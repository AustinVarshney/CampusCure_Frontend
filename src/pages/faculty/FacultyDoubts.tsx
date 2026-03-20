import PageTransition from '@/components/animated/PageTransition';
import { Skeleton } from '@/components/ui/skeleton';
import { Doubt } from '@/types';
import { getDoubts } from '@/api/faculty';
import { getStudentPostingSettings } from '@/api/student';
import { useAuth } from '@/context/AuthContext';
import { CheckCircleOutlined, EyeOutlined, MessageOutlined } from '@ant-design/icons';
import { Button, Empty, Input, Select, Tag, message } from 'antd';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const statusColors: Record<string, string> = { OPEN: 'orange', ANSWERED: 'blue', RESOLVED: 'green' };
const fallbackDoubtSubjects = ['DSA', 'DBMS', 'OS', 'NETWORKS'];

const FacultyDoubts = () => {
  useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [myAnsweredOnly, setMyAnsweredOnly] = useState(false);
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(false);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [doubtSubjects, setDoubtSubjects] = useState<string[]>(fallbackDoubtSubjects);

  useEffect(() => {
    fetchDoubts();
    fetchPostingSettings();
  }, []);

  const fetchPostingSettings = async () => {
    try {
      setSubjectsLoading(true);
      const settings = await getStudentPostingSettings();
      setDoubtSubjects(
        settings.doubtSubjects.length > 0
          ? settings.doubtSubjects
          : fallbackDoubtSubjects,
      );
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Failed to load subjects');
    } finally {
      setSubjectsLoading(false);
    }
  };

  const fetchDoubts = async (answeredByMe = false) => {
    try {
      setLoading(true);
      const data = await getDoubts(answeredByMe ? { myAnswered: true } : undefined);
      setDoubts(data);
    } catch (error) {
      message.error('Failed to fetch doubts');
    } finally {
      setLoading(false);
    }
  };

  const handleMyAnsweredToggle = () => {
    const next = !myAnsweredOnly;
    setMyAnsweredOnly(next);
    fetchDoubts(next);
  };

  const filtered = doubts.filter((d) => {
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase());
    const matchSubject = !subjectFilter || d.subject === subjectFilter;
    const matchStatus = !statusFilter || d.status === statusFilter;
    return matchSearch && matchSubject && matchStatus;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    if (diffMins < 10080) return `${Math.floor(diffMins / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Doubt Management</h1>
          <p className="text-muted-foreground">Answer and verify student doubts.</p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Input.Search 
            placeholder="Search doubts..." 
            className="w-full sm:max-w-xs placeholder-gray-800! placeholder:font-medium" 
            onChange={(e) => setSearch(e.target.value)} 
            allowClear 
          />
          <Select 
            placeholder="Filter by subject" 
            className="w-full sm:min-w-35 sm:w-auto [&_.ant-select-selection-placeholder]:text-gray-800! [&_.ant-select-selection-placeholder]:opacity-100 [&_.ant-select-selection-placeholder]:font-medium" 
            allowClear 
            onChange={(v) => setSubjectFilter(v || null)} 
            options={doubtSubjects.map((s) => ({ label: s, value: s }))}
            loading={subjectsLoading}
          />
          <Select 
            placeholder="Filter by status" 
            className="w-full sm:min-w-35 sm:w-auto [&_.ant-select-selection-placeholder]:text-gray-800! [&_.ant-select-selection-placeholder]:opacity-100 [&_.ant-select-selection-placeholder]:font-medium" 
            allowClear 
            onChange={(v) => setStatusFilter(v || null)} 
            options={[
              { label: 'Open', value: 'OPEN' },
              { label: 'Answered', value: 'ANSWERED' },
              { label: 'Resolved', value: 'RESOLVED' },
            ]} 
          />
          <Button
            icon={<CheckCircleOutlined />}
            type={myAnsweredOnly ? 'primary' : 'default'}
            onClick={handleMyAnsweredToggle}
            className="w-full sm:w-auto"
          >
            My Answered
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="rounded-2xl border bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <div className="flex gap-2 pt-1">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-14 rounded-full" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.length === 0 && <Empty description="No doubts found" />}
            {filtered.map((doubt, i) => (
              <motion.div 
                key={doubt.id} 
                initial={{ opacity: 0, y: 16 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: i * 0.06 }} 
                whileHover={{ scale: 1.01, boxShadow: '0 4px 20px rgba(22,119,255,0.08)' }} 
                className="bg-card rounded-2xl border p-5 cursor-pointer transition" 
                onClick={() => navigate(`/faculty/doubts/${doubt.id}`)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-base">{doubt.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{doubt.description}</p>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      <Tag color="purple">{doubt.subject}</Tag>
                      <Tag>Sem {doubt.semester}</Tag>
                      {doubt.labels?.map((label) => (
                        <Tag key={label} color="blue" className="rounded-full text-xs">{label}</Tag>
                      ))}
                    </div>
                  </div>
                  <Tag color={statusColors[doubt.status]}>{doubt.status}</Tag>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MessageOutlined /> {doubt.answerCount} answers
                  </span>
                  <span className="flex items-center gap-1">
                    <EyeOutlined /> {doubt.views} views
                  </span>
                  <span>by {doubt.postedBy.name || doubt.postedBy.username}</span>
                  <span>{formatDate(doubt.createdAt)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default FacultyDoubts;