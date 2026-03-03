import { RocketOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 via-purple-500/10 to-blue-600/10" />

      {/* Floating orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-64 h-64 rounded-full bg-blue-600/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-purple-600/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">
            <RocketOutlined />
            <span>Start Your Journey Today</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight">
            Ready to Transform Your Campus Experience?
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of students, faculty, and administrators who are already experiencing seamless campus management.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 20px 60px rgba(37, 99, 235, 0.3)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              className="h-14 px-10 rounded-xl text-base font-semibold bg-blue-600 text-white shadow-xl shadow-blue-600/25 hover:bg-blue-700 transition-all"
            >
              Get Started Free
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="h-14 px-10 rounded-xl text-base font-semibold border-1  border-gray-500 bg-card text-foreground hover:bg-accent transition-colors"
            >
              Sign In
            </motion.button>
          </div>

          <p className="text-sm text-muted-foreground pt-4">
            No credit card required • Set up in minutes • 24/7 support available
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
