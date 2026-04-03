import { getEscalatedComplaints, reassignEscalatedComplaint, getApprovedFaculty } from '@/api/admin';
import PageTransition from '@/components/animated/PageTransition';
import { Skeleton } from '@/components/ui/skeleton';
import type { Complaint, ComplaintStatus, User } from '@/types';
import {
  CloseOutlined,
  FileTextOutlined,
  SearchOutlined,
  UserSwitchOutlined,
  ExclamationCircleOutlined,
  AlertOutlined,
} from '@ant-design/icons';
import { Input, Modal, Select, message } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const STATUS_STYLES: Record<ComplaintStatus, { dot: string; bg: string; text: string; label: string }> = {
  RAISED:      { dot: 'bg-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/20', text: 'text-orange-800 dark:text-orange-800', label: 'Raised' },
  ASSIGNED:    { dot: 'bg-cyan-500',   bg: 'bg-cyan-100 dark:bg-cyan-900/20',     text: 'text-cyan-800 dark:text-cyan-800',     label: 'Assigned' },
  IN_PROGRESS: { dot: 'bg-cyan-500',   bg: 'bg-cyan-100 dark:bg-cyan-900/20',     text: 'text-cyan-800 dark:text-cyan-800',     label: 'In Progress' },
  PENDING_CONFIRMATION:      { dot: 'bg-slate-500',  bg: 'bg-slate-200 dark:bg-slate-400/60',     text: 'text-slate-800 dark:text-slate-800',  label: 'Pending Confirmation' },
  ESCALATED_TO_SUPERADMIN:   { dot: 'bg-purple-600', bg: 'bg-purple-200 dark:bg-purple-400/30',   text: 'text-purple-800 dark:text-purple-800', label: 'Escalated to SuperAdmin' },
  RESOLVED:    { dot: 'bg-green-500',  bg: 'bg-green-100 dark:bg-green-400/20',   text: 'text-green-800 dark:text-green-800',   label: 'Resolved' },
};

const SuperAdminComplaints = () => {
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [reassignModal, setReassignModal] = useState<Complaint | null>(null);
  const [search, setSearch] = useState('');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [faculty, setFaculty] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [reassigning, setReassigning] = useState(false);
  const [assignedFaculty, setAssignedFaculty] = useState<string | null>(null);
  const [superAdminNote, setSuperAdminNote] = useState('');

  useEffect(() => {
    fetchComplaints();
    fetchFaculty();
  }, []);


  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const data = await getEscalatedComplaints();

      // Show every complaint that has been escalated at least once.
      const escalatedOnly = (data || []).filter((complaint: Complaint) =>
        (complaint.escalationCount ?? 0) > 0 && complaint.status !== 'RESOLVED'
      );

      // Sort by escalation count (highest first) and then by created date
      escalatedOnly.sort((a, b) => {
        const countDiff = (b.escalationCount ?? 0) - (a.escalationCount ?? 0);
        if (countDiff !== 0) return countDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      setComplaints(escalatedOnly);
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : 'Failed to fetch escalated complaints';
      console.error('Error fetching escalated complaints:', errorMsg);
      message.error(errorMsg);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculty = async () => {
    try {
      const data = await getApprovedFaculty();
      setFaculty(data || []);
    } catch (e: unknown) {
      console.error("Error fetching faculty:", e);
      const errorMsg = e instanceof Error ? e.message : 'Failed to fetch faculty';
      message.error(errorMsg);
      setFaculty([]);
    }
  };

  const handleReassign = async () => {
    if (!assignedFaculty) {
      message.error('Please select a faculty member');
      return;
    }
    if (!reassignModal) return;

    try {
      setReassigning(true);
      await reassignEscalatedComplaint(reassignModal.id, assignedFaculty, superAdminNote || undefined);
      message.success('Complaint reassigned successfully!');
      setReassignModal(null);
      setAssignedFaculty(null);
      setSuperAdminNote('');
      setSelected(null);
      await fetchComplaints();
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : 'Failed to reassign complaint';
      message.error(errorMsg);
    } finally {
      setReassigning(false);
    }
  };

  // Filter by search
  const filtered = complaints.filter((c) => {
    const matchSearch = !search || 
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase()) ||
      c.studentRejectionMessage?.toLowerCase().includes(search.toLowerCase());
    
    return matchSearch;
  });

  const reassignmentFacultyOptions = faculty
    .filter((f) => f.approvalStatus === 'APPROVED')
    .filter((f) => f.id !== reassignModal?.assignedTo?.id)
    .map((f) => ({ label: `${f.name} (${f.email})`, value: f.id }));

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-linear-to-br from-purple-900 via-indigo-950 to-blue-950 p-7 text-white shadow-xl"
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[32px_32px]" />
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-purple-500/10" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center shrink-0">
              <ExclamationCircleOutlined className="text-purple-300 text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Escalated Complaints Management</h1>
              <p className="text-purple-200/70 text-xs mt-0.5">{complaints.length} escalated complaint(s) requiring SuperAdmin attention</p>
            </div>
          </div>
        </motion.div>

        {/* Info banner for SuperAdmin */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl p-4 flex items-start gap-3"
        >
          <AlertOutlined className="text-purple-600 dark:text-purple-400 text-lg mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-purple-900 dark:text-purple-800 text-sm mb-1">SuperAdmin Review Required</h3>
            <p className="text-xs text-purple-700 dark:text-purple-700 leading-relaxed">
              These complaints have been rejected by students and require your intervention. Review the rejection reasons, reassign to appropriate faculty members, and provide guidance for resolution.
            </p>
          </div>
        </motion.div>

        {/* Search */}
        <div className="relative w-full sm:max-w-sm">
          <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or reason..."
            className="w-full rounded-xl border-2 bg-card pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
          />
        </div>

        {/* List */}
        {loading ? (
          <div className="grid grid-cols-1 gap-3">
            {Array.from({ length: 3 }).map((_, idx) => (
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
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border-2 border-dashed bg-card">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-3">
              <FileTextOutlined className="text-4xl text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">No escalated complaints</p>
            <p className="text-xs text-muted-foreground">All escalated complaints have been resolved</p>
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
                  className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm cursor-pointer hover:border-purple-500/30 hover:shadow-purple-500/5 transition-all"
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
                    {c.escalationCount ? (
                      <p className="text-xs text-red-600 dark:text-red-400 font-medium mt-1">
                        ⚠️ Rejected {c.escalationCount} time(s)
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:ml-auto sm:justify-end">
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
          {selected && !reassignModal ? (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 h-full"
                onClick={() => setSelected(null)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="fixed right-0 top-0 h-full w-full max-w-md border-l border-border shadow-2xl z-50 overflow-y-auto bg-background"
              >
                <div className="sticky top-0 border-b border-border px-6 py-4 flex items-center justify-between z-10 bg-white">
                  <h2 className="font-bold text-foreground text-base truncate pr-4">{selected.title}</h2>
                  <button
                    onClick={() => setSelected(null)}
                    className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                  >
                    <CloseOutlined style={{ fontSize: 14 }} />
                  </button>
                </div>
                <div className="p-6 space-y-5 bg-white">
                  {/* Status + category pills */}
                  <div className="flex gap-2 flex-wrap">
                    {(() => {
                      const st = STATUS_STYLES[selected.status];
                      return (
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${st.bg} ${st.text}`}>{st.label}</span>
                      );
                    })()}
                    <span className="rounded-full px-3 py-1 text-xs font-semibold bg-muted text-muted-foreground">Room {selected.classroomNumber}</span>
                    <span className="rounded-full px-3 py-1 text-xs font-semibold bg-muted text-muted-foreground">Block {selected.block}</span>
                    {selected.category && (
                      <span className="rounded-full px-3 py-1 text-xs font-semibold bg-cyan-100 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-700">{selected.category.replace('_', ' ')}</span>
                    )}
                    {selected.escalationCount ? (
                      <span className="rounded-full px-3 py-1 text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-700">
                        Escalation #{selected.escalationCount}
                      </span>
                    ) : null}
                  </div>

                  {/* Description */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Description</p>
                    <p className="text-sm text-foreground leading-relaxed">{selected.description}</p>
                  </div>

                  {/* Rejection Reason */}
                  {/* {selected.studentRejectionMessage && (
                    <div className="rounded-xl border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-300/20 p-4">
                      <p className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wide mb-2">Student Rejection Reason</p>
                      <p className="text-sm text-foreground">{selected.studentRejectionMessage}</p>
                    </div>
                  )} */}

                  {/* Raised by */}
                  <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Raised By</p>
                    <p className="text-sm font-medium text-foreground">{selected.raisedBy?.name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">{selected.raisedBy?.email || 'N/A'}</p>
                    {selected.raisedBy?.studentProfile && (
                      <p className="text-xs text-muted-foreground">{selected.raisedBy.studentProfile.department} · {selected.raisedBy.studentProfile.branch}</p>
                    )}
                  </div>

                  {/* Current Faculty Assignment */}
                  {selected.assignedTo && (
                    <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Current Assignment</p>
                      <p className="text-sm font-medium text-foreground">{selected.assignedTo.name}</p>
                      <p className="text-xs text-muted-foreground">{selected.assignedTo.email}</p>
                      {selected.assignedTo.facultyProfile && (
                        <p className="text-xs text-muted-foreground">{selected.assignedTo.facultyProfile.department}</p>
                      )}
                    </div>
                  )}

                  {/* Resolution note from previous attempt */}
                  {selected.resolutionNote && (
                    <div className="rounded-xl border border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-300/20 p-4">
                      <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-800 uppercase tracking-wide mb-1">Previous Resolution Attempt</p>
                      <p className="text-sm text-foreground">{selected.resolutionNote}</p>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">Created: {new Date(selected.createdAt).toLocaleDateString()}</p>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 flex-wrap">
                    {selected.escalationCount && selected.escalationCount > 0 && (selected.status === 'RAISED' || selected.status === 'ASSIGNED') ? (
                      <button
                        onClick={() => {
                          setReassignModal(selected);
                          setAssignedFaculty(null);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-purple-600 via-indigo-600 to-blue-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-md shadow-purple-600/20"
                      >
                        <UserSwitchOutlined /> Reassign to Faculty
                      </button>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>

        {/* Reassign Modal */}
        <Modal
          open={!!reassignModal}
          onCancel={() => {
            setReassignModal(null);
            setAssignedFaculty(null);
            setSuperAdminNote('');
          }}
          title="Reassign Escalated Complaint"
          onOk={handleReassign}
          okText="Reassign"
          cancelText="Cancel"
          confirmLoading={reassigning}
          okButtonProps={{ className: 'rounded-lg' }}
          cancelButtonProps={{ className: 'rounded-lg' }}
          width={550}
        >
          <div className="space-y-4">
            <p className="mb-3">Reassign escalated complaint: <strong>{reassignModal?.title}</strong></p>
            
            <div>
              <label className="block text-sm font-medium mb-2">Select Faculty Member <span className="text-red-500">*</span></label>
              <Select
                placeholder="Select Faculty"
                className="w-full"
                value={assignedFaculty}
                onChange={(value) => setAssignedFaculty(value)}
                options={reassignmentFacultyOptions}
              />
              {reassignModal?.assignedTo?.id && reassignmentFacultyOptions.length === 0 ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  No other approved faculty available for reassignment.
                </p>
              ) : null}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">SuperAdmin Notes (Optional)</label>
              <Input.TextArea
                rows={4}
                value={superAdminNote}
                onChange={(e) => setSuperAdminNote(e.target.value)}
                placeholder="Provide guidance/context for this reassignment. This will help the faculty member understand why the previous resolution was rejected."
              />
            </div>

            {/* {reassignModal?.studentRejectionMessage && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
                <p className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase mb-2">Student's Rejection Reason</p>
                <p className="text-sm text-foreground">{reassignModal.studentRejectionMessage}</p>
              </div>
            )} */}
          </div>
        </Modal>
      </div>
    </PageTransition>
  );
};

export default SuperAdminComplaints;
