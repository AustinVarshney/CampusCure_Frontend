import PageTransition from '@/components/animated/PageTransition';
import { Complaint, ComplaintStatus } from '@/types';
import { Input, Modal, Select, Table, Tag } from 'antd';
import { motion } from 'framer-motion';
import { useState } from 'react';

const statusColors: Record<ComplaintStatus, string> = {
  RAISED: 'orange',
  ASSIGNED: 'cyan',
  IN_PROGRESS: 'blue',
  RESOLVED: 'green',
  CLOSED: 'default',
};

const priorityColors: Record<number, string> = { 1: 'default', 2: 'blue', 3: 'orange', 4: 'red', 5: 'magenta' };

const MyComplaints = () => {
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // TODO: Replace with actual API call to fetch user's complaints
  const complaints: Complaint[] = [];

  const filtered = complaints.filter((c) => {
    const matchStatus = !statusFilter || c.status === statusFilter;
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const getUserName = (_userId: string) => {
    // TODO: Replace with actual user name lookup
    return 'Staff Member';
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Room', dataIndex: 'classroomNumber', key: 'classroomNumber', responsive: ['md' as const] },
    { title: 'Block', dataIndex: 'block', key: 'block', responsive: ['md' as const], render: (b: string) => `Block ${b}` },
    { title: 'Category', dataIndex: 'category', key: 'category', responsive: ['lg' as const], render: (c: string) => <Tag>{c.replace('_', ' ')}</Tag> },
    { title: 'Priority', dataIndex: 'priority', key: 'priority', responsive: ['lg' as const], render: (p: number) => <Tag color={priorityColors[p]}>{p}</Tag> },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: (status: ComplaintStatus) => <Tag color={statusColors[status]}>{status.replace('_', ' ')}</Tag>,
    },
    { title: 'Date', dataIndex: 'createdAt', key: 'createdAt', responsive: ['md' as const] },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Complaints</h1>
          <p className="text-muted-foreground">Track the status of your complaints.</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Input.Search placeholder="Search complaints..." className="max-w-xs" onChange={(e) => setSearch(e.target.value)} allowClear />
          <Select placeholder="Filter by status" className="min-w-[150px]" allowClear onChange={(v) => setStatusFilter(v || null)} options={(['RAISED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const).map((s) => ({ label: s.replace('_', ' '), value: s }))} />
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-card rounded-2xl border  shadow-sm overflow-hidden">
          <Table dataSource={filtered} columns={columns} rowKey="id" onRow={(record) => ({ onClick: () => setSelected(record), className: 'cursor-pointer hover:bg-accent/50 transition' })} pagination={filtered.length > 10 ? { pageSize: 10 } : false} locale={{ emptyText: 'No complaints found' }} />
        </motion.div>
        <Modal open={!!selected} onCancel={() => setSelected(null)} footer={null} title={selected?.title} width={500}>
          {selected && (
            <div className="space-y-4">
              <p className="text-muted-foreground">{selected.description}</p>
              <div className="flex gap-2 flex-wrap">
                <Tag>Room {selected.classroomNumber}</Tag>
                <Tag>Block {selected.block}</Tag>
                {selected.category && <Tag>{selected.category.replace('_', ' ')}</Tag>}
                {selected.priority && <Tag color={priorityColors[selected.priority]}>Priority {selected.priority}</Tag>}
                <Tag color={statusColors[selected.status]}>{selected.status.replace('_', ' ')}</Tag>
              </div>
              {selected.assignedTo && <p className="text-sm"><strong>Assigned to:</strong> {getUserName(selected.assignedTo)}</p>}
              {selected.resolutionNote && <p className="text-sm"><strong>Resolution:</strong> {selected.resolutionNote}</p>}
              {selected.feedbackRating && <p className="text-sm"><strong>Feedback Rating:</strong> {selected.feedbackRating}/5</p>}
            </div>
          )}
        </Modal>
      </div>
    </PageTransition>
  );
};

export default MyComplaints;