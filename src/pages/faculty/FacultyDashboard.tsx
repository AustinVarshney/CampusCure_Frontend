import PageTransition from '@/components/animated/PageTransition';
import { useAuth } from '@/context/AuthContext';
import { ArrowRightOutlined, BookOutlined, CheckCircleOutlined, ClockCircleOutlined, FileTextOutlined, QuestionCircleOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
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

const statusColors: Record<string, string> = { RAISED: 'orange', ASSIGNED: 'cyan', IN_PROGRESS: 'blue', RESOLVED: 'green', CLOSED: 'default' };

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // TODO: Fetch from backend API
  const assignedComplaints: any[] = [];
  const unresolvedDoubts: any[] = [];
  
  const resolvedCount = assignedComplaints.filter((c) => c.status === 'RESOLVED').length;
  const resolveRate = assignedComplaints.length > 0 ? Math.round((resolvedCount / assignedComplaints.length) * 100) : 0;

  const stats = [
    { label: 'Assigned', value: assignedComplaints.length, icon: <FileTextOutlined />, iconColor: 'text-blue-600 dark:text-blue-400', lightBg: 'bg-blue-50 dark:bg-blue-90/30' },
    { label: 'Resolved', value: resolvedCount, icon: <CheckCircleOutlined />, iconColor: 'text-green-600 dark:text-green-400', lightBg: 'bg-green-50 dark:bg-green-90/30' },
    { label: 'Pending Doubts', value: unresolvedDoubts.length, icon: <QuestionCircleOutlined />, iconColor: 'text-orange-600 dark:text-orange-400', lightBg: 'bg-orange-50 dark:bg-orange-90/30' },
    { label: 'Verified Answers', value: 0, icon: <SafetyCertificateOutlined />, iconColor: 'text-purple-600 dark:text-purple-400', lightBg: 'bg-purple-50 dark:bg-purple-90/30' },
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
            <h1 className="text-2xl font-bold">Hello, {user?.name}! 🎓</h1>
            <p className="text-emerald-100 mt-1 text-sm">
              Faculty Dashboard
            </p>
            <div className="flex gap-3 mt-4">
              <Button type="default" ghost icon={<FileTextOutlined />} className="rounded-xl border-white/40 text-white" onClick={() => navigate('/faculty/complaints')}>
                View Complaints
              </Button>
              <Button type="default" ghost icon={<QuestionCircleOutlined />} className="rounded-xl border-white/40 text-white" onClick={() => navigate('/faculty/doubts')}>
                Answer Doubts
              </Button>
            </div>
          </div>
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -right-4 -bottom-12 h-32 w-32 rounded-full bg-white/5" />
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.08)' }}
              className="rounded-2xl bg-card border p-5 shadow-sm"
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

        {/* Middle Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Resolution Ring */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl bg-card border  p-6 shadow-sm flex flex-col items-center justify-center"
          >
            {assignedComplaints.length > 0 ? (
              <>
                <Progress
                  type="dashboard"
                  percent={resolveRate}
                  strokeColor={{ '0%': '#13c2c2', '100%': '#52c41a' }}
                  format={(p) => <span className="text-2xl font-bold text-foreground">{p}%</span>}
                  size={140}
                />
                <p className="text-sm font-medium text-foreground mt-3">Complaint Resolution</p>
                <p className="text-xs text-muted-foreground">{resolvedCount} of {assignedComplaints.length} resolved</p>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-3">📊</div>
                <p className="text-sm font-medium text-foreground">No Complaints Assigned</p>
                <p className="text-xs text-muted-foreground mt-1">Resolution rate will appear once complaints are assigned</p>
              </div>
            )}
          </motion.div>

          {/* Assigned Complaints */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="rounded-2xl bg-card border  p-6 shadow-sm lg:col-span-2"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <ClockCircleOutlined className="text-primary" /> Assigned Complaints
              </h3>
              {assignedComplaints.length > 0 && (
                <Button type="link" size="small" onClick={() => navigate('/faculty/complaints')} className="text-xs">
                  View All <ArrowRightOutlined />
                </Button>
              )}
            </div>
            {assignedComplaints.length > 0 ? (
              <div className="space-y-3">
                {assignedComplaints.slice(0, 4).map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/10 border /50 hover:border-primary/30 transition">
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.title}</p>
                      <p className="text-xs text-muted-foreground">Room {c.classroomNumber} · Block {c.block}</p>
                    </div>
                    <Tag color={statusColors[c.status]}>{c.status.replace('_', ' ')}</Tag>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-3">📋</div>
                <p className="text-sm font-medium text-foreground">No Complaints Assigned Yet</p>
                <p className="text-xs text-muted-foreground mt-1">Your assigned complaints will appear here</p>
              </div>
            )}
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
              <BookOutlined className="text-violet-500" /> Recent Doubts
            </h3>
            {unresolvedDoubts.length > 0 && (
              <Button type="link" size="small" onClick={() => navigate('/faculty/doubts')} className="text-xs">
                View All <ArrowRightOutlined />
              </Button>
            )}
          </div>
          {unresolvedDoubts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {unresolvedDoubts.slice(0, 3).map((d) => (
                <div key={d.id} className="p-4 rounded-xl border  bg-muted/5 hover:border-primary/30 transition">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag color="purple" className="text-xs">{d.subject}</Tag>
                    <Tag color={d.status === 'ANSWERED' ? 'blue' : 'orange'} className="text-xs">{d.status}</Tag>
                  </div>
                  <p className="text-sm font-medium text-foreground line-clamp-2">{d.title}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>💬 {d.answerCount}</span>
                    <span>👁 {d.views}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-3">❓</div>
              <p className="text-sm font-medium text-foreground">No Doubts Posted Yet</p>
              <p className="text-xs text-muted-foreground mt-1">Student doubts will appear here for you to answer</p>
            </div>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default FacultyDashboard;