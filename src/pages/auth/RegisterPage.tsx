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
    university: '',
    department: '',
    studentId: '',
    facultyId: '',
    adminId: '',
    superAdminId: '',
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
      if (!userData.university.trim()) {
        toast.error('Please enter your university');
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
      if (role === 'FACULTY' && !userData.facultyId.trim()) {
        toast.error('Please enter your Faculty ID');
        return;
      }
      if (role === 'ADMIN' && !userData.adminId.trim()) {
        toast.error('Please enter your Admin ID');
        return;
      }
      if (role === 'SUPER_ADMIN' && !userData.superAdminId.trim()) {
        toast.error('Please enter your Super Admin ID');
        return;
      }

      setLoading(true);
      const userID =
        role === 'STUDENT'
          ? userData.studentId
          : role === 'FACULTY'
            ? userData.facultyId
            : role === 'ADMIN'
              ? userData.adminId
              : userData.superAdminId;
      const user = await registerUser(userData.fullName, userData.email, userData.password, role, userID, userData.university);
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
            <span className="bg-linear-to-r from-cyan-200 via-white to-cyan-300 bg-clip-text text-transparent">
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

        formEyebrow="Final Step"
        formTitle="Set up Face ID"
        formDescription="Complete biometric registration now to unlock faster, more secure logins."
      >
        <div className="rounded-[28px] border border-border bg-muted/30 p-3 shadow-inner shadow-slate-100/40 dark:shadow-black/20">
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
          <span className="bg-linear-to-r from-cyan-200 via-white to-cyan-300 bg-clip-text text-transparent">
            CampusCure Account
          </span>
        </>
      }
      showcaseDescription="Join the platform built for smoother complaints, stronger communication, and clearer campus-wide coordination."
      highlights={benefits}
      formEyebrow="Register"
      formTitle="Create your account"
      formDescription="Set up your profile once and get access to the tools your role needs across the platform."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary transition-colors hover:opacity-90">
            Sign In
          </Link>
        </p>
      }
    >

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Full name</label>
          <Input
            size="large"
            prefix={<UserOutlined className="text-muted-foreground" />}
            placeholder="Your full name"
            className="h-13 rounded-2xl border-border bg-input/70 px-2 shadow-none"
            value={userData.fullName}
            onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Email address</label>
          <Input
            size="large"
            prefix={<MailOutlined className="text-muted-foreground" />}
            placeholder="you@campus.edu"
            type="email"
            className="h-13 rounded-2xl border-border bg-input/70 px-2 shadow-none"
            value={userData.email}
            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Password</label>
          <Input.Password
            size="large"
            prefix={<LockOutlined className="text-muted-foreground" />}
            placeholder="Create a secure password"
            className="h-13 rounded-2xl border-border bg-input/70 px-2 shadow-none"
            value={userData.password}
            onChange={(e) => setUserData({ ...userData, password: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">University</label>
          <Input
            size="large"
            prefix={<IdcardOutlined className="text-muted-foreground" />}
            placeholder="Enter your university name"
            className="h-13 rounded-2xl border-border bg-input/70 px-2 shadow-none"
            value={userData.university}
            onChange={(e) => setUserData({ ...userData, university: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Role</label>
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
              <div className="space-y-4 rounded-3xl border border-border bg-muted/25 p-4">
                {(role === 'STUDENT' || role === 'FACULTY' || role === 'ADMIN') && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Department</label>
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
                    <label className="text-sm font-medium text-foreground">Student ID</label>
                    <Input
                      size="large"
                      prefix={<IdcardOutlined className="text-muted-foreground" />}
                      placeholder="Enter your student ID"
                      className="h-13 rounded-2xl border-border bg-card px-2 shadow-none"
                      value={userData.studentId}
                      onChange={(e) => setUserData({ ...userData, studentId: e.target.value })}
                    />
                  </motion.div>
                )}

                {role === 'FACULTY' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }} className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Faculty ID</label>
                    <Input
                      size="large"
                      prefix={<IdcardOutlined className="text-muted-foreground" />}
                      placeholder="Enter your faculty ID"
                      className="h-13 rounded-2xl border-border bg-card px-2 shadow-none"
                      value={userData.facultyId}
                      onChange={(e) => setUserData({ ...userData, facultyId: e.target.value })}
                    />
                  </motion.div>
                )}

                {role === 'ADMIN' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }} className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Admin ID</label>
                    <Input
                      size="large"
                      prefix={<IdcardOutlined className="text-muted-foreground" />}
                      placeholder="Enter your admin ID"
                      className="h-13 rounded-2xl border-border bg-card px-2 shadow-none"
                      value={userData.adminId}
                      onChange={(e) => setUserData({ ...userData, adminId: e.target.value })}
                    />
                  </motion.div>
                )}

                {role === 'SUPER_ADMIN' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }} className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Super Admin ID</label>
                    <Input
                      size="large"
                      prefix={<IdcardOutlined className="text-muted-foreground" />}
                      placeholder="Enter your super admin ID"
                      className="h-13 rounded-2xl border-border bg-card px-2 shadow-none"
                      value={userData.superAdminId}
                      onChange={(e) => setUserData({ ...userData, superAdminId: e.target.value })}
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
          className="flex h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#06204d_0%,#0c5d8e_52%,#16b3c6_100%)] text-base font-semibold text-white shadow-[0_16px_36px_rgba(8,79,120,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_42px_rgba(8,79,120,0.34)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Spin size="small" /> : 'Create Account'}
        </button>
      </div>
    </AuthSplitLayout>
  );
};

export default RegisterPage;
