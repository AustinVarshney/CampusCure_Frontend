import {
  CommonDoubtsWindow,
  CommonDoubtTopic,
  getCommonAcademicDoubts,
  getDoubts,
  getSimilarDoubtSuggestions,
  getStudentPostingSettings,
  postDoubt,
  readDoubtFromImage,
  SimilarDoubtSuggestion,
} from '@/api/student';
import PageTransition from '@/components/animated/PageTransition';
import { DOUBT_STATUS } from "@/lib/statusStyles";
import { Badge, PageHeader, PageShell } from "@/components/app/PageShell";
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { Doubt } from '@/types';
import { ClockCircleOutlined, QuestionCircleOutlined, EyeOutlined, MessageOutlined, PlusOutlined } from '@ant-design/icons';
import { Alert, Button, Empty, Input, message, Modal, Select, Tag } from 'antd';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { stripCodeBlocks, plainTextLength } from '@/lib/codeBlocks';
import { RichTextEditor, RICH_TEXT_FORMAT } from '@/components/content/RichTextEditor';
import { TagChipList } from '@/components/tags/TagChip';
import { TagInput } from '@/components/tags/TagInput';
import { BookmarkButton } from '@/components/bookmarks/BookmarkButton';
import { AttachmentUploader } from '@/components/attachments/AttachmentUploader';


const doubtSchema = z.object({
  title: z.string().trim().min(10, 'Title must be at least 10 characters').max(200, 'Title too long'),
  // CC-23: the editor produces HTML, so a raw length check would measure
  // markup. <p></p> is seven characters of nothing.
  description: z
    .string()
    .refine((value) => plainTextLength(value) >= 20, 'Description must be at least 20 characters')
    .refine((value) => plainTextLength(value) <= 2000, 'Description too long'),
  subject: z.string().trim().min(1, 'Subject is required'),
  semester: z.number().min(1, 'Semester must be 1-8').max(8),
  labels: z.array(z.string()).optional(),
});

const fallbackDoubtSubjects = ['DSA', 'DBMS', 'OS', 'NETWORKS'];
type DoubtTab = 'doubts' | 'my-doubts' | 'subjectwise-doubts';

const parseTab = (tabValue: string | null): DoubtTab => {
  if (tabValue === 'common-doubts' || tabValue === 'subjectwise-doubts') {
    return 'subjectwise-doubts';
  }
  if (tabValue === 'my-doubts' || tabValue === 'doubts') {
    return tabValue;
  }
  return 'doubts';
};

/**
 * Debounce for duplicate-doubt suggestions.
 *
 * Raised from 350ms in CC-11: the endpoint now embeds the query through a
 * free-tier provider, so each keystroke burst that slips through costs a real
 * API call. 600ms still feels responsive while typing a title.
 */
const SUGGESTION_DEBOUNCE_MS = 600;

const DoubtCommunity = () => {
  const { user } = useAuth();
  const isApproved = user?.approvalStatus === 'APPROVED';
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<DoubtTab>(() => parseTab(searchParams.get('tab')));
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  const [askModal, setAskModal] = useState(false);
  const [newDoubt, setNewDoubt] = useState({ title: '', description: '', subject: '', semester: '', labels: [] as string[] });
  // CC-24: ids of files already uploaded; the form never carries bytes.
  const [doubtFiles, setDoubtFiles] = useState<string[]>([]);
  const [doubtUploaderKey, setDoubtUploaderKey] = useState(0);
  // CC-50. `transcription` is non-null once a question has been read out of an
  // image, and carries the model that read it so the doubt records provenance.
  const [readingImage, setReadingImage] = useState(false);
  const [transcription, setTranscription] = useState<{ model: string } | null>(null);
  // CC-20: tag filter lives in the URL, so a filtered list is shareable and
  // survives a refresh. getAll gives the repeated ?tag= form the API expects.
  const activeTags = searchParams.getAll('tag');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [doubtSubjects, setDoubtSubjects] = useState<string[]>(fallbackDoubtSubjects);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [similarDoubts, setSimilarDoubts] = useState<SimilarDoubtSuggestion[]>([]);
  const [commonWindow, setCommonWindow] = useState<CommonDoubtsWindow>('all');
  const [commonTopics, setCommonTopics] = useState<CommonDoubtTopic[]>([]);
  const [commonLoading, setCommonLoading] = useState(false);

  useEffect(() => {
    fetchPostingSettings();
  }, []);

  // Re-runs whenever the tag filter changes. Filtering happens server-side
  // against the GIN-indexed normalized column, not over an already-fetched
  // page, so it stays correct as the corpus grows.
  useEffect(() => {
    fetchDoubts(searchParams.getAll('tag'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  useEffect(() => {
    const nextTab = parseTab(searchParams.get('tab'));
    setActiveTab(nextTab);
  }, [searchParams]);

  useEffect(() => {
    if (activeTab !== 'subjectwise-doubts') {
      return;
    }

    void fetchCommonDoubts(commonWindow);
  }, [activeTab, commonWindow]);

  useEffect(() => {
    if (!askModal) {
      return;
    }

    void fetchPostingSettings();
  }, [askModal]);

  useEffect(() => {
    const onFocus = () => {
      void fetchPostingSettings();
    };

    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  useEffect(() => {
    if (!askModal) {
      setSimilarDoubts([]);
      return;
    }

    const query = `${newDoubt.title} ${newDoubt.description}`.trim();
    if (query.length < 8) {
      setSimilarDoubts([]);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      try {
        const semesterValue = Number(newDoubt.semester);
        const suggestions = await getSimilarDoubtSuggestions(
          {
            query,
            subject: newDoubt.subject || undefined,
            semester: Number.isInteger(semesterValue) && semesterValue > 0 ? semesterValue : undefined,
            limit: 5,
          },
          controller.signal,
        );

        if (!cancelled) {
          setSimilarDoubts(suggestions);
        }
      } catch {
        // Includes the abort case, where there is nothing to report.
        if (!cancelled) {
          setSimilarDoubts([]);
        }
      }
    }, SUGGESTION_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      // Abort the request itself, not just its result. Since CC-11 each call may
      // embed the query through a rate-limited free-tier provider, so letting a
      // superseded request finish spends quota on an answer nobody reads.
      controller.abort();
    };
  }, [askModal, newDoubt.title, newDoubt.description, newDoubt.subject, newDoubt.semester]);

  const fetchPostingSettings = async () => {
    try {
      setSubjectsLoading(true);
      const settings = await getStudentPostingSettings();
      setDoubtSubjects(
        settings.doubtSubjects.length > 0
          ? settings.doubtSubjects
          : fallbackDoubtSubjects,
      );
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Failed to load subjects');
    } finally {
      setSubjectsLoading(false);
    }
  };

  const fetchDoubts = async (tags: string[] = []) => {
    try {
      setLoading(true);
      const data = await getDoubts(tags.length > 0 ? { tags } : undefined);
      setDoubts(Array.isArray(data) ? data : []);
    } catch {
      message.error('Failed to fetch doubts');
      setDoubts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommonDoubts = async (window: CommonDoubtsWindow) => {
    try {
      setCommonLoading(true);
      const data = await getCommonAcademicDoubts(window);
      setCommonTopics(data.topics);
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Failed to fetch SubjectWise doubts');
    } finally {
      setCommonLoading(false);
    }
  };

  const changeTab = (tab: DoubtTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const jumpToFilteredDoubts = (topic: CommonDoubtTopic) => {
    setSubjectFilter(topic.label);
    setSearch('');
    changeTab('doubts');
  };

  const q = search.trim().toLowerCase();
  /** Toggle a tag in the URL. Adding one must narrow the list, never replace it. */
  const toggleTag = (tag: string) => {
    const next = new URLSearchParams(searchParams);
    const current = next.getAll('tag');
    next.delete('tag');
    const updated = current.includes(tag)
      ? current.filter((t) => t !== tag)
      : [...current, tag];
    updated.forEach((t) => next.append('tag', t));
    setSearchParams(next);
  };

  const clearTags = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('tag');
    setSearchParams(next);
  };

  const filtered = doubts.filter((d) => {
    const title = (d.title ?? '').toLowerCase();
    const desc = (d.description ?? '').toLowerCase();
    const matchSearch = !q || title.includes(q) || desc.includes(q);
    const matchSubject = !subjectFilter || d.subject === subjectFilter;
    const matchMyDoubt = activeTab !== 'my-doubts' || d.postedBy.id === user?.id;
    return matchSearch && matchSubject && matchMyDoubt;
  });

  const handleAsk = async () => {
    const result = doubtSchema.safeParse({ ...newDoubt, semester: Number(newDoubt.semester) || 0 });
    if (!result.success) {
      const e: Record<string, string> = {};
      result.error.errors.forEach((err) => { e[err.path[0] as string] = err.message; });
      setFormErrors(e);
      return;
    }

    if (!doubtSubjects.includes(result.data.subject)) {
      setFormErrors((prev) => ({ ...prev, subject: 'Selected subject is not allowed' }));
      return;
    }

    try {
      setSubmitting(true);
      // CC-20: already a list. The server normalizes and stores both forms -
      // splitting a comma-separated string here is what produced the
      // near-duplicate tags this replaces.
      const labelsArray = newDoubt.labels;
      await postDoubt({
        title: newDoubt.title,
        description: newDoubt.description,
        subject: newDoubt.subject,
        semester: Number(newDoubt.semester),
        labels: labelsArray,
        attachmentIds: doubtFiles,
        descriptionFormat: RICH_TEXT_FORMAT,
        // CC-50: provenance travels with the doubt so a reader can tell a
        // transcription from typed text.
        //
        // Deliberately NOT cleared when the student edits the description. We
        // ask them to check every number, so editing is the expected path -
        // clearing on edit would mean the flag is almost never set, which is
        // the opposite of what it is for. It records where the text came from,
        // not who touched it last.
        transcribedFromImage: transcription !== null,
        transcriptionModel: transcription?.model,
      });
      message.success('Your doubt has been posted!');
      setNewDoubt({ title: '', description: '', subject: '', semester: '', labels: [] });
      setDoubtFiles([]);
      setDoubtUploaderKey((k) => k + 1);
      setTranscription(null);
      setSimilarDoubts([]);
      setFormErrors({});
      setAskModal(false);
      fetchDoubts(); // Refresh the list
    } catch {
      message.error('Failed to post doubt. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  /**
   * CC-50: read the question out of the first uploaded image.
   *
   * Fills the form in and leaves it entirely editable - this never posts. The
   * error messages come from the server verbatim because they are the only
   * thing that distinguishes "try a clearer photo" from "this deployment
   * cannot read images at all", and collapsing them into one toast would leave
   * the student retaking a photo that was never going to work.
   */
  const handleReadFromImage = async () => {
    const first = doubtFiles[0];
    if (!first) return;

    try {
      setReadingImage(true);
      const fields = await readDoubtFromImage(first);

      setNewDoubt((p) => ({
        ...p,
        title: fields.title || p.title,
        description: fields.description || p.description,
        // Only accept a subject the form actually offers. The model is not
        // given the list, so an unrecognised guess is dropped rather than
        // silently failing validation on submit.
        subject:
          fields.subject && doubtSubjects.includes(fields.subject)
            ? fields.subject
            : p.subject,
        labels: fields.labels.length ? fields.labels : p.labels,
      }));
      setTranscription({ model: fields.model });
      setFormErrors({});
      message.success('Question read from the image. Please check it before posting.');
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Could not read the image.');
    } finally {
      setReadingImage(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setNewDoubt((p) => ({ ...p, [field]: value }));
    if (formErrors[field]) setFormErrors((p) => { const n = { ...p }; delete n[field]; return n; });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    if (diffMins < 10080) return `${Math.floor(diffMins / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <PageTransition>
      <PageShell>
        <PageHeader
          icon={<QuestionCircleOutlined />}
          title="Doubt Community"
          description="Ask, answer, and learn together"
          actions={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              disabled={!isApproved}
              title={!isApproved ? 'Account approval required' : undefined}
              onClick={() => setAskModal(true)}
            >
              Ask a Doubt
            </Button>
          }
        />

        {!isApproved && (
          <Alert
            type="warning"
            icon={<ClockCircleOutlined />}
            showIcon
            message="Account Pending Approval"
            description="You can browse doubts, but posting new doubts is disabled until your account is approved."
            className="rounded-xl mb-4"
          />
        )}

        <div className="flex flex-wrap gap-2 mt-4">
          <button
            type="button"
            onClick={() => changeTab('doubts')}
            className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'doubts'
                ? 'cc-fill-brand text-white border-transparent'
                : 'bg-card border-border text-muted-foreground hover:border-foreground/30'
            }`}
          >
            Doubts
          </button>
          <button
            type="button"
            onClick={() => changeTab('my-doubts')}
            className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'my-doubts'
                ? 'cc-fill-brand text-white border-transparent'
                : 'bg-card border-border text-muted-foreground hover:border-foreground/30'
            }`}
          >
            My Doubts
          </button>
          <button
            type="button"
            onClick={() => changeTab('subjectwise-doubts')}
            className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'subjectwise-doubts'
                ? 'cc-fill-brand text-white border-transparent'
                : 'bg-card border-border text-muted-foreground hover:border-foreground/30'
            }`}
          >
            SubjectWise Doubts
          </button>
        </div>

        {activeTab !== 'subjectwise-doubts' && (
          <div className="flex gap-3 flex-wrap mt-4">
            <Input.Search placeholder="Search doubts..." value={search} className="w-full sm:max-w-xs placeholder-gray-800! placeholder:font-medium" onChange={(e) => setSearch(e.target.value)} allowClear />
            <Select placeholder="Filter by subject" value={subjectFilter || undefined} className="w-full sm:min-w-35 sm:w-auto [&_.ant-select-selection-placeholder]:text-foreground! [&_.ant-select-selection-placeholder]:opacity-100 [&_.ant-select-selection-placeholder]:font-medium" allowClear onChange={(v) => setSubjectFilter(v || null)} options={doubtSubjects.map((s) => ({ label: s, value: s }))} loading={subjectsLoading} />
          </div>
        )}

        {/* CC-20: the active tag filter, shown next to the other filters so it
            is obvious why the list is short, and dismissible. */}
        {activeTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Filtered by</span>
            {activeTags.map((tag) => (
              <Tag
                key={tag}
                color="blue"
                closable
                onClose={(e) => {
                  e.preventDefault();
                  toggleTag(tag);
                }}
                className="rounded-full text-xs"
              >
                {tag}
              </Tag>
            ))}
            {activeTags.length > 1 && (
              <button
                type="button"
                onClick={clearTags}
                className="text-xs text-muted-foreground underline hover:text-foreground"
              >
                Clear all
              </button>
            )}
          </div>
        )}

        {activeTab === 'subjectwise-doubts' && (
          <div className="space-y-4">
            <div className="rounded-2xl border bg-card p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-bold text-foreground">Most Active Subjectwise Doubts</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Hybrid ranking: frequency first, engagement tie-breaker</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {([
                    { value: 'all', label: 'All Time' },
                    { value: '30d', label: 'Last 30 Days' },
                    { value: '90d', label: 'Last 90 Days' },
                  ] as { value: CommonDoubtsWindow; label: string }[]).map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setCommonWindow(item.value)}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                        commonWindow === item.value
                          ? 'cc-fill-brand text-white border-transparent'
                          : 'bg-card border-border text-muted-foreground hover:border-foreground/30'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {commonLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="rounded-2xl border bg-card p-4 space-y-3">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                ))}
              </div>
            ) : commonTopics.length === 0 ? (
              <Empty description="No SubjectWise doubts found for this window" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {commonTopics.map((topic, index) => (
                  <motion.button
                    key={topic.key}
                    type="button"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    onClick={() => jumpToFilteredDoubts(topic)}
                    className="text-left rounded-2xl border bg-card p-4 hover:border-blue-500/40 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-bold text-foreground truncate">{topic.label}</h3>
                      <span className="rounded-full bg-cyan-100 text-primary dark:bg-cyan-900/40 dark:text-primary px-2.5 py-0.5 text-xs font-semibold">
                        {topic.count} doubts
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Engagement score: {topic.engagementScore}</p>
                    <div className="mt-3 space-y-1">
                      {topic.topDoubts.map((doubt) => (
                        <p key={doubt.id} className="text-xs text-foreground/90 truncate">
                          • {doubt.title}
                        </p>
                      ))}
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab !== 'subjectwise-doubts' && (loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="rounded-2xl border bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <div className="flex gap-2 pt-1">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-14 rounded-full" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="mt-4 flex gap-3">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.length === 0 && (
              <Empty description={activeTab === 'my-doubts' ? 'You have not posted any doubts yet' : 'No doubts found'} />
            )}
            {filtered.map((doubt, i) => (
              <motion.div key={doubt.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} whileHover={{ scale: 1.01, boxShadow: '0 4px 20px rgba(22,119,255,0.08)' }} className="bg-card rounded-2xl border p-5 cursor-pointer transition" onClick={() => navigate(`/student/doubts/${doubt.id}`)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-base">{doubt.title}</h3>
                    {/* CC-22: cards show prose only. A truncated code block is noise, and
                        highlighting one per card is the cost the lazy highlighter avoids. */}
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{stripCodeBlocks(doubt.description)}</p>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      <Badge tone="escalate">{doubt.subject}</Badge>
                      <Tag>Sem {doubt.semester}</Tag>
                      <TagChipList
                        labels={doubt.labels}
                        labelsNormalized={doubt.labelsNormalized}
                        onTagClick={toggleTag}
                        activeTags={activeTags}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge tone={DOUBT_STATUS[doubt.status]?.tone ?? "neutral"}>{DOUBT_STATUS[doubt.status]?.label ?? doubt.status}</Badge>
                    <BookmarkButton
                      doubtId={doubt.id}
                      bookmarked={Boolean(doubt.isBookmarkedByUser)}
                      onChange={(next) =>
                        setDoubts((current) =>
                          current.map((d) =>
                            d.id === doubt.id ? { ...d, isBookmarkedByUser: next } : d,
                          ),
                        )
                      }
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MessageOutlined /> {doubt.answerCount} answers</span>
                  <span className="flex items-center gap-1"><EyeOutlined /> {doubt.views} views</span>
                  <span>by {doubt.postedBy.name || doubt.postedBy.userID}</span>
                  <span>{formatDate(doubt.createdAt)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        ))}

        <Modal
          open={askModal}
          onCancel={() => {
            setAskModal(false);
            setFormErrors({});
          }}
          title="Ask a Doubt"
          onOk={handleAsk}
          okText="Post Doubt"
          confirmLoading={submitting}
          okButtonProps={{ disabled: !isApproved, className: 'min-w-28' }}
          cancelButtonProps={{ className: 'min-w-24' }}
          centered
          width="min(94vw, 760px)"
          styles={{ body: { overflow: 'hidden' } }}
        >
          <div className="ask-doubt-scroll-area max-h-[70vh] overflow-y-auto pr-1 sm:pr-2 space-y-4 sm:space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Title *</label>
              <Input placeholder="What's your question? (min 10 chars)" value={newDoubt.title} onChange={(e) => updateField('title', e.target.value)} status={formErrors.title ? 'error' : undefined} maxLength={200} />
              {formErrors.title && <p className="text-xs text-destructive mt-1">{formErrors.title}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Description *</label>
              {/* CC-23: produces HTML; the SERVER sanitises it on write. */}
              <RichTextEditor
                value={newDoubt.description}
                onChange={(html) => setNewDoubt((p) => ({ ...p, description: html }))}
                placeholder="Provide more details — use the toolbar for lists, code, maths and images"
                disabled={submitting}
                imageEntity="DOUBT"
              />
              {formErrors.description && <p className="text-xs text-destructive mt-1">{formErrors.description}</p>}
            </div>
            {similarDoubts.length > 0 && (
              <div className="rounded-lg border border-dashed border-blue-300/70 bg-accent/40 p-3 sm:p-4 mt-8">
                <p className="text-xs font-semibold text-primary">Similar doubts found</p>
                <div className="mt-2 space-y-2">
                  {similarDoubts.map((suggestion) => (
                    <div key={suggestion.id} className="rounded-md border bg-background p-2.5 sm:p-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-2">{suggestion.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {suggestion.subject} • Sem {suggestion.semester} • {suggestion.answerCount} answers • {suggestion.views} views
                          </p>
                        </div>
                        <Button
                          size="small"
                          type="link"
                          className="self-start px-0 sm:px-2"
                          onClick={() => {
                            setAskModal(false);
                            navigate(`/student/doubts/${suggestion.id}`);
                          }}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Subject *</label>
                <Select placeholder="Select Subject" className="w-full" value={newDoubt.subject || undefined} onChange={(v) => updateField('subject', v)} options={doubtSubjects.map((s) => ({ label: s, value: s }))} status={formErrors.subject ? 'error' : undefined} loading={subjectsLoading} />
                {formErrors.subject && <p className="text-xs text-destructive mt-1">{formErrors.subject}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Semester *</label>
                <Select placeholder="Semester" className="w-full" value={newDoubt.semester || undefined} onChange={(v) => updateField('semester', v)} options={[1,2,3,4,5,6,7,8].map((s) => ({ label: `Sem ${s}`, value: String(s) }))} status={formErrors.semester ? 'error' : undefined} />
                {formErrors.semester && <p className="text-xs text-destructive mt-1">{formErrors.semester}</p>}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Labels (comma-separated)</label>
              <TagInput
                value={newDoubt.labels}
                onChange={(tags) => setNewDoubt((p) => ({ ...p, labels: tags }))}
                disabled={submitting}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Screenshots or notes (optional)</label>
              <AttachmentUploader
                key={doubtUploaderKey}
                entityType="DOUBT"
                onChange={setDoubtFiles}
                disabled={submitting}
              />

              {/* CC-50. Offered only once something is uploaded, because it
                  operates on the uploaded image rather than on a local file. */}
              {doubtFiles.length > 0 && (
                <div className="mt-2">
                  <Button
                    size="small"
                    onClick={handleReadFromImage}
                    loading={readingImage}
                    disabled={submitting}
                  >
                    Read my question from the image
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Works on JPG, PNG and WebP photos of a written question.
                  </p>
                </div>
              )}

              {transcription && (
                <Alert
                  className="mt-2"
                  type="info"
                  showIcon
                  message="Filled in from your image"
                  description={
                    `Read by ${transcription.model}. Check every number and symbol ` +
                    `before posting - a transcription can be confidently wrong, and ` +
                    `your original image stays attached either way.`
                  }
                />
              )}
            </div>
          </div>
        </Modal>
      </PageShell>
    </PageTransition>
  );
};

export default DoubtCommunity;