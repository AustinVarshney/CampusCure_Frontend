import { ClockCircleOutlined, CustomerServiceOutlined, SafetyOutlined, TeamOutlined } from '@ant-design/icons';
import { useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/* ───── count-up hook ───── */
const useCountUp = (end: number, duration = 1.4) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / (duration * 60);
    const id = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(id); }
      else setCount(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(id);
  }, [inView, end, duration]);

  return { count, ref };
};

const stats: { end: number; suffix: string; label: string; icon: React.ReactNode }[] = [
  { end: 500, suffix: '+', label: 'Active Students', icon: <TeamOutlined /> },
  { end: 98, suffix: '%', label: 'Resolution Rate', icon: <SafetyOutlined /> },
  { end: 24, suffix: '/7', label: 'Support Available', icon: <CustomerServiceOutlined /> },
  { end: 150, suffix: '+', label: 'Issues Resolved Weekly', icon: <ClockCircleOutlined /> },
];

const StatItem = ({ stat }: { stat: typeof stats[number] }) => {
  const { count, ref } = useCountUp(stat.end);
  return (
    <div ref={ref} className="text-center space-y-1">
      <div className="text-blue-600 dark:text-blue-400 text-2xl mb-2">{stat.icon}</div>
      <div className="text-3xl sm:text-4xl font-bold text-foreground">
        {count}{stat.suffix}
      </div>
      <div className="text-sm text-muted-foreground">{stat.label}</div>
    </div>
  );
};

const StatsSection = () => (
  <section id="stats" className="py-20 px-6 bg-muted/40">
    <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((s) => (
        <StatItem key={s.label} stat={s} />
      ))}
    </div>
  </section>
);

export default StatsSection;