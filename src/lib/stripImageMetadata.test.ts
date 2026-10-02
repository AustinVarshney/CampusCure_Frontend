/**
 * CC-30: metadata stripping.
 *
 * ## What these tests can and cannot cover
 *
 * The re-encode itself is a browser API — `HTMLImageElement` decoding, a 2D
 * canvas context, and `canvas.toBlob`. It is genuinely not unit-testable in
 * this suite, and adding jsdom would not change that: jsdom implements the
 * canvas *element* but not its rendering context, so `toBlob` needs the native
 * `canvas` package — a compiled dependency, pulled in to exercise code whose
 * whole purpose is to run in a real browser.
 *
 * So these tests pin the two things that do not need a canvas and that carry
 * the actual risk:
 *
 *  1. **Pass-through routing.** A PDF must never be re-encoded, and neither
 *     must anything outside the strippable list.
 *  2. **The never-block guarantee.** Every failure path must return the
 *     original file rather than throwing. A student reporting a broken fan
 *     must not be stopped because their photo could not be decoded — that
 *     turns a privacy enhancement into an outage on the upload path.
 *
 * The re-encode is verified by hand instead, per the spec's manual test plan:
 * upload a phone photo with GPS enabled, download it back, and confirm
 * `exiftool` reports no GPS block.
 */
import { describe, expect, it, vi } from "vitest";
import { stripImageMetadata } from "./stripImageMetadata";

const fileOf = (name: string, type: string, bytes = "data") =>
  new File([bytes], name, { type });

describe("pass-through", () => {
  /**
   * A PDF has no pixels to redraw. Running it through a canvas would produce
   * a picture of page one and silently destroy the document.
   */
  it("returns a PDF untouched", async () => {
    const input = fileOf("report.pdf", "application/pdf");
    const { file, stripped } = await stripImageMetadata(input);

    expect(file).toBe(input);
    expect(stripped).toBe(false);
  });

  it.each([
    "application/pdf",
    "text/plain",
    "application/zip",
    "",
    "image/svg+xml", // vector; a canvas re-encode would rasterise it
  ])("returns %s untouched", async (type) => {
    const input = fileOf("f", type);
    const { file, stripped } = await stripImageMetadata(input);

    expect(file).toBe(input);
    expect(stripped).toBe(false);
  });
});

describe("the never-block guarantee", () => {
  /**
   * In this Node environment there is no `document`, so the image-decode path
   * throws immediately — which makes it a faithful stand-in for a browser that
   * cannot decode the format (HEIC outside Safari being the real case).
   *
   * The requirement is the same either way: hand back the original, do not
   * throw, and report `stripped: false` so the caller can warn.
   */
  it.each(["image/jpeg", "image/png", "image/webp", "image/heic"])(
    "returns the original when %s cannot be processed",
    async (type) => {
      const input = fileOf("photo", type);
      const { file, stripped } = await stripImageMetadata(input);

      expect(file).toBe(input);
      // False is what makes the caller warn the student that location data
      // may still be attached. Reporting true here would be a silent lie.
      expect(stripped).toBe(false);
    },
  );

  it("never throws, whatever the input", async () => {
    for (const type of ["image/jpeg", "application/pdf", "nonsense/type", ""]) {
      await expect(stripImageMetadata(fileOf("f", type))).resolves.toBeDefined();
    }
  });

  /**
   * A browser that fires NEITHER `onload` nor `onerror`.
   *
   * This is not a hypothetical: writing this test is how the bug was found.
   * Without the decode timeout the promise never settled, `handleFiles` never
   * returned, and the upload hung on a spinner forever — the precise opposite
   * of the guarantee this module exists to provide. The test failed by timing
   * out at 5s, which is exactly the symptom a student would have seen.
   */
  it("gives up and returns the original when decoding never settles", async () => {
    vi.useFakeTimers();

    const created: string[] = [];
    const revoked: string[] = [];

    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: () => {
        const url = `blob:test-${created.length}`;
        created.push(url);
        return url;
      },
      revokeObjectURL: (url: string) => revoked.push(url),
    });
    // Silent: assigning `src` triggers no event, ever.
    vi.stubGlobal("Image", class {} as unknown as typeof Image);

    const input = fileOf("photo.jpg", "image/jpeg");
    const pending = stripImageMetadata(input);

    await vi.advanceTimersByTimeAsync(6000);
    const { file, stripped } = await pending;

    expect(file).toBe(input);
    expect(stripped).toBe(false);

    // A leaked object URL pins the whole file in memory for the life of the
    // tab, and a student attaching several photos would pin all of them.
    expect(revoked).toEqual(created);

    vi.unstubAllGlobals();
    vi.useRealTimers();
  });
});
