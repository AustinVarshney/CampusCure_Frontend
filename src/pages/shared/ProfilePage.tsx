import PageTransition from '@/components/animated/PageTransition';
import { useAuth } from '@/context/AuthContext';
import { departments } from '@/types';

import {
  CloseOutlined,
  EditOutlined,
  HomeOutlined,
  PhoneOutlined,
  SaveOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Avatar, Button, Divider, Input, message, Select, Tag } from 'antd';
import { motion } from 'framer-motion';
import { useState } from 'react';

const branches = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'];

const ProfilePage = () => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const isStudent = user?.role === 'STUDENT';
  const isFaculty = user?.role === 'FACULTY';

  const [form, setForm] = useState({
    phoneNumber: '',
    address: '',
    department: '',
    branch: '',
    ...(isStudent ? {
      semester: '',
      guardianName: '',
      guardianPhoneNumber: '',
    } : {}),
    ...(isFaculty ? {
      subjects: '',
    } : {}),
  });

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSave = () => {
    message.success('Profile updated successfully!');
    setEditing(false);
  };

  if (!user) return null;

  const initials = user.name.split(' ').map((n) => n[0]).join('').toUpperCase();

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border bg-card shadow-sm"
        >
          {/* Banner */}
          <div className="h-32 bg-linear-to-r from-blue-600 via-blue-500 to-indigo-500" />

          {/* Avatar + Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
              <Avatar
                size={96}
                style={{
                  backgroundColor: 'hsl(var(--primary))',
                  fontSize: 32,
                  fontWeight: 700,
                  border: '4px solid hsl(var(--card))',
                }}
              >
                {initials}
              </Avatar>
              <div className="flex-1 pt-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-white mb-2">{user.name}</h1>
                  <Tag color={user.role === 'STUDENT' ? 'blue' : user.role === 'FACULTY' ? 'green' : 'purple'}>
                    {user.role}
                  </Tag>
                  <Tag color={user.approvalStatus === 'APPROVED' ? 'green' : 'orange'}>
                    {user.approvalStatus}
                  </Tag>
                </div>
                <p className="text-muted-foreground text-sm mt-0.5">{user.email}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Username: <span className="font-mono font-medium text-foreground">{user.username}</span>
                </p>
              </div>
              <Button
                type={editing ? 'default' : 'primary'}
                icon={editing ? <CloseOutlined /> : <EditOutlined />}
                onClick={() => setEditing(!editing)}
                className="rounded-xl"
              >
                {editing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Profile Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border  bg-card p-6 shadow-sm space-y-5"
        >
          <h2 className="text-lg font-semibold text-foreground">Personal Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone Number</label>
              {editing ? (
                <Input size="large" prefix={<PhoneOutlined />} value={form.phoneNumber} onChange={(e) => update('phoneNumber', e.target.value)} className="rounded-xl" maxLength={10} />
              ) : (
                <p className="text-sm text-foreground font-medium flex items-center gap-2"><PhoneOutlined className="text-muted-foreground" /> {form.phoneNumber || '—'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Address</label>
              {editing ? (
                <Input size="large" prefix={<HomeOutlined />} value={form.address} onChange={(e) => update('address', e.target.value)} className="rounded-xl" />
              ) : (
                <p className="text-sm text-foreground font-medium flex items-center gap-2"><HomeOutlined className="text-muted-foreground" /> {form.address || '—'}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Department</label>
              {editing ? (
                <Select size="large" className="w-full" value={form.department || undefined} onChange={(v) => update('department', v)} options={departments.map((d) => ({ label: d, value: d }))} />
              ) : (
                <p className="text-sm text-foreground font-medium">{form.department}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Branch</label>
              {editing ? (
                <Select size="large" className="w-full" value={form.branch || undefined} onChange={(v) => update('branch', v)} options={branches.map((b) => ({ label: b, value: b }))} />
              ) : (
                <p className="text-sm text-foreground font-medium">{form.branch}</p>
              )}
            </div>
          </div>

          {/* Student-specific fields */}
          {isStudent && (
            <>
              <Divider className="my-2" />
              <h2 className="text-lg font-semibold text-foreground">Academic Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Semester</label>
                  {editing ? (
                    <Select size="large" className="w-full" value={form.semester || undefined} onChange={(v) => update('semester', v)} options={[1,2,3,4,5,6,7,8].map((s) => ({ label: `Semester ${s}`, value: String(s) }))} />
                  ) : (
                    <p className="text-sm text-foreground font-medium">Semester {form.semester || '—'}</p>
                  )}
                </div>
              </div>

              <Divider className="my-2" />
              <h2 className="text-lg font-semibold text-foreground">Guardian Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Guardian Name</label>
                  {editing ? (
                    <Input size="large" prefix={<UserOutlined />} value={form.guardianName} onChange={(e) => update('guardianName', e.target.value)} className="rounded-xl" />
                  ) : (
                    <p className="text-sm text-foreground font-medium">{form.guardianName || '—'}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Guardian Phone</label>
                  {editing ? (
                    <Input size="large" prefix={<PhoneOutlined />} value={form.guardianPhoneNumber} onChange={(e) => update('guardianPhoneNumber', e.target.value)} className="rounded-xl" maxLength={10} />
                  ) : (
                    <p className="text-sm text-foreground font-medium">{form.guardianPhoneNumber || '—'}</p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Faculty-specific fields */}
          {isFaculty && (
            <>
              <Divider className="my-2" />
              <h2 className="text-lg font-semibold text-foreground">Faculty Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
                  <Tag color="green">
                    Active Teaching
                  </Tag>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Subjects</label>
                {editing ? (
                  <Input size="large" placeholder="Comma-separated subjects" value={form.subjects} onChange={(e) => update('subjects', e.target.value)} className="rounded-xl" />
                ) : (
                  <p className="text-sm text-foreground font-medium">{form.subjects || '—'}</p>
                )}
              </div>
            </>
          )}

          {/* Save button */}
          {editing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-2">
              <Button type="primary" icon={<SaveOutlined />} size="large" onClick={handleSave} className="rounded-xl h-11 font-semibold">
                Save Changes
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border bg-card p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Activity Stats</h2>
          <div className="text-center py-12">
            <div className="text-6xl mb-3">📊</div>
            <p className="text-sm font-medium text-foreground">No Activity Data Yet</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              Your activity statistics will appear here once you start using the platform
            </p>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default ProfilePage;