/**
 * Remove metadata from an image before it is uploaded — CC-30.
 *
 * ## The problem
 *
 * A phone photograph carries EXIF, and EXIF carries GPS. CC-02 flagged this
 * and deferred it here, on the reasoning that it becomes urgent once photos
 * are routine — which is what CC-30 makes them. A complaint photo taken in a
 * hostel corridor at 11pm, with coordinates attached, is a student telling the
 * system exactly where they were and when. EXIF also carries the device model
 * and often a serial number, which deanonymises "anonymous" reports.
 *
 * ## Why this runs in the browser
 *
 * Stripping on the server would mean the original — GPS and all — is uploaded,
 * stored, and only then cleaned. The coordinates would have existed in our
 * bucket, in backups, and in whatever Supabase logs about the object. Doing it
 * here means the bytes carrying them never leave the student's device.
 *
 * It is also the only option that costs nothing: server-side stripping needs
 * either an image library (`sharp` is a native binary, awkward on Vercel and
 * large in a lambda) or a hand-written JPEG segment parser, plus a download and
 * re-upload per photo on a free tier with a 1 GB quota.
 *
 * ## What this does NOT defend against
 *
 * A deliberately malicious client can skip this and upload raw bytes — it is
 * ordinary frontend code. That is accepted, because the threat model here is
 * *a student unknowingly leaking their own location*, not an attacker leaking
 * it on purpose. An attacker choosing to publish their own coordinates is not
 * a problem this feature needs to solve.
 *
 * Recorded plainly so nobody later mistakes this for an enforced guarantee.
 */

/** Formats a canvas can decode and re-encode losslessly enough to be worth it. */
const STRIPPABLE = new Set(["image/jpeg", "image/png", "image/webp", "image/heic"]);

/**
 * JPEG quality for the re-encode.
 *
 * 0.92 is high enough that the difference is invisible on a photograph of a
 * broken chair, and it usually *shrinks* a phone photo — which helps against
 * the 5 MB cap rather than fighting it.
 */
const JPEG_QUALITY = 0.92;

/**
 * Give up on decoding after this long.
 *
 * Not defensive padding — a real hole found by the test that stubs an `Image`
 * firing neither `onload` nor `onerror`. Without a timeout the promise never
 * settles, `handleFiles` never returns, and the upload hangs forever with a
 * spinner: the exact opposite of the "never block the upload" guarantee this
 * module is built around. Browsers can genuinely fire neither event for some
 * malformed inputs.
 *
 * Five seconds is generous for a local decode of a phone photo, and the
 * failure mode is merely "uploaded with metadata intact", which the caller
 * warns about.
 */
const DECODE_TIMEOUT_MS = 5000;

/**
 * Re-encode an image through a canvas, which drops every metadata block.
 *
 * This is not a "remove the EXIF segment" operation. Drawing to a canvas and
 * reading it back produces a new image from pixels alone: EXIF, XMP, IPTC, ICC
 * and any vendor block are gone because nothing carries them across. That is
 * more thorough than parsing out the segments we know about, and it cannot be
 * defeated by a block we failed to anticipate.
 *
 * Returns the ORIGINAL file unchanged if anything goes wrong. A student trying
 * to report a broken fan must not be blocked because their photo was in a
 * format this browser could not decode — the upload is the point, and the
 * caller warns about what that means.
 */
export const stripImageMetadata = async (
  file: File,
): Promise<{ file: File; stripped: boolean }> => {
  if (!STRIPPABLE.has(file.type)) return { file, stripped: false };

  let objectUrl: string | null = null;

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      objectUrl = URL.createObjectURL(file);

      const timer = setTimeout(
        () => reject(new Error("decode timed out")),
        DECODE_TIMEOUT_MS,
      );
      const settle = (fn: () => void) => {
        clearTimeout(timer);
        fn();
      };

      const element = new Image();
      element.onload = () => settle(() => resolve(element));
      element.onerror = () => settle(() => reject(new Error("decode failed")));
      element.src = objectUrl;
    });

    // `naturalWidth` is 0 for an image the browser accepted but could not
    // actually decode. Drawing it would silently produce a blank canvas, and
    // the student would upload a white rectangle as their evidence.
    if (!image.naturalWidth || !image.naturalHeight) {
      return { file, stripped: false };
    }

    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const context = canvas.getContext("2d");
    if (!context) return { file, stripped: false };

    // A browser that honours the EXIF orientation tag when decoding has
    // already applied the rotation to what we draw. One that does not gives us
    // the raw orientation - and since the tag is about to be discarded, the
    // image would display rotated from here on. Every browser we support
    // (Chrome 81+, Safari 13.4+, Firefox 77+) honours it, which is what makes
    // discarding the tag safe.
    context.drawImage(image, 0, 0);

    // PNG stays PNG so screenshots of error messages keep their sharp text;
    // everything else becomes JPEG, including HEIC, which nothing outside
    // Apple's ecosystem reliably displays.
    const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, outputType, JPEG_QUALITY);
    });

    if (!blob || blob.size === 0) return { file, stripped: false };

    const name =
      outputType === "image/jpeg"
        ? file.name.replace(/\.(heic|heif|webp|jpeg|jpg)$/i, "") + ".jpg"
        : file.name;

    return {
      file: new File([blob], name, {
        type: outputType,
        lastModified: Date.now(),
      }),
      stripped: true,
    };
  } catch {
    // Decode failure, a tainted canvas, an out-of-memory on a very large
    // image: in every case the upload proceeds with the original.
    return { file, stripped: false };
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
};
