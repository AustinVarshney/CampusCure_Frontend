import { FileTextOutlined, CheckCircleOutlined, TeamOutlined, SettingOutlined } from '@ant-design/icons';
import CountUpStat from '@/components/animated/CountUpStat';
import AnimatedCard from '@/components/animated/AnimatedCard';
import PageTransition from '@/components/animated/PageTransition';
import { mockComplaints, mockDoubts, departments } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">System-wide overview and controls.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CountUpStat end={mockComplaints.length} label="Total Complaints" icon={<FileTextOutlined style={{ fontSize: 22 }} />} color="hsl(214 100% 50%)" delay={0} />
          <CountUpStat end={mockDoubts.length} label="Total Doubts" icon={<CheckCircleOutlined style={{ fontSize: 22 }} />} color="hsl(270 70% 55%)" delay={0.1} />
          <CountUpStat end={departments.length} label="Departments" icon={<TeamOutlined style={{ fontSize: 22 }} />} color="hsl(142 72% 42%)" delay={0.2} />
          <CountUpStat end={4} label="Active Admins" icon={<SettingOutlined style={{ fontSize: 22 }} />} color="hsl(38 92% 50%)" delay={0.3} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AnimatedCard delay={0.3} onClick={() => navigate('/superadmin/admins')}>
            <h3 className="font-semibold text-foreground mb-1">Admin Management</h3>
            <p className="text-sm text-muted-foreground">Manage admin permissions</p>
          </AnimatedCard>
          <AnimatedCard delay={0.4} onClick={() => navigate('/admin/analytics')}>
            <h3 className="font-semibold text-foreground mb-1">Analytics</h3>
            <p className="text-sm text-muted-foreground">View system-wide analytics</p>
          </AnimatedCard>
          <AnimatedCard delay={0.5} onClick={() => navigate('/superadmin/settings')}>
            <h3 className="font-semibold text-foreground mb-1">System Settings</h3>
            <p className="text-sm text-muted-foreground">Configure system behavior</p>
          </AnimatedCard>
        </div>
      </div>
    </PageTransition>
  );
};

export default SuperAdminDashboard;
