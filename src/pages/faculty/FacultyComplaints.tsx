import { assignedComplaints, updateComplaintStatus } from '@/api/faculty';
import PageTransition from '@/components/animated/PageTransition';
import { PageHeader, PageShell } from "@/components/app/PageShell";
import { COMPLAINT_STATUS, badgeClass, dotClass } from "@/lib/statusStyles";
import ResolutionNoteBlock from '@/components/complaints/ResolutionNoteBlock';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Complaint } from '@/types';
import { ClockCircleOutlined, CloseOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { Alert, Input, Modal, Select, message } from 'antd';
import { AttachmentUploader } from '@/components/attachments/AttachmentUploader';
import { AttachmentList } from '@/components/attachments/AttachmentList';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLabels } from '@/i18n';


const formatDateTime = (date?: string) => {
  if (!date) return '-';
  const d = new Date(date);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

const getAssignedTime = (complaint: Complaint) => complaint.assignedAt ?? complaint.createdAt;

const getReassignmentMeta = (complaint: Complaint, facultyId?: string) => {
  const isCurrentlyAssignedToMe = complaint.assignedTo?.id === facultyId;
  const isHandledByAnother = Boolean(
    facultyId && complaint.assignedTo?.id && complaint.assignedTo.id !== facultyId,
  );

  return {
    isCurrentlyAssignedToMe,
    isHandledByAnother,
  };
};

const FacultyComplaints = () => {
  const { t } = useTranslation();
  const labels = useLabels();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const isApproved = user?.approvalStatus === 'APPROVED';
  const [assigned, setAssigned] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // CC-30: moving to PENDING_CONFIRMATION opens this instead of firing
  // immediately, because that transition is the moment staff CLAIM the work is
  // done - and it is the only moment at which "here is a photo of it working"
  // is worth anything to the student who has to agree.
  const [resolving, setResolving] = useState<Complaint | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [resolutionFiles, setResolutionFiles] = useState<string[]>([]);
  const [uploaderKey, setUploaderKey] = useState(0);

  const closeResolveModal = () => {
    setResolving(null);
    setResolutionNote('');
    setResolutionFiles([]);
    // Remounts the uploader so the previous complaint's files are not offered
    // for the next one.
    setUploaderKey((k) => k + 1);
  };

  /**
   * CC-30: PENDING_CONFIRMATION goes through the modal; everything else fires
   * straight through, as it always did.
   *
   * The optimistic `setSelectedComplaint` that used to run alongside the
   * IN_PROGRESS path is gone: it painted the new status before the request
   * had succeeded, so a rejected update left the panel showing a status the
   * server never accepted. `updateStatus` already refetches on success.
   */
  const requestStatusChange = (
    complaint: Complaint,
    newStatus: 'IN_PROGRESS' | 'PENDING_CONFIRMATION',
  ) => {
    if (newStatus === 'PENDING_CONFIRMATION') {
      setResolving(complaint);
      setResolutionNote(complaint.resolutionNote ?? '');
      return;
    }
    void updateStatus(complaint.id, newStatus);
  };

  const updateStatus = async (
    complaintId: string,
    newStatus: "IN_PROGRESS" | "PENDING_CONFIRMATION",
    note?: string,
    attachmentIds?: string[],
  ) => {
    if (!isApproved) {
      message.error('Your account is not approved');
      return;
    }

    const complaint = assigned.find((c) => c.id === complaintId);
    const isCurrentlyAssignedToMe = complaint?.assignedTo?.id === user?.id;

    if (!isCurrentlyAssignedToMe) {
      message.error('This complaint is currently handled by another faculty');
      return;
    }

    if (complaint?.status === 'RESOLVED') {
      message.error('Resolved complaints cannot be updated');
      return;
    }

    setUpdatingId(complaintId);
    try {
      await updateComplaintStatus(complaintId, newStatus, note, attachmentIds);

      // Refresh from server so status/timestamps stay consistent.
      const refreshed = await assignedComplaints();
      setAssigned(refreshed);

      // Keep side panel in sync if open.
      setSelectedComplaint((prev) => {
        if (!prev) return prev;
        return refreshed.find((c) => c.id === prev.id) ?? prev;
      });

      message.success(`Complaint status updated to ${COMPLAINT_STATUS[newStatus]?.label ?? newStatus}`);
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
      <PageShell>
        <PageHeader
          icon={<UnorderedListOutlined />}
          title={t('staff.title')}
          description={t('staff.subtitle')}
        />
        {!isApproved && (
          <Alert
            type="warning"
            icon={<ClockCircleOutlined />}
            showIcon
            message={t('common.pendingApprovalTitle')}
            description={t('staff.pendingDesc')}
            className="rounded-xl"
          />
        )}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-card rounded-2xl border shadow-sm overflow-hidden mt-4">
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
              <p className="text-sm font-semibold text-foreground mb-1">{t('staff.emptyTitle')}</p>
              <p className="text-xs text-muted-foreground">{t('staff.emptyDesc')}</p>
            </div>
          ) : (
            <div className={`grid grid-cols-1 gap-3 p-3 ${isMobile ? '' : 'md:p-4'}`}>
              {!isMobile && (
                <div className="grid grid-cols-[2fr_1.2fr_1fr_1.3fr_1.5fr_180px] gap-3 px-4 py-2 rounded-xl border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <p>{t('staff.colTitle')}</p>
                  <p>{t('staff.colRoom')}</p>
                  <p>{t('staff.colCategory')}</p>
                  <p>{t('staff.colStatus')}</p>
                  <p>{t('staff.colTimeline')}</p>
                  <p>{t('staff.colAction')}</p>
                </div>
              )}

              {assigned.map((complaint, i) => {
                const st = (COMPLAINT_STATUS[complaint.status] ?? COMPLAINT_STATUS.RESOLVED);
                const { isCurrentlyAssignedToMe, isHandledByAnother } = getReassignmentMeta(complaint, user?.id);

                if (isMobile) {
                  return (
                    <motion.div
                      key={complaint.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => setSelectedComplaint(complaint)}
                      className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm hover:border-brand-500/40 transition-all cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <span className={`mt-1.5 shrink-0 ${dotClass(st.tone)}`} />
                          <p className="font-semibold text-sm text-foreground min-w-0 flex-1 truncate">{complaint.title}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {t('common.roomBlock', { room: complaint.classroomNumber, block: complaint.block })}
                          {complaint.category && ` · ${labels.category(complaint.category)}`}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground">
                        <p>{t('staff.assigned', { date: formatDateTime(getAssignedTime(complaint)) })}</p>
                        {complaint.pendingConfirmationAt && (
                          <p>{t('staff.pendingConfirmation', { date: formatDateTime(complaint.pendingConfirmationAt) })}</p>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={badgeClass(st.tone)}>{labels.status(complaint.status, st.label)}</span>
                          {isHandledByAnother && (
                            <span className="inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold bg-amber-100 text-amber-800">
                              {t('staff.handledBy', { name: complaint.assignedTo?.name ?? t('staff.anotherFaculty') })}
                            </span>
                          )}
                        </div>
                        <div onClick={(e) => e.stopPropagation()}>
                          <Select
                            size="small"
                            disabled={!isApproved || updatingId === complaint.id || complaint.status === 'RESOLVED' || !isCurrentlyAssignedToMe}
                            loading={updatingId === complaint.id}
                            value={complaint.status}
                            className="w-full"
                            onChange={(v) => requestStatusChange(complaint, v as 'IN_PROGRESS' | 'PENDING_CONFIRMATION')}
                            options={(['IN_PROGRESS', 'PENDING_CONFIRMATION'] as const).map((s) => ({ label: labels.status(s, COMPLAINT_STATUS[s].label), value: s }))}
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
                    className="grid grid-cols-[2fr_1.2fr_1fr_1.3fr_1.5fr_180px] items-center gap-3 rounded-2xl border bg-card px-4 py-3 shadow-sm hover:border-brand-500/40 transition-all cursor-pointer"
                  >
                    <div className="min-w-0 flex items-center gap-2">
                      <span className={`shrink-0 ${dotClass(st.tone)}`} />
                      <p className="font-semibold text-sm text-foreground truncate">{complaint.title}</p>
                    </div>

                    <p className="text-sm text-foreground truncate">{t('staff.roomBlock', { room: complaint.classroomNumber, block: complaint.block })}</p>
                    <p className="text-sm text-foreground truncate">{labels.category(complaint.category)}</p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={badgeClass(st.tone)}>{labels.status(complaint.status, st.label)}</span>
                      {isHandledByAnother && (
                        <span className="inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold bg-amber-100 text-amber-800">
                          {t('staff.handledBy', { name: complaint.assignedTo?.name ?? t('staff.anotherFaculty') })}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground leading-5">
                      <p>{t('staff.assigned', { date: formatDateTime(getAssignedTime(complaint)) })}</p>
                    </div>

                    <div onClick={(e) => e.stopPropagation()}>
                      <Select
                        size="small"
                        disabled={!isApproved || updatingId === complaint.id || complaint.status === 'RESOLVED' || !isCurrentlyAssignedToMe}
                        loading={updatingId === complaint.id}
                        value={complaint.status}
                        className="w-full"
                        onChange={(v) => requestStatusChange(complaint, v as 'IN_PROGRESS' | 'PENDING_CONFIRMATION')}
                        options={(['IN_PROGRESS', 'PENDING_CONFIRMATION'] as const).map((s) => ({ label: labels.status(s, COMPLAINT_STATUS[s].label), value: s }))}
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
                className="fixed right-0 top-0 h-full w-full max-w-md border-l border-border shadow-2xl z-50 overflow-y-auto bg-card"
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
                      const st = (COMPLAINT_STATUS[selectedComplaint.status] ?? COMPLAINT_STATUS.RESOLVED);
                      const { isHandledByAnother } = getReassignmentMeta(selectedComplaint, user?.id);
                      return (
                        <>
                          <span className={badgeClass(st.tone)}>{labels.status(selectedComplaint.status, st.label)}</span>
                          {isHandledByAnother && (
                            <span className="rounded-full px-3 py-1 text-xs font-semibold bg-amber-100 text-amber-800">
                              {t('staff.handledBy', { name: selectedComplaint.assignedTo?.name ?? t('staff.anotherFaculty') })}
                            </span>
                          )}
                        </>
                      );
                    })()}
                    <span className="rounded-full px-3 py-1 text-xs font-semibold bg-muted text-muted-foreground">{t('common.room')} {selectedComplaint.classroomNumber}</span>
                    <span className="rounded-full px-3 py-1 text-xs font-semibold bg-muted text-muted-foreground">{t('common.blockName', { block: selectedComplaint.block })}</span>
                    <span className="rounded-full px-3 py-1 text-xs font-semibold bg-cyan-100 text-primary dark:bg-cyan-900/20 dark:text-primary">
                      {labels.category(selectedComplaint.category)}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">{t('common.description')}</p>
                    <p className="text-sm text-foreground leading-relaxed">{selectedComplaint.description}</p>
                  </div>

                  <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('staff.raisedBy')}</p>
                    <p className="text-sm font-medium text-foreground">{selectedComplaint.raisedBy?.name ?? t('staff.unknownUser')}</p>
                    <p className="text-xs text-muted-foreground">{selectedComplaint.raisedBy?.email ?? '-'}</p>
                  </div>

                  <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('staff.timeline')}</p>
                    <p className="text-xs text-muted-foreground">{t('staff.created', { date: formatDateTime(selectedComplaint.createdAt) })}</p>
                    <p className="text-xs text-muted-foreground">{t('staff.assigned', { date: formatDateTime(getAssignedTime(selectedComplaint)) })}</p>
                    {selectedComplaint.pendingConfirmationAt && (
                      <p className="text-xs text-muted-foreground">{t('staff.pendingConfirmation', { date: formatDateTime(selectedComplaint.pendingConfirmationAt) })}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{t('staff.lastUpdated', { date: formatDateTime(selectedComplaint.updatedAt) })}</p>
                  </div>

                  {/* CC-30: the photograph is why this feature exists. Before
                      it, a faculty member assigned "the third-row chair in ML02
                      is broken" had the text and nothing else. */}
                  <AttachmentList
                    attachments={selectedComplaint.attachments}
                    label={t('staff.studentPhotos')}
                  />

                  {selectedComplaint.resolutionNote && (
                    <ResolutionNoteBlock note={selectedComplaint.resolutionNote} title={t('staff.resolutionNote')} variant="success" />
                  )}

                  <AttachmentList
                    attachments={selectedComplaint.resolutionAttachments}
                    label={t('staff.resolutionPhotos')}
                  />

                  <div className="pt-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{t('staff.updateStatus')}</p>
                    <Select
                      size="middle"
                      disabled={
                        !isApproved ||
                        updatingId === selectedComplaint.id ||
                        selectedComplaint.status === 'RESOLVED' ||
                        selectedComplaint.assignedTo?.id !== user?.id
                      }
                      loading={updatingId === selectedComplaint.id}
                      value={selectedComplaint.status}
                      className="w-full"
                      onChange={(v) => {
                        requestStatusChange(selectedComplaint, v as 'IN_PROGRESS' | 'PENDING_CONFIRMATION');
                      }}
                      options={(['IN_PROGRESS', 'PENDING_CONFIRMATION'] as const).map((s) => ({ label: labels.status(s, COMPLAINT_STATUS[s].label), value: s }))}
                    />
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
        {/* CC-30: resolution evidence. */}
        <Modal
          open={resolving !== null}
          title={t('staff.modalTitle')}
          onCancel={closeResolveModal}
          confirmLoading={updatingId === resolving?.id}
          onOk={() => {
            if (!resolving) return;
            void updateStatus(
              resolving.id,
              'PENDING_CONFIRMATION',
              resolutionNote.trim() || undefined,
              resolutionFiles,
            ).then(closeResolveModal);
          }}
          okText={t('staff.modalOk')}
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('staff.modalIntro')}
            </p>

            <AttachmentList
              attachments={resolving?.attachments}
              label={t('staff.studentReported')}
            />

            <div>
              <label className="text-sm font-medium mb-1 block">
                {t('staff.noteLabel')}
              </label>
              <Input.TextArea
                rows={3}
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder={t('staff.notePlaceholder')}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                {t('staff.repairPhoto')}
              </label>
              {/* Optional on purpose. Requiring it would mean a genuinely
                  fixed fault could not be closed because the corridor was too
                  dark to photograph - and staff would learn to upload a blank
                  frame to get past the validation. */}
              <AttachmentUploader
                key={uploaderKey}
                entityType="COMPLAINT_RESOLUTION"
                onChange={setResolutionFiles}
                disabled={updatingId === resolving?.id}
              />
            </div>
          </div>
        </Modal>
      </PageShell>
    </PageTransition>
  );
};

export default FacultyComplaints;