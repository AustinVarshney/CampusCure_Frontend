/**
 * Inline images in rich text (CC-23 on CC-02 storage).
 *
 * A stored post never holds an image URL. It holds
 * `<img data-attachment-id="…">`, because the bucket is private and signed
 * URLs expire in minutes - a URL written into the HTML would be dead by the
 * next visit. The URL is minted here, when the image is actually shown.
 *
 * See campus_cure_backend/docs/specs/CC-23-rich-text.md.
 */

import { type AttachmentSummary, getDownloadUrl } from "@/api/uploads";

/** Re-sign this long before the URL actually expires. */
const EXPIRY_MARGIN_MS = 30_000;

/**
 * Per-tab cache of signed URLs, keyed by attachment id.
 *
 * Kept only for each URL's own lifetime: a post re-rendered by a refetch
 * should not re-sign every image, but a URL held past its expiry is a broken
 * image.
 */
const cache = new Map<string, { url: string; expiresAt: number }>();
const inFlight = new Map<string, Promise<string>>();

/** A live URL for one inline image. */
export const resolveImageUrl = (attachmentId: string): Promise<string> => {
  const hit = cache.get(attachmentId);
  if (hit && hit.expiresAt - EXPIRY_MARGIN_MS > Date.now()) {
    return Promise.resolve(hit.url);
  }

  const pending = inFlight.get(attachmentId);
  if (pending) return pending;

  const request = getDownloadUrl(attachmentId)
    .then((target) => {
      cache.set(attachmentId, {
        url: target.url,
        expiresAt: Date.now() + target.expiresInSeconds * 1000,
      });
      return target.url;
    })
    .finally(() => inFlight.delete(attachmentId));

  inFlight.set(attachmentId, request);
  return request;
};

/** Mark an image that could not be loaded, rather than leaving a broken icon. */
const markBroken = (img: HTMLImageElement) => {
  img.removeAttribute("src");
  img.classList.add("cc23-image-broken");
  img.alt = img.alt || "Image unavailable";
};

/** Fill in `src` for every inline image under `root`. */
export const hydrateInlineImages = (root: HTMLElement): void => {
  root
    .querySelectorAll<HTMLImageElement>("img[data-attachment-id]")
    .forEach((img) => {
      const id = img.dataset.attachmentId;
      if (!id) return;

      img.loading = "lazy";
      img.classList.add("cc23-inline-image");

      resolveImageUrl(id)
        .then((url) => {
          img.src = url;
        })
        .catch(() => markBroken(img));
    });
};

/** Attachment ids shown inline in a post body. */
export const inlineImageIds = (html: string | null | undefined): Set<string> => {
  const ids = new Set<string>();
  if (!html) return ids;

  for (const match of html.matchAll(/data-attachment-id="([^"]+)"/g)) {
    ids.add(match[1]!.toLowerCase());
  }
  return ids;
};

/**
 * The attachment tray minus the images already shown in the body.
 *
 * An inline image is still an attachment - it is bound through the same
 * table - so without this it would appear twice: once in the text, once as a
 * thumbnail underneath.
 */
export const withoutInlineImages = <T extends AttachmentSummary>(
  attachments: T[] | undefined,
  html: string | null | undefined,
): T[] | undefined => {
  if (!attachments) return attachments;

  const inline = inlineImageIds(html);
  return inline.size === 0
    ? attachments
    : attachments.filter((attachment) => !inline.has(attachment.id));
};
