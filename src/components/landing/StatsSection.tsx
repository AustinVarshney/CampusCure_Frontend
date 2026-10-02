import {
  ClockCircleOutlined,
  CustomerServiceOutlined,
  SafetyOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/**
 * Counts up to `end` once the element scrolls into view.
 *
 * Driven by rAF rather than a 60Hz interval: the old version assumed every
 * tick fired on time, so on a loaded main thread it both ran long and landed
 * on a value that depended on frame timing.
 */
const useCountUp = (end: number, durationMs = 1400) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;

    // Respect the OS setting — an animated number is decoration.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(end);
      return;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1);
      // easeOutCubic: fast first, settles on the final number.
      setValue(Math.round(end * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, end, durationMs]);

  return { value, ref };
};

const STATS = [
  {
    end: 500,
    suffix: "+",
    label: "Active students",
    icon: <TeamOutlined />,
    tile: "",
  },
  {
    end: 98,
    suffix: "%",
    label: "Resolution rate",
    icon: <SafetyOutlined />,
    tile: "cc-icon-tile--emerald",
  },
  {
    end: 24,
    suffix: "/7",
    label: "Support available",
    icon: <CustomerServiceOutlined />,
    tile: "cc-icon-tile--violet",
  },
  {
    end: 150,
    suffix: "+",
    label: "Issues resolved weekly",
    icon: <ClockCircleOutlined />,
    tile: "cc-icon-tile--amber",
  },
];

const EASE = [0.22, 1, 0.36, 1] as const;

const StatItem = ({ stat }: { stat: (typeof STATS)[number] }) => {
  const { value, ref } = useCountUp(stat.end);

  return (
    <div ref={ref} className="text-center">
      <span className={"cc-icon-tile " + stat.tile}>{stat.icon}</span>
      <div className="mt-4 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
        {value}
        {stat.suffix}
      </div>
      <div className="mt-1.5 text-sm font-medium text-brand-100/70">
        {stat.label}
      </div>
    </div>
  );
};

const StatsSection = () => (
  <section
    id="stats"
    className="cc-section cc-section--dark landing-dark-bg"
  >
    <div className="cc-grid cc-grid--dark" aria-hidden="true" />
    <div
      aria-hidden="true"
      className="cc-orb left-1/2 top-0 h-56 w-xl -translate-x-1/2 bg-brand-400/10"
    />

    <div className="cc-container relative">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55, ease: EASE }}
        className="cc-section-head"
      >
        <span className="cc-eyebrow cc-eyebrow--onDark">By the numbers</span>
        <h2 className="cc-h2 text-white">
          Trusted by the campus community
        </h2>
      </motion.div>

      <div className="grid grid-cols-2 gap-10 lg:grid-cols-4 lg:gap-14">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: EASE }}
          >
            <StatItem stat={s} />
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default StatsSection;
