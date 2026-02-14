import { getRoleRedirect, useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: Props) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to={getRoleRedirect(user.role)} replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
