import PageTransition from '@/components/animated/PageTransition';
import { Empty } from 'antd';

const DoubtDetail = () => {
  // TODO: Get ID from URL params and fetch doubt from backend API
  // TODO: Replace with actual API call to fetch doubt by ID
  
  return (
    <PageTransition>
      <Empty description="Doubt details will be available once backend API is integrated." />
    </PageTransition>
  );
};

export default DoubtDetail;