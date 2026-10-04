import { getAdminProfile, updateAdminProfile } from '@/api/admin';
import { getFacultyProfile, updateFacultyProfile } from '@/api/faculty';
import { getStudentProfile, updateStudentProfile } from '@/api/student';
import PageTransition from '@/components/animated/PageTransition';
import { Badge } from "@/components/app/PageShell";
import { APPROVAL_STATUS, ROLE_LABEL } from "@/lib/statusStyles";
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { AdminLevel, departments } from '@/types';

import {
  CloseOutlined,
  EditOutlined,
  HomeOutlined,
  SaveOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Avatar, Button, Divider, Input, message, Select, Switch, Tag } from 'antd';
import { COMPLAINT_CATEGORIES, CATEGORY_LABEL } from '@/lib/complaintCategories';
import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';
import { TwoFactorCard } from '@/components/security/TwoFactorCard';
import { PushNotificationsCard } from '@/components/security/PushNotificationsCard';
import { useCallback, useEffect, useRef, useState } from 'react';

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
  // CC-27
  staffRole: string;
  handlesCategories: string[];
  directoryOptIn: boolean;
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
  staffRole: '',
  handlesCategories: [],
  directoryOptIn: false,
};

const PHONE_NUMBER_PATTERN = /^\d{10}$/;

const isValidPhoneNumber = (value: string): boolean => PHONE_NUMBER_PATTERN.test(value.trim());

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
  const editingRef = useRef(editing);
  const isStudent = user?.role === 'STUDENT';
  const isFaculty = user?.role === 'FACULTY';
  const isAdmin = user?.role === 'ADMIN';
  const canEditProfile = isStudent || isFaculty || isAdmin;

  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [adminInfo, setAdminInfo] = useState<AdminInfo>(null);

  useEffect(() => {
    editingRef.current = editing;
  }, [editing]);

  const loadProfile = useCallback(async () => {
    if (editingRef.current) {
      return;
    }

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
          staffRole: profile?.staffRole ?? '',
          handlesCategories: Array.isArray(profile?.handlesCategories)
            ? profile.handlesCategories
            : [],
          directoryOptIn: Boolean(profile?.directoryOptIn ?? false),
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

  useEffect(() => {
    if (!editing) {
      void loadProfile();
    }
  }, [editing, loadProfile]);

  // `string[]` joined the union for CC-27's handlesCategories, which is a
  // multi-select rather than a text field.
  const update = (
    field: keyof ProfileForm,
    value: string | boolean | string[],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!canEditProfile) {
      message.info('Profile update is not available for this role yet');
      return;
    }

    const phoneNumber = form.phoneNumber.trim();
    const guardianPhoneNumber = form.guardianPhoneNumber.trim();

    if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
      message.error('Phone number must be exactly 10 digits');
      return;
    }

    if (isStudent && guardianPhoneNumber && !isValidPhoneNumber(guardianPhoneNumber)) {
      message.error('Guardian phone number must be exactly 10 digits');
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
          phoneNumber,
          address: form.address.trim(),
          guardianName: form.guardianName.trim(),
          guardianPhone: guardianPhoneNumber,
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
          phoneNumber,
          address: form.address.trim(),
          subjects: form.subjects
            .split(',')
            .map((subject) => subject.trim())
            .filter((subject) => subject.length > 0),
          isTeaching: form.isTeaching,
          // CC-27
          staffRole: form.staffRole.trim(),
          handlesCategories: form.handlesCategories,
          directoryOptIn: form.directoryOptIn,
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
  const editProfileButtonStyle = editing
    ? {
        backgroundColor: 'hsl(var(--card))',
        color: 'hsl(var(--foreground))',
        borderColor: 'hsl(var(--border))',
      }
    : {
        background: 'var(--brand-gradient-soft)',
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
          className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-sm)]"
        >
          {/* Banner */}
          <div className="cc-brand-banner h-24 sm:h-32" />

          {/* Avatar + Info */}
          <div className="px-4 pb-5 sm:px-6 sm:pb-6">
            <div className="-mt-10 flex flex-col items-start gap-3 sm:-mt-12 sm:flex-row sm:items-end sm:gap-4">
              <Avatar
                size={96}
                style={{
                  backgroundColor: 'hsl(var(--brand-600))',
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
                  <Badge tone="info">{ROLE_LABEL[user.role] ?? user.role}</Badge>
                  {user.approvalStatus ? (
                    <Badge tone={APPROVAL_STATUS[user.approvalStatus].tone}>
                      {APPROVAL_STATUS[user.approvalStatus].label}
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-0.5 break-all text-sm text-muted-foreground">Email: {user.email}</p>
                <p className="mt-0.5 break-all text-xs text-muted-foreground">
                  User ID: <span className="font-mono font-medium text-foreground">{user.userID}</span>
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
                <label className="text-xs font-medium text-muted-foreground mb-1 block">User ID</label>
                <p className="text-sm text-foreground font-mono font-medium">{user.userID}</p>
              </div>
            </div>
          )}

          {!isAdmin && (
          <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone Number</label>
              {editing ? (
                <Input size="large" prefix={<Phone size={16} />} value={form.phoneNumber} onChange={(e) => update('phoneNumber', e.target.value)} className="rounded-xl" maxLength={10} inputMode="numeric" />
              ) : (
                <p className="text-sm text-foreground font-medium flex items-center gap-2"><Phone className="text-muted-foreground" size={16}/> {renderValue(form.phoneNumber, '—', 'w-28')}</p>
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
                    <Input size="large" prefix={<Phone size={16} />} value={form.guardianPhoneNumber} onChange={(e) => update('guardianPhoneNumber', e.target.value)} className="rounded-xl" maxLength={10} inputMode="numeric" />
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

              {/* CC-27: what this person is, and what they actually fix. */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Role</label>
                {editing ? (
                  <Input
                    size="large"
                    placeholder="Electrician, Lab Assistant, Lecturer…"
                    value={form.staffRole}
                    onChange={(e) => update('staffRole', e.target.value)}
                    className="rounded-xl"
                    maxLength={80}
                  />
                ) : (
                  <p className="text-sm text-foreground font-medium">{renderValue(form.staffRole, '—', 'w-40')}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Complaints you handle
                </label>
                {editing ? (
                  <>
                    <Select
                      mode="multiple"
                      size="large"
                      className="w-full"
                      placeholder="Select the kinds of problem you fix"
                      value={form.handlesCategories}
                      onChange={(v) => update('handlesCategories', v)}
                      options={COMPLAINT_CATEGORIES.map((c) => ({
                        label: CATEGORY_LABEL[c],
                        value: c,
                      }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Complaints of these kinds will suggest you first when an
                      admin assigns them. Leave empty if you do not handle
                      maintenance.
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-foreground font-medium">
                    {form.handlesCategories.length
                      ? form.handlesCategories.map((c) => CATEGORY_LABEL[c] ?? c).join(', ')
                      : '—'}
                  </p>
                )}
              </div>

              {/* CC-27: consent. Off unless the person turns it on - the
                  difference between a staff directory and the student
                  people-finder the roadmap cut as a harassment vector. */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Staff directory
                </label>
                {editing ? (
                  <>
                    <Switch
                      checked={form.directoryOptIn}
                      onChange={(v) => update('directoryOptIn', v)}
                    />
                    <span className="ml-2 text-sm text-foreground">
                      List me in the staff directory
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      Shares your name, department, role and contact details
                      with everyone at the institution. Your home address is
                      never shown. Off by default.
                    </p>
                  </>
                ) : (
                  <Tag color={form.directoryOptIn ? 'green' : 'default'}>
                    {form.directoryOptIn ? 'Listed' : 'Not listed'}
                  </Tag>
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
                    <div className="rounded-xl border border-cyan-100 bg-accent/60 p-4">
                      <p className="text-2xl font-bold text-foreground">{adminInfo.complaintsAssigned}</p>
                      <p className="text-xs text-muted-foreground mt-1">Complaints Assigned</p>
                    </div>
                    <div className="rounded-xl border border-cyan-100 bg-accent/60 p-4">
                      <p className="text-2xl font-bold text-foreground">{adminInfo.complaintsClosed}</p>
                      <p className="text-xs text-muted-foreground mt-1">Complaints Closed</p>
                    </div>
                    <div className="rounded-xl border border-cyan-100 bg-accent/60 p-4">
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
                className="h-11 rounded-xl border-none cc-fill-brand font-semibold text-white shadow-[var(--shadow-brand)] hover:opacity-95"
                loading={loadingProfile}
              >
                Save Changes
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* CC-62: two-step verification. Hidden when the server has no key. */}
        <TwoFactorCard />

        {/* CC-41: per-device browser notifications. */}
        <PushNotificationsCard />

        {/* Stats Card */}
        {/* <motion.div
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
        </motion.div> */}
      </div>
    </PageTransition>
  );
};

export default ProfilePage;