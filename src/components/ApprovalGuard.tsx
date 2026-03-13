import { useAuth } from '@/context/AuthContext';
import { ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
}

const ApprovalGuard = ({ children }: Props) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  if (user.approvalStatus === 'REJECTED') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="inline-flex h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 items-center justify-center mx-auto">
            <CloseCircleOutlined className="text-3xl text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Account Rejected</h2>
          <p className="text-muted-foreground text-sm">
            Your account registration has been rejected by the administration. Please contact your institution for more information.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate(-1)}>Go Back</Button>
            <Button danger onClick={logout}>Logout</Button>
          </div>
        </div>
      </div>
    );
  }

  if (user.approvalStatus !== 'APPROVED') {
    const dashboardPath =
      user.role === 'STUDENT' ? '/student/dashboard' :
      user.role === 'FACULTY' ? '/faculty/dashboard' : '/';

    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="inline-flex h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/30 items-center justify-center mx-auto">
            <ClockCircleOutlined className="text-3xl text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Account Pending Approval</h2>
          <p className="text-muted-foreground text-sm">
            Your account is awaiting approval from the administration. You'll be able to access this feature once your account is approved.
          </p>
          <Button type="primary" onClick={() => navigate(dashboardPath)}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ApprovalGuard;
