import { getAdminProfile, updateAdminProfile } from '@/api/admin';
import { getFacultyProfile, updateFacultyProfile } from '@/api/faculty';
import { getStudentProfile, updateStudentProfile } from '@/api/student';
import PageTransition from '@/components/animated/PageTransition';
import { useAuth } from '@/context/AuthContext';
import { AdminLevel, departments } from '@/types';

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
import { useCallback, useEffect, useState } from 'react';

const branches = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'];

type ProfileForm = {
  name: string;
  phoneNumber: string;
  address: string;
  department: string;
  branch: string;
  semester: string;
  guardianName: string;
  guardianPhoneNumber: string;
  subjects: string;
  isTeaching: boolean;
};

const emptyForm: ProfileForm = {
  name: '',
  phoneNumber: '',
  address: '',
  department: '',
  branch: '',
  semester: '',
  guardianName: '',
  guardianPhoneNumber: '',
  subjects: '',
  isTeaching: true,
};

type AdminInfo = {
  adminLevel: AdminLevel;
  manageUsers: boolean;
  manageComplaints: boolean;
  manageDoubts: boolean;
  viewAnalytics: boolean;
  assignedDepartments: string[];
  allowedCategories: string[];
  complaintsAssigned: number;
  complaintsClosed: number;
  usersManaged: number;
} | null;

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const isStudent = user?.role === 'STUDENT';
  const isFaculty = user?.role === 'FACULTY';
  const isAdmin = user?.role === 'ADMIN';
  const canEditProfile = isStudent || isFaculty || isAdmin;

  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [adminInfo, setAdminInfo] = useState<AdminInfo>(null);

  const loadProfile = useCallback(async () => {
    if (!user) {
      setForm(emptyForm);
      setAdminInfo(null);
      return;
    }

    if (isAdmin) {
      setLoadingProfile(true);
      try {
        const profile = await getAdminProfile();
        setForm({ ...emptyForm, name: profile.user?.name ?? '' });
        setAdminInfo({
          adminLevel: profile.adminLevel,
          manageUsers: profile.manageUsers,
          manageComplaints: profile.manageComplaints,
          manageDoubts: profile.manageDoubts,
          viewAnalytics: profile.viewAnalytics,
          assignedDepartments: profile.assignedDepartments,
          allowedCategories: profile.allowedCategories,
          complaintsAssigned: profile.complaintsAssigned,
          complaintsClosed: profile.complaintsClosed,
          usersManaged: profile.usersManaged,
        });
      } catch {
        message.error('Failed to load admin profile details');
      } finally {
        setLoadingProfile(false);
      }
      return;
    }

    if (!canEditProfile) {
      setForm(emptyForm);
      return;
    }

    setLoadingProfile(true);

    try {
      if (isStudent) {
        const profile = await getStudentProfile();
        setForm({
          ...emptyForm,
          phoneNumber: profile?.phoneNumber ? String(profile.phoneNumber) : '',
          address: profile?.address ?? '',
          department: profile?.department ?? '',
          branch: profile?.branch ?? '',
          semester: profile?.semester ? String(profile.semester) : '',
          guardianName: profile?.guardianName ?? '',
          guardianPhoneNumber: profile?.guardianPhone ?? '',
        });
        return;
      }

      if (isFaculty) {
        const profile = await getFacultyProfile();
        setForm({
          ...emptyForm,
          phoneNumber: profile?.phoneNumber ? String(profile.phoneNumber) : '',
          address: profile?.address ?? '',
          department: profile?.department ?? '',
          branch: profile?.branch ?? '',
          subjects: Array.isArray(profile?.subjects)
            ? profile.subjects.join(', ')
            : '',
          isTeaching: Boolean(profile?.isTeaching ?? true),
        });
      }
    } catch {
      message.error('Failed to load profile details');
    } finally {
      setLoadingProfile(false);
    }
  }, [canEditProfile, isAdmin, isFaculty, isStudent, user]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const update = (field: keyof ProfileForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!canEditProfile) {
      message.info('Profile update is not available for this role yet');
      return;
    }

    try {
      if (isStudent) {
        const payload: {
          department: string;
          branch: string;
          phoneNumber: string;
          address: string;
          guardianName: string;
          guardianPhone: string;
          semester?: number;
        } = {
          department: form.department.trim(),
          branch: form.branch.trim(),
          phoneNumber: form.phoneNumber.trim(),
          address: form.address.trim(),
          guardianName: form.guardianName.trim(),
          guardianPhone: form.guardianPhoneNumber.trim(),
        };

        if (form.semester.trim()) {
          const parsedSemester = Number(form.semester);

          if (!Number.isInteger(parsedSemester) || parsedSemester < 1 || parsedSemester > 8) {
            message.error('Semester must be between 1 and 8');
            return;
          }

          payload.semester = parsedSemester;
        }

        await updateStudentProfile(payload);
      } else if (isFaculty) {
        const payload = {
          department: form.department.trim(),
          branch: form.branch.trim(),
          phoneNumber: form.phoneNumber.trim(),
          address: form.address.trim(),
          subjects: form.subjects
            .split(',')
            .map((subject) => subject.trim())
            .filter((subject) => subject.length > 0),
          isTeaching: form.isTeaching,
        };

        await updateFacultyProfile(payload);
      } else if (isAdmin) {
        if (!form.name.trim()) {
          message.error('Name is required');
          return;
        }
        await updateAdminProfile({ name: form.name.trim() });
        await refreshUser();
      }

      await loadProfile();
      message.success('Profile updated successfully!');
      setEditing(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      message.error(errorMessage);
    }
  };

  if (!user) return null;

  const initials = user.name.split(' ').map((n) => n[0]).join('').toUpperCase();

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto px-1 sm:px-0 space-y-6">
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
                disabled={!canEditProfile || loadingProfile}
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

          {isAdmin && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
                <p className="text-sm text-foreground font-medium">{user.email}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Username</label>
                <p className="text-sm text-foreground font-mono font-medium">{user.username}</p>
              </div>
            </div>
          )}

          {!isAdmin && (
          <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone Number</label>
              {editing ? (
                <Input size="large" prefix={<PhoneOutlined />} value={form.phoneNumber} onChange={(e) => update('phoneNumber', e.target.value)} className="rounded-xl" maxLength={15} />
              ) : (
                <p className="text-sm text-foreground font-medium flex items-center gap-2"><PhoneOutlined className="text-muted-foreground" /> {loadingProfile ? 'Loading...' : form.phoneNumber || '—'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Address</label>
              {editing ? (
                <Input size="large" prefix={<HomeOutlined />} value={form.address} onChange={(e) => update('address', e.target.value)} className="rounded-xl" />
              ) : (
                <p className="text-sm text-foreground font-medium flex items-center gap-2"><HomeOutlined className="text-muted-foreground" /> {loadingProfile ? 'Loading...' : form.address || '—'}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Department</label>
              {editing ? (
                <Select size="large" className="w-full" value={form.department || undefined} onChange={(v) => update('department', v)} options={departments.map((d) => ({ label: d, value: d }))} />
              ) : (
                <p className="text-sm text-foreground font-medium">{loadingProfile ? 'Loading...' : form.department || '—'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Branch</label>
              {editing ? (
                <Select size="large" className="w-full" value={form.branch || undefined} onChange={(v) => update('branch', v)} options={branches.map((b) => ({ label: b, value: b }))} />
              ) : (
                <p className="text-sm text-foreground font-medium">{loadingProfile ? 'Loading...' : form.branch || '—'}</p>
              )}
            </div>
          </div>
          </>
          )}

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
                    <p className="text-sm text-foreground font-medium">Semester {loadingProfile ? 'Loading...' : form.semester || '—'}</p>
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
                    <p className="text-sm text-foreground font-medium">{loadingProfile ? 'Loading...' : form.guardianName || '—'}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Guardian Phone</label>
                  {editing ? (
                    <Input size="large" prefix={<PhoneOutlined />} value={form.guardianPhoneNumber} onChange={(e) => update('guardianPhoneNumber', e.target.value)} className="rounded-xl" maxLength={10} />
                  ) : (
                    <p className="text-sm text-foreground font-medium">{loadingProfile ? 'Loading...' : form.guardianPhoneNumber || '—'}</p>
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
                  <Tag color={form.isTeaching ? 'green' : 'orange'}>
                    {form.isTeaching ? 'Active Teaching' : 'Not Teaching'}
                  </Tag>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Subjects</label>
                {editing ? (
                  <Input size="large" placeholder="Comma-separated subjects" value={form.subjects} onChange={(e) => update('subjects', e.target.value)} className="rounded-xl" />
                ) : (
                  <p className="text-sm text-foreground font-medium">{loadingProfile ? 'Loading...' : form.subjects || '—'}</p>
                )}
              </div>
            </>
          )}

          {/* Admin-specific fields */}
          {isAdmin && (
            <>
              <Divider className="my-2" />
              <h2 className="text-lg font-semibold text-foreground">Admin Details</h2>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Display Name</label>
                {editing ? (
                  <Input
                    size="large"
                    prefix={<UserOutlined />}
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    className="rounded-xl"
                    maxLength={100}
                  />
                ) : (
                  <p className="text-sm text-foreground font-medium">{loadingProfile ? 'Loading...' : form.name || user.name}</p>
                )}
              </div>
              {loadingProfile ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : adminInfo ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Admin Level</label>
                      <Tag color={adminInfo.adminLevel === 'SUPER' ? 'gold' : 'blue'}>{adminInfo.adminLevel}</Tag>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Permissions</label>
                      <div className="flex flex-wrap gap-1">
                        {adminInfo.manageUsers && <Tag color="green">Manage Users</Tag>}
                        {adminInfo.manageComplaints && <Tag color="green">Manage Complaints</Tag>}
                        {adminInfo.manageDoubts && <Tag color="green">Manage Doubts</Tag>}
                        {adminInfo.viewAnalytics && <Tag color="green">View Analytics</Tag>}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Assigned Departments</label>
                      <p className="text-sm text-foreground font-medium">
                        {adminInfo.assignedDepartments.length > 0 ? adminInfo.assignedDepartments.join(', ') : '—'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Allowed Categories</label>
                      <p className="text-sm text-foreground font-medium">
                        {adminInfo.allowedCategories.length > 0 ? adminInfo.allowedCategories.join(', ') : '—'}
                      </p>
                    </div>
                  </div>
                  <Divider className="my-2" />
                  <h2 className="text-lg font-semibold text-foreground">Activity Overview</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div className="rounded-xl border bg-muted/30 p-4">
                      <p className="text-2xl font-bold text-foreground">{adminInfo.complaintsAssigned}</p>
                      <p className="text-xs text-muted-foreground mt-1">Complaints Assigned</p>
                    </div>
                    <div className="rounded-xl border bg-muted/30 p-4">
                      <p className="text-2xl font-bold text-foreground">{adminInfo.complaintsClosed}</p>
                      <p className="text-xs text-muted-foreground mt-1">Complaints Closed</p>
                    </div>
                    <div className="rounded-xl border bg-muted/30 p-4">
                      <p className="text-2xl font-bold text-foreground">{adminInfo.usersManaged}</p>
                      <p className="text-xs text-muted-foreground mt-1">Users Managed</p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No admin profile found.</p>
              )}
            </>
          )}

          {/* Save button */}
          {editing && canEditProfile && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-2">
              <Button type="primary" icon={<SaveOutlined />} size="large" onClick={handleSave} className="rounded-xl h-11 font-semibold" loading={loadingProfile}>
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