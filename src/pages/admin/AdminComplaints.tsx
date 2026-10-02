import {
  assignComplaint,
  getAllComplaints,
  getApprovedFaculty,
  getAssignmentCandidates,
  MATCH_REASON_LABEL,
  type AssignmentCandidate,
  getDuplicateClusters,
  updateComplaintStatus,
  type DuplicateCluster,
} from "@/api/admin";
import PageTransition from "@/components/animated/PageTransition";
import { PageHeader, PageShell } from "@/components/app/PageShell";
import { COMPLAINT_STATUS, badgeClass, dotClass } from "@/lib/statusStyles";
import ResolutionNoteBlock from "@/components/complaints/ResolutionNoteBlock";
import { AttachmentUploader } from "@/components/attachments/AttachmentUploader";
import { AttachmentList } from "@/components/attachments/AttachmentList";
import { Skeleton } from "@/components/ui/skeleton";
import { Complaint, ComplaintStatus, User } from "@/types";
import {
  CloseOutlined,
  FileTextOutlined,
  SearchOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import { Input, Modal, Select, message } from "antd";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";


const ALL_STATUSES: ComplaintStatus[] = [
  "RAISED",
  "ASSIGNED",
  "IN_PROGRESS",
  "PENDING_CONFIRMATION",
  "RESOLVED",
];

const AdminComplaints = () => {
  const [selected, setSelected] = useState<Complaint | null>(null);
  // CC-27: ranked for THIS complaint's category, so the electrician is not
  // buried among eighty lecturers in name order.
  const [candidates, setCandidates] = useState<AssignmentCandidate[] | null>(null);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [assignModal, setAssignModal] = useState<Complaint | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | null>(
    null,
  );
  const [assignedFaculty, setAssignedFaculty] = useState<string | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [faculty, setFaculty] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<ComplaintStatus | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");
  // CC-30: "after" photos, uploaded before the status change is submitted.
  const [resolutionFiles, setResolutionFiles] = useState<string[]>([]);
  const [uploaderKey, setUploaderKey] = useState(0);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  // CC-13: open complaints that look like the same fault. Empty is the normal
  // state — it means no duplicates, not a failure.
  const [duplicateClusters, setDuplicateClusters] = useState<DuplicateCluster[]>(
    [],
  );
  const [clustersOpen, setClustersOpen] = useState(false);

  useEffect(() => {
    fetchComplaints();
    fetchFaculty();
    // Never awaited or error-handled here: getDuplicateClusters swallows
    // failures and returns [], so this cannot break the page.
    void getDuplicateClusters().then(setDuplicateClusters);
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const data = await getAllComplaints();
      setComplaints(data);
    } catch (e: unknown) {
      const errorMsg =
        e instanceof Error ? e.message : "Failed to fetch complaints";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * CC-27: load ranked candidates when the assign modal opens.
   *
   * Falls back to the old flat faculty list if this fails. Ranking is a
   * convenience - losing it must not make a complaint unassignable.
   */
  const loadCandidates = async (complaintId: string) => {
    setCandidatesLoading(true);
    setCandidates(null);
    try {
      const { candidates: ranked } = await getAssignmentCandidates(complaintId);
      setCandidates(ranked);
    } catch {
      setCandidates(null);
    } finally {
      setCandidatesLoading(false);
    }
  };

  const fetchFaculty = async () => {
    try {
      const data = await getApprovedFaculty();
      console.log("Faculty data received:", data);
      console.log("Faculty array length:", data ? data.length : 0);
      if (data && Array.isArray(data)) {
        console.log(
          "Faculty items:",
          data.map((f) => ({ id: f.id, name: f.name, email: f.email })),
        );
      }
      setFaculty(data || []);
    } catch (e: unknown) {
      console.error("Error fetching faculty:", e);
      const errorMsg =
        e instanceof Error ? e.message : "Failed to fetch faculty";
      message.error(errorMsg);
      setFaculty([]);
    }
  };

  const handleAssign = async () => {
    if (!assignedFaculty) {
      message.error("Please select a faculty member");
      return;
    }
    if (!assignModal) return;

    try {
      setAssigning(true);
      await assignComplaint(assignModal.id, assignedFaculty);
      message.success("Complaint assigned successfully!");
      setAssignModal(null);
      setAssignedFaculty(null);
      await fetchComplaints();
    } catch (e: unknown) {
      const errorMsg =
        e instanceof Error ? e.message : "Failed to assign complaint";
      message.error(errorMsg);
    } finally {
      setAssigning(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selected || !newStatus) {
      message.error("Please select a status");
      return;
    }

    if (selected.status === "RESOLVED") {
      message.error("Resolved complaints cannot be updated");
      return;
    }

    // Validate resolution note for RESOLVED status
    if (newStatus === "RESOLVED" && !resolutionNote.trim()) {
      message.error("Please provide a resolution note");
      return;
    }

    try {
      setUpdatingStatus(true);
      await updateComplaintStatus(
        selected.id,
        newStatus,
        resolutionNote.trim() || undefined,
        resolutionFiles,
      );
      message.success("Complaint status updated successfully!");
      setStatusModalOpen(false);
      setNewStatus(null);
      setResolutionNote("");
      setResolutionFiles([]);
      // Remount, so the next complaint does not inherit these files.
      setUploaderKey((k) => k + 1);
      setSelected(null);
      await fetchComplaints();
    } catch (e: unknown) {
      const errorMsg =
        e instanceof Error ? e.message : "Failed to update status";
      message.error(errorMsg);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filtered = complaints.filter((c) => {
    const matchSearch =
      !search || c.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusCounts = ALL_STATUSES.reduce(
    (acc, s) => {
      acc[s] = complaints.filter((c) => c.status === s).length;
      return acc;
    },
    {} as Record<ComplaintStatus, number>,
  );

  return (
    <PageTransition>
      <PageShell>
        <PageHeader
          variant="hero"
          icon={<FileTextOutlined />}
          title="Complaint Management"
          description={`${complaints.length} complaints across campus`}
        />

        {/* CC-13: possible duplicate reports of the same fault. Advisory and
            read-only — nothing here merges or closes a complaint. */}
        {duplicateClusters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-amber-300 bg-amber-50 p-4"
          >
            <button
              type="button"
              onClick={() => setClustersOpen((open) => !open)}
              className="w-full flex items-center justify-between gap-3 text-left cursor-pointer"
            >
              <div>
                <h2 className="text-sm font-semibold text-amber-900">
                  {duplicateClusters.length} possible duplicate{" "}
                  {duplicateClusters.length === 1 ? "group" : "groups"}
                </h2>
                <p className="text-xs text-amber-700/80 mt-0.5">
                  {duplicateClusters.reduce((sum, c) => sum + c.size, 0)} open
                  complaints may describe{" "}
                  {duplicateClusters.length === 1 ? "one fault" : "fewer faults"}{" "}
                  than the queue suggests. Assign the oldest and close the rest
                  as you see fit.
                </p>
              </div>
              <span className="text-xs font-medium text-amber-800 shrink-0">
                {clustersOpen ? "Hide" : "Review"}
              </span>
            </button>

            {clustersOpen && (
              <div className="mt-4 space-y-3">
                {duplicateClusters.map((cluster) => (
                  <div
                    key={`${cluster.block}-${cluster.classroomNumber}-${cluster.complaints[0]?.id}`}
                    className="rounded-xl bg-card border border-amber-200 p-3"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-semibold text-foreground">
                        {cluster.block} / {cluster.classroomNumber}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {cluster.size} reports · closest match{" "}
                        {(cluster.topSimilarity * 100).toFixed(0)}%
                      </span>
                    </div>
                    <ol className="space-y-1">
                      {cluster.complaints.map((member, index) => (
                        <li key={member.id} className="text-sm flex gap-2">
                          <span className="text-muted-foreground shrink-0">
                            {index === 0 ? "first" : `#${index + 1}`}
                          </span>
                          <span className="text-foreground">{member.title}</span>
                          <span className="text-muted-foreground text-xs self-center">
                            {member.raisedBy ?? "unknown"} ·{" "}
                            {new Date(member.createdAt).toLocaleDateString()} ·{" "}
                            {member.status.replace(/_/g, " ").toLowerCase()}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
                <p className="text-xs text-amber-700/70">
                  These are suggestions based on wording and location. Check each
                  one before acting — two students can report genuinely different
                  problems in the same room.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Status Strip */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              !statusFilter
                ? "bg-foreground text-background border-foreground shadow-sm"
                : "bg-card text-muted-foreground border-border hover:border-foreground/30"
            }`}
          >
            All ({complaints.length})
          </button>
          {ALL_STATUSES.map((s) => {
            const st = (COMPLAINT_STATUS[s] ?? COMPLAINT_STATUS.RESOLVED);
            const active = statusFilter === s;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(active ? null : s)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                  active
                    ? `${badgeClass(st.tone)} border-current shadow-sm`
                    : "bg-card text-muted-foreground border-border hover:border-foreground/30"
                }`}
              >
                <span className={dotClass(st.tone)} />
                {st.label} ({statusCounts[s]})
              </button>
            );
          })}
        </div>    

        {/* Search */}
        <div className="relative w-full sm:max-w-sm">
          <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search complaints..."
            className="w-full rounded-xl border-2 bg-card pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-3 focus:ring-brand-500/16 focus:border-brand-500"
          />
        </div>

        {/* List */}
        {loading ? (
          <div className="grid grid-cols-1 gap-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-2xl border bg-card p-4 shadow-sm"
              >
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
            <p className="text-sm font-semibold text-foreground mb-1">
              No complaints found
            </p>
            <p className="text-xs text-muted-foreground">
              Try adjusting your filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filtered.map((c, i) => {
              const st = (COMPLAINT_STATUS[c.status] ?? COMPLAINT_STATUS.RESOLVED);
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setSelected(c)}
                  className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm cursor-pointer hover:border-brand-500/40 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <span
                        className={`mt-1.5 shrink-0 ${dotClass(st.tone)}`}
                      />
                      <p className="font-semibold text-sm text-foreground min-w-0 flex-1 truncate">
                        {c.title}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      Room {c.classroomNumber} · Block {c.block}
                      {c.category && ` · ${c.category.replace("_", " ")}`}
                    </p>
                    {c.assignedTo && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Assigned to: {c.assignedTo.name}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:ml-auto sm:justify-end">
                    {Number(c.escalationCount ?? 0) > 0 &&
                      c.status !== "RESOLVED" && (
                        <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-800">
                          Handled by Super Admin
                        </span>
                      )}
                    <span
                      className={badgeClass(st.tone)}
                    >
                      {st.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
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
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                className="fixed right-0 top-0 h-full w-full max-w-md border-l border-border shadow-2xl z-50 overflow-y-auto bg-card"
              >
                <div className="sticky top-0 bg-card/90 backdrop-blur-sm border-b border-border px-6 py-4 flex items-center justify-between">
                  <h2 className="font-bold text-foreground text-base truncate pr-4">
                    {selected.title}
                  </h2>
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
                    {(() => {
                      const st = (COMPLAINT_STATUS[selected.status] ?? COMPLAINT_STATUS.RESOLVED);
                      return (
                        <span
                          className={badgeClass(st.tone)}
                        >
                          {st.label}
                        </span>
                      );
                    })()}
                    <span className="rounded-full px-3 py-1 text-xs font-semibold bg-muted text-muted-foreground">
                      Room {selected.classroomNumber}
                    </span>
                    <span className="rounded-full px-3 py-1 text-xs font-semibold bg-muted text-muted-foreground">
                      Block {selected.block}
                    </span>
                    {selected.category && (
                      <span className="rounded-full px-3 py-1 text-xs font-semibold bg-cyan-100 text-primary dark:bg-cyan-900/20 dark:text-primary">
                        {selected.category.replace("_", " ")}
                      </span>
                    )}
                    {Number(selected.escalationCount ?? 0) > 0 &&
                      selected.status !== "RESOLVED" && (
                        <span className="rounded-full px-3 py-1 text-[11px] font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40/40 dark:text-indigo-900">
                          Escalated {selected.escalationCount}x
                        </span>
                      )}
                  </div>

                  {/* Description */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                      Description
                    </p>
                    <p className="text-sm text-foreground leading-relaxed">
                      {selected.description}
                    </p>
                  </div>

                  {/* Raised by */}
                  <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Raised By
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {selected.raisedBy.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selected.raisedBy.email}
                    </p>
                    {selected.raisedBy.studentProfile && (
                      <p className="text-xs text-muted-foreground">
                        {selected.raisedBy.studentProfile.department} ·{" "}
                        {selected.raisedBy.studentProfile.branch}
                      </p>
                    )}
                  </div>

                  {/* Assigned to */}
                  {selected.assignedTo && (
                    <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Assigned To
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {selected.assignedTo.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selected.assignedTo.email}
                      </p>
                      {selected.assignedTo.facultyProfile && (
                        <p className="text-xs text-muted-foreground">
                          {selected.assignedTo.facultyProfile.department}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Resolution note */}
                  {/* CC-30: admins triage and reassign from here, so they
                      need the same evidence the faculty member will get. */}
                  <AttachmentList
                    attachments={selected.attachments}
                    label="Photos from the student"
                  />
                  <AttachmentList
                    attachments={selected.resolutionAttachments}
                    label="Resolution photos"
                  />

                  {selected.resolutionNote && (
                    <ResolutionNoteBlock
                      note={selected.resolutionNote}
                      title="Resolution Note"
                      variant="success"
                    />
                  )}

                  <p className="text-xs text-muted-foreground">
                    Created: {new Date(selected.createdAt).toLocaleDateString()}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 flex-wrap">
                    {!selected.handledBySuperAdmin &&
                      selected.status === "RAISED" &&
                      !selected.assignedTo && (
                        <button
                          onClick={() => {
                            setAssignModal(selected);
                            setAssignedFaculty(null);
                            // CC-27: rank against THIS complaint's category.
                            void loadCandidates(selected.id);
                            setSelected(null);
                          }}
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
          okButtonProps={{ className: "rounded-lg" }}
        >
          <p className="mb-3">
            Assign a faculty member to: <strong>{assignModal?.title}</strong>
          </p>
          {/* CC-27. Ranked when available, alphabetical when not - the old
              behaviour is the fallback, never the default. */}
          <Select
            placeholder={candidatesLoading ? "Ranking staff…" : "Select staff"}
            loading={candidatesLoading}
            className="w-full"
            value={assignedFaculty}
            onChange={setAssignedFaculty}
            optionLabelProp="label"
            options={(candidates ?? []).length > 0
              ? candidates!.map((c) => ({
                  value: c.id,
                  label: c.name,
                  title: c.email,
                  // The reason is shown, not just the order. An admin who
                  // cannot see WHY someone is first has no basis to overrule
                  // it - and overruling it must stay easy.
                  children: (
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate">
                        {c.name}
                        {c.staffRole ? (
                          <span className="text-muted-foreground"> · {c.staffRole}</span>
                        ) : null}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {MATCH_REASON_LABEL[c.reason]} · {c.openLoad} open
                      </span>
                    </div>
                  ),
                }))
              : faculty.map((f) => ({
                  value: f.id,
                  label: f.name,
                  title: f.email,
                  children: <span>{`${f.name} (${f.email})`}</span>,
                }))}
          />

          {candidates && candidates.length > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Ordered by who handles this kind of complaint, then by how much
              is already on their plate. You can pick anyone.
            </p>
          )}
        </Modal>

        {/* Status Modal */}
        <Modal
          open={statusModalOpen}
          onCancel={() => {
            setStatusModalOpen(false);
            setNewStatus(null);
            setResolutionNote("");
          }}
          title="Update Complaint Status"
          onOk={handleStatusUpdate}
          okText="Update Status"
          confirmLoading={updatingStatus}
          okButtonProps={{ className: "rounded-lg" }}
          width={500}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                New Status <span className="text-red-500">*</span>
              </label>
              <Select
                className="w-full"
                value={newStatus}
                onChange={setNewStatus}
                options={ALL_STATUSES.map((s) => ({
                  label: s.replace("_", " "),
                  value: s,
                }))}
              />
            </div>
            {newStatus === "RESOLVED" && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Resolution Note <span className="text-red-500">*</span>
                </label>
                <Input.TextArea
                  rows={4}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Describe how the complaint was resolved..."
                />
              </div>
            )}

            {/* CC-30. Offered on both statuses the server accepts evidence
                for, and optional on both - see resolutionEvidence.ts for why
                requiring it would be worse than not having it. */}
            {(newStatus === "RESOLVED" ||
              newStatus === "PENDING_CONFIRMATION") && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Photo of the repair (optional)
                </label>
                <AttachmentUploader
                  key={uploaderKey}
                  entityType="COMPLAINT_RESOLUTION"
                  onChange={setResolutionFiles}
                  disabled={updatingStatus}
                />
              </div>
            )}
          </div>
        </Modal>
      </PageShell>
    </PageTransition>
  );
};

export default AdminComplaints;
