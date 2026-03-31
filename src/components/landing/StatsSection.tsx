import { ClockCircleOutlined, CustomerServiceOutlined, SafetyOutlined, TeamOutlined } from '@ant-design/icons';
import { useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

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

const stats = [
  { end: 500, suffix: '+', label: 'Active Students', icon: <TeamOutlined className="text-xl" />, gradient: 'from-[#00639B] to-[#009BB0]' },
  { end: 98, suffix: '%', label: 'Resolution Rate', icon: <SafetyOutlined className="text-xl" />, gradient: 'from-green-600 to-emerald-500' },
  { end: 24, suffix: '/7', label: 'Support Available', icon: <CustomerServiceOutlined className="text-xl" />, gradient: 'from-violet-600 to-purple-500' },
  { end: 150, suffix: '+', label: 'Issues Resolved Weekly', icon: <ClockCircleOutlined className="text-xl" />, gradient: 'from-orange-500 to-amber-400' },
];

const StatItem = ({ stat }: { stat: typeof stats[number] }) => {
  const { count, ref } = useCountUp(stat.end);
  return (
    <div ref={ref} className="text-center space-y-3">
      <div className={`inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-linear-to-br ${stat.gradient} text-white mb-2 shadow-lg`}>
        {stat.icon}
      </div>
      <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">
        {count}{stat.suffix}
      </div>
      <div className="text-sm text-slate-200/85 font-medium">{stat.label}</div>
    </div>
  );
};

const StatsSection = () => (
  <section id="stats" className="py-24 px-6 relative overflow-hidden bg-linear-to-br from-slate-900 via-[#06264F] to-[#041A47]">
    {/* Grid pattern */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[48px_48px]" />
    {/* Top glow */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-48 bg-[#009BB0]/20 blur-3xl rounded-full" />

    <div className="relative max-w-5xl mx-auto">
      <div className="text-center mb-14">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-slate-200 text-xs font-semibold uppercase tracking-wider mb-4 border border-white/10">
          By The Numbers
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-white">
          Trusted by the campus community
        </h2>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-16">
        {stats.map((s) => (
          <StatItem key={s.label} stat={s} />
        ))}
      </div>
    </div>
  </section>
);

export default StatsSection;