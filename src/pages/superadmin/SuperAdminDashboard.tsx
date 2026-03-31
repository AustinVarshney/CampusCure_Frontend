import { getDashboardStats, getSuperAdminStats, type DashboardStats, type SuperAdminStats } from '@/api/admin';
import PageTransition from '@/components/animated/PageTransition';
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Button, Progress, Spin, Tag } from 'antd';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const COLORS = ['#1677FF', '#52c41a', '#fa8c16', '#722ed1', '#eb2f96'];

const CountUp = ({ end, delay = 0 }: { end: number; delay?: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      let start = 0;
      const step = Math.max(end / 72, 1);
      const timer = setInterval(() => {
        start += step;
        if (start >= end) { setCount(end); clearInterval(timer); }
        else setCount(Math.floor(start));
      }, 1000 / 60);
      return () => clearInterval(timer);
    }, delay * 1000);
    return () => clearTimeout(timeout);
  }, [end, delay]);
  return <>{count}</>;
};

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [superStats, setSuperStats] = useState<SuperAdminStats | null>(null);
  const [dashStats, setDashStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [s, d] = await Promise.all([getSuperAdminStats(), getDashboardStats()]);
        setSuperStats(s);
        setDashStats(d);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center h-96">
          <Spin size="large" />
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-foreground">Super Admin Dashboard</h1>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600">{error}</div>
        </div>
      </PageTransition>
    );
  }

  const s = superStats!.stats;
  const analytics = dashStats?.analytics ?? { complaintsByMonth: [], complaintsByType: [], complaintsByDept: [] };
  const totalPending = s.pendingStudents + s.pendingFaculty + s.pendingAdmins;
  const hasMonthlyTrendData = analytics.complaintsByMonth.some((item) => (item.complaints ?? 0) > 0 || (item.resolved ?? 0) > 0);
  const hasCategoryData = analytics.complaintsByType.some((item) => (item.value ?? 0) > 0);
  const hasDepartmentData = analytics.complaintsByDept.some((item) => (item.count ?? 0) > 0);

  const topStats = [
    { label: 'Total Students', value: s.totalStudents, pending: s.pendingStudents, icon: <UserOutlined />, iconColor: 'text-cyan-600 dark:text-cyan-400', lightBg: 'bg-cyan-50 dark:bg-cyan-90/30' },
    { label: 'Total Faculty', value: s.totalFaculty, pending: s.pendingFaculty, icon: <TeamOutlined />, iconColor: 'text-green-600 dark:text-green-400', lightBg: 'bg-green-50 dark:bg-green-90/30' },
    { label: 'Total Admins', value: s.totalAdmins, pending: s.pendingAdmins, icon: <SafetyCertificateOutlined />, iconColor: 'text-purple-600 dark:text-purple-400', lightBg: 'bg-purple-50 dark:bg-purple-90/30' },
    { label: 'Total Doubts', value: s.totalDoubts, pending: 0, icon: <QuestionCircleOutlined />, iconColor: 'text-orange-600 dark:text-orange-400', lightBg: 'bg-orange-50 dark:bg-orange-90/30' },
    { label: 'Total Complaints', value: s.totalComplaints, pending: 0, icon: <FileTextOutlined />, iconColor: 'text-red-600 dark:text-red-400', lightBg: 'bg-red-50 dark:bg-red-90/30' },
    { label: 'Resolved', value: s.resolvedComplaints, pending: 0, icon: <CheckCircleOutlined />, iconColor: 'text-teal-600 dark:text-teal-400', lightBg: 'bg-teal-50 dark:bg-teal-90/30' },
  ];

  return (
    <PageTransition>
      <div className="dashboard-surface space-y-6">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="dashboard-hero"
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-size-[48px_48px]" />
          <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-cyan-600/20 blur-3xl" />
          <div className="absolute -bottom-8 right-1/3 h-40 w-40 rounded-full bg-violet-600/15 blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">Super Admin Control Center</h1>
              <Tag color="gold" className="font-semibold">SUPER ADMIN</Tag>
            </div>
            <p className="text-cyan-200/80 mt-1 text-sm">Welcome, {user?.name} · Full system access</p>
            <div className="mt-4 grid grid-cols-1 min-[460px]:grid-cols-2 gap-3">
              <Button type="default" ghost icon={<SafetyCertificateOutlined />} className="rounded-xl border-white/40 text-white w-full" onClick={() => navigate('/superadmin/admins')}>
                Admin Management
              </Button>
              <Button type="default" ghost icon={<SettingOutlined />} className="rounded-xl border-white/40 text-white w-full" onClick={() => navigate('/superadmin/settings')}>
                System Config
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Pending Approvals Alert */}
        {totalPending > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-orange-200 bg-orange-50 dark:bg-orange-40/20 dark:border-orange-800 p-4 flex items-center justify-between flex-wrap gap-3"
          >
            <div className="flex items-center gap-3">
              <ClockCircleOutlined className="text-orange-500 text-lg" />
              <div>
                <p className="font-semibold text-orange-800 dark:text-orange-300">Pending Approvals</p>
                <p className="text-xs text-orange-600 dark:text-orange-700">
                  {s.pendingStudents} students · {s.pendingFaculty} faculty · {s.pendingAdmins} admins
                </p>
              </div>
            </div>
            <Button size="small" className="rounded-xl" onClick={() => navigate('/admin/users')}>
              Review Now
            </Button>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 min-[360px]:grid-cols-2 lg:grid-cols-3 gap-4">
          {topStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.07 }}
              whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.08)' }}
              className="dashboard-card p-5"
            >
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-xl ${stat.lightBg} ${stat.iconColor}`}>
                {stat.icon}
              </div>
              <div className="mt-3">
                <div className="text-3xl font-extrabold text-foreground tracking-tight">
                  <CountUp end={stat.value} delay={0.15 + i * 0.07} />
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                {stat.pending > 0 && (
                  <Tag color="orange" className="mt-1 text-[10px]">{stat.pending} pending</Tag>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Resolution Rate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="dashboard-card flex flex-col items-center justify-center"
          >
            {s.totalComplaints > 0 ? (
              <>
                <Progress
                  type="dashboard"
                  percent={s.resolutionRate}
                  strokeColor={{ '0%': '#722ed1', '100%': '#52c41a' }}
                  format={(p) => <span className="text-2xl font-bold text-foreground">{p}%</span>}
                  size={140}
                />
                <p className="text-sm font-medium text-foreground mt-3">System Resolution Rate</p>
                <p className="text-xs text-muted-foreground">{s.resolvedComplaints} of {s.totalComplaints} complaints resolved</p>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-5xl mb-3">📊</div>
                <p className="text-sm font-medium text-foreground">No Complaints Yet</p>
              </div>
            )}
          </motion.div>

          {/* Monthly Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
            className="dashboard-card lg:col-span-2"
          >
            <h3 className="font-semibold text-foreground mb-4">Monthly Trends</h3>
            {hasMonthlyTrendData ? (
              <ResponsiveContainer width="100%" height={isMobile ? 200 : 220}>
                <AreaChart data={analytics.complaintsByMonth}>
                  <defs>
                    <linearGradient id="saColorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1677FF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#1677FF" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="saColorResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#52c41a" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#52c41a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 91%)" />
                  <XAxis dataKey="month" tick={{ fontSize: isMobile ? 11 : 12 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: isMobile ? 11 : 12 }} width={isMobile ? 28 : 36} />
                  <Tooltip />
                  <Area type="monotone" dataKey="complaints" stroke="#1677FF" fillOpacity={1} fill="url(#saColorTotal)" strokeWidth={2} name="Total" />
                  <Area type="monotone" dataKey="resolved" stroke="#52c41a" fillOpacity={1} fill="url(#saColorResolved)" strokeWidth={2} name="Resolved" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-16">
                <div className="text-5xl mb-3">📈</div>
                <p className="text-sm font-medium text-foreground">No Trend Data Yet</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* By Category + By Dept */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="dashboard-card"
          >
            <h3 className="font-semibold text-foreground mb-4">By Category</h3>
            {hasCategoryData ? (
              <>
                <ResponsiveContainer width="100%" height={isMobile ? 210 : 220}>
                  <PieChart>
                    <Pie
                      data={analytics.complaintsByType}
                      cx="50%"
                      cy="50%"
                      innerRadius={isMobile ? 38 : 50}
                      outerRadius={isMobile ? 66 : 80}
                      dataKey="value"
                      paddingAngle={4}
                    >
                      {analytics.complaintsByType.map((_entry, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {analytics.complaintsByType.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      {item.name.replace('_', ' ')}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <div className="text-5xl mb-3">🏷️</div>
                <p className="text-sm font-medium text-foreground">No Category Data</p>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95 }}
            className="dashboard-card"
          >
            <h3 className="font-semibold text-foreground mb-4">By Department</h3>
            {hasDepartmentData ? (
              <ResponsiveContainer width="100%" height={isMobile ? 240 : 260}>
                <BarChart data={analytics.complaintsByDept} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 91%)" />
                  <XAxis type="number" tick={{ fontSize: isMobile ? 11 : 12 }} width={isMobile ? 28 : undefined} />
                  <YAxis dataKey="dept" type="category" tick={{ fontSize: isMobile ? 10 : 11 }} width={isMobile ? 36 : 45} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#722ed1" radius={[0, 6, 6, 0]} barSize={18} name="Complaints" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-16">
                <div className="text-5xl mb-3">🏛️</div>
                <p className="text-sm font-medium text-foreground">No Department Data</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Admin Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="dashboard-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Admin Overview</h3>
            <Button size="small" className="rounded-xl" onClick={() => navigate('/superadmin/admins')}>
              Manage All
            </Button>
          </div>
          {superStats!.adminProfiles.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">👤</div>
              <p className="text-sm text-muted-foreground">No admin profiles found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {superStats!.adminProfiles.slice(0, 5).map((admin) => (
                <div key={admin.id} className="flex items-center justify-between gap-4 p-3 rounded-xl border bg-muted/10 hover:bg-muted/20 transition">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-sm shrink-0">
                      {admin.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{admin.user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{admin.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Tag color={admin.adminLevel === 'SUPER' ? 'gold' : 'blue'} className="text-xs">{admin.adminLevel}</Tag>
                    <Tag color={admin.user.isActive ? 'green' : 'red'} className="text-xs">{admin.user.isActive ? 'Active' : 'Inactive'}</Tag>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default SuperAdminDashboard;
