import PageTransition from '@/components/animated/PageTransition';
import { motion } from 'framer-motion';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const COLORS = ['#1677FF', '#52c41a', '#fa8c16', '#722ed1', '#eb2f96', '#13c2c2'];

// TODO: Fetch from backend API
const analyticsData = {
  complaintsByMonth: [],
  resolutionTime: [],
  complaintsByDept: [],
  complaintsByType: [],
};

const AdminAnalytics = () => (
  <PageTransition>
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl border  p-6 shadow-sm">
          <h3 className="font-semibold text-foreground mb-4">Complaints Trend</h3>
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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-2xl border  p-6 shadow-sm">
          <h3 className="font-semibold text-foreground mb-4">Resolution Time (Avg Days)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={analyticsData.resolutionTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 91%)" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="avgDays" stroke="#1677FF" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card rounded-2xl border  p-6 shadow-sm">
          <h3 className="font-semibold text-foreground mb-4">By Department</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={analyticsData.complaintsByDept} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 91%)" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="dept" width={40} />
              <Tooltip />
              <Bar dataKey="count" fill="#722ed1" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card rounded-2xl border  p-6 shadow-sm">
          <h3 className="font-semibold text-foreground mb-4">By Issue Type</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={analyticsData.complaintsByType} cx="50%" cy="50%" outerRadius={90} dataKey="value" label>
                {analyticsData.complaintsByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
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

export default AdminAnalytics;