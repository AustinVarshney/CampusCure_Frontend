import { assignComplaint, getAllComplaints, getApprovedFaculty, updateComplaintStatus } from '@/api/admin';
import PageTransition from '@/components/animated/PageTransition';
import { Skeleton } from '@/components/ui/skeleton';
import { Complaint, ComplaintStatus, User } from '@/types';
import {
  CheckCircleOutlined,
  CloseOutlined,
  FileTextOutlined,
  SearchOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import { Input, Modal, Select, message } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const STATUS_STYLES: Record<ComplaintStatus, { dot: string; bg: string; text: string; label: string }> = {
  RAISED: { dot: 'bg-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/20', text: 'text-orange-800 dark:text-orange-800', label: 'Raised' },
  ASSIGNED: { dot: 'bg-cyan-500', bg: 'bg-cyan-100 dark:bg-cyan-900/20', text: 'text-cyan-800 dark:text-cyan-800', label: 'Assigned' },
  IN_PROGRESS: { dot: 'bg-cyan-500', bg: 'bg-cyan-100 dark:bg-cyan-900/20', text: 'text-cyan-800 dark:text-cyan-800', label: 'In Progress' },
  PENDING_CONFIRMATION: { dot: 'bg-slate-500', bg: 'bg-slate-200 dark:bg-slate-400/60', text: 'text-slate-800 dark:text-slate-800', label: 'Pending Confirmation' },
  ESCALATED_TO_SUPERADMIN: { dot: 'bg-purple-600', bg: 'bg-purple-200 dark:bg-purple-400/30', text: 'text-purple-800 dark:text-purple-800', label: 'Escalated To Super Admin' },
  RESOLVED: { dot: 'bg-green-500', bg: 'bg-green-100 dark:bg-green-400/20', text: 'text-green-800 dark:text-green-800', label: 'Resolved' },
};

const ALL_STATUSES: ComplaintStatus[] = [
  'RAISED',
  'ASSIGNED',
  'IN_PROGRESS',
  'PENDING_CONFIRMATION',
  'RESOLVED',
];

const AdminComplaints = () => {
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [assignModal, setAssignModal] = useState<Complaint | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | null>(null);
  const [assignedFaculty, setAssignedFaculty] = useState<string | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [faculty, setFaculty] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<ComplaintStatus | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchComplaints();
    fetchFaculty();
  }, []);

  const fetchComplaints = async() => {
    try{
      setLoading(true);
      const data = await getAllComplaints();
      setComplaints(data);
    }catch(e:unknown) {
      const errorMsg = e instanceof Error ? e.message : 'Failed to fetch complaints';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculty = async() => {
    try{
      const data = await getApprovedFaculty();
      console.log("Faculty data received:", data);
      console.log("Faculty array length:", data? data.length : 0);
      if (data && Array.isArray(data)) {
        console.log("Faculty items:", data.map(f => ({ id: f.id, name: f.name, email: f.email })));
      }
      setFaculty(data || []);
    }catch(e:unknown) {
      console.error("Error fetching faculty:", e);
      const errorMsg = e instanceof Error ? e.message : 'Failed to fetch faculty';
      message.error(errorMsg);
      // Set empty array on error
      setFaculty([]);
    }
  };

  const handleAssign = async () => {
    if (!assignedFaculty) { 
      message.error('Please select a faculty member'); 
      return; 
    }
    if (!assignModal) return;

    try {
      setAssigning(true);
      await assignComplaint(assignModal.id, assignedFaculty);
      message.success('Complaint assigned successfully!');
      setAssignModal(null);
      setAssignedFaculty(null);
      // Refresh complaints list
      await fetchComplaints();
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : 'Failed to assign complaint';
      message.error(errorMsg);
    } finally {
      setAssigning(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selected || !newStatus) {
      message.error('Please select a status');
      return;
    }

    if (selected.status === 'RESOLVED') {
      message.error('Resolved complaints cannot be updated');
      return;
    }

    // Validate resolution note for RESOLVED status
    if (newStatus === 'RESOLVED' && !resolutionNote.trim()) {
      message.error('Please provide a resolution note');
      return;
    }

    try {
      setUpdatingStatus(true);
      await updateComplaintStatus(selected.id, newStatus, resolutionNote.trim() || undefined);
      message.success('Complaint status updated successfully!');
      setStatusModalOpen(false);
      setNewStatus(null);
      setResolutionNote('');
      setSelected(null);
      // Refresh complaints list
      await fetchComplaints();
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : 'Failed to update status';
      message.error(errorMsg);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openStatusModal = (complaint: Complaint) => {
    if (complaint.status === 'RESOLVED') {
      message.info('Resolved complaints are locked and cannot be updated');
      return;
    }

    setSelected(complaint);
    setNewStatus(complaint.status);
    setResolutionNote(complaint.resolutionNote || '');
    setStatusModalOpen(true);
  };

  const filtered = complaints.filter((c) => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusCounts = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = complaints.filter((c) => c.status === s).length;
    return acc;
  }, {} as Record<ComplaintStatus, number>);

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
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-cyan-500/10" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center shrink-0">
              <FileTextOutlined className="text-cyan-300 text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Complaint Management</h1>
              <p className="text-cyan-200/70 text-xs mt-0.5">{complaints.length} total complaints</p>
            </div>
          </div>
        </motion.div>

        {/* Status Strip */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              !statusFilter
                ? 'bg-foreground text-background border-foreground shadow-sm'
                : 'bg-card text-muted-foreground border-border hover:border-foreground/30'
            }`}
          >
            All ({complaints.length})
          </button>
          {ALL_STATUSES.map((s) => {
            const st = STATUS_STYLES[s];
            const active = statusFilter === s;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(active ? null : s)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                  active
                    ? `${st.bg} ${st.text} border-current shadow-sm`
                    : 'bg-card text-muted-foreground border-border hover:border-foreground/30'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                {st.label} ({statusCounts[s]})
              </button>
            );
          })}
        </div>

        {/* Debug Info - Remove this after fixing the issue */}
        {/* <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-yellow-50 border border-yellow-200 rounded-xl p-4"
        >
          <h3 className="font-semibold text-yellow-800 mb-2 text-sm">Debug Information</h3>
          <div className="text-xs text-yellow-700 space-y-1">
            <p>• Faculty loaded: {faculty.length} faculty members available for assignment</p>
            <p>• Faculty data: {faculty.length > 0 ? faculty.map(f => f.name).join(', ') : 'No faculty found'}</p>
            <p>• Status: {faculty.length === 0 ? '❌ No approved faculty available - check user management' : '✅ Faculty available'}</p>
            {faculty.length === 0 && (
              <p className="font-medium">⚠️ Go to Users → Faculty tab to approve pending faculty members</p>
            )}
          </div>
        </motion.div> */}

        {/* Search */}
        <div className="relative w-full sm:max-w-sm">
          <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search complaints..."
            className="w-full rounded-xl border-2 bg-card pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
          />
        </div>

        {/* List */}
        {loading ? (
          <div className="grid grid-cols-1 gap-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="rounded-2xl border bg-card p-4 shadow-sm">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border-2 bg-card">
            <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
              <FileTextOutlined className="text-2xl text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">No complaints found</p>
            <p className="text-xs text-muted-foreground">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filtered.map((c, i) => {
              const st = STATUS_STYLES[c.status];
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setSelected(c)}
                  className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm cursor-pointer hover:border-blue-500/30 hover:shadow-blue-500/5 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${st.dot}`} />
                      <p className="font-semibold text-sm text-foreground min-w-0 flex-1 truncate">{c.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      Room {c.classroomNumber} · Block {c.block}
                      {c.category && ` · ${c.category.replace('_', ' ')}`}
                    </p>
                    {c.assignedTo && (
                      <p className="text-xs text-muted-foreground mt-0.5">Assigned to: {c.assignedTo.name}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:ml-auto sm:justify-end">
                    {Number(c.escalationCount ?? 0) > 0 && c.status !== 'RESOLVED' && (
                      <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-400/20 dark:text-red-800">
                        Handled by Super Admin
                      </span>
                    )}
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${st.bg} ${st.text}`}>{st.label}</span>
                    <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Slide-in Detail Panel */}
        <AnimatePresence>
          {selected && !statusModalOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 h-screen"
                onClick={() => setSelected(null)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="fixed right-0 top-0 h-full w-full max-w-md border-l border-border shadow-2xl z-50 overflow-y-auto bg-white"
              >
                <div className="sticky top-0 bg-card/90 backdrop-blur-sm border-b border-border px-6 py-4 flex items-center justify-between">
                  <h2 className="font-bold text-foreground text-base truncate pr-4">{selected.title}</h2>
                  <button
                    onClick={() => setSelected(null)}
                    className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                  >
                    <CloseOutlined style={{ fontSize: 14 }} />
                  </button>
                </div>
                <div className="p-6 space-y-5">
                  {/* Status + category pills */}
                  <div className="flex gap-2 flex-wrap">
                    {(() => { const st = STATUS_STYLES[selected.status]; return (
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${st.bg} ${st.text}`}>{st.label}</span>
                    );})()}
                    <span className="rounded-full px-3 py-1 text-xs font-semibold bg-muted text-muted-foreground">Room {selected.classroomNumber}</span>
                    <span className="rounded-full px-3 py-1 text-xs font-semibold bg-muted text-muted-foreground">Block {selected.block}</span>
                    {selected.category && (
                      <span className="rounded-full px-3 py-1 text-xs font-semibold bg-cyan-100 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-700">{selected.category.replace('_', ' ')}</span>
                    )}
                    {Number(selected.escalationCount ?? 0) > 0 && selected.status !== 'RESOLVED' && (
                      <span className="rounded-full px-3 py-1 text-[11px] font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-300/40 dark:text-indigo-900">
                        Escalated {selected.escalationCount}x
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Description</p>
                    <p className="text-sm text-foreground leading-relaxed">{selected.description}</p>
                  </div>

                  {/* Raised by */}
                  <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Raised By</p>
                    <p className="text-sm font-medium text-foreground">{selected.raisedBy.name}</p>
                    <p className="text-xs text-muted-foreground">{selected.raisedBy.email}</p>
                    {selected.raisedBy.studentProfile && (
                      <p className="text-xs text-muted-foreground">{selected.raisedBy.studentProfile.department} · {selected.raisedBy.studentProfile.branch}</p>
                    )}
                  </div>

                  {/* Assigned to */}
                  {selected.assignedTo && (
                    <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Assigned To</p>
                      <p className="text-sm font-medium text-foreground">{selected.assignedTo.name}</p>
                      <p className="text-xs text-muted-foreground">{selected.assignedTo.email}</p>
                      {selected.assignedTo.facultyProfile && (
                        <p className="text-xs text-muted-foreground">{selected.assignedTo.facultyProfile.department}</p>
                      )}
                    </div>
                  )}

                  {/* Resolution note */}
                  {selected.resolutionNote && (
                    <div className="rounded-xl border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-200/30 p-4">
                      <p className="text-xs font-semibold text-green-700 dark:text-green-800 uppercase tracking-wide mb-1">Resolution Note</p>
                      <p className="text-sm text-foreground">{selected.resolutionNote}</p>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">Created: {new Date(selected.createdAt).toLocaleDateString()}</p>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 flex-wrap">
                    {/* {Number(selected.escalationCount ?? 0) <= 0 && selected.status !== 'RESOLVED' && (
                      <button
                        onClick={() => openStatusModal(selected)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-[#041A47] via-[#00639B] to-[#009BB0] text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-md shadow-cyan-600/20"
                      >
                        <CheckCircleOutlined /> Change Status
                      </button>
                    )} */}
                    {!selected.handledBySuperAdmin && selected.status === 'RAISED' && !selected.assignedTo && (
                      <button
                        onClick={() => { setAssignModal(selected); setAssignedFaculty(null); setSelected(null); }}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-border bg-background text-sm font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
                      >
                        <UserSwitchOutlined /> Reassign to Faculty
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Assign Modal */}
        <Modal
          open={!!assignModal}
          onCancel={() => setAssignModal(null)}
          title="Assign Faculty"
          onOk={handleAssign}
          okText="Assign"
          confirmLoading={assigning}
          okButtonProps={{ className: 'rounded-lg' }}
        >
          <p className="mb-3">Assign a faculty member to: <strong>{assignModal?.title}</strong></p>
          <Select
            placeholder="Select Faculty"
            className="w-full"
            value={assignedFaculty}
            onChange={setAssignedFaculty}
            options={faculty.map((f) => ({ label: `${f.name} (${f.email})`, value: f.id }))}
          />
        </Modal>

        {/* Status Modal */}
        <Modal
          open={statusModalOpen}
          onCancel={() => { setStatusModalOpen(false); setNewStatus(null); setResolutionNote(''); }}
          title="Update Complaint Status"
          onOk={handleStatusUpdate}
          okText="Update Status"
          confirmLoading={updatingStatus}
          okButtonProps={{ className: 'rounded-lg' }}
          width={500}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">New Status <span className="text-red-500">*</span></label>
              <Select
                className="w-full"
                value={newStatus}
                onChange={setNewStatus}
                options={ALL_STATUSES.map((s) => ({ label: s.replace('_', ' '), value: s }))}
              />
            </div>
            {newStatus === 'RESOLVED' && (
              <div>
                <label className="block text-sm font-medium mb-2">Resolution Note <span className="text-red-500">*</span></label>
                <Input.TextArea
                  rows={4}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Describe how the complaint was resolved..."
                />
              </div>
            )}
          </div>
        </Modal>
      </div>
    </PageTransition>
  );
};

export default AdminComplaints;