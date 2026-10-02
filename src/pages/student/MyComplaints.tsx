import { api } from '@/api/auth';
import { getMyComplaints, submitComplaintFeedback } from '@/api/student';
import PageTransition from '@/components/animated/PageTransition';
import ResolutionNoteBlock from '@/components/complaints/ResolutionNoteBlock';
import { Badge, Dot, EmptyState, ListRow, PageHeader, PageShell, StatCard, StatGrid } from '@/components/app/PageShell';
import { Skeleton } from '@/components/ui/skeleton';
import { COMPLAINT_STATUS, priorityMeta } from '@/lib/statusStyles';
import { Complaint, ComplaintStatus } from '@/types';
import { CloseOutlined, FileTextOutlined, SearchOutlined } from '@ant-design/icons';
import { Select } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { AttachmentList } from '@/components/attachments/AttachmentList';



const MyComplaints = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [feedbackRatingInput, setFeedbackRatingInput] = useState<number>(0);
  const [feedbackCommentInput, setFeedbackCommentInput] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  const filtered = complaints.filter((c) => {
    const matchStatus = !statusFilter || c.status === statusFilter;
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const data = await getMyComplaints();
        setComplaints(data);
      } catch (error) {
        console.error('Error fetching complaints:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  useEffect(() => {
    setFeedbackRatingInput(0);
    setFeedbackCommentInput('');
  }, [selected?.id]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const handleConfirmResolution = async () => {
    if (!selected) return;
    try {
      setConfirmLoading(true);
      await api.post(`/students/complaints/${selected.id}/confirm-resolution`);

      // Update the complaint status in the list
      setComplaints(complaints.map(c => c.id === selected.id ? { ...c, status: 'RESOLVED', studentConfirmed: true } : c));
      setSelected({ ...selected, status: 'RESOLVED', studentConfirmed: true });

      // Show success notification
      setTimeout(() => setSelected(null), 1500);
    } catch (error) {
      console.error('Error confirming resolution:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to confirm resolution';
      alert(errorMsg);
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleRejectResolution = async () => {
    if (!selected) return;
    try {
      setConfirmLoading(true);
      await api.post(`/students/complaints/${selected.id}/reject-resolution`, { rejectionReason });

      const nextStatus: ComplaintStatus = selected.assignedTo ? 'ASSIGNED' : 'RAISED';

      // Update the complaint status in the list
      setComplaints(complaints.map(c => c.id === selected.id ? {
        ...c,
        status: nextStatus,
        escalationCount: (c.escalationCount ?? 0) + 1,
      } : c));
      setSelected({
        ...selected,
        status: nextStatus,
        escalationCount: (selected.escalationCount ?? 0) + 1,
      });
      setRejectionReason('');
      setShowRejectionInput(false);

      // Show success notification
      setTimeout(() => setSelected(null), 1500);
    } catch (error) {
      console.error('Error rejecting resolution:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to reject resolution';
      alert(errorMsg);
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!selected) return;

    if (selected.status !== 'RESOLVED') {
      alert('Feedback can only be submitted after complaint is resolved');
      return;
    }

    if (feedbackRatingInput < 1 || feedbackRatingInput > 5) {
      alert('Please select a rating between 1 and 5');
      return;
    }

    try {
      setFeedbackSubmitting(true);
      const normalizedComment = feedbackCommentInput.trim();
      await submitComplaintFeedback(
        selected.id,
        feedbackRatingInput,
        normalizedComment || undefined,
      );

      setComplaints((prev) =>
        prev.map((c) =>
          c.id === selected.id
            ? {
                ...c,
                feedbackRating: feedbackRatingInput,
                feedbackComment: normalizedComment || undefined,
              }
            : c,
        ),
      );
      setSelected((prev) =>
        prev
          ? {
              ...prev,
              feedbackRating: feedbackRatingInput,
              feedbackComment: normalizedComment || undefined,
            }
          : prev,
      );
      setFeedbackRatingInput(0);
      setFeedbackCommentInput('');
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Failed to submit feedback';
      alert(errorMsg);
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <PageShell>
        <PageHeader
          icon={<FileTextOutlined />}
          title="My Complaints"
          description="Track the status of every issue you have reported"
          actions={
            <span className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">
                {complaints.length} total
              </span>
              <span className="h-4 w-px bg-border" />
              <span className="font-semibold text-success">
                {complaints.filter((c) => c.status === 'RESOLVED').length} resolved
              </span>
            </span>
          }
        />

        {/* Doubles as the status filter — tapping a tile scopes the list. */}
        <StatGrid cols={5}>
          {(['RAISED', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_CONFIRMATION', 'RESOLVED'] as ComplaintStatus[]).map((st, i) => {
            const meta = COMPLAINT_STATUS[st];
            return (
              <StatCard
                key={st}
                index={i}
                tone={meta.tone}
                icon={<span className="cc-badge__dot" />}
                value={complaints.filter((c) => c.status === st).length}
                label={meta.label}
                active={statusFilter === st}
                onClick={() => setStatusFilter(statusFilter === st ? null : st)}
              />
            );
          })}
        </StatGrid>

        {/* Search + filter */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative w-full sm:w-auto">
            <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm z-10 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-4 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-brand-500 focus:outline-none focus:ring-3 focus:ring-brand-500/16 sm:w-64"
            />
          </div>
          <Select
            placeholder="All statuses"
            value={statusFilter}
            className="w-full sm:min-w-37.5 sm:w-auto"
            allowClear
            onChange={(v) => setStatusFilter(v || null)}
            options={(['RAISED', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_CONFIRMATION', 'RESOLVED'] as ComplaintStatus[]).map((s) => ({
              label: COMPLAINT_STATUS[s].label, value: s,
            }))}
          />
        </div>

        {/* Card list */}
        {loading ? (
          <div className="space-y-2.5">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="rounded-2xl border bg-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<FileTextOutlined />}
            title="No complaints found"
            description="Try adjusting your search or clearing the status filter."
          />
        ) : (
          <div className="space-y-2.5">
            {filtered.map((c, i) => {
              const meta = COMPLAINT_STATUS[c.status] ?? COMPLAINT_STATUS.RESOLVED;
              const pri = c.priority ? priorityMeta(c.priority) : null;
              return (
                <ListRow key={c.id} index={i} onClick={() => setSelected(c)}>
                  <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div className="flex min-w-0 items-center gap-3.5">
                      <Dot tone={meta.tone} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{c.title}</p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          Room {c.classroomNumber} · Block {c.block}
                          {c.category ? ` · ${c.category.replace(/_/g, ' ')}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto">
                      {pri && (
                        <Badge tone={pri.tone} className="hidden sm:inline-flex">
                          {pri.label}
                        </Badge>
                      )}
                      {Number(c.escalationCount ?? 0) > 0 && (
                        <Badge tone="danger">Escalated {c.escalationCount}x</Badge>
                      )}
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                      <span className="hidden text-xs text-muted-foreground md:block">
                        {formatDate(c.createdAt)}
                      </span>
                    </div>
                  </div>
                </ListRow>
              );
            })}
          </div>
        )}

        {/* Slide-in detail panel */}
        <AnimatePresence>
          {selected && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 h-screen"
                onClick={() => setSelected(null)}
              />
              <motion.div
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 60 }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="fixed bg-card right-0 top-0 h-full w-full max-w-md border-l shadow-2xl z-50 overflow-y-auto"
              >
                <div className="p-6 flex flex-col gap-5 min-h-full bg-card">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-bold text-foreground leading-snug">{selected.title}</h2>
                    <button
                      onClick={() => setSelected(null)}
                      className="shrink-0 h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <CloseOutlined style={{ fontSize: 13 }} />
                    </button>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {(() => { const m = COMPLAINT_STATUS[selected.status] ?? COMPLAINT_STATUS.RESOLVED; return <Badge tone={m.tone} dot>{m.label}</Badge>; })()}
                    {selected.priority && (() => { const m = priorityMeta(selected.priority); return <Badge tone={m.tone}>{m.label}</Badge>; })()}
                    {selected.category && <span className="rounded-full px-3 py-1 text-xs font-semibold bg-muted text-muted-foreground">{selected.category.replace(/_/g, ' ')}</span>}
                  </div>

                  <div className="rounded-xl bg-muted/30 border p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    {[
                      { label: 'Room', value: selected.classroomNumber },
                      { label: 'Block', value: `Block ${selected.block}` },
                      { label: 'Submitted', value: formatDate(selected.createdAt) },
                      { label: 'Updated', value: formatDate(selected.updatedAt) },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                        <p className="font-semibold text-foreground">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Description</p>
                    <p className="text-sm text-foreground leading-relaxed">{selected.description}</p>
                  </div>

                  {/* CC-02: evidence the student attached when filing. */}
                  <AttachmentList
                    attachments={selected.attachments}
                    label={
                      selected.resolutionAttachments?.length
                        ? 'Before — what you reported'
                        : 'Photos & documents'
                    }
                  />

                  {selected.assignedTo && (
                    <div className="rounded-xl border p-4">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Assigned To</p>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full cc-fill-brand flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {selected.assignedTo.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{selected.assignedTo.name}</p>
                          {selected.assignedTo.facultyProfile && (
                            <p className="text-xs text-muted-foreground">{selected.assignedTo.facultyProfile.department}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {selected.resolutionNote && (
                    <ResolutionNoteBlock note={selected.resolutionNote} title="Resolution Note" variant="success" />
                  )}

                  {/* CC-30: the "after" half, placed immediately ABOVE the
                      confirm/reject buttons on purpose. This is the evidence
                      the decision rests on, and a photo below the buttons is a
                      photo half the students never scroll to. */}
                  <AttachmentList
                    attachments={selected.resolutionAttachments}
                    label="After — photos of the repair"
                  />

                  {selected.status === 'PENDING_CONFIRMATION' && (
                    <div className="rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-900 p-4 space-y-3">
                      <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                        Faculty has marked this as resolved. Please confirm if the issue is actually fixed.
                      </p>
                      
                      {!showRejectionInput ? (
                        <div className="flex gap-2">
                          <button
                            onClick={handleConfirmResolution}
                            disabled={confirmLoading}
                            className="flex-1 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {confirmLoading ? 'Confirming...' : '✓ Yes, Issue Fixed'}
                          </button>
                          <button
                            onClick={() => setShowRejectionInput(true)}
                            disabled={confirmLoading}
                            className="flex-1 px-4 py-2 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-medium text-sm hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            ✗ Not Fixed
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Tell us why the issue is not fixed (optional)..."
                            className="w-full p-2 rounded-lg border border-red-200 bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleRejectResolution}
                              disabled={confirmLoading}
                              className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {confirmLoading ? 'Submitting...' : 'Submit'}
                            </button>
                            <button
                              onClick={() => {
                                setShowRejectionInput(false);
                                setRejectionReason('');
                              }}
                              disabled={confirmLoading}
                              className="px-4 py-2 rounded-lg border border-muted bg-card hover:bg-muted text-foreground font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {selected.feedbackRating && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Your Rating</p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className={`text-xl ${star <= selected.feedbackRating! ? 'text-yellow-400' : 'text-muted-foreground/20'}`}>★</span>
                        ))}
                      </div>
                      {selected.feedbackComment && (
                        <div className="mt-3 rounded-lg border bg-muted/20 p-3">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Your Comment</p>
                          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{selected.feedbackComment}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {selected.status === 'RESOLVED' && !selected.feedbackRating && (
                    <div className="rounded-xl border p-4 space-y-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rate Resolution</p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFeedbackRatingInput(star)}
                            className={`text-2xl leading-none cursor-pointer transition-colors ${star <= feedbackRatingInput ? 'text-yellow-400' : 'text-muted-foreground/30 hover:text-yellow-300'}`}
                            aria-label={`Rate ${star} stars`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                      <div>
                        <p className="mt-8 not-only-of-type:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Comment (Optional)</p>
                        <textarea
                          value={feedbackCommentInput}
                          onChange={(e) => setFeedbackCommentInput(e.target.value)}
                          placeholder="Share what worked or what can be improved..."
                          rows={3}
                          maxLength={1000}
                          className="w-full p-2 rounded-sm border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                        />
                        <p className="text-[11px] text-muted-foreground mt-1 text-right">{feedbackCommentInput.length}/1000</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleSubmitFeedback}
                        disabled={feedbackSubmitting || feedbackRatingInput === 0}
                        className="w-full px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {feedbackSubmitting ? 'Submitting...' : 'Submit Feedback'}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </PageShell>
    </PageTransition>
  );
};

export default MyComplaints;