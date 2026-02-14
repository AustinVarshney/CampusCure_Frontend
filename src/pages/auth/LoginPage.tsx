import { getRoleRedirect, useAuth } from '@/context/AuthContext';
import { demoUsers } from '@/data/mockData';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Divider, Input, message } from 'antd';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';


const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      const success = login(email, password);
      if (success) {
        const user = demoUsers.find((u) => u.email === email)!;
        message.success(`Welcome back, ${user.name}!`);
        navigate(getRoleRedirect(user.role));
      } else {
        message.error('Invalid credentials. Use a demo account below.');
      }
      setLoading(false);
    }, 500);
  };

  const quickLogin = (email: string) => {
    setEmail(email);
    setPassword('demo123');
    const success = login(email, 'demo123');
    if (success) {
      const user = demoUsers.find((u) => u.email === email)!;
      message.success(`Welcome, ${user.name}!`);
      navigate(getRoleRedirect(user.role));
    }
  };

  const roleColors: Record<string, string> = {
    student: '#1677FF',
    faculty: '#52c41a',
    admin: '#fa8c16',
    superadmin: '#722ed1',
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

          <Divider className="text-muted-foreground">Quick Demo Login</Divider>

          <div className="grid grid-cols-2 gap-2">
            {demoUsers.map((u) => (
              <motion.div key={u.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  block
                  onClick={() => quickLogin(u.email)}
                  className="rounded-xl h-auto py-2 text-left"
                  style={{ borderColor: roleColors[u.role], color: roleColors[u.role] }}
                >
                  <div className="text-xs font-semibold">{u.role.charAt(0).toUpperCase() + u.role.slice(1)}</div>
                  <div className="text-[10px] opacity-70 truncate">{u.email}</div>
                </Button>
              </motion.div>
            ))}
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