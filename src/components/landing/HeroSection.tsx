import {
  ArrowRightOutlined,
  CheckCircleFilled,
  ClockCircleFilled,
  MessageFilled,
  SafetyCertificateFilled,
  ThunderboltFilled,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const CHIPS = [
  { label: "Multi-role dashboards", icon: <SafetyCertificateFilled /> },
  { label: "Face-verified sign-in", icon: <CheckCircleFilled /> },
  { label: "Live analytics", icon: <ThunderboltFilled /> },
];

/** Rows of the preview panel. Illustrative, not live data. */
const PREVIEW_ROWS = [
  {
    title: "Projector not working — Lab C-204",
    meta: "Raised 2h ago",
    status: "In progress",
    tone: "warning" as const,
  },
  {
    title: "How does indexing affect JOIN cost?",
    meta: "3 answers · faculty verified",
    status: "Answered",
    tone: "success" as const,
  },
  {
    title: "Broken seating — Lecture Hall B",
    meta: "Assigned to Facilities",
    status: "Resolved",
    tone: "success" as const,
  },
];

const TONE: Record<"warning" | "success", string> = {
  warning: "bg-warning/12 text-warning",
  success: "bg-success/12 text-success",
};

const PREVIEW_STATS = [
  { label: "Open", value: "3", icon: <ClockCircleFilled /> },
  { label: "Answered", value: "12", icon: <MessageFilled /> },
  { label: "Resolved", value: "27", icon: <CheckCircleFilled /> },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const EASE = [0.22, 1, 0.36, 1] as const;

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden pb-20 pt-32 sm:pt-36">
      {/* Backdrop: grid texture, then two slow-drifting colour washes. All of
          it is decorative and sits behind the content. */}
      <div className="cc-grid" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="cc-orb cc-animate-float-a -left-32 top-10 h-96 w-96 bg-brand-400/10"
      />
      <div
        aria-hidden="true"
        className="cc-orb cc-animate-float-b -right-24 top-1/3 h-80 w-80 bg-brand-300/6"
      />

      <div className="cc-container relative">
        <motion.div
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.09, delayChildren: 0.05 }}
          className="grid min-w-0 items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-16"
        >
          {/* ── Copy ─────────────────────────────────────────────────── */}
          <div className="min-w-0 text-center lg:text-left">
            <motion.div variants={fadeUp} transition={{ duration: 0.5, ease: EASE }}>
              <span className="cc-eyebrow">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75 [animation:cc-pulse-ring_2s_ease-out_infinite]" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-600" />
                </span>
                One platform for the whole campus
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.6, ease: EASE }}
              className="cc-display mt-6"
            >
              The smart way to run{" "}
              <span className="cc-gradient-text">campus life</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5, ease: EASE }}
              className="cc-lede mx-auto mt-6 max-w-xl lg:mx-0"
            >
              Route complaints to the right desk, let students answer each other
              under faculty supervision, and give administrators the numbers
              behind both — in a single workspace.
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5, ease: EASE }}
              className="mt-9 flex flex-wrap justify-center gap-3 lg:justify-start"
            >
              <button
                onClick={() => navigate("/register")}
                className="cc-btn cc-btn-primary cc-btn--lg group"
              >
                Get started free
                <ArrowRightOutlined className="transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="cc-btn cc-btn-secondary cc-btn--lg"
              >
                Explore features
              </button>
            </motion.div>

            <motion.ul
              variants={fadeUp}
              transition={{ duration: 0.5, ease: EASE }}
              className="mt-8 flex flex-wrap justify-center gap-2.5 lg:justify-start"
            >
              {CHIPS.map((chip) => (
                <li key={chip.label} className="cc-chip">
                  <span className="text-brand-600">{chip.icon}</span>
                  {chip.label}
                </li>
              ))}
            </motion.ul>
          </div>

          {/* ── Product preview ──────────────────────────────────────── */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.7, ease: EASE }}
            className="relative mx-auto w-full min-w-0 max-w-lg lg:max-w-none"
          >
            {/* Glow pooled under the panel so it lifts off the page. */}
            <div
              aria-hidden="true"
              className="absolute inset-x-6 bottom-2 h-24 rounded-full bg-brand-600/25 blur-3xl"
            />

            <div className="cc-card relative overflow-hidden shadow-[var(--shadow-xl)]">
              {/* Title bar */}
              <div className="flex items-center gap-2 border-b border-border bg-surface px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                <span className="ml-3 text-xs font-medium text-muted-foreground">
                  Student dashboard
                </span>
              </div>

              <div className="space-y-4 p-4 sm:p-5">
                <div className="grid min-w-0 grid-cols-3 gap-2 sm:gap-3">
                  {PREVIEW_STATS.map((stat) => (
                    <div
                      key={stat.label}
                      className="min-w-0 rounded-xl border border-border bg-surface p-2.5 sm:p-3"
                    >
                      <span className="text-sm text-brand-600">{stat.icon}</span>
                      <div className="mt-1.5 font-display text-xl font-bold tracking-tight sm:text-2xl">
                        {stat.value}
                      </div>
                      <div className="truncate text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:text-[11px]">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>

                <ul className="space-y-2">
                  {PREVIEW_ROWS.map((row, i) => (
                    <motion.li
                      key={row.title}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.45, delay: 0.5 + i * 0.12, ease: EASE }}
                      className="flex items-center gap-3 rounded-xl border border-border bg-card px-3.5 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] font-semibold">
                          {row.title}
                        </div>
                        <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
                          {row.meta}
                        </div>
                      </div>
                      <span
                        className={
                          "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide " +
                          TONE[row.tone]
                        }
                      >
                        {row.status}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Floating accent card, overlapping the panel's corner. */}
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.55, delay: 0.9, ease: EASE }}
              className="absolute -bottom-6 -left-4 hidden items-center gap-2.5 rounded-2xl border border-border bg-card px-4 py-3 shadow-[var(--shadow-lg)] sm:flex"
            >
              <span className="cc-icon-tile cc-icon-tile--sm cc-icon-tile--emerald">
                <CheckCircleFilled />
              </span>
              <div>
                <div className="font-display text-sm font-bold">98%</div>
                <div className="text-[11px] text-muted-foreground">
                  resolution rate
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
