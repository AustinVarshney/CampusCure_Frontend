import { getAdminProfile, updateAdminProfile } from '@/api/admin';
import { getFacultyProfile, updateFacultyProfile } from '@/api/faculty';
import { getStudentProfile, updateStudentProfile } from '@/api/student';
import PageTransition from '@/components/animated/PageTransition';
import { Skeleton } from '@/components/ui/skeleton';
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
  const showFieldSkeleton = loadingProfile && !editing;
  const roleTagStyle = {
    background: 'linear-gradient(135deg, #06204D 0%, #0C5D8E 52%, #16B3C6 100%)',
    color: '#ffffff',
    border: 'none',
  };
  const approvalTagStyle = {
    backgroundColor: user.approvalStatus === 'APPROVED' ? '#DCFCE7' : '#FEF3C7',
    color: user.approvalStatus === 'APPROVED' ? '#166534' : '#92400E',
    border: 'none',
  };
  const editProfileButtonStyle = editing
    ? {
        backgroundColor: '#ffffff',
        color: '#0f172a',
        borderColor: '#cbd5e1',
      }
    : {
        background: 'linear-gradient(135deg, #06204d 0%, #0c5d8e 52%, #16b3c6 100%)',
        color: '#ffffff',
        borderColor: 'transparent',
      };
  const renderValue = (value: string | undefined, fallback = '—', width = 'w-24') => (
    showFieldSkeleton ? <Skeleton className={`h-4 ${width}`} /> : (value || fallback)
  );

  return (
    <PageTransition>
      <div className="mx-auto w-full max-w-3xl space-y-5 px-3 sm:space-y-6 sm:px-4">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/85 shadow-sm"
        >
          {/* Banner */}
          <div className="h-24 bg-[radial-gradient(circle_at_top,#1cc8d4_0%,rgba(28,200,212,0.18)_0%,transparent_60%),linear-gradient(15deg,#04122f_8%,#0a2f61_44%,#0a7c9b_100%)] sm:h-32" />

          {/* Avatar + Info */}
          <div className="px-4 pb-5 sm:px-6 sm:pb-6">
            <div className="-mt-10 flex flex-col items-start gap-3 sm:-mt-12 sm:flex-row sm:items-end sm:gap-4">
              <Avatar
                size={96}
                style={{
                  backgroundColor: '#0C5D8E',
                  fontSize: 32,
                  fontWeight: 700,
                  border: '4px solid hsl(var(--card))',
                }}
              >
                {initials}
              </Avatar>
              <div className="min-w-0 flex-1 pt-1 sm:pt-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="mb-1 wrap-break-word text-xl font-bold text-foreground sm:mb-2 sm:text-2xl sm:text-white">{user.name}</h1>
                  <Tag style={roleTagStyle}>
                    {user.role}
                  </Tag>
                  <Tag style={approvalTagStyle}>
                    {user.approvalStatus}
                  </Tag>
                </div>
                <p className="mt-0.5 break-all text-sm text-muted-foreground">{user.email}</p>
                <p className="mt-0.5 break-all text-xs text-muted-foreground">
                  Username: <span className="font-mono font-medium text-foreground">{user.username}</span>
                </p>
              </div>
              <Button
                type="default"
                icon={editing ? <CloseOutlined /> : <EditOutlined />}
                onClick={() => setEditing(!editing)}
                style={editProfileButtonStyle}
                className="h-10 w-full rounded-xl border sm:w-auto"
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
          className="space-y-5 rounded-2xl border bg-card p-4 shadow-sm sm:p-6"
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
                <p className="text-sm text-foreground font-medium flex items-center gap-2"><PhoneOutlined className="text-muted-foreground" /> {renderValue(form.phoneNumber, '—', 'w-28')}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Address</label>
              {editing ? (
                <Input size="large" prefix={<HomeOutlined />} value={form.address} onChange={(e) => update('address', e.target.value)} className="rounded-xl" />
              ) : (
                <p className="text-sm text-foreground font-medium flex items-center gap-2"><HomeOutlined className="text-muted-foreground" /> {renderValue(form.address, '—', 'w-44')}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Department</label>
              {editing ? (
                <Select size="large" className="w-full" value={form.department || undefined} onChange={(v) => update('department', v)} options={departments.map((d) => ({ label: d, value: d }))} />
              ) : (
                <p className="text-sm text-foreground font-medium">{renderValue(form.department, '—', 'w-36')}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Branch</label>
              {editing ? (
                <Select size="large" className="w-full" value={form.branch || undefined} onChange={(v) => update('branch', v)} options={branches.map((b) => ({ label: b, value: b }))} />
              ) : (
                <p className="text-sm text-foreground font-medium">{renderValue(form.branch, '—', 'w-20')}</p>
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
                    <p className="text-sm text-foreground font-medium">{showFieldSkeleton ? <Skeleton className="h-4 w-28" /> : `Semester ${form.semester || '—'}`}</p>
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
                    <p className="text-sm text-foreground font-medium">{renderValue(form.guardianName, '—', 'w-40')}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Guardian Phone</label>
                  {editing ? (
                    <Input size="large" prefix={<PhoneOutlined />} value={form.guardianPhoneNumber} onChange={(e) => update('guardianPhoneNumber', e.target.value)} className="rounded-xl" maxLength={10} />
                  ) : (
                    <p className="text-sm text-foreground font-medium">{renderValue(form.guardianPhoneNumber, '—', 'w-32')}</p>
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
                  <p className="text-sm text-foreground font-medium">{renderValue(form.subjects, '—', 'w-44')}</p>
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
                  <p className="text-sm text-foreground font-medium">{renderValue(form.name || user.name, '—', 'w-40')}</p>
                )}
              </div>
              {loadingProfile ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Skeleton className="h-20 rounded-xl" />
                    <Skeleton className="h-20 rounded-xl" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Skeleton className="h-24 rounded-xl" />
                    <Skeleton className="h-24 rounded-xl" />
                    <Skeleton className="h-24 rounded-xl" />
                  </div>
                </div>
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
                      <p className="wrap-break-word text-sm font-medium text-foreground">
                        {adminInfo.assignedDepartments.length > 0 ? adminInfo.assignedDepartments.join(', ') : '—'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Allowed Categories</label>
                      <p className="wrap-break-word text-sm font-medium text-foreground">
                        {adminInfo.allowedCategories.length > 0 ? adminInfo.allowedCategories.join(', ') : '—'}
                      </p>
                    </div>
                  </div>
                  <Divider className="my-2" />
                  <h2 className="text-lg font-semibold text-foreground">Activity Overview</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div className="rounded-xl border border-cyan-100 bg-cyan-50/60 p-4">
                      <p className="text-2xl font-bold text-foreground">{adminInfo.complaintsAssigned}</p>
                      <p className="text-xs text-muted-foreground mt-1">Complaints Assigned</p>
                    </div>
                    <div className="rounded-xl border border-cyan-100 bg-cyan-50/60 p-4">
                      <p className="text-2xl font-bold text-foreground">{adminInfo.complaintsClosed}</p>
                      <p className="text-xs text-muted-foreground mt-1">Complaints Closed</p>
                    </div>
                    <div className="rounded-xl border border-cyan-100 bg-cyan-50/60 p-4">
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
              <Button
                type="primary"
                icon={<SaveOutlined />}
                size="large"
                onClick={handleSave}
                className="h-11 rounded-xl border-none bg-[linear-gradient(135deg,#06204d_0%,#0c5d8e_52%,#16b3c6_100%)] font-semibold text-white shadow-[0_14px_34px_rgba(8,79,120,0.28)] hover:opacity-95"
                loading={loadingProfile}
              >
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
          className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6"
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