import PageTransition from '@/components/animated/PageTransition';
import { Doubt } from '@/types';
import { Empty } from 'antd';

const FacultyDoubts = () => {
  // TODO: Fetch from backend API
  const filtered: Doubt[] = [];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Doubt Management</h1>
          <p className="text-muted-foreground">Answer and verify student doubts.</p>
        </div>
        {/* TODO: Add search functionality when backend API is integrated */}
        <div className="space-y-3">
          {filtered.length === 0 && <Empty description="No doubts found" />}
        </div>
      </div>
    </PageTransition>
  );
};

export default FacultyDoubts;