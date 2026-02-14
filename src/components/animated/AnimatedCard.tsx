import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
  onClick?: () => void;
}

const AnimatedCard = ({ children, className = '', delay = 0, onClick }: Props) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: 'easeOut' }}
    whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(22,119,255,0.10)' }}
    className={`rounded-2xl bg-card border border-border p-6 shadow-sm cursor-pointer ${className}`}
    onClick={onClick}
  >
    {children}
  </motion.div>
);

export default AnimatedCard;
