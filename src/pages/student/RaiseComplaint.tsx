import { getSimilarComplaints, getStudentPostingSettings, parseComplaintText, raiseComplaint, type DuplicateComplaintSuggestion } from '@/api/student';
import { AttachmentUploader } from '@/components/attachments/AttachmentUploader';
import PageTransition from '@/components/animated/PageTransition';
import { useAuth } from '@/context/AuthContext';
import blockClassroomData from '@/data/block_classroom.json';
import { ClockCircleOutlined, SendOutlined } from '@ant-design/icons';
import { Alert, Button, Input, message, Select, Spin } from 'antd';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';

const { TextArea } = Input;

/**
 * CC-13: debounce for the duplicate check.
 *
 * Each call may embed the text through a rate-limited free-tier provider, so
 * this is the main quota guard on a field the student types into continuously.
 */
const DUPLICATE_CHECK_DEBOUNCE_MS = 700;

const complaintSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(100, 'Title too long'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(1000, 'Description too long'),
  category: z.string().trim().min(1, 'Category is required'),
  classroomNumber: z.string().trim().min(1, 'Classroom number is required').max(20, 'Classroom number too long'),
  block: z.string().min(1, 'Block is required'),
  priority: z.number().min(1, 'Priority is required').max(5),
});

const fallbackComplaintCategories = ['PROJECTOR', 'FAN', 'LIGHT', 'SMART_BOARD', 'SEATING', 'FURNITURE', 'NETWORK', 'OTHER'];

const PRIORITY_OPTIONS = [
  { label: '1 — Low', value: '1' },
  { label: '2 — Minor', value: '2' },
  { label: '3 — Medium', value: '3' },
  { label: '4 — High', value: '4' },
  { label: '5 — Critical', value: '5' },
];

const RaiseComplaint = () => {
  const { user } = useAuth();
  const isApproved = user?.approvalStatus === 'APPROVED';
  const [form, setForm] = useState({ classroomNumber: '', block: '', category: '', title: '', description: '', priority: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [allowedCategories, setAllowedCategories] = useState<string[]>(fallbackComplaintCategories);
  const [duplicates, setDuplicates] = useState<DuplicateComplaintSuggestion[]>([]);
  // CC-14: free-text intake. Fills the form; never submits it.
  const [intakeText, setIntakeText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parseNote, setParseNote] = useState('');
  // CC-02: ids of files already uploaded to storage. The form carries ids, not
  // bytes — the upload finished before submit was ever pressed.
  const [attachmentIds, setAttachmentIds] = useState<string[]>([]);
  // Bumped after a successful submit to remount the uploader: it owns its own
  // file tray, so clearing the id list alone would leave stale thumbnails.
  const [uploaderKey, setUploaderKey] = useState(0);

  const handleBlockChange = (value: string) => {
    update('block', value);
    // Reset classroom when block changes
    update('classroomNumber', '');
  };

  const handleClassroomChange = (value: string) => {
    update('classroomNumber', value);
  };

  useEffect(() => {
    let active = true;

    const fetchPostingSettings = async () => {
      try {
        setCategoriesLoading(true);
        const settings = await getStudentPostingSettings();
        if (!active) {
          return;
        }
        setAllowedCategories(
          settings.allowedCategories.length > 0
            ? settings.allowedCategories
            : fallbackComplaintCategories,
        );
      } catch (error) {
        if (active) {
          message.error(error instanceof Error ? error.message : 'Failed to load categories');
        }
      } finally {
        if (active) {
          setCategoriesLoading(false);
        }
      }
    };

    void fetchPostingSettings();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onFocus = async () => {
      try {
        const settings = await getStudentPostingSettings();
        setAllowedCategories(
          settings.allowedCategories.length > 0
            ? settings.allowedCategories
            : fallbackComplaintCategories,
        );
      } catch {
        // Keep current options on transient errors.
      }
    };

    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const blockOptions = useMemo(
    () => Object.keys(blockClassroomData).map((block) => ({ 
      label: blockClassroomData[block as keyof typeof blockClassroomData].name, 
      value: block 
    })),
    [],
  );

  const classroomOptions = useMemo(() => {
    if (!form.block) return [];
    const blockData = blockClassroomData[form.block as keyof typeof blockClassroomData];
    return blockData?.classrooms.map((classroom) => ({ label: classroom, value: classroom })) || [];
  }, [form.block]);

  const categoryOptions = useMemo(
    () => allowedCategories.map((category) => ({ label: category.replace(/_/g, ' '), value: category })),
    [allowedCategories],
  );

  /**
   * CC-13: look for an existing open complaint about the same fault in the same
   * room. Advisory only - it never blocks submission, and any failure simply
   * shows nothing. A student who believes their problem is different is usually
   * right.
   */
  // Destructured outside the effect so the dependency array can name the exact
  // fields it reads, rather than the whole `form` object — which would re-run
  // the check (and spend a provider call) on every unrelated keystroke.
  const { title, description, block, classroomNumber } = form;

  useEffect(() => {
    // Location is required by the backend: a fault is physical, and text alone
    // cannot distinguish the same words about two different rooms.
    if (!block || !classroomNumber || (title + description).trim().length < 10) {
      setDuplicates([]);
      setAttachmentIds([]);
      setUploaderKey((k) => k + 1);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      const found = await getSimilarComplaints(
        { title, description, block, classroomNumber },
        controller.signal,
      );
      if (!cancelled) setDuplicates(found);
    }, DUPLICATE_CHECK_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      // Abort the request itself, not just its result - a superseded call still
      // costs provider quota.
      controller.abort();
    };
  }, [title, description, block, classroomNumber]);

  /**
   * CC-14: extract fields from the description and pre-fill the form.
   *
   * Only ever FILLS — it never submits, and every field it touches stays
   * editable. A wrong suggestion the student corrects is cheap; a silent
   * miscategorisation is not.
   */
  const handleParse = async () => {
    const text = intakeText.trim();
    if (text.length < 10) return;

    setParsing(true);
    setParseNote('');

    const parsed = await parseComplaintText(text);

    if (!parsed || parsed.source === 'none') {
      setParseNote('Could not work that out — please fill the form below.');
      setParsing(false);
      return;
    }

    const filled: string[] = [];
    setForm((prev) => {
      const next = { ...prev };
      // Use the description as the starting point for title and description,
      // so the student is not asked to type it twice.
      if (!next.description) next.description = text;
      if (!next.title) next.title = text.slice(0, 80);
      if (parsed.category && allowedCategories.includes(parsed.category)) {
        next.category = parsed.category;
        filled.push('category');
      }
      if (parsed.block) {
        next.block = parsed.block;
        filled.push('block');
      }
      if (parsed.classroomNumber) {
        next.classroomNumber = parsed.classroomNumber;
        filled.push('room');
      }
      if (parsed.priority) {
        next.priority = String(parsed.priority);
        filled.push('priority');
      }
      return next;
    });

    setParseNote(
      filled.length > 0
        ? `Filled ${filled.join(', ')} — please check before submitting.`
        : 'Nothing could be filled automatically; please complete the form.',
    );
    setParsing(false);
  };

  const handleSubmit = async () => {
    try{
      const result = complaintSchema.safeParse({ ...form, priority: Number(form.priority) || 0 });
      console.log(result);
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.errors.forEach((err) => { fieldErrors[err.path[0] as string] = err.message; });
        setErrors(fieldErrors);
        return;
      }

      if (!allowedCategories.includes(result.data.category)) {
        setErrors((prev) => ({ ...prev, category: 'Selected category is not allowed' }));
        return;
      }

      setSubmitting(true);
      
      // Actually call the API
      await raiseComplaint({
        title: result.data.title,
        description: result.data.description,
        category: result.data.category,
        priority: result.data.priority,
        classroomNumber: result.data.classroomNumber,
        block: result.data.block,
        attachmentIds,
      });
      
      message.success('Complaint submitted successfully! You can track it in My Complaints.');
      setForm({ classroomNumber: '', block: '', category: '', title: '', description: '', priority: '' });
      setErrors({});
      setDuplicates([]);
      setAttachmentIds([]);
      setUploaderKey((k) => k + 1);
    } catch(e) {
      console.error('Error submitting complaint:', e);
      message.error(e instanceof Error ? e.message : 'An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const update = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => { const n = { ...p }; delete n[field]; return n; });
  };

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header banner */}
        <div className="dashboard-hero">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[40px_40px]" />
          <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-cyan-600/15 blur-2xl" aria-hidden="true" />
          <div className="relative flex gap-4">
            <div className="inline-flex h-10 w-10 rounded-xl cc-fill-brand items-center justify-center mb-3">
              <SendOutlined style={{ fontSize: 16, color: 'white' }} />
            </div>
            <div>
              
            <h1 className="text-xl font-bold">Raise a Complaint</h1>
            <p className="text-brand-100/75 text-sm mt-0.5">Report classroom or facility issues to the administration</p>
          </div>
            </ div>
        </div>

        {/* Approval banner */}
        {!isApproved && (
          <Alert
            type="warning"
            icon={<ClockCircleOutlined />}
            showIcon
            message="Account Pending Approval"
            description="You can view this form, but submitting complaints is disabled until your account is approved by the administration."
            className="rounded-xl"
          />
        )}

        {/* CC-14: describe the problem in plain language and let the system
            fill the form. Everything it fills stays editable, and nothing is
            submitted until the student presses the button below. */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-2xl border border-cyan-200 bg-accent/40 p-4"
        >
          <label className="text-sm font-semibold text-foreground">
            Describe the problem
          </label>
          <p className="text-xs text-muted-foreground mt-0.5 mb-2">
            Type it however you like — for example "the projector in ML03 won't
            turn on". We'll fill in the form below, and you can correct anything.
          </p>
          <TextArea
            rows={3}
            value={intakeText}
            onChange={(e) => setIntakeText(e.target.value)}
            placeholder="What is wrong, and where?"
            maxLength={500}
            disabled={!isApproved || parsing}
          />
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <Button
              onClick={handleParse}
              loading={parsing}
              disabled={!isApproved || intakeText.trim().length < 10}
            >
              Fill the form for me
            </Button>
            {parseNote && (
              <span className="text-xs text-muted-foreground">{parseNote}</span>
            )}
          </div>
        </motion.div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4 bg-card rounded-2xl border p-6 shadow-sm space-y-6"
        >
          {/* Location row */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Location</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Block <span className="text-red-500">*</span>
                </label>
                <Select
                  size="large"
                  placeholder="Select Block"
                  className="w-full rounded-xl"
                  value={form.block || undefined}
                  onChange={(value) => handleBlockChange(value)}
                  options={blockOptions}
                  status={errors.block ? 'error' : undefined}
                />
                {errors.block && <p className="text-red-500 text-xs mt-1">{errors.block}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Classroom Number <span className="text-red-500">*</span>
                </label>
                <Select
                  size="large"
                  placeholder={form.block ? "Select Classroom" : "Select a block first"}
                  className="w-full rounded-xl"
                  value={form.classroomNumber || undefined}
                  onChange={(value) => handleClassroomChange(value)}
                  options={classroomOptions}
                  disabled={!form.block}
                  status={errors.classroomNumber ? 'error' : undefined}
                />
                {errors.classroomNumber && <p className="text-red-500 text-xs mt-1">{errors.classroomNumber}</p>}
              </div>
            </div>
          </div>

          {/* Classification row */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Classification</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Category <span className="text-red-500">*</span>
                </label>
                <Select
                  size="large"
                  placeholder="Select Category"
                  className="w-full"
                  value={form.category || undefined}
                  onChange={(v) => update('category', v)}
                  options={categoryOptions}
                  status={errors.category ? 'error' : undefined}
                  loading={categoriesLoading}
                />
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Priority <span className="text-red-500">*</span>
                </label>
                <Select
                  size="large"
                  placeholder="Select Priority"
                  className="w-full"
                  value={form.priority || undefined}
                  onChange={(v) => update('priority', v)}
                  options={PRIORITY_OPTIONS}
                  status={errors.priority ? 'error' : undefined}
                />
                {errors.priority && <p className="text-red-500 text-xs mt-1">{errors.priority}</p>}
              </div>
            </div>
          </div>

          {/* Details */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Details</p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  size="large"
                  placeholder="Brief title of the issue"
                  className="rounded-xl"
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                  status={errors.title ? 'error' : undefined}
                  maxLength={100}
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Description <span className="text-red-500">*</span>
                </label>
                <TextArea
                  rows={4}
                  placeholder="Describe the issue in detail (min 10 characters)..."
                  className="rounded-xl"
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  status={errors.description ? 'error' : undefined}
                  maxLength={1000}
                  showCount
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>
            </div>
          </div>

          {duplicates.length > 0 && (
            <Alert
              type="info"
              showIcon
              className="mb-4"
              message={
                duplicates.length === 1
                  ? 'A similar complaint has already been reported for this room'
                  : `${duplicates.length} similar complaints have already been reported for this room`
              }
              description={
                <div className="space-y-2">
                  <ul className="list-disc pl-4 space-y-1">
                    {duplicates.map((d) => (
                      <li key={d.id} className="text-sm">
                        <span className="font-medium">{d.title}</span>
                        <span className="text-muted-foreground">
                          {' '}— {d.status.replace(/_/g, ' ').toLowerCase()}, reported{' '}
                          {new Date(d.createdAt).toLocaleDateString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground">
                    If your problem is different, please carry on and submit — this
                    is only a suggestion.
                  </p>
                </div>
              }
            />
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Photos or documents (optional)</label>
            <AttachmentUploader
              key={uploaderKey}
              entityType="COMPLAINT"
              onChange={setAttachmentIds}
              disabled={submitting || !isApproved}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={submitting || !isApproved || categoriesLoading}
            className="w-full h-11 rounded-xl cc-fill-brand text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting ? <Spin size="small" /> : <SendOutlined />}
            {submitting ? 'Submitting…' : 'Submit Complaint'}
          </motion.button>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default RaiseComplaint;