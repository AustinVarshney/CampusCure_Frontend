import { cn } from "@/lib/utils";

type BrandMarkProps = {
  /** `onDark` swaps the navy ring for white so the mark holds on brand bands. */
  tone?: "default" | "onDark";
  /** Accessible name. Omit when a visible wordmark already names the brand. */
  title?: string;
  className?: string;
};

/**
 * The CampusCure mark — "Resolved".
 *
 * A single heavy C (Campus) with a check that starts inside it and breaks out
 * through the opening: an issue comes in, a resolution leaves. Drawn on a
 * 64-unit grid with 8-unit round strokes so it stays legible down to 16px.
 * Flat two-colour on purpose: a mark has to survive one-colour print,
 * embroidery and a 16px tab, and a gradient survives none of them.
 * Geometry is mirrored in `public/favicon.svg` — change both together.
 */
const BrandMark = ({ tone = "default", title, className }: BrandMarkProps) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    role={title ? "img" : undefined}
    aria-hidden={title ? undefined : true}
    className={cn("shrink-0", className)}
  >
    {title ? <title>{title}</title> : null}
    <path
      d="M31.83 13.08A21 21 0 1 0 50.92 32.17"
      stroke={tone === "onDark" ? "#fff" : "hsl(var(--brand-900))"}
      strokeWidth="8"
      strokeLinecap="round"
      className={tone === "default" ? "dark:stroke-white" : undefined}
    />
    <path
      d="M20 34l7 7L54 14"
      stroke={
        tone === "onDark" ? "hsl(var(--brand-300))" : "hsl(var(--brand-500))"
      }
      strokeWidth="8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default BrandMark;
