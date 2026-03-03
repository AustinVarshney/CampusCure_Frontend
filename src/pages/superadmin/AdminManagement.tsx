import PageTransition from '@/components/animated/PageTransition';
import { UserOutlined } from '@ant-design/icons';
import { Avatar, message, Switch, Table, Tag } from 'antd';
import { motion } from 'framer-motion';

const AdminManagement = () => {
  // TODO: Fetch admin profiles from backend API
  const admins: any[] = [];

  const columns = [
    {
      title: 'Admin', key: 'name',
      render: (_: unknown, r: typeof admins[0]) => (
        <div className="flex items-center gap-2">
          <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: 'hsl(38 92% 50%)' }} />
          <div>
            <div className="font-medium">{r.name}</div>
            <div className="text-xs text-muted-foreground">{r.email}</div>
          </div>
        </div>
      ),
    },
    { title: 'Level', key: 'level', render: (_: unknown, r: typeof admins[0]) => <Tag color={r.adminLevel === 'SUPER' ? 'purple' : 'blue'}>{r.adminLevel}</Tag> },
    { title: 'Departments', key: 'depts', responsive: ['lg' as const], render: (_: unknown, r: typeof admins[0]) => <span className="text-sm">{r.assignedDepartments.length} depts</span> },
    {
      title: 'Complaints', key: 'c',
      render: (_: unknown, r: typeof admins[0]) => <Switch defaultChecked={r.permissions.manageComplaints} onChange={() => message.success('Permission updated')} />,
    },
    {
      title: 'Users', key: 'u',
      render: (_: unknown, r: typeof admins[0]) => <Switch defaultChecked={r.permissions.manageUsers} onChange={() => message.success('Permission updated')} />,
    },
    {
      title: 'Analytics', key: 'a',
      render: (_: unknown, r: typeof admins[0]) => <Switch defaultChecked={r.permissions.viewAnalytics} onChange={() => message.success('Permission updated')} />,
    },
    {
      title: 'Doubts', key: 'd',
      render: (_: unknown, r: typeof admins[0]) => <Switch defaultChecked={r.permissions.manageDoubts} onChange={() => message.success('Permission updated')} />,
    },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Admin Management</h1>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-card rounded-2xl border  shadow-sm overflow-hidden">
          <Table dataSource={admins} columns={columns} rowKey="id" pagination={false} />
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default AdminManagement;