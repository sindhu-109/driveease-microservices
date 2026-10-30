import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * AdminRoute — renders children only for ADMIN users.
 *
 * The role comes from the authenticated backend response.
 * This is UI-level protection; the backend enforces its own
 * authorization on every API call.
 */
export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin)         return <Navigate to="/dashboard" replace />;

  return children;
}
