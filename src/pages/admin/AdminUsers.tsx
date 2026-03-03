import PageTransition from '@/components/animated/PageTransition';
import { User } from '@/types';
import { UserOutlined } from '@ant-design/icons';
import { Avatar, Table, Tag } from 'antd';
import { motion } from 'framer-motion';

const AdminUsers = () => {
  // TODO: Fetch from backend API
  const users: User[] = [];

  const columns = [
    {
      title: 'Name', key: 'name',
      render: (_: unknown, r: User) => (
        <div className="flex items-center gap-2">
          <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: 'hsl(214 100% 50%)' }} />
          <div>
            <div className="font-medium">{r.name}</div>
            <div className="text-xs text-muted-foreground">{r.username}</div>
          </div>
        </div>
      ),
    },
    { title: 'Email', dataIndex: 'email', key: 'email', responsive: ['md' as const] },
    {
      title: 'Role', dataIndex: 'role', key: 'role',
      render: (role: string) => <Tag color={role === 'STUDENT' ? 'blue' : 'green'}>{role}</Tag>,
    },
    {
      title: 'Status', key: 'status',
      render: (_: unknown, r: User) => (
        <div className="flex gap-1">
          <Tag color={r.approvalStatus === 'APPROVED' ? 'green' : r.approvalStatus === 'PENDING' ? 'orange' : 'red'}>{r.approvalStatus}</Tag>
          <Tag color={r.isActive ? 'green' : 'default'}>{r.isActive ? 'Active' : 'Inactive'}</Tag>
        </div>
      ),
    },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-card rounded-2xl border  shadow-sm overflow-hidden">
          <Table dataSource={users} columns={columns} rowKey="id" pagination={false} />
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default AdminUsers;