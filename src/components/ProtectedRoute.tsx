import { useAuth } from '@/context/AuthContext';
import { getRoleRedirect } from '@/lib/authUtils';
import { Spin } from 'antd';
import { Navigate } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
  allowedRoles: string[];
}


const ProtectedRoute = ({ children, allowedRoles }: Props) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to={getRoleRedirect(user.role, user)} replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
