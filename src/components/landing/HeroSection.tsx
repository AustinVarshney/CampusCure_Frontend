import { ArrowRightOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const chips = [
  { label: 'Multi-Role Support', emoji: '🎓' },
  { label: 'Face Recognition Login', emoji: '✅' },
  { label: 'Real-time Analytics', emoji: '⚡' },
  { label: 'Secure & Private', emoji: '🔒' },
];

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-28 pb-20 overflow-hidden">
      {/* Fine grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.4)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.4)_1px,transparent_1px)] bg-size-[56px_56px]" />

      {/* Radial glow in center */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,hsl(217_91%_60%/15%),transparent)] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-80 h-80 rounded-full bg-violet-500/8 blur-3xl pointer-events-none" style={{ animation: 'float-b 10s ease-in-out infinite' }} />
      <div className="absolute bottom-10 left-0 w-72 h-72 rounded-full bg-[#009BB0]/10 blur-3xl pointer-events-none" style={{ animation: 'float-a 8s ease-in-out infinite' }} />

      <div className="relative max-w-4xl mx-auto text-center space-y-8">
        {/* Animated badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00639B]/25 bg-[#00639B]/10 text-[#00639B] dark:text-[#009BB0] text-sm font-medium"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#009BB0] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#009BB0]" />
          </span>
          Next-Gen Campus Management Platform
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.06] tracking-tight"
        >
          <span className="text-foreground">The Smart Way</span>
          <br />
          <span className="bg-linear-to-r from-[#041A47] via-[#00639B] to-[#009BB0] bg-clip-text text-transparent">
            to Manage Campus
          </span>
          <br />
          <span className="text-foreground">Life</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          Streamline complaints, foster peer learning, and gain actionable insights —
          built for students, faculty, and administrators.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 20px 60px rgba(99,102,241,0.35)' }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/register')}
            className="group inline-flex items-center gap-2 h-13 px-8 rounded-2xl text-base font-semibold text-white bg-linear-to-r from-[#041A47] via-[#00639B] to-[#009BB0] hover:opacity-90 shadow-sm shadow-cyan-600/30 transition-all"
          >
            Get Started Free
            <ArrowRightOutlined className="transition-transform group-hover:translate-x-1" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center h-13 px-8 rounded-2xl text-base font-semibold border border-border bg-background/80 text-foreground hover:bg-accent/60 backdrop-blur-sm transition-all"
          >
            Explore Features
          </motion.button>
        </motion.div>

        {/* Social proof chips */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-3 pt-2"
        >
          {chips.map((chip) => (
            <div
              key={chip.label}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-card border border-border text-xs font-medium text-muted-foreground shadow-sm"
            >
              <span>{chip.emoji}</span>
              <span>{chip.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;