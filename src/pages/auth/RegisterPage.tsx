import { loginUser, registerUser } from '@/api/auth';
import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import FaceRegister from '@/components/FaceRegister';
import { UserRole, departments } from '@/types';
import { IdcardOutlined, LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Input, Select, Spin } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const benefits = [
  {
    title: 'Fast issue reporting',
    description: 'Raise complaints, track resolutions, and keep every update visible from one dashboard.',
  },
  {
    title: 'Academic collaboration',
    description: 'Connect with peers and faculty in a doubt community designed for clear, useful answers.',
  },
  {
    title: 'Announcements that reach everyone',
    description: 'Stay synced on campus notices without digging through scattered channels.',
  },
];

const roleOptions: { label: string; value: UserRole }[] = [
  { label: 'Student', value: 'STUDENT' },
  { label: 'Faculty', value: 'FACULTY' },
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Super Admin', value: 'SUPER_ADMIN' },
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
      if (!userData.fullName.trim()) {
        toast.error('Please enter your full name');
        return;
      }
      if (!userData.email.trim()) {
        toast.error('Please enter your email');
        return;
      }
      if (!userData.password.trim()) {
        toast.error('Please enter a password');
        return;
      }
      if (!role) {
        toast.error('Please select a role');
        return;
      }
      if (role === 'STUDENT' && !userData.studentId.trim()) {
        toast.error('Please enter your Student ID');
        return;
      }

      setLoading(true);
      const username = role === 'STUDENT' ? userData.studentId : userData.email;
      const user = await registerUser(userData.fullName, userData.email, userData.password, role, username);
      void user;
      toast.success('Account created! Set up face login or skip to proceed.');

      try {
        const loginResponse = await loginUser(userData.email, userData.password);
        localStorage.setItem('token', loginResponse.token);
        setShowFaceRegister(true);
      } catch {
        setTimeout(() => navigate('/login'), 1000);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFaceSuccess = () => {
    toast.success('Face registered! Your account is pending approval.');
    localStorage.removeItem('token');
    setTimeout(() => navigate('/login'), 1000);
  };

  const handleFaceSkip = () => {
    toast.info('Skipped face setup. You can register your face later from your profile.');
    localStorage.removeItem('token');
    setTimeout(() => navigate('/login'), 800);
  };

  if (showFaceRegister) {
    return (
      <AuthSplitLayout
        showcaseEyebrow="Biometric Setup"
        showcaseTitle={
          <>
            Finish With{' '}
            <span className="bg-gradient-to-r from-cyan-200 via-white to-cyan-300 bg-clip-text text-transparent">
              Secure Face Login
            </span>
          </>
        }
        showcaseDescription="Add Face ID now for quicker sign-ins and a smoother daily workflow. Your biometric data stays encrypted and private."
        highlights={[
          {
            title: 'Quick access from day one',
            description: 'Use your face as a faster sign-in method once your account is approved.',
          },
          {
            title: 'Encrypted biometric storage',
            description: 'Face data is handled for authentication only and is not shared elsewhere.',
          },
          {
            title: 'Optional during setup',
            description: 'You can complete this step now or skip and add it later from your profile.',
          },
        ]}
        testimonial={{
          quote: 'Face login removes friction for students and staff who need to jump into the platform quickly between classes.',
          name: 'Security Team',
          meta: 'CampusCure Access Controls',
          initials: 'SC',
          accentClassName: 'bg-gradient-to-br from-sky-500 to-cyan-600',
        }}
        formEyebrow="Final Step"
        formTitle="Set up Face ID"
        formDescription="Complete biometric registration now to unlock faster, more secure logins."
      >
        <div className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-3 shadow-inner shadow-slate-100">
          <FaceRegister onSuccess={handleFaceSuccess} onSkip={handleFaceSkip} />
        </div>
      </AuthSplitLayout>
    );
  }

  return (
    <AuthSplitLayout
      showcaseEyebrow="Get Started"
      showcaseTitle={
        <>
          Create Your{' '}
          <span className="bg-gradient-to-r from-cyan-200 via-white to-cyan-300 bg-clip-text text-transparent">
            CampusCure Account
          </span>
        </>
      }
      showcaseDescription="Join the platform built for smoother complaints, stronger communication, and clearer campus-wide coordination."
      highlights={benefits}
      testimonial={{
        quote: 'The doubt community and announcements feed save time every week. It feels like one system instead of five disconnected ones.',
        name: 'Sneha Patel',
        meta: 'M.Tech IT, 1st Year',
        initials: 'SP',
        accentClassName: 'bg-gradient-to-br from-fuchsia-500 to-rose-500',
      }}
      formEyebrow="Register"
      formTitle="Create your account"
      formDescription="Set up your profile once and get access to the tools your role needs across the platform."
      footer={
        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-cyan-700 transition-colors hover:text-cyan-900">
            Sign In
          </Link>
        </p>
      }
    >

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Full name</label>
          <Input
            size="large"
            prefix={<UserOutlined className="text-slate-400" />}
            placeholder="Your full name"
            className="h-[52px] rounded-2xl border-slate-200 bg-slate-50/70 px-2 shadow-none"
            value={userData.fullName}
            onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Email address</label>
          <Input
            size="large"
            prefix={<MailOutlined className="text-slate-400" />}
            placeholder="you@campus.edu"
            type="email"
            className="h-[52px] rounded-2xl border-slate-200 bg-slate-50/70 px-2 shadow-none"
            value={userData.email}
            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Password</label>
          <Input.Password
            size="large"
            prefix={<LockOutlined className="text-slate-400" />}
            placeholder="Create a secure password"
            className="h-[52px] rounded-2xl border-slate-200 bg-slate-50/70 px-2 shadow-none"
            value={userData.password}
            onChange={(e) => setUserData({ ...userData, password: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Role</label>
          <Select
            size="large"
            placeholder="Select your role"
            className="w-full"
            value={role || undefined}
            onChange={(value: UserRole) => setRole(value)}
            options={roleOptions}
          />
        </div>

        <AnimatePresence initial={false}>
          {role ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="space-y-4 rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
                {(role === 'STUDENT' || role === 'FACULTY' || role === 'ADMIN') && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Department</label>
                    <Select
                      size="large"
                      placeholder="Select department"
                      className="w-full"
                      options={departments.map((department) => ({ label: department, value: department }))}
                      value={userData.department || undefined}
                      onChange={(value) => setUserData({ ...userData, department: value })}
                    />
                  </div>
                )}

                {role === 'STUDENT' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }} className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Student ID</label>
                    <Input
                      size="large"
                      prefix={<IdcardOutlined className="text-slate-400" />}
                      placeholder="Enter your student ID"
                      className="h-[52px] rounded-2xl border-slate-200 bg-white px-2 shadow-none"
                      value={userData.studentId}
                      onChange={(e) => setUserData({ ...userData, studentId: e.target.value })}
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <button
          onClick={handleRegister}
          disabled={loading}
          className="flex h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#06204d_0%,#0c5d8e_52%,#16b3c6_100%)] text-base font-semibold text-white shadow-[0_16px_36px_rgba(8,79,120,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_42px_rgba(8,79,120,0.34)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Spin size="small" /> : 'Create Account'}
        </button>
      </div>
    </AuthSplitLayout>
  );
};

export default RegisterPage;
