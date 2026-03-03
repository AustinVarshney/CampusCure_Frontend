import PageTransition from '@/components/animated/PageTransition';
import { Doubt } from '@/types';
import { EyeOutlined, LikeOutlined, MessageOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Empty, Input, Modal, Select, Tag, message } from 'antd';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

const { TextArea } = Input;

const doubtSchema = z.object({
  title: z.string().trim().min(10, 'Title must be at least 10 characters').max(200, 'Title too long'),
  description: z.string().trim().min(20, 'Description must be at least 20 characters').max(2000, 'Description too long'),
  subject: z.enum(['DSA', 'DBMS', 'OS', 'NETWORKS'] as const, { errorMap: () => ({ message: 'Subject is required' }) }),
  semester: z.number().min(1, 'Semester must be 1-8').max(8),
  labels: z.string().optional(),
});

const statusColors: Record<string, string> = { OPEN: 'orange', ANSWERED: 'blue', RESOLVED: 'green' };
const doubtSubjects = ['DSA', 'DBMS', 'OS', 'NETWORKS', 'CN', 'TOC', 'COA'];

const DoubtCommunity = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  const [askModal, setAskModal] = useState(false);
  const [newDoubt, setNewDoubt] = useState({ title: '', description: '', subject: '', semester: '', labels: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [upvoted, setUpvoted] = useState<Set<string>>(new Set());

  // TODO: Replace with actual API call to fetch doubts
  const doubts: Doubt[] = [];

  const filtered = doubts.filter((d) => {
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase());
    const matchSubject = !subjectFilter || d.subject === subjectFilter;
    return matchSearch && matchSubject;
  });

  const getUserName = (_userId: string) => {
    // TODO: Replace with actual user name lookup
    return 'Student';
  };

  const handleAsk = () => {
    const result = doubtSchema.safeParse({ ...newDoubt, semester: Number(newDoubt.semester) || 0 });
    if (!result.success) {
      const e: Record<string, string> = {};
      result.error.errors.forEach((err) => { e[err.path[0] as string] = err.message; });
      setFormErrors(e);
      return;
    }
    message.success('Your doubt has been posted!');
    setNewDoubt({ title: '', description: '', subject: '', semester: '', labels: '' });
    setFormErrors({});
    setAskModal(false);
  };

  const toggleUpvote = (id: string) => {
    setUpvoted((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };

  const updateField = (field: string, value: string) => {
    setNewDoubt((p) => ({ ...p, [field]: value }));
    if (formErrors[field]) setFormErrors((p) => { const n = { ...p }; delete n[field]; return n; });
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Doubt Community</h1>
            <p className="text-muted-foreground">Ask, answer, and learn together.</p>
          </div>
          <Button type="primary" icon={<PlusOutlined />} className="rounded-xl" onClick={() => setAskModal(true)}>Ask a Doubt</Button>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Input.Search placeholder="Search doubts..." className="max-w-xs" onChange={(e) => setSearch(e.target.value)} allowClear />
          <Select placeholder="Filter by subject" className="min-w-[140px]" allowClear onChange={(v) => setSubjectFilter(v || null)} options={doubtSubjects.map((s) => ({ label: s, value: s }))} />
        </div>

        <div className="space-y-3">
          {filtered.length === 0 && <Empty description="No doubts found" />}
          {filtered.map((doubt, i) => (
            <motion.div key={doubt.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} whileHover={{ scale: 1.01, boxShadow: '0 4px 20px rgba(22,119,255,0.08)' }} className="bg-card rounded-2xl border  p-5 cursor-pointer transition" onClick={() => navigate(`/student/doubts/${doubt.id}`)}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-base">{doubt.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{doubt.description}</p>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    <Tag color="purple">{doubt.subject}</Tag>
                    <Tag>Sem {doubt.semester}</Tag>
                    {doubt.labels?.map((label) => <Tag key={label} color="blue" className="rounded-full text-xs">{label}</Tag>)}
                  </div>
                </div>
                <Tag color={statusColors[doubt.status]}>{doubt.status}</Tag>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span className={`flex items-center gap-1 cursor-pointer hover:text-primary transition ${upvoted.has(doubt.id) ? 'text-primary font-semibold' : ''}`} onClick={(e) => { e.stopPropagation(); toggleUpvote(doubt.id); }}>
                  <LikeOutlined /> {doubt.upVoteCount + (upvoted.has(doubt.id) ? 1 : 0)}
                </span>
                <span className="flex items-center gap-1"><MessageOutlined /> {doubt.answerCount} answers</span>
                <span className="flex items-center gap-1"><EyeOutlined /> {doubt.views} views</span>
                <span>by {getUserName(doubt.postedBy)}</span>
                <span>{doubt.createdAt}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <Modal open={askModal} onCancel={() => { setAskModal(false); setFormErrors({}); }} title="Ask a Doubt" onOk={handleAsk} okText="Post Doubt">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Title *</label>
              <Input placeholder="What's your question? (min 10 chars)" value={newDoubt.title} onChange={(e) => updateField('title', e.target.value)} status={formErrors.title ? 'error' : undefined} maxLength={200} />
              {formErrors.title && <p className="text-xs text-destructive mt-1">{formErrors.title}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Description *</label>
              <TextArea rows={4} placeholder="Provide more details (min 20 chars)..." value={newDoubt.description} onChange={(e) => updateField('description', e.target.value)} status={formErrors.description ? 'error' : undefined} maxLength={2000} showCount />
              {formErrors.description && <p className="text-xs text-destructive mt-1">{formErrors.description}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Subject *</label>
                <Select placeholder="Select Subject" className="w-full" value={newDoubt.subject || undefined} onChange={(v) => updateField('subject', v)} options={doubtSubjects.map((s) => ({ label: s, value: s }))} status={formErrors.subject ? 'error' : undefined} />
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
              <Input placeholder="e.g. Sorting, Complexity, Searching" value={newDoubt.labels} onChange={(e) => updateField('labels', e.target.value)} />
            </div>
          </div>
        </Modal>
      </div>
    </PageTransition>
  );
};

export default DoubtCommunity;