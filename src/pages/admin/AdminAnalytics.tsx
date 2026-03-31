import { getAnalytics, type AnalyticsData } from '@/api/admin';
import AutoRoutingDashboard from '@/components/admin/AutoRoutingDashboard';
import PageTransition from '@/components/animated/PageTransition';
import { useIsMobile } from '@/hooks/use-mobile';
import { BarChartOutlined, FileTextOutlined, RiseOutlined, TeamOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const COLORS = ['#1677FF', '#52c41a', '#fa8c16', '#722ed1', '#eb2f96', '#13c2c2'];

const AdminAnalytics = () => {
  const isMobile = useIsMobile();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    complaintsByMonth: [],
    resolutionTime: [],
    complaintsByDept: [],
    complaintsByType: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await getAnalytics();
        setAnalyticsData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center h-96">
          <Spin size="large" />
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600">
            {error}
          </div>
        </div>
      </PageTransition>
    );
  }

  const hasTrendData = analyticsData.complaintsByMonth.some((item) => (item.complaints ?? 0) > 0 || (item.resolved ?? 0) > 0);
  const hasResolutionData = analyticsData.resolutionTime.some((item) => (item.avgDays ?? 0) > 0);
  const hasDepartmentData = analyticsData.complaintsByDept.some((item) => (item.count ?? 0) > 0);
  const hasCategoryData = analyticsData.complaintsByType.some((item) => (item.value ?? 0) > 0);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-linear-to-br from-slate-900 via-blue-950 to-indigo-950 p-7 text-white shadow-xl"
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[32px_32px]" />
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-cyan-500/10" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center shrink-0">
              <BarChartOutlined className="text-cyan-300 text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Analytics</h1>
              <p className="text-cyan-200/70 text-xs mt-0.5">Complaint trends and resolution insights</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl border p-4 sm:p-6 shadow-sm">
            <h3 className="font-semibold text-foreground mb-4">Complaints Trend</h3>
            {hasTrendData ? (
              <ResponsiveContainer width="100%" height={isMobile ? 220 : 260}>
                <BarChart data={analyticsData.complaintsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 91%)" />
                  <XAxis dataKey="month" tick={{ fontSize: isMobile ? 11 : 12 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: isMobile ? 11 : 12 }} width={isMobile ? 28 : 36} />
                  <Tooltip />
                  <Bar dataKey="complaints" fill="#1677FF" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="resolved" fill="#52c41a" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-65 flex flex-col items-center justify-center text-center gap-2">
                <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center">
                  <RiseOutlined className="text-xl text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No trend data available</p>
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-2xl border p-4 sm:p-6 shadow-sm">
            <h3 className="font-semibold text-foreground mb-4">Resolution Time (Avg Days)</h3>
            {hasResolutionData ? (
              <ResponsiveContainer width="100%" height={isMobile ? 220 : 260}>
                <LineChart data={analyticsData.resolutionTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 91%)" />
                  <XAxis dataKey="month" tick={{ fontSize: isMobile ? 11 : 12 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: isMobile ? 11 : 12 }} width={isMobile ? 28 : 36} />
                  <Tooltip />
                  <Line type="monotone" dataKey="avgDays" stroke="#1677FF" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-65 flex flex-col items-center justify-center text-center gap-2">
                <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center">
                  <BarChartOutlined className="text-xl text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No resolution data available</p>
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card rounded-2xl border p-4 sm:p-6 shadow-sm">
            <h3 className="font-semibold text-foreground mb-4">By Department</h3>
            {hasDepartmentData ? (
              <ResponsiveContainer width="100%" height={isMobile ? 230 : 260}>
                <BarChart
                    data={analyticsData.complaintsByDept}
                    layout="vertical"
                    margin={isMobile ? { top: 0, right: 12, left: 12, bottom: 24 } : { top: 0, right: 30, left: 30, bottom: 30 }}
                  >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 91%)" />
                  <XAxis
                    type="number"
                    label={{ value: 'Count', position: 'insideBottom', offset: -15, fontSize: 15 }}
                    tick={{ fontSize: isMobile ? 11 : 12 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="dept"
                    width={1}
                    tick={false}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#722ed1" radius={[0, 6, 6, 0]}>
                    <LabelList
                      dataKey="dept"
                      position="insideLeft"
                      offset={8}
                      style={{ fill: 'white', fontSize: 12, fontWeight: 500 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-65 flex flex-col items-center justify-center text-center gap-2">
                <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center">
                  <TeamOutlined className="text-xl text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No department data available</p>
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card rounded-2xl border p-4 sm:p-6 shadow-sm">
            <h3 className="font-semibold text-foreground mb-4">By Issue Type</h3>
            {hasCategoryData ? (
              <ResponsiveContainer width="100%" height={isMobile ? 230 : 260}>
                <PieChart>
                  <Pie
                    data={analyticsData.complaintsByType}
                    cx="50%"
                    cy="50%"
                    outerRadius={isMobile ? 72 : 90}
                    dataKey="value"
                    label={!isMobile}
                  >
                    {analyticsData.complaintsByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-65 flex flex-col items-center justify-center text-center gap-2">
                <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center">
                  <FileTextOutlined className="text-xl text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No category data available</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Auto-Routing Dashboard */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.5 }}
          className="bg-card rounded-2xl border p-4 sm:p-6 shadow-sm"
        >
          <h3 className="font-semibold text-foreground mb-4">Auto-Routing System</h3>
          <AutoRoutingDashboard />
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default AdminAnalytics;