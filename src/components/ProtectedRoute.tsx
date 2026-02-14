import { Navigate } from 'react-router-dom';
import { useAuth, getRoleRedirect } from '@/context/AuthContext';
import type { UserRole } from '@/data/mockData';

interface Props {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: Props) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to={getRoleRedirect(user.role)} replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
