import { getAllUsers, toggleUserActiveStatus, updateUserApprovalStatus } from '@/api/admin';
import PageTransition from '@/components/animated/PageTransition';
import { User } from '@/types';
import { UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Modal, Select, Switch, Table, Tag, message } from 'antd';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [newApprovalStatus, setNewApprovalStatus] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const data = await getAllUsers();
        console.log("All users data:", data);
        if (isMounted) {
          setUsers(data);
        }
      } catch (e: unknown) {
        console.error("Error fetching users:", e);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      await toggleUserActiveStatus(userId, !currentStatus);
      message.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      // Refresh user list
      const data = await getAllUsers();
      setUsers(data);
    } catch (e: unknown) {
      message.error(e instanceof Error ? e.message : 'Failed to update user status');
    }
  };

  const handleApprovalStatusUpdate = async () => {
    if (!selectedUser || !newApprovalStatus) {
      message.error('Please select an approval status');
      return;
    }

    setUpdating(true);
    try {
      await updateUserApprovalStatus(selectedUser.id, newApprovalStatus);
      message.success('User approval status updated successfully');
      setApprovalModalOpen(false);
      setNewApprovalStatus('');
      // Refresh user list
      const data = await getAllUsers();
      setUsers(data);
    } catch (e: unknown) {
      message.error(e instanceof Error ? e.message : 'Failed to update approval status');
    } finally {
      setUpdating(false);
    }
  };

  const openViewModal = (user: User) => {
    setSelectedUser(user);
    setViewModalOpen(true);
  };

  const openApprovalModal = (user: User) => {
    setSelectedUser(user);
    setNewApprovalStatus(user.approvalStatus || 'PENDING');
    setApprovalModalOpen(true);
  };

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
      render: (role: string) => <Tag color={role === 'STUDENT' ? 'blue' : role === 'FACULTY' ? 'green' : 'purple'}>{role}</Tag>,
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
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, r: User) => (
        <div className="flex gap-2">
          <Button size="small" onClick={() => openViewModal(r)}>
            View
          </Button>
          <Button size="small" onClick={() => openApprovalModal(r)}>
            Approval
          </Button>
          <Switch
            size="small"
            checked={r.isActive || false}
            onChange={() => handleToggleActive(r.id, r.isActive || false)}
            checkedChildren="Active"
            unCheckedChildren="Inactive"
          />
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

        {/* View User Modal */}
        <Modal
          title="User Details"
          open={viewModalOpen}
          onCancel={() => setViewModalOpen(false)}
          footer={[
            <Button key="close" onClick={() => setViewModalOpen(false)}>
              Close
            </Button>,
          ]}
          width={600}
        >
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b">
                <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: 'hsl(214 100% 50%)' }} />
                <div>
                  <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.username}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm">{selectedUser.email}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Role</p>
                  <Tag color={selectedUser.role === 'STUDENT' ? 'blue' : selectedUser.role === 'FACULTY' ? 'green' : 'purple'}>
                    {selectedUser.role}
                  </Tag>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Approval Status</p>
                  <Tag color={selectedUser.approvalStatus === 'APPROVED' ? 'green' : selectedUser.approvalStatus === 'PENDING' ? 'orange' : 'red'}>
                    {selectedUser.approvalStatus}
                  </Tag>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Status</p>
                  <Tag color={selectedUser.isActive ? 'green' : 'default'}>
                    {selectedUser.isActive ? 'Active' : 'Inactive'}
                  </Tag>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created At</p>
                  <p className="text-sm">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'N/A'}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Updated At</p>
                  <p className="text-sm">{selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleString() : 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Change Approval Status Modal */}
        <Modal
          title="Change Approval Status"
          open={approvalModalOpen}
          onCancel={() => {
            setApprovalModalOpen(false);
            setNewApprovalStatus('');
          }}
          footer={[
            <Button
              key="cancel"
              onClick={() => {
                setApprovalModalOpen(false);
                setNewApprovalStatus('');
              }}
            >
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={updating}
              onClick={handleApprovalStatusUpdate}
            >
              Update Status
            </Button>,
          ]}
        >
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <p className="text-sm mb-2">
                  <strong>User:</strong> {selectedUser.name} ({selectedUser.username})
                </p>
                <p className="text-sm mb-4">
                  <strong>Current Status:</strong>{' '}
                  <Tag color={selectedUser.approvalStatus === 'APPROVED' ? 'green' : selectedUser.approvalStatus === 'PENDING' ? 'orange' : 'red'}>
                    {selectedUser.approvalStatus}
                  </Tag>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">New Approval Status</label>
                <Select
                  value={newApprovalStatus}
                  onChange={setNewApprovalStatus}
                  style={{ width: '100%' }}
                  options={[
                    { value: 'PENDING', label: 'Pending' },
                    { value: 'APPROVED', label: 'Approved' },
                    { value: 'REJECTED', label: 'Rejected' },
                  ]}
                />
              </div>
            </div>
          )}
        </Modal>
      </div>
    </PageTransition>
  );
};

export default AdminUsers;