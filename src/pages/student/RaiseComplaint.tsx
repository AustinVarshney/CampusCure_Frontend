import PageTransition from '@/components/animated/PageTransition';
import { SendOutlined } from '@ant-design/icons';
import { Button, Input, message, Select } from 'antd';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { z } from 'zod';

const { TextArea } = Input;

const complaintSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(100, 'Title too long'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(1000, 'Description too long'),
  category: z.enum(['PROJECTOR', 'FAN', 'LIGHT', 'SMART_BOARD', 'SEATING'] as const, { errorMap: () => ({ message: 'Category is required' }) }),
  classroomNumber: z.string().trim().min(1, 'Classroom number is required').max(20, 'Classroom number too long'),
  block: z.string().min(1, 'Block is required'),
  priority: z.number().min(1, 'Priority is required').max(5),
});

const blocks = ['A', 'B', 'C', 'D', 'E'];
const complaintCategories = ['PROJECTOR', 'FAN', 'LIGHT', 'SMART_BOARD', 'SEATING', 'FURNITURE', 'NETWORK', 'OTHER'];

const RaiseComplaint = () => {
  const [form, setForm] = useState({ classroomNumber: '', block: '', category: '', title: '', description: '', priority: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    const result = complaintSchema.safeParse({ ...form, priority: Number(form.priority) || 0 });
    if (!result.success) {
      const e: Record<string, string> = {};
      result.error.errors.forEach((err) => { e[err.path[0] as string] = err.message; });
      setErrors(e);
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      message.success('Complaint submitted successfully! You can track it in My Complaints.');
      setForm({ classroomNumber: '', block: '', category: '', title: '', description: '', priority: '' });
      setErrors({});
      setSubmitting(false);
    }, 800);
  };

  const update = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => { const n = { ...p }; delete n[field]; return n; });
  };

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Raise a Complaint</h1>
          <p className="text-muted-foreground">Report classroom or facility issues.</p>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl border  p-6 shadow-sm space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Classroom Number *</label>
              <Input size="large" placeholder="e.g. 301, LH-A" className="rounded-xl" value={form.classroomNumber} onChange={(e) => update('classroomNumber', e.target.value)} status={errors.classroomNumber ? 'error' : undefined} />
              {errors.classroomNumber && <p className="text-xs text-destructive mt-1">{errors.classroomNumber}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Block *</label>
              <Select size="large" placeholder="Select Block" className="w-full" value={form.block || undefined} onChange={(v) => update('block', v)} options={blocks.map((b) => ({ label: `Block ${b}`, value: b }))} status={errors.block ? 'error' : undefined} />
              {errors.block && <p className="text-xs text-destructive mt-1">{errors.block}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Category *</label>
              <Select size="large" placeholder="Select Category" className="w-full" value={form.category || undefined} onChange={(v) => update('category', v)} options={complaintCategories.map((c) => ({ label: c.replace('_', ' '), value: c }))} status={errors.category ? 'error' : undefined} />
              {errors.category && <p className="text-xs text-destructive mt-1">{errors.category}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Priority (1-5) *</label>
              <Select size="large" placeholder="Select Priority" className="w-full" value={form.priority || undefined} onChange={(v) => update('priority', v)} options={[
                { label: '1 - Low', value: '1' },
                { label: '2 - Minor', value: '2' },
                { label: '3 - Medium', value: '3' },
                { label: '4 - High', value: '4' },
                { label: '5 - Critical', value: '5' },
              ]} status={errors.priority ? 'error' : undefined} />
              {errors.priority && <p className="text-xs text-destructive mt-1">{errors.priority}</p>}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Title *</label>
            <Input size="large" placeholder="Brief title of the issue" className="rounded-xl" value={form.title} onChange={(e) => update('title', e.target.value)} status={errors.title ? 'error' : undefined} maxLength={100} />
            {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Description *</label>
            <TextArea rows={4} placeholder="Describe the issue in detail (min 10 characters)..." className="rounded-xl" value={form.description} onChange={(e) => update('description', e.target.value)} status={errors.description ? 'error' : undefined} maxLength={1000} showCount />
            {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
          </div>

          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
            <Button type="primary" size="large" block icon={<SendOutlined />} onClick={handleSubmit} loading={submitting} className="rounded-xl h-11 font-semibold">
              Submit Complaint
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default RaiseComplaint;