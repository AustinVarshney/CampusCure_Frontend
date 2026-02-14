import type { UserRole } from '@/data/mockData';
import { departments } from '@/data/mockData';
import { IdcardOutlined, LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Input, Select, message } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [role, setRole] = useState<UserRole | ''>('');
  const navigate = useNavigate();

  const handleRegister = () => {
    message.success('Registration successful! Please login.');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, hsl(214 100% 97%), hsl(214 60% 92%))' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="rounded-2xl shadow-lg" styles={{ body: { padding: 32 } }}>
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🎓</div>
            <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
            <p className="text-muted-foreground text-sm mt-1">Join CampusCure today</p>
          </div>

          <div className="space-y-4">
            <Input size="large" prefix={<UserOutlined />} placeholder="Full Name" className="rounded-xl" />
            <Input size="large" prefix={<MailOutlined />} placeholder="Email address" className="rounded-xl" />
            <Input.Password size="large" prefix={<LockOutlined />} placeholder="Password" className="rounded-xl" />

            <Select
              size="large"
              placeholder="Select Role"
              className="w-full"
              onChange={(v: UserRole) => setRole(v)}
              options={[
                { label: 'Student', value: 'student' },
                { label: 'Faculty', value: 'faculty' },
              ]}
            />

            <AnimatePresence>
              {role && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden space-y-4"
                >
                  <Select
                    size="large"
                    placeholder="Select Department"
                    className="w-full"
                    options={departments.map((d) => ({ label: d, value: d }))}
                  />
                  {role === 'student' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                      <Input size="large" prefix={<IdcardOutlined />} placeholder="Student ID" className="rounded-xl" />
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <Button type="primary" size="large" block onClick={handleRegister} className="rounded-xl h-11 font-semibold">
              Register
            </Button>
          </div>

          <div className="text-center mt-6">
            <span className="text-sm text-muted-foreground">Already have an account? </span>
            <Link to="/login" className="text-sm font-medium" style={{ color: 'hsl(214 100% 50%)' }}>Sign In</Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default RegisterPage;