import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * AdminRoute — renders children only for ADMIN users.
 *
 * Role "ADMIN" is set directly in the database.
 * All new signups receive role "USER" automatically.
 * This is UI-level protection only; the backend enforces its own
 * authorization on every API call.
 */
export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin)         return <Navigate to="/dashboard" replace />;

  return children;
}
