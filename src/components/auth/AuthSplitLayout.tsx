import Wordmark from "@/components/brand/Wordmark";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { ArrowLeftOutlined, CheckOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type Highlight = {
  title: string;
  description?: string;
};

type AuthSplitLayoutProps = {
  showcaseTitle: ReactNode;
  showcaseDescription: string;
  showcaseEyebrow?: string;
  highlights: Highlight[];
  formTitle: string;
  formDescription: string;
  formEyebrow?: string;
  backHref?: string;
  footer?: ReactNode;
  children: ReactNode;
};

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Two-pane shell for sign-in, registration and face verification.
 *
 * Left pane is brand and reassurance, right pane is the task. Below `lg` the
 * left pane is dropped entirely rather than stacked — on a phone it would push
 * the form, which is the only thing the visitor came for, below the fold.
 */
const AuthSplitLayout = ({
  showcaseTitle,
  showcaseDescription,
  showcaseEyebrow,
  highlights,
  formTitle,
  formDescription,
  formEyebrow,
  backHref = "/",
  footer,
  children,
}: AuthSplitLayoutProps) => {
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[minmax(440px,46%)_1fr]">
      {/* ── Showcase ─────────────────────────────────────────────────── */}
      <aside className="cc-section--dark relative hidden lg:flex lg:min-h-screen lg:flex-col lg:justify-between lg:overflow-hidden">
        <div className="cc-grid cc-grid--dark" aria-hidden="true" />
        <div
          aria-hidden="true"
          className="cc-orb cc-animate-float-a -left-24 top-16 h-80 w-80 bg-brand-400/10"
        />
        <div
          aria-hidden="true"
          className="cc-orb cc-animate-float-b -right-16 bottom-24 h-72 w-72 bg-brand-300/6"
        />

        <div className="relative z-10 flex flex-1 flex-col justify-center px-12 py-12 xl:px-16">
          <Wordmark tone="onDark" size="lg" tagline="Campus Operations" />

          <div className="mt-14">
            {showcaseEyebrow ? (
              <span className="cc-eyebrow cc-eyebrow--onDark mb-5">
                {showcaseEyebrow}
              </span>
            ) : null}

            <h1 className="max-w-md font-display text-[2.5rem] font-extrabold leading-[1.1] tracking-tight text-white">
              {showcaseTitle}
            </h1>

            <p className="mt-5 max-w-md text-[15px] leading-7 text-brand-100/75">
              {showcaseDescription}
            </p>

            <ul className="mt-9 space-y-3">
              {highlights.map((highlight, i) => (
                <motion.li
                  key={highlight.title}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.1, ease: EASE }}
                  className="cc-card cc-card--glass flex items-start gap-4 rounded-2xl px-4 py-3.5"
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-400/20 text-brand-200 ring-1 ring-inset ring-brand-300/25">
                    <CheckOutlined style={{ fontSize: 11 }} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-white">
                      {highlight.title}
                    </span>
                    {highlight.description ? (
                      <span className="mt-1 block text-[13px] leading-6 text-brand-100/65">
                        {highlight.description}
                      </span>
                    ) : null}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      {/* ── Form ─────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-screen flex-col overflow-hidden bg-surface">
        <div
          aria-hidden="true"
          className="cc-orb -right-20 -top-16 h-72 w-72 bg-brand-300/12"
        />
        <div
          aria-hidden="true"
          className="cc-orb bottom-0 left-[10%] h-60 w-60 bg-brand-300/6"
        />

        <div className="relative z-10 flex items-center justify-between px-5 pt-5 sm:px-8 lg:px-10 lg:pt-8">
          <Link
            to={backHref}
            className="cc-btn cc-btn-secondary cc-btn--sm rounded-full"
          >
            <ArrowLeftOutlined style={{ fontSize: 11 }} />
            Back to home
          </Link>
          <ThemeToggle />
        </div>

        <div className="relative z-10 flex flex-1 items-center justify-center px-4 pb-10 pt-6 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="w-full max-w-xl"
          >
            <div className="cc-card p-6 shadow-[var(--shadow-xl)] sm:p-9">
              <div className="lg:hidden">
                <Wordmark size="md" />
                <hr className="cc-divider my-6" />
              </div>

              {formEyebrow ? (
                <span className="cc-eyebrow">{formEyebrow}</span>
              ) : null}

              <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight">
                {formTitle}
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                {formDescription}
              </p>

              <div className="mt-8 space-y-6">
                {children}
                {footer}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AuthSplitLayout;
