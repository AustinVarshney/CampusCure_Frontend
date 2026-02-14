import { FileTextOutlined, ExclamationCircleOutlined, QuestionCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { List, Tag, Typography } from 'antd';
import CountUpStat from '@/components/animated/CountUpStat';
import AnimatedCard from '@/components/animated/AnimatedCard';
import PageTransition from '@/components/animated/PageTransition';
import { mockComplaints, mockDoubts } from '@/data/mockData';

const { Text } = Typography;

const StudentDashboard = () => {
  const totalComplaints = mockComplaints.length;
  const activeComplaints = mockComplaints.filter((c) => c.status !== 'resolved').length;
  const totalDoubts = mockDoubts.length;
  const resolvedDoubts = mockDoubts.filter((d) => d.isResolved).length;

  const recentActivity = [
    { text: 'You raised a complaint about projector in Room 301', time: '2 hours ago', type: 'complaint' },
    { text: 'Your doubt about binary search was answered', time: '5 hours ago', type: 'doubt' },
    { text: 'Complaint about broken chair was resolved', time: '1 day ago', type: 'resolved' },
    { text: 'You upvoted a doubt about React Virtual DOM', time: '2 days ago', type: 'doubt' },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Student Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your overview.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CountUpStat end={totalComplaints} label="Total Complaints" icon={<FileTextOutlined style={{ fontSize: 22 }} />} color="hsl(214 100% 50%)" delay={0} />
          <CountUpStat end={activeComplaints} label="Active Complaints" icon={<ExclamationCircleOutlined style={{ fontSize: 22 }} />} color="hsl(38 92% 50%)" delay={0.1} />
          <CountUpStat end={totalDoubts} label="Doubts Asked" icon={<QuestionCircleOutlined style={{ fontSize: 22 }} />} color="hsl(270 70% 55%)" delay={0.2} />
          <CountUpStat end={resolvedDoubts} label="Doubts Resolved" icon={<CheckCircleOutlined style={{ fontSize: 22 }} />} color="hsl(142 72% 42%)" delay={0.3} />
        </div>

        <AnimatedCard delay={0.4}>
          <h3 className="text-lg font-semibold mb-4 text-foreground">Recent Activity</h3>
          <List
            dataSource={recentActivity}
            renderItem={(item) => (
              <List.Item className="px-0">
                <div className="flex justify-between w-full items-center">
                  <Text className="text-foreground">{item.text}</Text>
                  <Tag color={item.type === 'resolved' ? 'green' : item.type === 'complaint' ? 'blue' : 'purple'} className="ml-2 shrink-0">
                    {item.time}
                  </Tag>
                </div>
              </List.Item>
            )}
          />
        </AnimatedCard>
      </div>
    </PageTransition>
  );
};

export default StudentDashboard;
