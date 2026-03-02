import { CloseOutlined, MenuOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LandingNavbarProps {
  scrolled: boolean;
  dark: boolean;
  onToggleTheme: () => void;
}

const NAV_LINKS = ['Features', 'How It Works', 'Benefits', 'Testimonials', 'FAQ'];

const LandingNavbar = ({ scrolled, dark, onToggleTheme }: LandingNavbarProps) => {
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-background/80 backdrop-blur-xl border-border shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
        <span className="text-xl font-bold font-serif tracking-tight text-foreground">
          🎓 CampusCure
        </span>

        <div className="hidden md:flex items-center gap-6 mr-4">
          {NAV_LINKS.map((s) => (
            <button
              key={s}
              onClick={() => scrollTo(s.toLowerCase())}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggleTheme}
            className="h-9 w-9 flex items-center justify-center rounded-full bg-secondary text-secondary-foreground"
            aria-label="Toggle theme"
          >
            {dark ? <SunOutlined /> : <MoonOutlined />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
            className="hidden sm:inline-flex h-9 px-4 py-2 rounded-lg text-sm font-medium border border-border bg-background text-foreground hover:bg-accent transition-colors"
          >
            Login
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/register')}
            className="hidden sm:inline-flex h-9 px-5 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Get Started
          </motion.button>

          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="md:hidden h-9 w-9 flex items-center justify-center rounded-lg text-foreground hover:bg-accent transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenu ? <CloseOutlined /> : <MenuOutlined />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden border-t border-border bg-background/95 backdrop-blur-xl"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {NAV_LINKS.map((s) => (
                <button
                  key={s}
                  onClick={() => { setMobileMenu(false); scrollTo(s.toLowerCase()); }}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground py-2 text-left transition-colors"
                >
                  {s}
                </button>
              ))}
              <div className="flex gap-3 pt-3 border-t border-border mt-2">
                <button onClick={() => { setMobileMenu(false); navigate('/login'); }} className="flex-1 h-10 rounded-lg text-sm font-medium border border-border bg-background text-foreground hover:bg-accent transition-colors">Login</button>
                <button onClick={() => { setMobileMenu(false); navigate('/register'); }} className="flex-1 h-10 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors py-auto">Get Started</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default LandingNavbar;