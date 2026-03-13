import { getDashboardStats, type DashboardStats } from '@/api/admin';
import PageTransition from '@/components/animated/PageTransition';
import { useAuth } from '@/context/AuthContext';
import { BarChartOutlined, CheckCircleOutlined, ClockCircleOutlined, FileTextOutlined, IeOutlined, RiseOutlined, TeamOutlined } from '@ant-design/icons';
import { Progress, Spin } from 'antd';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const COLORS = ['#1677FF', '#52c41a', '#fa8c16', '#722ed1', '#eb2f96'];

const CountUp = ({ end, delay = 0 }: { end: number; delay?: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      let start = 0;
      const step = end / 72;
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch dashboard:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
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
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600">
            {error}
          </div>
        </div>
      </PageTransition>
    );
  }

  const stats = dashboardData?.stats || { totalComplaints: 0, resolvedComplaints: 0, raisedComplaints: 0, totalDoubts: 0 };
  const analyticsData = dashboardData?.analytics || { complaintsByMonth: [], complaintsByType: [], complaintsByDept: [] };
  const resolutionRate = stats.totalComplaints > 0 ? Math.round((stats.resolvedComplaints / stats.totalComplaints) * 100) : 0;

  const statsDisplay = [
    { label: 'Total Complaints', value: stats.totalComplaints, icon: <FileTextOutlined />, iconColor: 'text-blue-600 dark:text-blue-400', lightBg: 'bg-blue-50 dark:bg-blue-90/30' },
    { label: 'Resolved', value: stats.resolvedComplaints, icon: <CheckCircleOutlined />, iconColor: 'text-green-600 dark:text-green-400', lightBg: 'bg-green-50 dark:bg-green-90/30' },
    { label: 'Pending', value: stats.raisedComplaints, icon: <ClockCircleOutlined />, iconColor: 'text-orange-600 dark:text-orange-400', lightBg: 'bg-orange-50 dark:bg-orange-90/30' },
    { label: 'Total Doubts', value: stats.totalDoubts, icon: <TeamOutlined />, iconColor: 'text-purple-600 dark:text-purple-400', lightBg: 'bg-purple-50 dark:bg-purple-90/30' },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-linear-to-br from-slate-900 via-blue-950 to-indigo-950 p-8 text-white shadow-xl"
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[32px_32px]" />
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-blue-500/10" />
          <div className="absolute -right-4 -bottom-14 h-36 w-36 rounded-full bg-indigo-500/10" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                <IeOutlined className="text-blue-300 text-lg" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-blue-200/70 text-xs">Welcome back, {user?.name}</p>
              </div>
            </div>
            <div className="flex gap-3 mt-4 flex-wrap">
              <button
                onClick={() => navigate('/admin/complaints')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm text-white text-sm font-medium hover:bg-white/20 transition-colors cursor-pointer"
              >
                <FileTextOutlined /> Manage Complaints
              </button>
              <button
                onClick={() => navigate('/admin/analytics')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm text-white text-sm font-medium hover:bg-white/20 transition-colors cursor-pointer"
              >
                <RiseOutlined /> View Analytics
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsDisplay.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.08)' }}
              className="rounded-2xl bg-card border  p-5 shadow-sm"
            >
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-xl ${stat.lightBg} ${stat.iconColor}`}>
                {stat.icon}
              </div>
              <div className="mt-3">
                <div className="text-3xl font-extrabold text-foreground tracking-tight">
                  <CountUp end={stat.value} delay={0.2 + i * 0.07} />
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Resolution Ring */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl bg-card border  p-6 shadow-sm flex flex-col items-center justify-center"
          >
            {stats.totalComplaints > 0 ? (
              <>
                <Progress
                  type="dashboard"
                  percent={resolutionRate}
                  strokeColor={{ '0%': '#722ed1', '100%': '#52c41a' }}
                  format={(p) => <span className="text-2xl font-bold text-foreground">{p}%</span>}
                  size={140}
                />
                <p className="text-sm font-medium text-foreground mt-3">Resolution Rate</p>
                <p className="text-xs text-muted-foreground">{stats.resolvedComplaints} of {stats.totalComplaints} complaints</p>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                  <BarChartOutlined className="text-2xl text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">No Complaints Yet</p>
                <p className="text-xs text-muted-foreground mt-1">Resolution rate will appear once complaints are filed</p>
              </div>
            )}
          </motion.div>

          {/* Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="rounded-2xl bg-card border  p-6 shadow-sm lg:col-span-2"
          >
            <h3 className="font-semibold text-foreground mb-4">Monthly Trends</h3>
            {analyticsData.complaintsByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={analyticsData.complaintsByMonth}>
                  <defs>
                    <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1677FF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#1677FF" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#52c41a" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#52c41a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 91%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="complaints" stroke="#1677FF" fillOpacity={1} fill="url(#colorComplaints)" strokeWidth={2} />
                  <Area type="monotone" dataKey="resolved" stroke="#52c41a" fillOpacity={1} fill="url(#colorResolved)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-16">
                <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                  <RiseOutlined className="text-2xl text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">No Trend Data Available</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">Monthly complaint trends will be displayed here as data accumulates over time</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Bottom: Pie + By Dept */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl bg-card border  p-6 shadow-sm"
          >
            <h3 className="font-semibold text-foreground mb-4">By Category</h3>
            {analyticsData.complaintsByType.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={analyticsData.complaintsByType} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value" paddingAngle={4} label={{ fontSize: 11 }}>
                      {analyticsData.complaintsByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {analyticsData.complaintsByType.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      {item.name.replace('_', ' ')}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                  <FileTextOutlined className="text-2xl text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">No Category Data</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">Complaint distribution by category will appear here</p>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="rounded-2xl bg-card border  p-6 shadow-sm"
          >
            <h3 className="font-semibold text-foreground mb-4">By Department</h3>
            {analyticsData.complaintsByDept.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={analyticsData.complaintsByDept} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 91%)" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="dept" type="category" tick={{ fontSize: 12 }} width={40} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#722ed1" radius={[0, 6, 6, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-24">
                <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                  <TeamOutlined className="text-2xl text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">No Department Data</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">Complaint distribution by department will appear here</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default AdminDashboard;