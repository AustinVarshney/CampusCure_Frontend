import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  end: number;
  duration?: number;
  label: string;
  icon: React.ReactNode;
  color?: string;
  delay?: number;
}

const CountUpStat = ({ end, duration = 1.2, label, icon, color = 'hsl(214 100% 50%)', delay = 0 }: Props) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      let start = 0;
      const step = end / (duration * 60);
      const timer = setInterval(() => {
        start += step;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 1000 / 60);
      return () => clearInterval(timer);
    }, delay * 1000);
    return () => clearTimeout(timeout);
  }, [end, duration, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02 }}
      className="rounded-2xl bg-card border border-border p-6 shadow-sm"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}15`, color }}>
          {icon}
        </div>
        <div>
          <div className="text-3xl font-bold text-foreground">{count}</div>
          <div className="text-sm text-muted-foreground">{label}</div>
        </div>
      </div>
    </motion.div>
  );
};

export default CountUpStat;
