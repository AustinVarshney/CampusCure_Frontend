import logo from '@/assets/logo.jpeg';
import { GithubOutlined, LinkedinFilled, MailOutlined, TwitterOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const LandingFooter = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Product: [
      { label: 'Features', action: () => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }) },
      { label: 'How It Works', action: () => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }) },
      { label: 'Benefits', action: () => document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' }) },
      { label: 'Testimonials', action: () => document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' }) },
    ],
    Platform: [
      { label: 'Student Portal', action: () => navigate('/login') },
      { label: 'Faculty Portal', action: () => navigate('/login') },
      { label: 'Admin Portal', action: () => navigate('/login') },
      { label: 'Register', action: () => navigate('/register') },
    ],
    Legal: [
      { label: 'Privacy Policy', action: () => {} },
      { label: 'Terms of Service', action: () => {} },
      { label: 'Cookie Policy', action: () => {} },
    ],
  };

  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-9 w-9 shrink-0">
                <img src={logo} alt="CampusCure" className="h-full w-full object-fill" />
              </div>
              <span className="text-xl font-bold"><span className="bg-linear-to-r from-[#041A47] via-[#00639B] to-[#009BB0] bg-clip-text text-transparent">
    Campus
  </span>
  <span className="text-[#041A47]">
    Cure
  </span></span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-6">
              Transforming campus management with intelligent solutions for students, faculty, and administrators.
            </p>
            <div className="flex gap-2">
              {[
                { icon: <TwitterOutlined />, href: '#', label: 'Twitter' },
                { icon: <LinkedinFilled />, href: '#', label: 'LinkedIn' },
                { icon: <GithubOutlined />, href: '#', label: 'GitHub' },
                { icon: <MailOutlined />, href: 'mailto:contact@campuscure.com', label: 'Email' },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="h-7 w-7 flex items-center justify-center rounded-xl bg-accent text-muted-foreground hover:bg-[#009BB0] hover:text-white transition-all duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4">{group}</h3>
              <ul className="space-y-3">
                {links.map((link, idx) => (
                  <li key={idx}>
                    <button
                      onClick={link.action}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} CampusCure. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Built with <span className="text-red-500">&#10084;&#65039;</span> for campus communities
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;