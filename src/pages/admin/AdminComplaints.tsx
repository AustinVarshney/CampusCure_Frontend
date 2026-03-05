import { assignComplaint, getAllComplaints, getApprovedFaculty, updateComplaintStatus } from '@/api/admin';
import PageTransition from '@/components/animated/PageTransition';
import { Complaint, ComplaintStatus, User } from '@/types';
import { Button, Input, Modal, Select, Table, Tag, message } from 'antd';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const statusColors: Record<ComplaintStatus, string> = { RAISED: 'orange', ASSIGNED: 'cyan', IN_PROGRESS: 'blue', RESOLVED: 'green', CLOSED: 'default' };

const AdminComplaints = () => {
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [assignModal, setAssignModal] = useState<Complaint | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [assignedFaculty, setAssignedFaculty] = useState<string | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]); 
  const [faculty, setFaculty] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<ComplaintStatus | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchComplaints();
    fetchFaculty();
  }, []);

  const fetchComplaints = async() => {
    try{
      setLoading(true);
      const data = await getAllComplaints();
      setComplaints(data);
    }catch(e:unknown) {
      const errorMsg = e instanceof Error ? e.message : 'Failed to fetch complaints';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculty = async() => {
    try{
      const data = await getApprovedFaculty();
      console.log("Faculty data:", data);
      setFaculty(data);
    }catch(e:unknown) {
      const errorMsg = e instanceof Error ? e.message : 'Failed to fetch faculty';
      message.error(errorMsg);
    }
  };

  const filtered = complaints.filter((c) => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80, render: (id: string) => id.slice(0, 8) },
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Room', key: 'room', responsive: ['md' as const], render: (_: unknown, r: Complaint) => `${r.classroomNumber} (Block ${r.block})` },
    { title: 'Category', dataIndex: 'category', key: 'category', responsive: ['lg' as const], render: (c: string) => <Tag>{c?.replace('_', ' ')}</Tag> },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: (s: ComplaintStatus) => <Tag color={statusColors[s]}>{s.replace('_', ' ')}</Tag>,
    },
    {
      title: 'Actions', key: 'actions',
      render: (_: unknown, r: Complaint) => (
        <div className="flex gap-2">
          <Button size="small" onClick={() => setSelected(r)}>View</Button>
          {(r.status === 'RAISED' || r.status === 'ASSIGNED') && (
            <Button size="small" type="primary" onClick={() => { setAssignModal(r); setAssignedFaculty(r.assignedTo?.id || null); }}>
              {r.status === 'ASSIGNED' ? 'Reassign' : 'Assign'}
            </Button>
          )}
        </div>
      ),
    },
  ];

  const handleAssign = async () => {
    if (!assignedFaculty) { 
      message.error('Please select a faculty member'); 
      return; 
    }
    if (!assignModal) return;

    try {
      setAssigning(true);
      await assignComplaint(assignModal.id, assignedFaculty);
      message.success('Complaint assigned successfully!');
      setAssignModal(null);
      setAssignedFaculty(null);
      // Refresh complaints list
      await fetchComplaints();
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : 'Failed to assign complaint';
      message.error(errorMsg);
    } finally {
      setAssigning(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selected || !newStatus) {
      message.error('Please select a status');
      return;
    }

    // Validate resolution note for RESOLVED/CLOSED status
    if ((newStatus === 'RESOLVED' || newStatus === 'CLOSED') && !resolutionNote.trim()) {
      message.error('Please provide a resolution note');
      return;
    }

    try {
      setUpdatingStatus(true);
      await updateComplaintStatus(selected.id, newStatus, resolutionNote.trim() || undefined);
      message.success('Complaint status updated successfully!');
      setStatusModalOpen(false);
      setNewStatus(null);
      setResolutionNote('');
      setSelected(null);
      // Refresh complaints list
      await fetchComplaints();
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : 'Failed to update status';
      message.error(errorMsg);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openStatusModal = (complaint: Complaint) => {
    setSelected(complaint);
    setNewStatus(complaint.status);
    setResolutionNote(complaint.resolutionNote || '');
    setStatusModalOpen(true);
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
          <Table 
            dataSource={filtered} 
            columns={columns} 
            rowKey="id" 
            loading={loading}
            pagination={filtered.length > 10 ? { pageSize: 10 } : false} 
          />
        </motion.div>
        <Modal open={!!selected} onCancel={() => setSelected(null)} footer={null} title={selected?.title} width={500}>
          {selected && (
            <div className="space-y-4">
              <p className="text-muted-foreground">{selected.description}</p>
              <div className="flex gap-2 flex-wrap">
                <Tag>Room {selected.classroomNumber}</Tag>
                <Tag>Block {selected.block}</Tag>
                {selected.category && <Tag>{selected.category.replace('_', ' ')}</Tag>}
                <Tag color={statusColors[selected.status]}>{selected.status.replace('_', ' ')}</Tag>
              </div>
              {selected.assignedTo && (
                <p className="text-sm">
                  <strong>Assigned to:</strong> {selected.assignedTo.name} ({selected.assignedTo.email})
                  {selected.assignedTo.facultyProfile && ` - ${selected.assignedTo.facultyProfile.department}`}
                </p>
              )}
              <p className="text-sm">
                <strong>Raised by:</strong> {selected.raisedBy.name} ({selected.raisedBy.email})
                {selected.raisedBy.studentProfile && (
                  <span> - {selected.raisedBy.studentProfile.department}, {selected.raisedBy.studentProfile.branch}</span>
                )}
              </p>
              {selected.resolutionNote && (
                <p className="text-sm">
                  <strong>Resolution Note:</strong> {selected.resolutionNote}
                </p>
              )}
              <p className="text-sm"><strong>Created:</strong> {new Date(selected.createdAt).toLocaleDateString()}</p>
              <div className="flex gap-2 justify-end mt-4">
                <Button onClick={() => setSelected(null)}>Close</Button>
                <Button type="primary" onClick={() => openStatusModal(selected)}>
                  Change Status
                </Button>
              </div>
            </div>
          )}
        </Modal>
        <Modal 
          open={!!assignModal} 
          onCancel={() => setAssignModal(null)} 
          title="Assign Faculty" 
          onOk={handleAssign} 
          okText="Assign"
          confirmLoading={assigning}
        >
          <p className="mb-3">Assign a faculty member to: <strong>{assignModal?.title}</strong></p>
          <Select 
            placeholder="Select Faculty" 
            className="w-full" 
            value={assignedFaculty} 
            onChange={setAssignedFaculty} 
            options={faculty.map((f) => ({ label: `${f.name} (${f.email})`, value: f.id }))} 
          />
        </Modal>
        <Modal
          open={statusModalOpen}
          onCancel={() => {
            setStatusModalOpen(false);
            setNewStatus(null);
            setResolutionNote('');
          }}
          title="Update Complaint Status"
          onOk={handleStatusUpdate}
          okText="Update Status"
          confirmLoading={updatingStatus}
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
                options={(['RAISED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const).map((s) => ({
                  label: s.replace('_', ' '),
                  value: s,
                }))}
              />
            </div>
            {(newStatus === 'RESOLVED' || newStatus === 'CLOSED') && (
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
          </div>
        </Modal>
      </div>
    </PageTransition>
  );
};

export default AdminComplaints;