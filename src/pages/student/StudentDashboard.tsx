import { getComplaints, getDoubts, getStudentProfile } from '@/api/student';
import PageTransition from '@/components/animated/PageTransition';
import { COMPLAINT_STATUS, badgeClass, dotClass } from "@/lib/statusStyles";
import { useAuth } from '@/context/AuthContext';
import { Complaint, Doubt } from '@/types';
import { ArrowRightOutlined, CheckCircleOutlined, ClockCircleOutlined, CommentOutlined, EyeOutlined, ExclamationCircleOutlined, FileTextOutlined, FireOutlined, LikeOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Tag } from 'antd';
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


interface StudentProfile {
  id: string;
  userId: string;
  enrollmentNumber: string;
  department: string;
  branch: string;
  semester: number;
  phoneNumber: number;
  address: string;
  isStudying: boolean;
  guardianName: string;
  guardianPhone: string;
  doubtsAsked: number;
  doubtsSolved: number;
  totalComplaints: number;
  totalActiveComplaints: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    userID: string;
  };
}

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [trendingDoubts, setTrendingDoubts] = useState<Doubt[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, complaintsData, doubtsData] = await Promise.all([
          getStudentProfile(),
          getComplaints(),
          getDoubts(),
        ]);
        setProfile(profileData);
        setComplaints(complaintsData);
        const topDoubts = (Array.isArray(doubtsData) ? doubtsData : [])
          .slice()
          .sort((a, b) => {
            if (b.upVoteCount !== a.upVoteCount) return b.upVoteCount - a.upVoteCount;
            if (b.answerCount !== a.answerCount) return b.answerCount - a.answerCount;
            if (b.views !== a.views) return b.views - a.views;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          })
          .slice(0, 5);
        setTrendingDoubts(topDoubts);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);
  
  // Use profile data if available, otherwise fall back to local state
  const totalComplaints = profile?.totalComplaints ?? complaints.length;
  const activeComplaints = profile?.totalActiveComplaints ?? complaints.filter((c) => c.status !== 'RESOLVED').length;
  const totalDoubts = profile?.doubtsAsked ?? 0;
  const resolvedDoubts = profile?.doubtsSolved ?? 0;

  const recentComplaints = complaints.slice(0, 4);

  const initials = user?.name?.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() ?? '??';

  const stats = [
    {
      label: 'Total Complaints Raised', value: totalComplaints,
      icon: <FileTextOutlined />,
      tile: 'cc-icon-tile',
    },
    {
      label: 'Active Complaints', value: activeComplaints,
      icon: <ExclamationCircleOutlined />,
      tile: 'cc-icon-tile cc-icon-tile--amber',
    },
    {
      label: 'Doubts Asked', value: totalDoubts,
      icon: <QuestionCircleOutlined />,
      tile: 'cc-icon-tile cc-icon-tile--violet',
    },
    {
      label: 'Doubts Resolved', value: resolvedDoubts,
      icon: <CheckCircleOutlined />,
      tile: 'cc-icon-tile cc-icon-tile--emerald',
    },
  ];

  // const quickActions = [
  //   {
  //     label: 'Raise Complaint', description: 'Report an issue to admin',
  //     icon: <FileTextOutlined />, from: 'from-cyan-500', to: 'to-cyan-600', shadow: 'shadow-cyan-500/30',
  //     onClick: () => navigate('/student/complaints/new'),
  //   },
  //   {
  //     label: 'Ask a Doubt', description: 'Post to the community',
  //     icon: <QuestionCircleOutlined />, from: 'from-violet-500', to: 'to-purple-600', shadow: 'shadow-violet-500/30',
  //     onClick: () => navigate('/student/doubts'),
  //   },
  //   {
  //     label: 'My Complaints', description: 'Track your submissions',
  //     icon: <ClockCircleOutlined />, from: 'from-indigo-500', to: 'to-indigo-600', shadow: 'shadow-indigo-500/30',
  //     onClick: () => navigate('/student/complaints'),
  //   },
  //   {
  //     label: 'Community', description: 'Help others with answers',
  //     icon: <TeamOutlined />, from: 'from-teal-500', to: 'to-emerald-600', shadow: 'shadow-teal-500/30',
  //     onClick: () => navigate('/student/doubts'),
  //   },
  // ];

  return (
    <PageTransition>
      <div className="dashboard-surface space-y-6">

        {/* ── 1. Welcome Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="dashboard-hero"
        >
          <div className="dashboard-hero__grid" aria-hidden="true" />
          {/* Glows */}
          <div className="dashboard-hero__glow dashboard-hero__glow--primary" aria-hidden="true" />
          <div className="dashboard-hero__glow dashboard-hero__glow--secondary" aria-hidden="true" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            {/* Avatar + info */}
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 shrink-0 rounded-2xl dashboard-stat-icon !h-16 !w-16 text-xl font-bold ring-2 ring-white/20">
                {initials}
              </div>
              <div>
                <p className="text-brand-100/75 text-sm font-medium tracking-wide">Welcome back</p>
                <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  {profile?.enrollmentNumber && (
                    <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-brand-100 ring-1 ring-white/10">
                      Enrollment No. :{profile.enrollmentNumber}
                    </span>
                  )}
                  {profile?.department && (
                    <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-brand-100 ring-1 ring-white/10">
                      Department : {profile.department}
                    </span>
                  )}
                  {profile?.semester && (
                    <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-brand-100 ring-1 ring-white/10">
                      Sem {profile.semester}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3 w-full sm:w-auto sm:shrink-0">
              <button
                onClick={() => navigate('/student/complaints/new')}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition-colors cursor-pointer"
              >
                <FileTextOutlined /> Raise Complaint
              </button>
              <button
                onClick={() => navigate('/student/doubts')}
                className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-brand-900 hover:bg-brand-50 transition-colors cursor-pointer shadow-lg shadow-brand-950/25"
              >
                <QuestionCircleOutlined /> Ask a Doubt
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── 2. Stat Cards ── */}
        <div className="grid grid-cols-1 min-[360px]:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="dashboard-card relative cursor-default overflow-hidden group"
            >
              <div className={`${stat.tile} relative !h-11 !w-11 !text-base`}>
                {stat.icon}
              </div>
              <div className="relative mt-4">
                <div className="text-3xl font-extrabold text-foreground tracking-tight tabular-nums">
                  <CountUp end={stat.value} delay={0.2 + i * 0.07} />
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 font-medium">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── 3. Middle Row: Profile + Resolution | Recent Complaints ── */}
        <div className="grid grid-cols-1 gap-4">
          {/* Left col */}
          {/* <div className="flex flex-col gap-4"> */}
            {/* Profile Card */}
            {/* <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38 }}
              className="dashboard-card p-5"
            >
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="inline-flex h-5 w-5 rounded-md cc-fill-brand items-center justify-center text-white text-[10px] font-bold">C</span>
                Student Profile
              </h3>
              <div className="space-y-2.5">
                {[
                  { label: 'Department', value: profile?.department },
                  { label: 'Branch', value: profile?.branch },
                  { label: 'Semester', value: profile?.semester ? `Semester ${profile.semester}` : undefined },
                  {
                    label: 'Status',
                    value: profile ? (profile.isStudying ? 'Currently Studying' : 'Alumni') : undefined,
                    badge: profile ? (profile.isStudying ? 'green' : 'gray') : undefined,
                  },
                  { label: 'Enrollment', value: profile?.enrollmentNumber },
                ].map(({ label, value, badge }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground shrink-0">{label}</span>
                    {value ? (
                      badge ? (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badge === 'green' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : 'bg-muted text-muted-foreground dark:bg-slate-800 dark:text-muted-foreground'}`}>
                          {value}
                        </span>
                      ) : (
                        <span className="font-medium text-foreground text-right max-w-35 truncate">{value}</span>
                      )
                    ) : (
                      <span className="text-muted-foreground/40 italic text-xs">—</span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div> */}

            {/* Resolution Ring */}
            {/* <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42 }}
              className="dashboard-card flex flex-col items-center justify-center"
            >
              <Progress
                type="dashboard"
                percent={resolutionRate}
                strokeColor={{ '0%': '#0785B0', '100%': '#25A179' }}
                format={(p) => <span className="text-2xl font-bold text-foreground">{p}%</span>}
                size={130}
              />
              <p className="text-sm font-semibold text-foreground mt-2">Resolution Rate</p>
              <p className="text-xs text-muted-foreground">{resolvedComplaints} of {totalComplaints} resolved</p>
            </motion.div> */}
          {/* </div> */}

          {/* Recent Complaints */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.44 }}
            className="dashboard-card lg:col-span-2"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <ClockCircleOutlined className="text-primary" /> Recent Complaints
              </h3>
              <button
                onClick={() => navigate('/student/complaints')}
                className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary transition-colors cursor-pointer"
              >
                View All <ArrowRightOutlined style={{ fontSize: 10 }} />
              </button>
            </div>
            <div className="space-y-2.5">
              {recentComplaints.length > 0 ? (
                recentComplaints.map((c) => {
                  const s = (COMPLAINT_STATUS[c.status] ?? COMPLAINT_STATUS.RESOLVED);
                  return (
                    <motion.div
                      key={c.id}
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => navigate('/student/complaints')}
                      className="flex items-center justify-between p-3.5 rounded-xl border bg-muted/5 hover:border-brand-500/40 hover:bg-muted/30 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`shrink-0 ${dotClass(s.tone)}`} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{c.title}</p>
                          <p className="text-xs text-muted-foreground">Room {c.classroomNumber} · Block {c.block}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {c.priority != null && (
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${c.priority >= 4 ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400' : c.priority >= 3 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400' : 'bg-cyan-100 text-primary dark:bg-cyan-900/50 dark:text-primary'}`}>
                            P{c.priority}
                          </span>
                        )}
                        <span className={badgeClass(s.tone)}>
                          {s.label}
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-accent dark:bg-cyan-950/30 flex items-center justify-center mb-4">
                    <FileTextOutlined className="text-3xl text-primary" />
                  </div>
                  <h4 className="text-base font-semibold text-foreground mb-1">No Complaints Yet</h4>
                  <p className="text-sm text-muted-foreground mb-4">Start by raising your first complaint</p>
                  <button
                    onClick={() => navigate('/student/complaints/new')}
                    className="flex items-center gap-2 rounded-xl cc-fill-brand px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <FileTextOutlined /> Raise a Complaint
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* ── 4. Quick Actions ── */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.52 }}
        >
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</h3>
          <div className="grid grid-cols-1 min-[460px]:grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <motion.div
                key={action.label}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                onClick={action.onClick}
                className="dashboard-card group relative cursor-pointer overflow-hidden hover:border-blue-500/20 transition-colors"
              >
                <div className={`absolute inset-0 bg-linear-to-br ${action.from} ${action.to} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`} />
                <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br ${action.from} ${action.to} text-white text-base shadow-md ${action.shadow}`}>
                  {action.icon}
                </div>
                <p className="relative mt-3 text-sm font-semibold text-foreground">{action.label}</p>
                <p className="relative text-xs text-muted-foreground mt-0.5">{action.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div> */}

        {/* ── 5. Trending Doubts ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.58 }}
          className="dashboard-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FireOutlined className="text-orange-500" /> Trending Doubts
            </h3>
            <button
              onClick={() => navigate('/student/doubts')}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary transition-colors cursor-pointer"
            >
              View All <ArrowRightOutlined style={{ fontSize: 10 }} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {trendingDoubts.length > 0 ? (
              trendingDoubts.map((d) => (
                <motion.div
                  key={d.id}
                  whileHover={{ y: -2 }}
                  className="p-4 rounded-xl border bg-muted/5 hover:border-violet-500/30 cursor-pointer transition"
                  onClick={() => navigate(`/student/doubts/${d.id}`)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Tag color="purple" className="text-xs">{d.subject}</Tag>
                    <Tag color={d.status === 'RESOLVED' ? 'green' : d.status === 'ANSWERED' ? 'blue' : 'orange'} className="text-xs">{d.status}</Tag>
                  </div>
                  <p className="text-sm font-medium text-foreground line-clamp-2">{d.title}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 font-semibold text-amber-800">
                      <LikeOutlined /> {d.upVoteCount}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-100 px-2 py-0.5 font-semibold text-sky-800">
                      <CommentOutlined /> {d.answerCount}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 font-semibold text-foreground">
                      <EyeOutlined /> {d.views}
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-3 flex flex-col items-center justify-center py-12 text-center">
                <div className="h-16 w-16 rounded-2xl bg-accent dark:bg-cyan-950/30 flex items-center justify-center mb-4">
                  <QuestionCircleOutlined className="text-3xl text-primary" />
                </div>
                <h4 className="text-base font-semibold text-foreground mb-1">No Doubts Yet</h4>
                <p className="text-sm text-muted-foreground mb-4">Have a question? Ask the community!</p>
                <button
                  onClick={() => navigate('/student/doubts')}
                  className="flex items-center gap-2 rounded-xl bg-linear-to-r from-cyan-600 to-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity cursor-pointer shadow-md shadow-violet-600/20"
                >
                  <QuestionCircleOutlined /> Ask a Doubt
                </button>
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </PageTransition>
  );
};

export default StudentDashboard;
