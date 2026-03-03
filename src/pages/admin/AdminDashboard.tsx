import PageTransition from '@/components/animated/PageTransition';
import { useAuth } from '@/context/AuthContext';
import { Complaint, Doubt } from '@/types';
import { CheckCircleOutlined, ClockCircleOutlined, FileTextOutlined, RiseOutlined, TeamOutlined } from '@ant-design/icons';
import { Button, Progress } from 'antd';
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
  
  // TODO: Fetch from backend API
  const mockComplaints: Complaint[] = [];
  const mockDoubts: Doubt[] = [];
  
  const resolved = mockComplaints.filter((c) => c.status === 'RESOLVED').length;
  const raised = mockComplaints.filter((c) => c.status === 'RAISED').length;
  const resolutionRate = mockComplaints.length > 0 ? Math.round((resolved / mockComplaints.length) * 100) : 0;

  // TODO: Fetch from backend API
  const analyticsData = {
    complaintsByMonth: [] as any[],
    complaintsByType: [] as any[],
    complaintsByDept: [] as any[],
  };

  const stats = [
    { label: 'Total Complaints', value: mockComplaints.length, icon: <FileTextOutlined />, iconColor: 'text-blue-600 dark:text-blue-400',  },
    { label: 'Resolved', value: resolved, icon: <CheckCircleOutlined />, iconColor: 'text-green-600 dark:text-green-400',  },
    { label: 'Pending', value: raised, icon: <ClockCircleOutlined />, iconColor: 'text-orange-600 dark:text-orange-400',  },
    { label: 'Total Doubts', value: mockDoubts.length, icon: <TeamOutlined />, iconColor: 'text-purple-600 dark:text-purple-400', },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-linear-to-r from-blue-600 via-blue-500 to-indigo-500 p-6 text-white shadow-lg"
        >
          <div className="relative z-10">
            <h1 className="text-2xl font-bold">Admin Dashboard 🛡️</h1>
            <p className="text-indigo-100 mt-1 text-sm">
              Welcome, {user?.name}
            </p>
            <div className="flex gap-3 mt-4">
              <Button type="default" ghost icon={<FileTextOutlined />} className="rounded-xl border-white/40 text-white" onClick={() => navigate('/admin/complaints')}>
                Manage Complaints
              </Button>
              <Button type="default" ghost icon={<RiseOutlined />} className="rounded-xl border-white/40 text-white" onClick={() => navigate('/admin/analytics')}>
                View Analytics
              </Button>
            </div>
          </div>
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -right-4 -bottom-12 h-32 w-32 rounded-full bg-white/5" />
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
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
            {mockComplaints.length > 0 ? (
              <>
                <Progress
                  type="dashboard"
                  percent={resolutionRate}
                  strokeColor={{ '0%': '#722ed1', '100%': '#52c41a' }}
                  format={(p) => <span className="text-2xl font-bold text-foreground">{p}%</span>}
                  size={140}
                />
                <p className="text-sm font-medium text-foreground mt-3">Resolution Rate</p>
                <p className="text-xs text-muted-foreground">{resolved} of {mockComplaints.length} complaints</p>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-3">📊</div>
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
                <div className="text-6xl mb-3">📈</div>
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
                <div className="text-6xl mb-3">🏷️</div>
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
                <div className="text-6xl mb-3">🏛️</div>
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