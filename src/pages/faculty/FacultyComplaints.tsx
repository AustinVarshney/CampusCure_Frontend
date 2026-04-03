import { assignedComplaints, updateComplaintStatus } from '@/api/faculty';
import PageTransition from '@/components/animated/PageTransition';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Complaint, ComplaintStatus } from '@/types';
import { ClockCircleOutlined, CloseOutlined } from '@ant-design/icons';
import { Alert, Select, message } from 'antd';
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

const formatDateTime = (date?: string) => {
  if (!date) return '-';
  const d = new Date(date);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

const getAssignedTime = (complaint: Complaint) => complaint.assignedAt ?? complaint.createdAt;

const FacultyComplaints = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const isApproved = user?.approvalStatus === 'APPROVED';
  const [assigned, setAssigned] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const updateStatus = async (complaintId: string, newStatus: "IN_PROGRESS" | "PENDING_CONFIRMATION") => {
    if (!isApproved) {
      message.error('Your account is not approved');
      return;
    }

    const complaint = assigned.find((c) => c.id === complaintId);
    if (complaint?.status === 'RESOLVED') {
      message.error('Resolved complaints cannot be updated');
      return;
    }

    setUpdatingId(complaintId);
    try {
      await updateComplaintStatus(complaintId, newStatus);

      // Refresh from server so status/timestamps stay consistent.
      const refreshed = await assignedComplaints();
      setAssigned(refreshed);

      // Keep side panel in sync if open.
      setSelectedComplaint((prev) => {
        if (!prev) return prev;
        return refreshed.find((c) => c.id === prev.id) ?? prev;
      });

      message.success(`Complaint status updated to ${newStatus.replace('_', ' ')}`);
    } catch (error) {
      console.error('Error updating status:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to update status';
      if (errorMsg.toLowerCase().includes('assigned to another faculty')) {
        const refreshed = await assignedComplaints();
        setAssigned(refreshed);
        setSelectedComplaint(null);
      }
      message.error(errorMsg);
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {

    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const result = await assignedComplaints();
      setAssigned(result);
      } catch (e: unknown) {
        console.error("Error fetching assigned complaints:", e);
        message.error(e instanceof Error ? e.message : 'Failed to fetch assigned complaints');
      } finally {
        setLoading(false);
      }
    } 
    fetchComplaints();
  }, []);

  return (
    <PageTransition>
      <div className="dashboard-surface space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assigned Complaints</h1>
          <p className="text-muted-foreground">Manage complaints assigned to you.</p>
        </div>
        {!isApproved && (
          <Alert
            type="warning"
            icon={<ClockCircleOutlined />}
            showIcon
            message="Account Pending Approval"
            description="You can view assigned complaints, but updating status is disabled until your account is approved."
            className="rounded-xl"
          />
        )}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-card rounded-2xl border  shadow-sm overflow-hidden mt-4">
          {loading ? (
            <div className="grid grid-cols-1 gap-3 p-3">
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
          ) : assigned.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border-2 bg-card m-3">
              <p className="text-sm font-semibold text-foreground mb-1">No assigned complaints found</p>
              <p className="text-xs text-muted-foreground">Assigned complaints will appear here</p>
            </div>
          ) : (
            <div className={`grid grid-cols-1 gap-3 p-3 ${isMobile ? '' : 'md:p-4'}`}>
              {!isMobile && (
                <div className="grid grid-cols-[2fr_1.2fr_1fr_1.3fr_1.5fr_180px] gap-3 px-4 py-2 rounded-xl border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <p>Title</p>
                  <p>Room</p>
                  <p>Category</p>
                  <p>Status</p>
                  <p>Timeline</p>
                  <p>Action</p>
                </div>
              )}

              {assigned.map((complaint, i) => {
                const st = STATUS_STYLES[complaint.status];

                if (isMobile) {
                  return (
                    <motion.div
                      key={complaint.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => setSelectedComplaint(complaint)}
                      className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm hover:border-blue-500/30 hover:shadow-blue-500/5 transition-all cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${st.dot}`} />
                          <p className="font-semibold text-sm text-foreground min-w-0 flex-1 truncate">{complaint.title}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          Room {complaint.classroomNumber} · Block {complaint.block}
                          {complaint.category && ` · ${complaint.category.replace('_', ' ')}`}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground">
                        <p><span className="font-medium">Assigned:</span> {formatDateTime(getAssignedTime(complaint))}</p>
                        <p><span className="font-medium">Pending Confirmation:</span> {formatDateTime(complaint.pendingConfirmationAt)}</p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <span className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ${st.bg} ${st.text}`}>{st.label}</span>
                        <div onClick={(e) => e.stopPropagation()}>
                          <Select
                            size="small"
                            disabled={!isApproved || updatingId === complaint.id || complaint.status === 'RESOLVED'}
                            loading={updatingId === complaint.id}
                            value={complaint.status}
                            className="w-full"
                            onChange={(v) => updateStatus(complaint.id, v as 'IN_PROGRESS' | 'PENDING_CONFIRMATION')}
                            options={(['IN_PROGRESS', 'PENDING_CONFIRMATION'] as const).map((s) => ({ label: s.replace('_', ' '), value: s }))}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    key={complaint.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setSelectedComplaint(complaint)}
                    className="grid grid-cols-[2fr_1.2fr_1fr_1.3fr_1.5fr_180px] items-center gap-3 rounded-2xl border bg-card px-4 py-3 shadow-sm hover:border-blue-500/30 hover:shadow-blue-500/5 transition-all cursor-pointer"
                  >
                    <div className="min-w-0 flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full shrink-0 ${st.dot}`} />
                      <p className="font-semibold text-sm text-foreground truncate">{complaint.title}</p>
                    </div>

                    <p className="text-sm text-foreground truncate">{complaint.classroomNumber} (Block {complaint.block})</p>
                    <p className="text-sm text-foreground truncate">{(complaint.category ?? 'GENERAL').replace('_', ' ')}</p>
                    <span className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ${st.bg} ${st.text}`}>{st.label}</span>
                    <div className="text-xs text-muted-foreground leading-5">
                      <p>Assigned: {formatDateTime(getAssignedTime(complaint))}</p>
                      <p>Pending: {formatDateTime(complaint.pendingConfirmationAt)}</p>
                    </div>

                    <div onClick={(e) => e.stopPropagation()}>
                      <Select
                        size="small"
                        disabled={!isApproved || updatingId === complaint.id || complaint.status === 'RESOLVED'}
                        loading={updatingId === complaint.id}
                        value={complaint.status}
                        className="w-full"
                        onChange={(v) => updateStatus(complaint.id, v as 'IN_PROGRESS' | 'PENDING_CONFIRMATION')}
                        options={(['IN_PROGRESS', 'PENDING_CONFIRMATION'] as const).map((s) => ({ label: s.replace('_', ' '), value: s }))}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        <AnimatePresence>
          {selectedComplaint && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 h-screen"
                onClick={() => setSelectedComplaint(null)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="fixed right-0 top-0 h-full w-full max-w-md border-l border-border shadow-2xl z-50 overflow-y-auto bg-white"
              >
                <div className="sticky top-0 bg-card/90 backdrop-blur-sm border-b border-border px-6 py-4 flex items-center justify-between">
                  <h2 className="font-bold text-foreground text-base truncate pr-4">{selectedComplaint.title}</h2>
                  <button
                    onClick={() => setSelectedComplaint(null)}
                    className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                  >
                    <CloseOutlined style={{ fontSize: 14 }} />
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  <div className="flex gap-2 flex-wrap">
                    {(() => {
                      const st = STATUS_STYLES[selectedComplaint.status];
                      return (
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${st.bg} ${st.text}`}>{st.label}</span>
                      );
                    })()}
                    <span className="rounded-full px-3 py-1 text-xs font-semibold bg-muted text-muted-foreground">Room {selectedComplaint.classroomNumber}</span>
                    <span className="rounded-full px-3 py-1 text-xs font-semibold bg-muted text-muted-foreground">Block {selectedComplaint.block}</span>
                    <span className="rounded-full px-3 py-1 text-xs font-semibold bg-cyan-100 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-700">
                      {(selectedComplaint.category ?? 'GENERAL').replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Description</p>
                    <p className="text-sm text-foreground leading-relaxed">{selectedComplaint.description}</p>
                  </div>

                  <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Raised By</p>
                    <p className="text-sm font-medium text-foreground">{selectedComplaint.raisedBy?.name ?? 'Unknown User'}</p>
                    <p className="text-xs text-muted-foreground">{selectedComplaint.raisedBy?.email ?? '-'}</p>
                  </div>

                  <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Timeline</p>
                    <p className="text-xs text-muted-foreground">Created: {formatDateTime(selectedComplaint.createdAt)}</p>
                    <p className="text-xs text-muted-foreground">Assigned: {formatDateTime(getAssignedTime(selectedComplaint))}</p>
                    <p className="text-xs text-muted-foreground">Pending Confirmation: {formatDateTime(selectedComplaint.pendingConfirmationAt)}</p>
                    <p className="text-xs text-muted-foreground">Last Updated: {formatDateTime(selectedComplaint.updatedAt)}</p>
                  </div>

                  {selectedComplaint.resolutionNote && (
                    <div className="rounded-xl border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-200/30 p-4">
                      <p className="text-xs font-semibold text-green-700 dark:text-green-800 uppercase tracking-wide mb-1">Resolution Note</p>
                      <p className="text-sm text-foreground">{selectedComplaint.resolutionNote}</p>
                    </div>
                  )}

                  <div className="pt-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Update Status</p>
                    <Select
                      size="middle"
                      disabled={!isApproved || updatingId === selectedComplaint.id || selectedComplaint.status === 'RESOLVED'}
                      loading={updatingId === selectedComplaint.id}
                      value={selectedComplaint.status}
                      className="w-full"
                      onChange={(v) => {
                        void updateStatus(selectedComplaint.id, v as 'IN_PROGRESS' | 'PENDING_CONFIRMATION');
                        setSelectedComplaint((prev) => (prev ? { ...prev, status: v as ComplaintStatus } : prev));
                      }}
                      options={(['IN_PROGRESS', 'PENDING_CONFIRMATION'] as const).map((s) => ({ label: s.replace('_', ' '), value: s }))}
                    />
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

export default FacultyComplaints;