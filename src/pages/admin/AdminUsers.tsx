import { getAllUsers, toggleUserActiveStatus, updateUserApprovalStatus } from '@/api/admin';
import PageTransition from '@/components/animated/PageTransition';
import { User } from '@/types';
import {
    CloseOutlined,
    SearchOutlined,
    TeamOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Modal, Select, Switch, message } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const ROLE_STYLES: Record<string, { bg: string; text: string }> = {
  STUDENT: { bg: 'bg-blue-100 dark:bg-blue-950/40',   text: 'text-blue-700 dark:text-blue-300' },
  FACULTY: { bg: 'bg-green-100 dark:bg-green-950/40', text: 'text-green-700 dark:text-green-300' },
  ADMIN:   { bg: 'bg-violet-100 dark:bg-violet-950/40', text: 'text-violet-700 dark:text-violet-300' },
};
const APPROVAL_STYLES: Record<string, { bg: string; text: string }> = {
  APPROVED: { bg: 'bg-green-100 dark:bg-green-950/40', text: 'text-green-700 dark:text-green-300' },
  PENDING:  { bg: 'bg-orange-100 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-300' },
  REJECTED: { bg: 'bg-red-100 dark:bg-red-950/40',   text: 'text-red-700 dark:text-red-300' },
};

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [panelUser, setPanelUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
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

  const openApprovalModal = (user: User) => {
    setSelectedUser(user);
    setNewApprovalStatus(user.approvalStatus || 'PENDING');
    setApprovalModalOpen(true);
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !search || u.name?.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.username.toLowerCase().includes(q);
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const roleCounts = ['STUDENT', 'FACULTY', 'ADMIN'].reduce((acc, r) => {
    acc[r] = users.filter((u) => u.role === r).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-linear-to-br from-slate-900 via-blue-950 to-indigo-950 p-7 text-white shadow-xl"
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[32px_32px]" />
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-blue-500/10" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
              <TeamOutlined className="text-blue-300 text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">User Management</h1>
              <p className="text-blue-200/70 text-xs mt-0.5">{users.length} total users</p>
            </div>
          </div>
        </motion.div>

        {/* Role strip + search row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setRoleFilter(null)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                !roleFilter ? 'bg-foreground text-background border-foreground shadow-sm' : 'bg-card text-muted-foreground border-border hover:border-foreground/30'
              }`}
            >
              All ({users.length})
            </button>
            {['STUDENT', 'FACULTY', 'ADMIN'].map((role) => {
              const rs = ROLE_STYLES[role] ?? ROLE_STYLES.STUDENT;
              const active = roleFilter === role;
              return (
                <button
                  key={role}
                  onClick={() => setRoleFilter(active ? null : role)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                    active ? `${rs.bg} ${rs.text} border-current shadow-sm` : 'bg-card text-muted-foreground border-border hover:border-foreground/30'
                  }`}
                >
                  {role} ({roleCounts[role] ?? 0})
                </button>
              );
            })}
          </div>
          <div className="relative sm:ml-auto">
            <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full sm:w-64 rounded-xl border border-border bg-card pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
          </div>
        </div>

        {/* User list */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border bg-card">
            <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
              <UserOutlined className="text-2xl text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground">No users found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((u, i) => {
              const rs = ROLE_STYLES[u.role] ?? ROLE_STYLES.STUDENT;
              const as_ = APPROVAL_STYLES[u.approvalStatus ?? 'PENDING'] ?? APPROVAL_STYLES.PENDING;
              const initial = (u.name || u.username || 'U')[0].toUpperCase();
              return (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  whileHover={{ x: 3 }}
                  onClick={() => setPanelUser(u)}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm cursor-pointer hover:border-blue-500/30 transition-all"
                >
                  <div className="h-9 w-9 rounded-full bg-linear-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{u.name || u.username}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${rs.bg} ${rs.text}`}>{u.role}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${as_.bg} ${as_.text}`}>{u.approvalStatus}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${u.isActive ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Slide-in Detail Panel */}
        <AnimatePresence>
          {panelUser && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                onClick={() => setPanelUser(null)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border shadow-2xl z-50 overflow-y-auto"
              >
                <div className="sticky top-0 bg-card/90 backdrop-blur-sm border-b border-border px-6 py-4 flex items-center justify-between">
                  <h2 className="font-bold text-foreground text-base">User Details</h2>
                  <button
                    onClick={() => setPanelUser(null)}
                    className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                  >
                    <CloseOutlined style={{ fontSize: 14 }} />
                  </button>
                </div>
                <div className="p-6 space-y-5">
                  {/* Avatar + name */}
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-linear-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
                      {(panelUser.name || panelUser.username || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-lg">{panelUser.name}</p>
                      <p className="text-xs text-muted-foreground">{panelUser.username}</p>
                    </div>
                  </div>

                  {/* Pills */}
                  <div className="flex gap-2 flex-wrap">
                    {(() => { const rs = ROLE_STYLES[panelUser.role] ?? ROLE_STYLES.STUDENT; return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${rs.bg} ${rs.text}`}>{panelUser.role}</span>; })()}
                    {(() => { const as_ = APPROVAL_STYLES[panelUser.approvalStatus ?? 'PENDING']; return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${as_.bg} ${as_.text}`}>{panelUser.approvalStatus}</span>; })()}
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${panelUser.isActive ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                      {panelUser.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-border bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground mb-1">Email</p>
                      <p className="text-sm font-medium text-foreground break-all">{panelUser.email}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground mb-1">Created</p>
                      <p className="text-sm font-medium text-foreground">{panelUser.createdAt ? new Date(panelUser.createdAt).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>

                  {/* Toggle active */}
                  <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Account Active</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Enable or disable this user's access</p>
                    </div>
                    <Switch
                      checked={panelUser.isActive || false}
                      onChange={async () => {
                        await handleToggleActive(panelUser.id, panelUser.isActive || false);
                        setPanelUser(null);
                      }}
                      checkedChildren="On"
                      unCheckedChildren="Off"
                    />
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => { openApprovalModal(panelUser); }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-blue-600 to-violet-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-md shadow-blue-600/20"
                  >
                    Change Approval Status
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Change Approval Status Modal */}
        <Modal
          title="Change Approval Status"
          open={approvalModalOpen}
          onCancel={() => { setApprovalModalOpen(false); setNewApprovalStatus(''); }}
          onOk={handleApprovalStatusUpdate}
          okText="Update Status"
          confirmLoading={updating}
          okButtonProps={{ className: 'rounded-lg' }}
        >
          {selectedUser && (
            <div className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">
                Updating approval for <span className="font-semibold text-foreground">{selectedUser.name}</span>
              </p>
              <div>
                <label className="block text-sm font-medium mb-2">New Approval Status</label>
                <Select
                  value={newApprovalStatus}
                  onChange={setNewApprovalStatus}
                  className="w-full"
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