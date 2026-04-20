import BenefitsSection from '@/components/landing/BenefitsSection';
import CTASection from '@/components/landing/CTASection';
import FAQSection from '@/components/landing/FAQSection';
import FeaturesSection from '@/components/landing/FeaturesSection.tsx';
import HeroSection from '@/components/landing/HeroSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import LandingFooter from '@/components/landing/LandingFooter.tsx';
import LandingNavbar from '@/components/landing/LandingNavbar';
import StatsSection from '@/components/landing/StatsSection.tsx';
import TestimonialsSection from '@/components/landing/TestimonialsSection.tsx';
import { useEffect, useState } from 'react';

/* ───── floating orb keyframes (CSS-only, no JS overhead) ───── */
const orbStyle = `
@keyframes float-a { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,-40px) scale(1.05)} }
@keyframes float-b { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-25px,35px) scale(1.08)} }
@keyframes float-c { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,25px) scale(0.95)} }
`;

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <style>{orbStyle}</style>
      <LandingNavbar scrolled={scrolled} dark={dark} onToggleTheme={toggleTheme} />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <BenefitsSection />
      <StatsSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <LandingFooter />
    </div>
  );
};

export default LandingPage;