import { getMyComplaints } from '@/api/student';
import PageTransition from '@/components/animated/PageTransition';
import { Skeleton } from '@/components/ui/skeleton';
import { Complaint, ComplaintStatus } from '@/types';
import { CloseOutlined, FileTextOutlined, SearchOutlined } from '@ant-design/icons';
import { Select } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const STATUS_STYLES: Record<ComplaintStatus, { dot: string; bg: string; text: string; label: string }> = {
  RAISED:      { dot: 'bg-orange-500',  bg: 'bg-orange-100 dark:bg-orange-90/40', text: 'text-orange-700 dark:text-orange-700',   label: 'Raised' },
  ASSIGNED:    { dot: 'bg-blue-500',    bg: 'bg-blue-100 dark:bg-blue-90/40',     text: 'text-blue-700 dark:text-blue-700',       label: 'Assigned' },
  IN_PROGRESS: { dot: 'bg-violet-500',  bg: 'bg-violet-100 dark:bg-violet-90/40', text: 'text-violet-700 dark:text-violet-700',   label: 'In Progress' },
  RESOLVED:    { dot: 'bg-green-500',   bg: 'bg-green-100 dark:bg-green-90/40',   text: 'text-green-700 dark:text-green-700',     label: 'Resolved' },
  CLOSED:      { dot: 'bg-slate-400',   bg: 'bg-slate-100 dark:bg-slate-800/40',   text: 'text-slate-600 dark:text-slate-700',     label: 'Closed' },
};

const PRIORITY_STYLES: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: 'bg-slate-100 dark:bg-slate-80',          text: 'text-slate-600 dark:text-slate-700',     label: 'P1 · Low' },
  2: { bg: 'bg-blue-100 dark:bg-blue-90/40',          text: 'text-blue-700 dark:text-blue-700',       label: 'P2 · Minor' },
  3: { bg: 'bg-yellow-100 dark:bg-yellow-90/40',      text: 'text-yellow-700 dark:text-yellow-700',   label: 'P3 · Medium' },
  4: { bg: 'bg-orange-100 dark:bg-orange-90/40',      text: 'text-orange-700 dark:text-orange-700',   label: 'P4 · High' },
  5: { bg: 'bg-red-100 dark:bg-red-90/40',            text: 'text-red-800 dark:text-red-700',         label: 'P5 · Critical' },
};

const MyComplaints = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

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

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Complaints</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Track the status of your submitted complaints</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">{complaints.length} total</span>
            <span className="h-4 w-px bg-border" />
            <span className="text-green-600 dark:text-green-400 font-medium">
              {complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length} resolved
            </span>
          </div>
        </div>

        {/* Status summary strip */}
        <div className="grid grid-cols-1 min-[360px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {(['RAISED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as ComplaintStatus[]).map((s) => {
            const style = STATUS_STYLES[s];
            const count = complaints.filter(c => c.status === s).length;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? null : s)}
                className={`rounded-xl border p-3 text-center transition-all cursor-pointer ${
                  statusFilter === s
                    ? `${style.bg} border-current ${style.text}`
                    : 'bg-card hover:border-blue-500/30'
                }`}
              >
                <div className={`text-lg font-bold ${statusFilter === s ? style.text : 'text-foreground'}`}>{count}</div>
                <div className={`text-xs mt-0.5 ${statusFilter === s ? style.text : 'text-muted-foreground'}`}>{style.label}</div>
              </button>
            );
          })}
        </div>

        {/* Search + filter */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative w-full sm:w-auto">
            <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm z-10 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 h-9 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all w-full sm:w-64"
            />
          </div>
          <Select
            placeholder="All statuses"
            value={statusFilter}
            className="w-full sm:min-w-37.5 sm:w-auto"
            allowClear
            onChange={(v) => setStatusFilter(v || null)}
            options={(['RAISED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as ComplaintStatus[]).map((s) => ({
              label: STATUS_STYLES[s].label, value: s,
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 rounded-2xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center mb-4">
              <FileTextOutlined className="text-3xl text-blue-500" />
            </div>
            <p className="text-base font-semibold text-foreground mb-1">No complaints found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search or status filter.</p>
          </motion.div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((c, i) => {
              const s = STATUS_STYLES[c.status] ?? STATUS_STYLES.CLOSED;
              const p = c.priority ? PRIORITY_STYLES[c.priority] : null;
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ x: 3 }}
                  onClick={() => setSelected(c)}
                  className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 p-4 rounded-2xl bg-card border hover:border-blue-500/30 hover:shadow-md hover:shadow-blue-500/5 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${s.dot}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{c.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Room {c.classroomNumber} · Block {c.block}{c.category ? ` · ${c.category.replace(/_/g, ' ')}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto">
                    {p && (
                      <span className={`hidden sm:inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${p.bg} ${p.text}`}>
                        {p.label}
                      </span>
                    )}
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.bg} ${s.text}`}>
                      {s.label}
                    </span>
                    <span className="hidden md:block text-xs text-muted-foreground">{formatDate(c.createdAt)}</span>
                  </div>
                </motion.div>
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
                className="fixed bg-white right-0 top-0 h-full w-full max-w-md border-l shadow-2xl z-50 overflow-y-auto"
              >
                <div className="p-6 flex flex-col gap-5 min-h-full bg-white">
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
                    {(() => { const s = STATUS_STYLES[selected.status] ?? STATUS_STYLES.CLOSED; return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${s.bg} ${s.text}`}>{s.label}</span>; })()}
                    {selected.priority && (() => { const p = PRIORITY_STYLES[selected.priority!]; return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${p.bg} ${p.text}`}>{p.label}</span>; })()}
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

                  {selected.assignedTo && (
                    <div className="rounded-xl border p-4">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Assigned To</p>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-linear-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
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
                    <div className="rounded-xl bg-green-50 dark:bg-green-90/30 border border-green-200 dark:border-green-900 p-4">
                      <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wider mb-2">Resolution Note</p>
                      <p className="text-sm text-green-800 dark:text-green-700 leading-relaxed">{selected.resolutionNote}</p>
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
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

export default MyComplaints;