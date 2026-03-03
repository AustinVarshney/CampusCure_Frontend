import { registerUser } from '@/api/auth';
import { UserRole, departments } from '@/types';
import { IdcardOutlined, LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Input, Select } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const RegisterPage = () => {
  const [role, setRole] = useState<UserRole | ''>('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    password: '',
    department: '',
    studentId: '',
  });
  const navigate = useNavigate();

  const handleRegister = async () => {
   try {
    // Validate required fields
    if (!userData.fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (!userData.email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    if (!userData.password.trim()) {
      toast.error("Please enter a password");
      return;
    }
    if (!role) {
      toast.error("Please select a role");
      return;
    }
    if (role === 'STUDENT' && !userData.studentId.trim()) {
      toast.error("Please enter your Student ID");
      return;
    }
    
    setLoading(true);
    
    // Use studentId as username for students, email for others
    const username = role === 'STUDENT' ? userData.studentId : userData.email;
    
    const user = await registerUser(userData.fullName, userData.email, userData.password, role, username);
    console.log("Registered user:", user);
    toast.success("Registration successful! Redirecting to login...", { description: user.name });
    setTimeout(() => navigate("/login"), 1500);
   } catch (error) {
    toast.error(error instanceof Error ? error.message : "Registration failed. Please try again.");
   } finally {
    setLoading(false);
   }
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
            <Input size="large" prefix={<UserOutlined />} placeholder="Full Name" className="rounded-xl" value={userData.fullName} onChange={(e) => setUserData({...userData, fullName: e.target.value})} />
            <Input size="large" prefix={<MailOutlined />} placeholder="Email address" className="rounded-xl" value={userData.email} onChange={(e) => setUserData({...userData, email: e.target.value})} />
            <Input.Password size="large" prefix={<LockOutlined />} placeholder="Password" className="rounded-xl" value={userData.password} onChange={(e) => setUserData({...userData, password: e.target.value})} />

            <Select
              size="large"
              placeholder="Select Role"
              className="w-full"
              onChange={(v: UserRole) => setRole(v)}
              options={[
                { label: 'Admin', value: 'ADMIN' },
                { label: 'Faculty', value: 'FACULTY' },
                { label: 'Student', value: 'STUDENT' },
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
                    value={userData.department}
                    onChange={(value) => setUserData({...userData, department: value})}
                  />
                  {role === 'STUDENT' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                      <Input size="large" prefix={<IdcardOutlined />} placeholder="Student ID" className="rounded-xl" value={userData.studentId} onChange={(e) => setUserData({...userData, studentId: e.target.value})} />
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <Button type="primary" size="large" block loading={loading} onClick={handleRegister} className="rounded-xl h-11 font-semibold mt-4">
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