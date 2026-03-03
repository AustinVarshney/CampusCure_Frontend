import PageTransition from '@/components/animated/PageTransition';
import { useAuth } from '@/context/AuthContext';
import { ArrowRightOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, FileTextOutlined, FireOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Progress, Tag } from 'antd';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

const statusColors: Record<string, string> = { RAISED: '#fa8c16', ASSIGNED: '#1677FF', IN_PROGRESS: '#722ed1', RESOLVED: '#52c41a', CLOSED: '#8c8c8c' };

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // TODO: Fetch profile, complaints, and doubts from backend API
  const complaints: any[] = [];
  const doubts: any[] = [];

  const totalComplaints = complaints.length;
  const activeComplaints = complaints.filter((c) => c.status !== 'RESOLVED' && c.status !== 'CLOSED').length;
  const resolvedComplaints = complaints.filter((c) => c.status === 'RESOLVED').length;
  const totalDoubts = doubts.length;
  const resolvedDoubts = doubts.filter((d) => d.status === 'RESOLVED').length;
  const resolutionRate = totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 0;

  const recentComplaints = complaints.slice(0, 3);
  const recentDoubts = doubts.slice(0, 3);

  const stats = [
    { label: 'Total Complaints', value: totalComplaints, icon: <FileTextOutlined />, iconColor: 'text-blue-600 dark:text-blue-400', lightBg: 'bg-blue-50 dark:bg-blue-90/30' },
    { label: 'Active Issues', value: activeComplaints, icon: <ExclamationCircleOutlined />, iconColor: 'text-orange-600 dark:text-orange-400', lightBg: 'bg-orange-50 dark:bg-orange-90/30' },
    { label: 'Doubts Asked', value: totalDoubts, icon: <QuestionCircleOutlined />, iconColor: 'text-purple-600 dark:text-purple-400', lightBg: 'bg-purple-50 dark:bg-purple-90/30' },
    { label: 'Resolved', value: resolvedDoubts, icon: <CheckCircleOutlined />, iconColor: 'text-green-600 dark:text-green-400', lightBg: 'bg-green-50 dark:bg-green-90/30' },
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
            <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
            <p className="text-blue-100 mt-1 text-sm">
              Welcome to your dashboard
            </p>
            <div className="flex gap-3 mt-4">
              <Button type="default" ghost icon={<FileTextOutlined />} className="rounded-xl border-white/40 text-white hover:bg-white/10" onClick={() => navigate('/student/complaints/new')}>
                Raise Complaint
              </Button>
              <Button type="default" ghost icon={<QuestionCircleOutlined />} className="rounded-xl border-white/40 text-white hover:bg-white/10" onClick={() => navigate('/student/doubts')}>
                Ask a Doubt
              </Button>
            </div>
          </div>
          {/* Decorative circles */}
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -right-4 -bottom-12 h-32 w-32 rounded-full bg-white/5" />
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.08)' }}
              className="rounded-2xl bg-card border p-5 shadow-sm cursor-default"
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

        {/* Middle Row: Resolution Rate + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Resolution Ring */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl bg-card border  p-6 shadow-sm flex flex-col items-center justify-center"
          >
            <Progress
              type="dashboard"
              percent={resolutionRate}
              strokeColor={{ '0%': '#1677FF', '100%': '#52c41a' }}
              format={(p) => <span className="text-2xl font-bold text-foreground">{p}%</span>}
              size={140}
            />
            <p className="text-sm font-medium text-foreground mt-3">Resolution Rate</p>
            <p className="text-xs text-muted-foreground">{resolvedComplaints} of {totalComplaints} resolved</p>
          </motion.div>

          {/* Recent Complaints */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="rounded-2xl bg-card border p-6 shadow-sm lg:col-span-2"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <ClockCircleOutlined className="text-primary" /> Recent Complaints
              </h3>
              <Button type="link" size="small" onClick={() => navigate('/student/complaints')} className="text-xs">
                View All <ArrowRightOutlined />
              </Button>
            </div>
            <div className="space-y-3">
              {recentComplaints.length > 0 ? (
                recentComplaints.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/10 border /50 hover:border-primary/30 transition">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: statusColors[c.status] }} />
                      <div>
                        <p className="text-sm font-medium text-foreground">{c.title}</p>
                        <p className="text-xs text-muted-foreground">Room {c.classroomNumber} · Block {c.block}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag color={c.priority >= 4 ? 'red' : c.priority >= 3 ? 'orange' : 'blue'} className="text-xs">P{c.priority}</Tag>
                      <Tag color={statusColors[c.status]}>{c.status.replace('_', ' ')}</Tag>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-20 w-20 rounded-full bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center mb-4">
                    <FileTextOutlined className="text-4xl text-blue-500" />
                  </div>
                  <h4 className="text-base font-semibold text-foreground mb-1">No Complaints Yet</h4>
                  <p className="text-sm text-muted-foreground mb-4">Start by raising your first complaint</p>
                  <Button type="primary" icon={<FileTextOutlined />} onClick={() => navigate('/student/complaints/new')} className="rounded-lg">
                    Raise a Complaint
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Recent Doubts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl bg-card border  p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <FireOutlined className="text-orange-500" /> Trending Doubts
            </h3>
            <Button type="link" size="small" onClick={() => navigate('/student/doubts')} className="text-xs">
              View All <ArrowRightOutlined />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recentDoubts.length > 0 ? (
              recentDoubts.map((d) => (
                <motion.div
                  key={d.id}
                  whileHover={{ y: -2 }}
                  className="p-4 rounded-xl border  bg-muted/5 hover:border-primary/30 cursor-pointer transition"
                  onClick={() => navigate(`/student/doubts/${d.id}`)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Tag color="purple" className="text-xs">{d.subject}</Tag>
                    <Tag color={d.status === 'RESOLVED' ? 'green' : d.status === 'ANSWERED' ? 'blue' : 'orange'} className="text-xs">{d.status}</Tag>
                  </div>
                  <p className="text-sm font-medium text-foreground line-clamp-2">{d.title}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>▲ {d.upVoteCount}</span>
                    <span>💬 {d.answerCount}</span>
                    <span>👁 {d.views}</span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-3 flex flex-col items-center justify-center py-12 text-center">
                <div className="h-20 w-20 rounded-full bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center mb-4">
                  <QuestionCircleOutlined className="text-4xl text-purple-500" />
                </div>
                <h4 className="text-base font-semibold text-foreground mb-1">No Doubts Yet</h4>
                <p className="text-sm text-muted-foreground mb-4">Have a question? Ask the community!</p>
                <Button type="primary" icon={<QuestionCircleOutlined />} onClick={() => navigate('/student/doubts')} className="rounded-lg">
                  Ask a Doubt
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default StudentDashboard;