import { assignedComplaints } from '@/api/faculty';
import PageTransition from '@/components/animated/PageTransition';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Complaint, ComplaintStatus } from '@/types';
import { ClockCircleOutlined } from '@ant-design/icons';
import { Alert, Select, Table, Tag, message } from 'antd';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const statusColors: Record<ComplaintStatus, string> = { RAISED: 'orange', ASSIGNED: 'cyan', IN_PROGRESS: 'blue', RESOLVED: 'green', CLOSED: 'default' };

const FacultyComplaints = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const isApproved = user?.approvalStatus === 'APPROVED';
  const [statuses, setStatuses] = useState<Record<string, ComplaintStatus>>({});
  const [assigned, setAssigned] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);

  const getStatus = (id: string, original: ComplaintStatus) => statuses[id] ?? original;

  const updateStatus = (id: string, newStatus: ComplaintStatus) => {
    setStatuses((prev) => ({ ...prev, [id]: newStatus }));
    message.success(`Complaint ${id} status updated to ${newStatus.replace('_', ' ')}`);
  };

  useEffect(() => {

    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const result = await assignedComplaints();
      setAssigned(result);
      } catch (e: unknown) {
        console.error("Error fetching assigned complaints:", e);
        message.error(e instanceof Error ? e.message : 'Failed to fetch assigned complaints');
      } finally {
        setLoading(false);
      }
    } 
    fetchComplaints();
  }, []);

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (value: string) => <span className="block max-w-55 sm:max-w-none truncate">{value}</span>,
    },
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
        <Select size="small" disabled={!isApproved} value={getStatus(record.id, record.status)} className="w-30" onChange={(v) => updateStatus(record.id, v as ComplaintStatus)} options={(['ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const).map((s) => ({ label: s.replace('_', ' '), value: s }))} />
      ),
    },
  ];

  return (
    <PageTransition>
      <div className="dashboard-surface space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assigned Complaints</h1>
          <p className="text-muted-foreground">Manage complaints assigned to you.</p>
        </div>
        {!isApproved && (
          <Alert
            type="warning"
            icon={<ClockCircleOutlined />}
            showIcon
            message="Account Pending Approval"
            description="You can view assigned complaints, but updating status is disabled until your account is approved."
            className="rounded-xl"
          />
        )}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-card rounded-2xl border  shadow-sm overflow-hidden mt-4">
          {isMobile ? (
            <div className="space-y-3 p-3">
              {assigned.length === 0 ? (
                <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">No assigned complaints found.</div>
              ) : (
                assigned.map((complaint) => {
                  const current = getStatus(complaint.id, complaint.status);
                  return (
                    <div key={complaint.id} className="rounded-xl border p-3 space-y-3">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">{complaint.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {complaint.classroomNumber} (Block {complaint.block})
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <Tag>{(complaint.category ?? 'GENERAL').replace('_', ' ')}</Tag>
                        <Tag color={statusColors[current]}>{current.replace('_', ' ')}</Tag>
                      </div>
                      <Select
                        size="small"
                        disabled={!isApproved}
                        value={current}
                        className="w-full"
                        onChange={(v) => updateStatus(complaint.id, v as ComplaintStatus)}
                        options={(['ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const).map((s) => ({ label: s.replace('_', ' '), value: s }))}
                      />
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <Table dataSource={assigned} columns={columns} rowKey="id" size="small" pagination={false} />
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-3 items-center">
                  <Skeleton className="col-span-5 h-4" />
                  <Skeleton className="col-span-2 h-4 hidden md:block" />
                  <Skeleton className="col-span-2 h-4 hidden lg:block" />
                  <Skeleton className="col-span-2 h-6 rounded-full" />
                  <Skeleton className="col-span-3 md:col-span-1 h-8 rounded-md" />
                </div>
              ))}
            </div>
          ) : (
            <Table dataSource={assigned} columns={columns} rowKey="id" size="small" pagination={false} scroll={{ x: 640 }} />
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default FacultyComplaints;