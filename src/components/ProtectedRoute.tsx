import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, authState } = useAuth();

  if (authState === 'loading') return null;

  if (!isAuthenticated && authState !== 'unavailable') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
