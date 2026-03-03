import PageTransition from '@/components/animated/PageTransition';
import { Complaint, ComplaintStatus } from '@/types';
import { Select, Table, Tag, message } from 'antd';
import { motion } from 'framer-motion';
import { useState } from 'react';

const statusColors: Record<ComplaintStatus, string> = { RAISED: 'orange', ASSIGNED: 'cyan', IN_PROGRESS: 'blue', RESOLVED: 'green', CLOSED: 'default' };

const FacultyComplaints = () => {
  const [statuses, setStatuses] = useState<Record<string, ComplaintStatus>>({});
  
  // TODO: Fetch from backend API
  const assigned: Complaint[] = [];

  const getStatus = (id: string, original: ComplaintStatus) => statuses[id] ?? original;

  const updateStatus = (id: string, newStatus: ComplaintStatus) => {
    setStatuses((prev) => ({ ...prev, [id]: newStatus }));
    message.success(`Complaint ${id} status updated to ${newStatus.replace('_', ' ')}`);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Room', dataIndex: 'classroomNumber', key: 'classroomNumber', responsive: ['md' as const], render: (v: string, r: typeof assigned[0]) => `${v} (Block ${r.block})` },
    { title: 'Category', dataIndex: 'category', key: 'category', responsive: ['lg' as const], render: (c: string) => <Tag>{c.replace('_', ' ')}</Tag> },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: (s: ComplaintStatus, r: typeof assigned[0]) => {
        const current = getStatus(r.id, s);
        return <Tag color={statusColors[current]}>{current.replace('_', ' ')}</Tag>;
      },
    },
    {
      title: 'Action', key: 'action',
      render: (_: unknown, record: typeof assigned[0]) => (
        <Select size="small" value={getStatus(record.id, record.status)} className="w-[140px]" onChange={(v) => updateStatus(record.id, v as ComplaintStatus)} options={(['ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const).map((s) => ({ label: s.replace('_', ' '), value: s }))} />
      ),
    },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assigned Complaints</h1>
          <p className="text-muted-foreground">Manage complaints assigned to you.</p>
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-card rounded-2xl border  shadow-sm overflow-hidden">
          <Table dataSource={assigned} columns={columns} rowKey="id" pagination={false} />
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default FacultyComplaints;