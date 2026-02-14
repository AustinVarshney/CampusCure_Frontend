import { FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, TeamOutlined } from '@ant-design/icons';
import CountUpStat from '@/components/animated/CountUpStat';
import PageTransition from '@/components/animated/PageTransition';
import { mockComplaints, mockDoubts, analyticsData } from '@/data/mockData';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#1677FF', '#52c41a', '#fa8c16', '#722ed1', '#eb2f96', '#13c2c2'];

const AdminDashboard = () => (
  <PageTransition>
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of campus management.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CountUpStat end={mockComplaints.length} label="Total Complaints" icon={<FileTextOutlined style={{ fontSize: 22 }} />} color="hsl(214 100% 50%)" delay={0} />
        <CountUpStat end={mockComplaints.filter((c) => c.status === 'resolved').length} label="Resolved" icon={<CheckCircleOutlined style={{ fontSize: 22 }} />} color="hsl(142 72% 42%)" delay={0.1} />
        <CountUpStat end={mockComplaints.filter((c) => c.status === 'pending').length} label="Pending" icon={<ClockCircleOutlined style={{ fontSize: 22 }} />} color="hsl(38 92% 50%)" delay={0.2} />
        <CountUpStat end={mockDoubts.length} label="Total Doubts" icon={<TeamOutlined style={{ fontSize: 22 }} />} color="hsl(270 70% 55%)" delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <h3 className="font-semibold text-foreground mb-4">Complaints by Month</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={analyticsData.complaintsByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 91%)" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="complaints" fill="#1677FF" radius={[6, 6, 0, 0]} />
              <Bar dataKey="resolved" fill="#52c41a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <h3 className="font-semibold text-foreground mb-4">Complaints by Type</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={analyticsData.complaintsByType} cx="50%" cy="50%" outerRadius={90} dataKey="value" label>
                {analyticsData.complaintsByType.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  </PageTransition>
);

export default AdminDashboard;
