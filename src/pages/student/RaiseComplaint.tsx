import { getStudentPostingSettings, raiseComplaint } from '@/api/student';
import PageTransition from '@/components/animated/PageTransition';
import { useAuth } from '@/context/AuthContext';
import blockClassroomData from '@/data/block_classroom.json';
import { CheckCircleOutlined, ClockCircleOutlined, SendOutlined } from '@ant-design/icons';
import { Alert, Input, message, Select, Spin } from 'antd';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';

const { TextArea } = Input;

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
  const [isBlockValid, setIsBlockValid] = useState(false);
  const [isClassroomValid, setIsClassroomValid] = useState(false);

  // Validation functions
  const validateBlock = (blockValue: string): boolean => {
    return blockValue.trim() !== '' && blockValue in blockClassroomData;
  };

  const validateClassroom = (blockValue: string, classroomValue: string): boolean => {
    if (!validateBlock(blockValue) || classroomValue.trim() === '') {
      return false;
    }
    const blockData = blockClassroomData[blockValue as keyof typeof blockClassroomData];
    return blockData && blockData.classrooms.includes(classroomValue.toUpperCase());
  };

  const handleBlockChange = (value: string) => {
    update('block', value);
    const valid = validateBlock(value);
    setIsBlockValid(valid);
    // Reset classroom when block changes
    if (!valid) {
      update('classroomNumber', '');
      setIsClassroomValid(false);
    }
  };

  const handleClassroomChange = (value: string) => {
    update('classroomNumber', value);
    const valid = validateClassroom(form.block, value);
    setIsClassroomValid(valid);
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

  const categoryOptions = useMemo(
    () => allowedCategories.map((category) => ({ label: category.replace(/_/g, ' '), value: category })),
    [allowedCategories],
  );

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
      });
      
      message.success('Complaint submitted successfully! You can track it in My Complaints.');
      setForm({ classroomNumber: '', block: '', category: '', title: '', description: '', priority: '' });
      setErrors({});
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
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-slate-900 via-blue-950 to-indigo-950 p-6 text-white">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[40px_40px]" />
          <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-cyan-600/15 blur-2xl" />
          <div className="relative flex gap-4">
            <div className="inline-flex h-10 w-10 rounded-xl bg-linear-to-br from-[#041A47] via-[#00639B] to-[#009BB0] items-center justify-center mb-3 shadow-md shadow-cyan-600/30">
              <SendOutlined style={{ fontSize: 16, color: 'white' }} />
            </div>
            <div>
              
            <h1 className="text-xl font-bold">Raise a Complaint</h1>
            <p className="text-cyan-200/70 text-sm mt-0.5">Report classroom or facility issues to the administration</p>
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
                <div className="relative">
                  <Input
                    size="large"
                    placeholder="e.g. ML, NL"
                    className="rounded-xl pr-10"
                    value={form.block}
                    onChange={(e) => handleBlockChange(e.target.value.toUpperCase())}
                    status={errors.block ? 'error' : undefined}
                  />
                  {isBlockValid && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <CheckCircleOutlined className="text-emerald-500 text-lg" style={{ fontSize: '20px' }} />
                    </motion.div>
                  )}
                </div>
                {errors.block && <p className="text-red-500 text-xs mt-1">{errors.block}</p>}
              </div>

              {isBlockValid && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Classroom Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      size="large"
                      placeholder="e.g. ML01, NL20"
                      className="rounded-xl pr-10"
                      value={form.classroomNumber}
                      onChange={(e) => handleClassroomChange(e.target.value.toUpperCase())}
                      status={errors.classroomNumber ? 'error' : undefined}
                    />
                    {isClassroomValid && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        <CheckCircleOutlined className="text-emerald-500 text-lg" style={{ fontSize: '20px' }} />
                      </motion.div>
                    )}
                  </div>
                  {errors.classroomNumber && <p className="text-red-500 text-xs mt-1">{errors.classroomNumber}</p>}
                </div>
              )}

              {!isBlockValid && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Classroom Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    size="large"
                    placeholder="Select a valid block first"
                    className="rounded-xl"
                    disabled
                  />
                </div>
              )}
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

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={submitting || !isApproved || categoriesLoading}
            className="w-full h-11 rounded-xl bg-linear-to-r from-[#041A47] via-[#00639B] to-[#009BB0] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-cyan-600/20"
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