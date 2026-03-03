import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

/* ───── word-stagger component ───── */
const StaggerWords = ({ text, className = '' }: { text: string; className?: string }) => (
  <span className={className}>
    {text.split(' ').map((word, i) => (
      <motion.span
        key={i}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 + i * 0.08, ease: 'easeOut' }}
        className="inline-block mr-[0.3em]"
      >
        {word}
      </motion.span>
    ))}
  </span>
);

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center px-6 pt-16">
      {/* orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl" style={{ animation: 'float-a 8s ease-in-out infinite' }} />
        <div className="absolute top-1/3 right-0 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl" style={{ animation: 'float-b 10s ease-in-out infinite' }} />
        <div className="absolute bottom-10 left-1/4 w-64 h-64 rounded-full bg-blue-600/10 blur-3xl" style={{ animation: 'float-c 9s ease-in-out infinite' }} />
      </div>

      <div className="relative max-w-3xl text-center space-y-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight text-foreground">
          <StaggerWords text="Smart Campus Management, Simplified" />
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="text-lg text-muted-foreground max-w-xl mx-auto"
        >
          Streamline complaints, foster peer learning, and gain actionable insights — all in one place.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="flex flex-wrap justify-center gap-4 pt-2"
        >
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/register')}
            className="h-12 px-8 rounded-xl text-base font-semibold bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 hover:bg-blue-700 transition-all"
          >
            Get Started
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="h-12 px-8 rounded-xl text-base font-semibold border-1 border-gray-300 bg-background text-foreground hover:bg-accent transition-colors"
          >
            Learn More
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;