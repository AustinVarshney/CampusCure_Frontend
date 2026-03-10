import { ArrowRightOutlined, RocketOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 px-6 relative overflow-hidden bg-linear-to-br from-slate-900 via-blue-950 to-indigo-950">
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[48px_48px]" />
      {/* Top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-72 bg-linear-to-b from-blue-600/25 to-transparent blur-3xl" />
      {/* Side orbs */}
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-violet-600/15 blur-3xl rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-600/15 blur-3xl rounded-full" />

      <div className="relative max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-blue-200 text-sm font-medium">
            <RocketOutlined />
            Start Your Journey Today
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight">
            Ready to Transform<br />
            <span className="bg-linear-to-r from-blue-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
              Your Campus?
            </span>
          </h2>

          <p className="text-lg text-blue-200/80 max-w-2xl mx-auto leading-relaxed">
            Join thousands of students, faculty, and administrators already experiencing seamless campus management.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 24px 80px rgba(99,102,241,0.4)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              className="group h-14 px-10 rounded-2xl font-semibold text-white bg-linear-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-xl shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              Get Started Free
              <ArrowRightOutlined className="transition-transform group-hover:translate-x-1" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="h-14 px-10 rounded-2xl font-semibold border border-white/20 bg-white/5 text-white hover:bg-white/10 backdrop-blur-sm transition-all"
            >
              Sign In
            </motion.button>
          </div>

          <p className="text-sm text-blue-300/60">
            No credit card required &bull; Set up in minutes &bull; 24/7 support
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
