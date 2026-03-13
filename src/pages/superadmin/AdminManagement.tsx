import { getSuperAdminStats, updateAdminPermissions, type SuperAdminStats } from '@/api/admin';
import PageTransition from '@/components/animated/PageTransition';
import { ReloadOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, message, Spin, Switch, Table, Tag, Tooltip } from 'antd';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

type AdminProfile = SuperAdminStats['adminProfiles'][number];
type PermKey = 'manageUsers' | 'manageComplaints' | 'manageDoubts' | 'viewAnalytics';

const AdminManagement = () => {
  const [admins, setAdmins] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const data = await getSuperAdminStats();
      setAdmins(data.adminProfiles);
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void fetchAdmins(); }, []);

  const handlePermissionToggle = async (adminId: string, field: PermKey, value: boolean) => {
    const savingKey = `${adminId}-${field}`;
    // Optimistic update
    setAdmins((prev) =>
      prev.map((a) => (a.id === adminId ? { ...a, [field]: value } : a)),
    );
    setSaving((prev) => ({ ...prev, [savingKey]: true }));
    try {
      await updateAdminPermissions(adminId, { [field]: value });
      message.success('Permission updated');
    } catch (err) {
      // Revert on error
      setAdmins((prev) =>
        prev.map((a) => (a.id === adminId ? { ...a, [field]: !value } : a)),
      );
      message.error(err instanceof Error ? err.message : 'Failed to update permission');
    } finally {
      setSaving((prev) => ({ ...prev, [savingKey]: false }));
    }
  };

  const permSwitch = (field: PermKey, label: string) => ({
    title: label,
    key: field,
    align: 'center' as const,
    render: (_: unknown, record: AdminProfile) => {
      const savingKey = `${record.id}-${field}`;
      const isSuper = record.adminLevel === 'SUPER';
      return (
        <Tooltip title={isSuper ? 'Super admins have all permissions' : undefined}>
          <Switch
            checked={record[field]}
            loading={saving[savingKey]}
            disabled={isSuper}
            onChange={(val) => handlePermissionToggle(record.id, field, val)}
            size="small"
          />
        </Tooltip>
      );
    },
  });

  const columns = [
    {
      title: 'Admin',
      key: 'name',
      render: (_: unknown, record: AdminProfile) => (
        <div className="flex items-center gap-2">
          <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: record.adminLevel === 'SUPER' ? 'hsl(38 92% 50%)' : 'hsl(217 91% 60%)' }}>
            {record.user.name.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <div className="font-medium text-sm">{record.user.name}</div>
            <div className="text-xs text-muted-foreground">{record.user.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Level',
      key: 'level',
      render: (_: unknown, record: AdminProfile) => (
        <Tag color={record.adminLevel === 'SUPER' ? 'gold' : 'blue'}>{record.adminLevel}</Tag>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: unknown, record: AdminProfile) => (
        <div className="flex flex-col gap-1">
          <Tag color={record.user.isActive ? 'green' : 'red'} className="text-[10px]">
            {record.user.isActive ? 'Active' : 'Inactive'}
          </Tag>
          <Tag color={record.user.approvalStatus === 'APPROVED' ? 'green' : record.user.approvalStatus === 'PENDING' ? 'orange' : 'red'} className="text-[10px]">
            {record.user.approvalStatus}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Depts',
      key: 'depts',
      responsive: ['lg' as const],
      render: (_: unknown, record: AdminProfile) => (
        <span className="text-sm text-muted-foreground">
          {record.assignedDepartments.length > 0 ? record.assignedDepartments.join(', ') : 'All'}
        </span>
      ),
    },
    {
      title: 'Activity',
      key: 'activity',
      responsive: ['lg' as const],
      render: (_: unknown, record: AdminProfile) => (
        <div className="text-xs text-muted-foreground space-y-0.5">
          <div>{record.complaintsAssigned} assigned</div>
          <div>{record.complaintsClosed} closed</div>
        </div>
      ),
    },
    permSwitch('manageUsers', 'Users'),
    permSwitch('manageComplaints', 'Complaints'),
    permSwitch('manageDoubts', 'Doubts'),
    permSwitch('viewAnalytics', 'Analytics'),
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-foreground">Admin Management</h1>
          <Button icon={<ReloadOutlined />} onClick={fetchAdmins} loading={loading} className="rounded-xl w-full sm:w-auto">
            Refresh
          </Button>
        </div>

        {loading && admins.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <Spin size="large" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl border shadow-sm overflow-hidden"
          >
            <Table
              dataSource={admins}
              columns={columns}
              rowKey="id"
              scroll={{ x: 940 }}
              pagination={admins.length > 10 ? { pageSize: 10, showSizeChanger: false } : false}
              locale={{ emptyText: 'No admin profiles found' }}
            />
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
};

export default AdminManagement;
