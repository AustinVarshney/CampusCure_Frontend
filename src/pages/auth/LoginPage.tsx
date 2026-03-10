import { loginUser } from '@/api/auth';
import { useAuth } from '@/context/AuthContext';
import { getRoleRedirect } from '@/lib/authUtils';
import { ArrowLeftOutlined, CheckOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { Input, Spin } from 'antd';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const features = [
  'Real-time complaint tracking',
  'Collaborative doubt community',
  'Role-based access control',
];

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getRoleRedirect(user.role, user), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    try {
      setLoading(true);
      const response = await loginUser(email, password);
      login(response.token, response.user);
      toast.success(`Welcome back, ${response.user.name}!`);
      navigate(getRoleRedirect(response.user.role, response.user));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* ── Left brand panel (lg+) ── */}
      <div className="hidden lg:flex flex-col justify-between w-[460px] shrink-0 bg-linear-to-br from-slate-900 via-blue-950 to-indigo-950 p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[48px_48px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-48 bg-blue-600/20 blur-3xl rounded-full" />

        {/* Logo + tagline */}
        <div className="relative">
          <div className="flex items-center gap-2.5 mb-12">
            <div className="h-9 w-9 rounded-xl bg-linear-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-md shadow-blue-600/30">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-xl font-bold text-white">CampusCure</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 leading-snug">
            The Smarter Way to{' '}
            <span className="bg-linear-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              Manage Campus Life
            </span>
          </h2>
          <p className="text-blue-200/70 text-sm leading-relaxed mb-10">
            One platform for complaints, doubts, and announcements — built for the entire campus community.
          </p>
          <div className="space-y-4">
            {features.map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center shrink-0">
                  <CheckOutlined style={{ fontSize: 9 }} className="text-blue-400" />
                </div>
                <span className="text-sm text-blue-100/80">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial quote */}
        <div className="relative border border-white/10 rounded-2xl p-5 bg-white/5 backdrop-blur-sm">
          <p className="text-sm text-blue-100/80 italic leading-relaxed mb-4">
            "CampusCure made it so easy to report issues and track their resolution. A game-changer for our campus!"
          </p>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-linear-to-br from-violet-600 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
              AS
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Ankit Sharma</div>
              <div className="text-xs text-blue-300/60">B.Tech CSE, 3rd Year</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Back link */}
        <div className="p-6">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeftOutlined style={{ fontSize: 12 }} />
            Back to home
          </Link>
        </div>

        {/* Centered form */}
        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="w-full max-w-sm"
          >
            {/* Mobile logo */}
            <div className="flex items-center gap-2.5 mb-8 lg:hidden">
              <div className="h-8 w-8 rounded-xl bg-linear-to-br from-blue-600 to-violet-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-lg font-bold bg-linear-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">CampusCure</span>
            </div>

            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-1">Welcome back</h1>
              <p className="text-sm text-muted-foreground">Sign in to your CampusCure account</p>
            </div>

            <div className="space-y-4">
              <Input
                size="large"
                prefix={<UserOutlined className="text-muted-foreground" />}
                placeholder="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onPressEnter={handleLogin}
                className="rounded-xl"
              />
              <Input.Password
                size="large"
                prefix={<LockOutlined className="text-muted-foreground" />}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onPressEnter={handleLogin}
                className="rounded-xl"
              />

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full h-11 rounded-xl font-semibold text-white bg-linear-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 transition-all shadow-lg shadow-blue-600/25 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? <Spin size="small" /> : 'Sign In'}
              </button>
            </div>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <button
              onClick={() => navigate('/face-login')}
              className="w-full h-11 rounded-xl font-semibold border border-border bg-card text-foreground hover:bg-accent transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <span>📷</span> Login with Face ID
            </button>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
                Register
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;