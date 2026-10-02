// @vitest-environment jsdom
/**
 * CC-23 inline images: resolving attachment ids to signed URLs at render time.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const uploads = vi.hoisted(() => ({
  getDownloadUrl: vi.fn(),
}));

vi.mock("@/api/uploads", () => uploads);

const { hydrateInlineImages, inlineImageIds, resolveImageUrl, withoutInlineImages } =
  await import("./inlineImages");

const ID_A = "3f2504e0-4f89-11d3-9a0c-0305e82c3301";
const ID_B = "11111111-2222-3333-4444-555555555555";

const signed = (url: string, expiresInSeconds = 300) => ({
  id: "x",
  mimeType: "image/png",
  originalName: "a.png",
  sizeBytes: 1,
  url,
  expiresInSeconds,
});

/** Let pending promise callbacks run. */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
  uploads.getDownloadUrl.mockReset();
});

describe("resolveImageUrl", () => {
  it("signs once and reuses the URL while it is still valid", async () => {
    uploads.getDownloadUrl.mockResolvedValue(signed("https://s/a"));
    const id = "aaaaaaaa-0000-0000-0000-000000000001";

    await expect(resolveImageUrl(id)).resolves.toBe("https://s/a");
    await expect(resolveImageUrl(id)).resolves.toBe("https://s/a");
    expect(uploads.getDownloadUrl).toHaveBeenCalledTimes(1);
  });

  it("shares one request between simultaneous callers", async () => {
    uploads.getDownloadUrl.mockResolvedValue(signed("https://s/b"));
    const id = "aaaaaaaa-0000-0000-0000-000000000002";

    await Promise.all([resolveImageUrl(id), resolveImageUrl(id)]);
    expect(uploads.getDownloadUrl).toHaveBeenCalledTimes(1);
  });

  /** A URL held past its expiry is a broken image. */
  it("re-signs a URL that is about to expire", async () => {
    uploads.getDownloadUrl
      .mockResolvedValueOnce(signed("https://s/old", 10))
      .mockResolvedValueOnce(signed("https://s/new"));
    const id = "aaaaaaaa-0000-0000-0000-000000000003";

    await resolveImageUrl(id);
    await expect(resolveImageUrl(id)).resolves.toBe("https://s/new");
  });
});

describe("hydrateInlineImages", () => {
  it("fills in src for each inline image", async () => {
    uploads.getDownloadUrl.mockResolvedValue(signed("https://s/hydrated"));
    const root = document.createElement("div");
    root.innerHTML = `<p>x</p><img data-attachment-id="bbbbbbbb-0000-0000-0000-000000000001" alt="g">`;

    hydrateInlineImages(root);
    await flush();

    const img = root.querySelector("img")!;
    expect(img.getAttribute("src")).toBe("https://s/hydrated");
    expect(img.alt).toBe("g");
  });

  it("marks an image it cannot sign as broken, with no src", async () => {
    uploads.getDownloadUrl.mockRejectedValue(new Error("403"));
    const root = document.createElement("div");
    root.innerHTML = `<img data-attachment-id="bbbbbbbb-0000-0000-0000-000000000002">`;

    hydrateInlineImages(root);
    await flush();

    const img = root.querySelector("img")!;
    expect(img.hasAttribute("src")).toBe(false);
    expect(img.classList.contains("cc23-image-broken")).toBe(true);
    expect(img.alt).toBe("Image unavailable");
  });
});

describe("inlineImageIds / withoutInlineImages", () => {
  const html = `<p>a</p><img data-attachment-id="${ID_A}">`;
  const tray = [
    { id: ID_A, mimeType: "image/png", originalName: "a.png", sizeBytes: 1 },
    { id: ID_B, mimeType: "application/pdf", originalName: "b.pdf", sizeBytes: 1 },
  ];

  it("finds the ids in a body", () => {
    expect([...inlineImageIds(html)]).toEqual([ID_A]);
    expect(inlineImageIds(null).size).toBe(0);
  });

  it("hides attachments already shown in the text, so nothing appears twice", () => {
    expect(withoutInlineImages(tray, html)?.map((a) => a.id)).toEqual([ID_B]);
  });

  it("returns the tray untouched for a body with no images", () => {
    expect(withoutInlineImages(tray, "<p>none</p>")).toBe(tray);
    expect(withoutInlineImages(undefined, html)).toBeUndefined();
  });
});
