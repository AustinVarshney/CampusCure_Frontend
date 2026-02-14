import { FileTextOutlined, QuestionCircleOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { List, Tag, Button } from 'antd';
import CountUpStat from '@/components/animated/CountUpStat';
import AnimatedCard from '@/components/animated/AnimatedCard';
import PageTransition from '@/components/animated/PageTransition';
import { mockComplaints, mockDoubts } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const assignedComplaints = mockComplaints.filter((c) => c.assignedTo === '2');
  const unresolvedDoubts = mockDoubts.filter((d) => !d.isResolved);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Faculty Dashboard</h1>
          <p className="text-muted-foreground">Manage complaints and student doubts.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CountUpStat end={assignedComplaints.length} label="Assigned Complaints" icon={<FileTextOutlined style={{ fontSize: 22 }} />} color="hsl(214 100% 50%)" delay={0} />
          <CountUpStat end={assignedComplaints.filter((c) => c.status === 'resolved').length} label="Resolved" icon={<CheckCircleOutlined style={{ fontSize: 22 }} />} color="hsl(142 72% 42%)" delay={0.1} />
          <CountUpStat end={unresolvedDoubts.length} label="Pending Doubts" icon={<QuestionCircleOutlined style={{ fontSize: 22 }} />} color="hsl(38 92% 50%)" delay={0.2} />
          <CountUpStat end={3} label="Verified Answers" icon={<ClockCircleOutlined style={{ fontSize: 22 }} />} color="hsl(270 70% 55%)" delay={0.3} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AnimatedCard delay={0.3}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">Assigned Complaints</h3>
              <Button type="link" onClick={() => navigate('/faculty/complaints')}>View All</Button>
            </div>
            <List
              dataSource={assignedComplaints.slice(0, 3)}
              renderItem={(c) => (
                <List.Item>
                  <div className="flex justify-between w-full">
                    <span className="text-foreground">{c.title}</span>
                    <Tag color={c.status === 'resolved' ? 'green' : c.status === 'in_progress' ? 'blue' : 'orange'}>
                      {c.status.replace('_', ' ')}
                    </Tag>
                  </div>
                </List.Item>
              )}
            />
          </AnimatedCard>

          <AnimatedCard delay={0.4}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">Recent Doubts</h3>
              <Button type="link" onClick={() => navigate('/faculty/doubts')}>View All</Button>
            </div>
            <List
              dataSource={unresolvedDoubts.slice(0, 3)}
              renderItem={(d) => (
                <List.Item>
                  <div className="flex justify-between w-full">
                    <span className="text-foreground">{d.title}</span>
                    <Tag color="purple">{d.answersCount} answers</Tag>
                  </div>
                </List.Item>
              )}
            />
          </AnimatedCard>
        </div>
      </div>
    </PageTransition>
  );
};

export default FacultyDashboard;
