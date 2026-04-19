import { loginUser } from '@/api/auth';
import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import { useAuth } from '@/context/AuthContext';
import { getRoleRedirect } from '@/lib/authUtils';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Input, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const features = [
  {
    title: 'Real-time complaint tracking',
    description: 'Students and staff can file, route, and monitor issues without relying on scattered updates.',
  },
  {
    title: 'Collaborative doubt community',
    description: 'Academic questions stay visible, searchable, and easier for peers and faculty to resolve together.',
  },
  {
    title: 'Role-based access control',
    description: 'Each user lands in a dashboard tailored to their responsibilities and approval flow.',
  },
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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <AuthSplitLayout
      showcaseTitle={
        <>
          The Smarter Way to{' '}
        <span className="bg-linear-to-r from-cyan-200 via-white to-cyan-300 bg-clip-text text-transparent">
            Manage Campus Life
          </span>
        </>
      }
      showcaseDescription="One workspace for complaints & doubts. Built to keep the entire campus community aligned."
      highlights={features}
      formEyebrow="Sign In"
      formTitle="Welcome back"
      formDescription="Access your dashboard, continue active conversations, and keep campus operations moving."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-primary transition-colors hover:opacity-90">
            Register
          </Link>
        </p>
      }
    >

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Email address</label>
          <Input
            size="large"
            prefix={<UserOutlined className="text-muted-foreground" />}
            placeholder="you@campus.edu"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onPressEnter={handleLogin}
            className="h-13 rounded-2xl border-border bg-input/70 px-2 shadow-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Password</label>
          <Input.Password
            size="large"
            prefix={<LockOutlined className="text-muted-foreground" />}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onPressEnter={handleLogin}
          className="h-13 rounded-2xl border-border bg-input/70 px-2 shadow-none"
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
className="flex h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#06204d_0%,#0c5d8e_52%,#16b3c6_100%)] text-base font-semibold text-white shadow-[0_16px_36px_rgba(8,79,120,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_42px_rgba(8,79,120,0.34)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Spin size="small" /> : 'Sign In'}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <button
        onClick={() => navigate('/face-login')}
       className="flex h-13 w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border border-border bg-card text-sm font-semibold text-foreground transition-colors hover:border-cyan-300 hover:bg-accent/60"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted text-base">
          <LockOutlined />
        </span>
        Login with Face ID
      </button>
    </AuthSplitLayout>
  );
};

export default LoginPage;
