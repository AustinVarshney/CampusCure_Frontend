/**
 * TipTap node for an inline image (CC-23).
 *
 * Serialises to `<img data-attachment-id="…" alt="…">` and nothing else - no
 * `src`. That is the only image shape the server's sanitiser keeps, so the
 * editor cannot produce an image that silently disappears on save.
 *
 * `previewSrc` is the local object URL of a just-uploaded file. It is never
 * rendered into the HTML, only shown while editing, so a fresh upload appears
 * instantly instead of waiting on a signed URL.
 */

import { Node, mergeAttributes } from "@tiptap/react";
import { resolveImageUrl } from "@/lib/inlineImages";

export interface InlineImageAttrs {
  attachmentId: string;
  alt?: string;
  previewSrc?: string | null;
}

export const InlineImage = Node.create({
  name: "inlineImage",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      attachmentId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-attachment-id"),
        renderHTML: (attributes) => ({
          "data-attachment-id": attributes.attachmentId,
        }),
      },
      alt: {
        default: "",
        parseHTML: (element) => element.getAttribute("alt") ?? "",
        renderHTML: (attributes) =>
          attributes.alt ? { alt: attributes.alt } : {},
      },
      previewSrc: { default: null, rendered: false },
    };
  },

  parseHTML() {
    return [{ tag: "img[data-attachment-id]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["img", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ({ node }) => {
      const img = document.createElement("img");
      img.className = "cc23-inline-image";
      img.alt = node.attrs.alt ?? "";
      img.draggable = true;

      if (node.attrs.previewSrc) {
        img.src = node.attrs.previewSrc;
      } else if (node.attrs.attachmentId) {
        // Editing a saved post: the image exists only as an id.
        resolveImageUrl(node.attrs.attachmentId)
          .then((url) => {
            img.src = url;
          })
          .catch(() => img.classList.add("cc23-image-broken"));
      }

      return { dom: img };
    };
  },
});

export default InlineImage;
