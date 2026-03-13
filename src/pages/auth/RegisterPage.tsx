import { loginUser, registerUser } from '@/api/auth';
import logo from '@/assets/logo.jpeg';
import FaceRegister from '@/components/FaceRegister';
import { UserRole, departments } from '@/types';
import { ArrowLeftOutlined, CheckOutlined, IdcardOutlined, LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Input, Select, Spin } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const benefits = [
  'Submit & track complaints in real-time',
  'Ask & answer academic doubts',
  'Stay informed with campus announcements',
];

const RegisterPage = () => {
  const [role, setRole] = useState<UserRole | ''>('');
  const [loading, setLoading] = useState(false);
  const [showFaceRegister, setShowFaceRegister] = useState(false);
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
    if (!userData.fullName.trim()) { toast.error("Please enter your full name"); return; }
    if (!userData.email.trim()) { toast.error("Please enter your email"); return; }
    if (!userData.password.trim()) { toast.error("Please enter a password"); return; }
    if (!role) { toast.error("Please select a role"); return; }
    if (role === 'STUDENT' && !userData.studentId.trim()) { toast.error("Please enter your Student ID"); return; }

    setLoading(true);
    const username = role === 'STUDENT' ? userData.studentId : userData.email;
    const user = await registerUser(userData.fullName, userData.email, userData.password, role, username);
    console.log("Registered user:", user);
    toast.success("Account created! Set up face login or skip to proceed.");

    try {
      const loginResponse = await loginUser(userData.email, userData.password);
      localStorage.setItem('token', loginResponse.token);
      setShowFaceRegister(true);
    } catch {
      setTimeout(() => navigate("/login"), 1000);
    }
   } catch (error) {
    toast.error(error instanceof Error ? error.message : "Registration failed. Please try again.");
   } finally {
    setLoading(false);
   }
  };

  const handleFaceSuccess = () => {
    toast.success("Face registered! Your account is pending approval.");
    localStorage.removeItem('token');
    setTimeout(() => navigate("/login"), 1000);
  };

  const handleFaceSkip = () => {
    toast.info("Skipped face setup. You can register your face later from your profile.");
    localStorage.removeItem('token');
    setTimeout(() => navigate("/login"), 800);
  };

  if (showFaceRegister) {
    return (
      <div className="min-h-screen flex bg-background">
        <div className="hidden lg:flex flex-col justify-between w-115 shrink-0 bg-linear-to-br from-slate-900 via-blue-950 to-indigo-950 p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[48px_48px]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-48 bg-violet-600/20 blur-3xl rounded-full" />
          <div className="relative flex items-center gap-2.5">
            <div className="h-9 w-9 shrink-0">
              <img src={logo} alt="CampusCure" className="h-full w-full object-fill" />
            </div>
            <span className="text-xl font-bold"><span className="text-blue-400">Campus</span><span className="text-violet-400">Cure</span></span>
          </div>
          <div className="relative border border-white/10 rounded-2xl p-6 bg-white/5">
            <div className="text-blue-200 text-2xl mb-3">🔒</div>
            <h3 className="text-white font-semibold mb-2">Secure Face Login</h3>
            <p className="text-sm text-blue-200/70 leading-relaxed">
              Register your face to enable quick and secure login. Your biometric data is encrypted and never shared.
            </p>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-screen">
          <div className="p-6">
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeftOutlined style={{ fontSize: 12 }} />
              Back to home
            </Link>
          </div>
          <div className="flex-1 flex items-center justify-center px-6 pb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="w-full max-w-sm"
            >
              <div className="rounded-2xl border border-border bg-card p-8 shadow-xl shadow-black/5">
                <FaceRegister onSuccess={handleFaceSuccess} onSkip={handleFaceSkip} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* ── Left brand panel (lg+) ── */}
      <div className="hidden lg:flex flex-col justify-between w-115 shrink-0 bg-linear-to-br from-slate-900 via-blue-950 to-indigo-950 p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[48px_48px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-48 bg-violet-600/20 blur-3xl rounded-full" />

        <div className="relative">
          <div className="flex items-center gap-2.5 mb-12">
            <div className="h-9 w-9 shrink-0">
              <img src={logo} alt="CampusCure" className="h-full w-full object-fill" />
            </div>
            <span className="text-xl font-bold"><span className="text-blue-400">Campus</span><span className="text-violet-400">Cure</span></span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 leading-snug">
            Join{' '}
            <span className="bg-linear-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              CampusCure
            </span>{' '}
            Today
          </h2>
          <p className="text-blue-200/70 text-sm leading-relaxed mb-10">
            Create your account and start experiencing seamless campus management from day one.
          </p>
          <div className="space-y-4">
            {benefits.map((b) => (
              <div key={b} className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-violet-600/30 border border-violet-500/40 flex items-center justify-center shrink-0">
                  <CheckOutlined style={{ fontSize: 9 }} className="text-violet-400" />
                </div>
                <span className="text-sm text-blue-100/80">{b}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative border border-white/10 rounded-2xl p-5 bg-white/5 backdrop-blur-sm">
          <p className="text-sm text-blue-100/80 italic leading-relaxed mb-4">
            "The doubt community is a lifesaver during exam season. Best campus tool ever built!"
          </p>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-linear-to-br from-rose-600 to-pink-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
              SP
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Sneha Patel</div>
              <div className="text-xs text-blue-300/60">M.Tech IT, 1st Year</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        <div className="p-6">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeftOutlined style={{ fontSize: 12 }} />
            Back to home
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="w-full max-w-sm"
          >
            {/* Mobile logo */}
            <div className="flex items-center gap-2.5 mb-8 lg:hidden">
              <div className="h-8 w-8 shrink-0">
                <img src={logo} alt="CampusCure" className="h-full w-full object-fill" />
              </div>
              <span className="text-lg font-bold"><span className="text-blue-600">Campus</span><span className="text-violet-600">Cure</span></span>
            </div>

            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-1">Create an account</h1>
              <p className="text-sm text-muted-foreground">Fill in your details to get started</p>
            </div>

            <div className="space-y-4">
              <Input
                size="large"
                prefix={<UserOutlined className="text-muted-foreground" />}
                placeholder="Full Name"
                className="rounded-xl"
                value={userData.fullName}
                onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
              />
              <Input
                size="large"
                prefix={<MailOutlined className="text-muted-foreground" />}
                placeholder="Email address"
                type="email"
                className="rounded-xl"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
              />
              <Input.Password
                size="large"
                prefix={<LockOutlined className="text-muted-foreground" />}
                placeholder="Password"
                className="rounded-xl"
                value={userData.password}
                onChange={(e) => setUserData({ ...userData, password: e.target.value })}
              />

              <Select
                size="large"
                placeholder="Select your role"
                className="w-full my-2"
                onChange={(v: UserRole) => setRole(v)}
                options={[
                  { label: 'Student', value: 'STUDENT' },
                  { label: 'Faculty', value: 'FACULTY' },
                  { label: 'Admin', value: 'ADMIN' },
                  { label: '⭐ Super Admin', value: 'SUPER_ADMIN' },
                ]}
              />

              <AnimatePresence>
                {role && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden my-4"
                  >
                    {(role === 'STUDENT' || role === 'FACULTY' || role === 'ADMIN') && (
                      <Select
                        size="large"
                        placeholder="Select Department"
                        className="w-full my-2"
                        options={departments.map((d) => ({ label: d, value: d }))}
                        value={userData.department}
                        onChange={(value) => setUserData({ ...userData, department: value })}
                      />
                    )}
                    {role === 'STUDENT' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                        <Input
                          size="large"
                          prefix={<IdcardOutlined className="text-muted-foreground" />}
                          placeholder="Student ID"
                          className="rounded-xl my-4"
                          value={userData.studentId}
                          onChange={(e) => setUserData({ ...userData, studentId: e.target.value })}
                        />
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={handleRegister}
                disabled={loading}
                className="w-full h-11 rounded-xl font-semibold text-white bg-linear-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 transition-all shadow-lg shadow-blue-600/25 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? <Spin size="small" /> : 'Create Account'}
              </button>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
                Sign In
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
