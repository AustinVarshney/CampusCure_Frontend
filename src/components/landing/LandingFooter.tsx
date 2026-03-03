import { GithubOutlined, LinkedinOutlined, MailOutlined, TwitterOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const LandingFooter = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: 'Features', action: () => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }) },
      { label: 'How It Works', action: () => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }) },
      { label: 'Benefits', action: () => document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' }) },
      { label: 'Testimonials', action: () => document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' }) },
    ],
    company: [
      { label: 'About Us', action: () => {} },
      { label: 'Contact', action: () => {} },
      { label: 'Careers', action: () => {} },
      { label: 'Press Kit', action: () => {} },
    ],
    resources: [
      { label: 'Documentation', action: () => {} },
      { label: 'Help Center', action: () => {} },
      { label: 'API Reference', action: () => {} },
      { label: 'Community', action: () => {} },
    ],
    legal: [
      { label: 'Privacy Policy', action: () => {} },
      { label: 'Terms of Service', action: () => {} },
      { label: 'Cookie Policy', action: () => {} },
      { label: 'License', action: () => {} },
    ],
  };

  const socialLinks = [
    { icon: <TwitterOutlined />, href: '#', label: 'Twitter', color: 'hover:text-[#1DA1F2]' },
    { icon: <LinkedinOutlined />, href: '#', label: 'LinkedIn', color: 'hover:text-[#0077B5]' },
    { icon: <GithubOutlined />, href: '#', label: 'GitHub', color: 'hover:' },
    { icon: <MailOutlined />, href: 'mailto:contact@campuscure.com', label: 'Email', color: 'hover:text-blue-400' },
  ];

  return (
    <footer className="relative bg-linear-to-br from-blue-500/10 via-purple-500/10 to-blue-600/10 border-t border-slate-300 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
          {/* Brand Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="text-3xl">🎓</div>
              <span className="text-2xl font-bold bg-linear-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                CampusCure
              </span>
            </div>
            <p className="text-slate-800 text-sm mb-6 max-w-xs">
              Transforming campus management with intelligent solutions. Empowering students, faculty, and administrators.
            </p>
            
            {/* Newsletter */}
            <div className="space-y-2">
              <p className="text-sm font-medium ">Subscribe to our newsletter</p>
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter your email" 
                  className="rounded-lg bg-slate-800 border-slate-700  placeholder:text-slate-500"
                  suffix={
                    <button className="text-blue-400 hover:text-blue-300 transition-colors">
                      <MailOutlined />
                    </button>
                  }
                />
              </div>
            </div>
          </motion.div>

          {/* Product Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="font-semibold  mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link, idx) => (
                <li key={idx}>
                  <button
                    onClick={link.action}
                    className="text-sm text-slate-800 hover:text-blue-400 transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="font-semibold  mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link, idx) => (
                <li key={idx}>
                  <button
                    onClick={link.action}
                    className="text-sm text-slate-800 hover:text-blue-400 transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Resources Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="font-semibold  mb-4">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link, idx) => (
                <li key={idx}>
                  <button
                    onClick={link.action}
                    className="text-sm text-slate-800 hover:text-blue-400 transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className="font-semibold  mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, idx) => (
                <li key={idx}>
                  <button
                    onClick={link.action}
                    className="text-sm text-slate-800 hover:text-blue-400 transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 mb-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright */}
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm text-slate-800"
          >
            © {currentYear} CampusCure. All rights reserved. Made with ❤️ for education.
          </motion.p>

          {/* Social Links */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-4"
          >
            {socialLinks.map((social, idx) => (
              <a
                key={idx}
                href={social.href}
                target={social.href.startsWith('http') ? '_blank' : undefined}
                rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                aria-label={social.label}
                className={`text-xl text-slate-800 ${social.color} transition-all duration-300 hover:scale-110`}
              >
                {social.icon}
              </a>
            ))}
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex gap-3"
          >
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-sm font-medium text-gray-800 hover: transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-4 py-2 text-sm font-medium bg-blue-600  rounded-lg hover:bg-blue-700 transition-all hover:scale-105 text-white"
            >
              Get Started
            </button>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;