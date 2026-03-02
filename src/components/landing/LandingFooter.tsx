import { useNavigate } from 'react-router-dom';

const LandingFooter = () => {
  const navigate = useNavigate();

  return (
    <footer className="py-10 px-6 border-t border-border">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <span>© {new Date().getFullYear()} CampusCure. All rights reserved.</span>
        <div className="flex gap-6">
          <button onClick={() => navigate('/login')} className="hover:text-foreground transition-colors">Login</button>
          <button onClick={() => navigate('/register')} className="hover:text-foreground transition-colors">Register</button>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;