import PageTransition from '@/components/animated/PageTransition';
import { Complaint, ComplaintStatus, User } from '@/types';
import { Button, Input, Modal, Select, Table, Tag, message } from 'antd';
import { motion } from 'framer-motion';
import { useState } from 'react';

const statusColors: Record<ComplaintStatus, string> = { RAISED: 'orange', ASSIGNED: 'cyan', IN_PROGRESS: 'blue', RESOLVED: 'green', CLOSED: 'default' };

const AdminComplaints = () => {
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [assignModal, setAssignModal] = useState<Complaint | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [assignedFaculty, setAssignedFaculty] = useState<string | null>(null);
  
  // TODO: Fetch from backend API
  const faculty: User[] = [];
  const mockComplaints: Complaint[] = [];

  const filtered = mockComplaints.filter((c) => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Room', key: 'room', responsive: ['md' as const], render: (_: unknown, r: Complaint) => `${r.classroomNumber} (Block ${r.block})` },
    { title: 'Type', dataIndex: 'type', key: 'type', responsive: ['lg' as const], render: (c: string) => <Tag>{c.replace('_', ' ')}</Tag> },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: (s: ComplaintStatus) => <Tag color={statusColors[s]}>{s.replace('_', ' ')}</Tag>,
    },
    {
      title: 'Actions', key: 'actions',
      render: (_: unknown, r: Complaint) => (
        <div className="flex gap-2">
          <Button size="small" onClick={() => setSelected(r)}>View</Button>
          <Button size="small" type="primary" onClick={() => { setAssignModal(r); setAssignedFaculty(null); }}>Assign</Button>
        </div>
      ),
    },
  ];

  const handleAssign = () => {
    if (!assignedFaculty) { message.error('Please select a faculty member'); return; }
    message.success(`Assigned to faculty!`);
    setAssignModal(null);
    setAssignedFaculty(null);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Complaint Management</h1>
        <div className="flex gap-3 flex-wrap">
          <Input.Search placeholder="Search complaints..." className="max-w-xs" onChange={(e) => setSearch(e.target.value)} allowClear />
          <Select placeholder="Filter by status" className="min-w-[150px]" allowClear onChange={(v) => setStatusFilter(v || null)} options={(['RAISED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const).map((s) => ({ label: s.replace('_', ' '), value: s }))} />
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-card rounded-2xl border  shadow-sm overflow-hidden">
          <Table dataSource={filtered} columns={columns} rowKey="id" pagination={filtered.length > 10 ? { pageSize: 10 } : false} />
        </motion.div>
        <Modal open={!!selected} onCancel={() => setSelected(null)} footer={null} title={selected?.title} width={500}>
          {selected && (
            <div className="space-y-4">
              <p className="text-muted-foreground">{selected.description}</p>
              <div className="flex gap-2 flex-wrap">
                <Tag>Room {selected.classroomNumber}</Tag>
                <Tag>Block {selected.block}</Tag>
                <Tag>{selected.type.replace('_', ' ')}</Tag>
                <Tag color={statusColors[selected.status]}>{selected.status.replace('_', ' ')}</Tag>
              </div>
              {selected.assignedTo && <p className="text-sm"><strong>Assigned to:</strong> {selected.assignedTo}</p>}
              <p className="text-sm"><strong>Raised by:</strong> {selected.raisedBy}</p>
              <p className="text-sm"><strong>Created:</strong> {new Date(selected.createdAt).toLocaleDateString()}</p>
            </div>
          )}
        </Modal>
        <Modal open={!!assignModal} onCancel={() => setAssignModal(null)} title="Assign Faculty" onOk={handleAssign} okText="Assign">
          <p className="mb-3">Assign a faculty member to: <strong>{assignModal?.title}</strong></p>
          <Select placeholder="Select Faculty" className="w-full" value={assignedFaculty} onChange={setAssignedFaculty} options={faculty.map((f) => ({ label: f.name, value: f.id }))} />
        </Modal>
      </div>
    </PageTransition>
  );
};

export default AdminComplaints;