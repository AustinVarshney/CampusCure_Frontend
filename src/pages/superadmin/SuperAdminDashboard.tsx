import PageTransition from '@/components/animated/PageTransition';
import { ArrowRightOutlined, BarChartOutlined, CheckCircleOutlined, ControlOutlined, FileTextOutlined, SafetyCertificateOutlined, SettingOutlined, TeamOutlined } from '@ant-design/icons';
import { Button, Empty, Progress, Tag } from 'antd';
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

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const complaints: any[] = [];
  const doubts: any[] = [];
  const adminProfiles: any[] = [];
  const systemDepartments = ['CS', 'IT', 'CE', 'ME'];

  const resolved = complaints.filter((c) => c.status === 'RESOLVED').length;
  const resolutionRate = complaints.length > 0 ? Math.round((resolved / complaints.length) * 100) : 0;

  const stats = [
    { label: 'Total Complaints', value: complaints.length, icon: <FileTextOutlined />, iconColor: 'text-blue-600 dark:text-blue-400', lightBg: 'bg-blue-50 dark:bg-blue-950/30' },
    { label: 'Total Doubts', value: doubts.length, icon: <CheckCircleOutlined />, iconColor: 'text-purple-600 dark:text-purple-400', lightBg: 'bg-purple-50 dark:bg-purple-950/30' },
    { label: 'Departments', value: systemDepartments.length, icon: <TeamOutlined />, iconColor: 'text-green-600 dark:text-green-400', lightBg: 'bg-green-50 dark:bg-green-950/30' },
    { label: 'Active Admins', value: adminProfiles.length, icon: <SettingOutlined />, iconColor: 'text-orange-600 dark:text-orange-400', lightBg: 'bg-orange-50 dark:bg-orange-950/30' },
  ];

  const quickActions = [
    { title: 'Admin Management', desc: 'Manage admin permissions & roles', icon: <SafetyCertificateOutlined className="text-xl" />, path: '/superadmin/admins', bgColor: 'bg-blue-50 dark:bg-blue-950/30', iconColor: 'text-blue-600 dark:text-blue-400' },
    { title: 'Analytics', desc: 'System-wide data & insights', icon: <BarChartOutlined className="text-xl" />, path: '/admin/analytics', bgColor: 'bg-purple-50 dark:bg-purple-950/30', iconColor: 'text-purple-600 dark:text-purple-400' },
    { title: 'System Settings', desc: 'Configure auto-close, categories', icon: <ControlOutlined className="text-xl" />, path: '/superadmin/settings', bgColor: 'bg-green-50 dark:bg-green-950/30', iconColor: 'text-green-600 dark:text-green-400' },
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
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Super Admin Control Center</h1>
              <Tag color="gold">SUPER</Tag>
            </div>
            <p className="text-gray-300 mt-1 text-sm">
              Full system access · {systemDepartments.length} departments
            </p>
            <div className="flex gap-3 mt-4">
              <Button type="default" ghost icon={<TeamOutlined />} className="rounded-xl border-white/40 text-white" onClick={() => navigate('/admin/users')}>
                Manage Users
              </Button>
              <Button type="default" ghost icon={<SettingOutlined />} className="rounded-xl border-white/40 text-white" onClick={() => navigate('/superadmin/settings')}>
                System Config
              </Button>
            </div>
          </div>
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
          <div className="absolute right-20 -bottom-16 h-48 w-48 rounded-full bg-white/5" />
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, i) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.07 }}
              whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.08)' }}
              onClick={() => navigate(action.path)}
              className="rounded-2xl bg-card border  p-5 shadow-sm cursor-pointer hover:border-primary/30 transition group"
            >
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${action.bgColor} ${action.iconColor} mb-3`}>
                {action.icon}
              </div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition">{action.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
              <ArrowRightOutlined className="text-muted-foreground group-hover:text-primary transition mt-2" />
            </motion.div>
          ))}
        </div>

        {/* Bottom: Chart + Activity Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl bg-card border  p-6 shadow-sm"
          >
            <h3 className="font-semibold text-foreground mb-4">Complaints by Department</h3>
            {/* TODO: Add Bar Chart with analytics data */}
            <Empty description="Analytics data will be available from backend" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="rounded-2xl bg-card border p-6 shadow-sm flex flex-col items-center justify-center"
          >
            <Progress
              type="dashboard"
              percent={resolutionRate}
              strokeColor={{ '0%': '#722ed1', '100%': '#52c41a' }}
              format={(p) => <span className="text-3xl font-bold text-foreground">{p}%</span>}
              size={160}
            />
            <p className="text-sm font-medium text-foreground mt-4">System Resolution Rate</p>
            <p className="text-xs text-muted-foreground">{resolved} of {complaints.length} total complaints</p>
            {/* TODO: Add admin activity summary from backend */}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default SuperAdminDashboard;