import BrandMark from "@/components/brand/BrandMark";
import { cn } from "@/lib/utils";

type WordmarkProps = {
  /** `onDark` inverts the lockup for the navy bands and the auth showcase. */
  tone?: "default" | "onDark";
  size?: "sm" | "md" | "lg";
  /** Small caps line under the name. Omitted in tight spots like the navbar. */
  tagline?: string;
  className?: string;
};

const MARK_SIZE = {
  sm: "h-7 w-7",
  md: "h-8 w-8",
  lg: "h-10 w-10",
} as const;

const TEXT_SIZE = {
  sm: "text-[0.9375rem]",
  md: "text-lg",
  lg: "text-xl",
} as const;

/**
 * The CampusCure lockup. Previously this markup was pasted into the navbar,
 * the footer, the app sidebar and both auth screens, and had already drifted
 * apart between them — one shared component keeps the brand identical.
 */
const Wordmark = ({
  tone = "default",
  size = "md",
  tagline,
  className,
}: WordmarkProps) => (
  <span className={cn("flex items-center gap-2.5", className)}>
    <BrandMark tone={tone} className={MARK_SIZE[size]} />

    <span className="flex flex-col leading-none">
      <span
        className={cn(
          "font-display font-extrabold tracking-tight",
          TEXT_SIZE[size],
        )}
      >
        {tone === "onDark" ? (
          <>
            <span className="text-brand-200">Campus</span>
            <span className="text-white">Cure</span>
          </>
        ) : (
          <>
            <span className="cc-gradient-text">Campus</span>
            <span className="text-brand-900 dark:text-white">Cure</span>
          </>
        )}
      </span>
      {tagline ? (
        <span
          className={cn(
            "mt-1 text-[10px] font-semibold uppercase tracking-[0.28em]",
            tone === "onDark" ? "text-brand-200/60" : "text-muted-foreground",
          )}
        >
          {tagline}
        </span>
      ) : null}
    </span>
  </span>
);

export default Wordmark;
