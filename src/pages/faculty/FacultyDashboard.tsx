import { assignedComplaints as getAssignedComplaints } from '@/api/faculty';
import PageTransition from '@/components/animated/PageTransition';
import { useAuth } from '@/context/AuthContext';
import { Complaint, Doubt } from '@/types';
import { ArrowRightOutlined, BookOutlined, CheckCircleOutlined, ClockCircleOutlined, FileTextOutlined, QuestionCircleOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { Progress, Tag } from 'antd';
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
  const isApproved = user?.approvalStatus === 'APPROVED';
  const [assignedComplaintsData, setAssignedComplaintsData] = useState<Complaint[]>([]);  
  // TODO: Fetch from backend API - Currently using empty array until doubts endpoint is implemented
  const unresolvedDoubts: Doubt[] = [];
  
  const resolvedCount = assignedComplaintsData.filter((c) => c.status === 'RESOLVED').length;
  const resolveRate = assignedComplaintsData.length > 0 ? Math.round((resolvedCount / assignedComplaintsData.length) * 100) : 0;

  const stats = [
    { label: 'Assigned', value: assignedComplaintsData.length, icon: <FileTextOutlined />, iconColor: 'text-blue-600 dark:text-blue-400', lightBg: 'bg-blue-50 dark:bg-blue-90/30' },
    { label: 'Resolved', value: resolvedCount, icon: <CheckCircleOutlined />, iconColor: 'text-green-600 dark:text-green-400', lightBg: 'bg-green-50 dark:bg-green-90/30' },
    { label: 'Pending Doubts', value: unresolvedDoubts.length, icon: <QuestionCircleOutlined />, iconColor: 'text-orange-600 dark:text-orange-400', lightBg: 'bg-orange-50 dark:bg-orange-90/30' },
    { label: 'Verified Answers', value: 0, icon: <SafetyCertificateOutlined />, iconColor: 'text-purple-600 dark:text-purple-400', lightBg: 'bg-purple-50 dark:bg-purple-90/30' },
  ];

  useEffect(() => {
    const fetchAssignedComplaints = async () => {
      try {
        const data = await getAssignedComplaints();
        setAssignedComplaintsData(data);
      } catch (e: unknown) {
        console.error("Error fetching assigned complaints:", e);
        // message.error(e instanceof Error ? e.message : 'Failed to fetch assigned complaints'); --- IGNORE ---
      }
    };

    fetchAssignedComplaints();
  }, []);

  return (
    <PageTransition>
      <div className="dashboard-surface space-y-6">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-blue-950 to-indigo-950 p-8 text-white shadow-xl"
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-size-[48px_48px]" />
          <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute -bottom-8 right-1/3 h-40 w-40 rounded-full bg-violet-600/15 blur-2xl" />
          <div className="relative z-10">
            <h1 className="text-2xl font-bold">Hello, {user?.name}! 🎓</h1>
            <p className="text-blue-200/80 mt-1 text-sm">
              Faculty Dashboard
            </p>
            <div className="mt-4 grid grid-cols-1 min-[460px]:grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/faculty/complaints')}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition-colors cursor-pointer"
              >
                <FileTextOutlined /> View Complaints
              </button>
              <button
                onClick={() => navigate('/faculty/doubts')}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors cursor-pointer hover:bg-white/20 disabled:bg-white/6 disabled:border-white/15 disabled:text-white/55 disabled:cursor-not-allowed disabled:hover:bg-white/6"
              >
                <QuestionCircleOutlined /> Answer Doubts
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 min-[360px]:grid-cols-2 lg:grid-cols-4 gap-4">
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
            {assignedComplaintsData.length > 0 ? (
              <>
                <Progress
                  type="dashboard"
                  percent={resolveRate}
                  strokeColor={{ '0%': '#13c2c2', '100%': '#52c41a' }}
                  format={(p) => <span className="text-2xl font-bold text-foreground">{p}%</span>}
                  size={140}
                />
                <p className="text-sm font-medium text-foreground mt-3">Complaint Resolution</p>
                <p className="text-xs text-muted-foreground">{resolvedCount} of {assignedComplaintsData.length} resolved</p>
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
              {assignedComplaintsData.length > 0 && (
                <button onClick={() => navigate('/faculty/complaints')} className="text-xs text-blue-600 hover:text-blue-700 transition-colors cursor-pointer">
                  View All <ArrowRightOutlined />
                </button>
              )}
            </div>
            {assignedComplaintsData.length > 0 ? (
              <div className="space-y-3">
                {assignedComplaintsData.slice(0, 4).map((c) => (
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
              <button onClick={() => navigate('/faculty/doubts')} className="text-xs text-blue-600 hover:text-blue-700 transition-colors cursor-pointer">
                View All <ArrowRightOutlined />
              </button>
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