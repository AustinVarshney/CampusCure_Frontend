import logo from '@/assets/logo.jpeg';
import { CloseOutlined, MenuOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LandingNavbarProps {
  scrolled: boolean;
  dark: boolean;
  onToggleTheme: () => void;
}

const NAV_LINKS = [
  { label: 'Features', id: 'features' },
  { label: 'How It Works', id: 'how-it-works' },
  { label: 'Benefits', id: 'benefits' },
  { label: 'Testimonials', id: 'testimonials' },
  { label: 'FAQ', id: 'faq' },
];

const LandingNavbar = ({ scrolled, dark, onToggleTheme }: LandingNavbarProps) => {
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const [overDark, setOverDark] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenu(false);
  };

  useEffect(() => {
    const check = () => {
      const navEl = navRef.current as HTMLElement | null;
      if (!navEl) return;
      const rect = navEl.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const elems = document.elementsFromPoint(x, y);
      const behind = elems.find((e) => !navEl.contains(e));
      const isDark = !!(behind && (behind.classList?.contains('landing-dark-bg') || behind.closest?.('.landing-dark-bg')));
      setOverDark(isDark);
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, [mobileMenu]);

  return (
    <nav ref={navRef as any} className="fixed top-0 inset-x-0 z-50 flex justify-center pt-4 px-4">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`w-full max-w-5xl rounded-2xl transition-all duration-300 ${
          overDark
            ? 'bg-white shadow-lg'
            : scrolled || mobileMenu
            ? 'bg-background/85 backdrop-blur-2xl shadow-lg shadow-black/5'
            : 'bg-background/60 backdrop-blur-md shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between px-5 h-14">
          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2"
          >
            <div className="h-8 w-8 shrink-0">
              <img src={logo} alt="CampusCure" className="h-full w-full object-fill" />
            </div>
            <span className="font-bold text-base select-none"><span className="bg-linear-to-r from-[#041A47] via-[#00639B] to-[#009BB0] bg-clip-text text-transparent">
    Campus
  </span>
  <span className="text-[#041A47]">
    Cure
  </span></span>
          </button>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className={`px-3 py-1.5 text-sm font-medium hover:text-foreground hover:bg-accent/70 rounded-lg transition-all ${overDark ? 'text-foreground' : 'text-muted-foreground'}`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleTheme}
              className={`h-8 w-8 flex items-center justify-center rounded-lg bg-accent/70 hover:text-foreground transition-colors ${overDark ? 'text-foreground' : 'text-muted-foreground'}`}
              aria-label="Toggle theme"
            >
              {dark ? <SunOutlined /> : <MoonOutlined />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/login')}
              className={`hidden sm:flex h-8 px-4 items-center text-sm font-medium hover:bg-accent/70 rounded-lg transition-colors cursor-pointer ${overDark ? 'text-foreground' : 'text-foreground'}`}
            >
              Login
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(0, 155, 176, 0.35)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/register')}
              className="hidden sm:flex h-8 px-4 items-center text-sm font-semibold text-white rounded-lg bg-linear-to-r from-[#041A47] via-[#00639B] to-[#009BB0] hover:opacity-90 shadow-sm shadow-cyan-600/30 transition-all"
            >
              Get Started
            </motion.button>

            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="md:hidden h-8 w-8 flex items-center justify-center rounded-lg text-foreground hover:bg-accent/70 transition-colors"
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
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-border/50"
            >
              <div className="px-4 py-3 space-y-1">
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => scrollTo(link.id)}
                    className="w-full text-left px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/70 rounded-lg transition-all"
                  >
                    {link.label}
                  </button>
                ))}
                <div className="flex gap-2 pt-2 border-t border-border/50 mt-1">
                  <button
                    onClick={() => { setMobileMenu(false); navigate('/login'); }}
                    className="flex-1 h-9 text-sm font-medium border border-border rounded-xl hover:bg-accent transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => { setMobileMenu(false); navigate('/register'); }}
                    className="flex-1 h-9 text-sm font-semibold text-white rounded-xl bg-linear-to-r from-[#041A47] via-[#00639B] to-[#009BB0]"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </nav>
  );
};

export default LandingNavbar;