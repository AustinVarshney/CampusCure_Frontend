import { loginUser } from '@/api/auth';
import { useAuth, getRoleRedirect } from '@/context/AuthContext';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Input } from 'antd';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';


const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setLoading(true);
      const response = await loginUser(email, password);
      login(response.token, response.user);
      const redirectPath = getRoleRedirect(response.user.role);
      navigate(redirectPath);
      toast.success(`Welcome back, ${response.user.name}!`);
    } catch (error) {
      setLoading(false);
      toast.error(error instanceof Error ? error.message : 'Login failed');
      throw error;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, hsl(214 100% 97%), hsl(214 60% 92%))' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <Card className="rounded-2xl shadow-lg" styles={{ body: { padding: 32 } }}>
          <div className="text-center mb-8">
            <div className="text-4xl mb-2">🎓</div>
            <h1 className="text-2xl font-bold text-foreground">CampusCure</h1>
            <p className="text-muted-foreground text-sm mt-1">Smart Campus Management System</p>
          </div>

          <div className="space-y-4">
            <Input
              size="large"
              prefix={<UserOutlined className="text-muted-foreground" />}
              placeholder="Email address"
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
            <Button type="primary" size="large" block loading={loading} onClick={handleLogin} className="rounded-xl h-11 font-semibold">
              Sign In
            </Button>
          </div>

          <div className="text-center mt-6">
            <span className="text-sm text-muted-foreground">Don't have an account? </span>
            <Link to="/register" className="text-sm font-medium" style={{ color: 'hsl(214 100% 50%)' }}>Register</Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;