import { createContext, useContext, useState, useCallback } from 'react';
import { storeAuth, clearAuth, getAuthState } from '../services/authService';
import { ROLES } from '../utils/auth';

/**
 * AuthContext — global authentication state for DriveEase.
 *
 * Auth state shape (from localStorage):
 *   token     string   JWT Bearer token
 *   username  string   from AuthResponse.username
 *   role      string   "USER" | "ADMIN"  from AuthResponse.role
 *   userId    string   extracted from JWT payload.userId (Long as string)
 *
 * isAdmin: role === "ADMIN"
 * Backend assigns "USER" to all new signups.
 * ADMIN role must be set directly in the database.
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const state = getAuthState();
    return state.token
      ? state
      : { token: null, username: null, role: null, userId: null };
  });

  /**
   * Called after successful signin.
   * authResponse = { token, username, role } from /ms1/signin
   */
  const login = useCallback((authResponse) => {
    storeAuth(authResponse);          // persists to localStorage
    setAuth(getAuthState());          // re-reads all 4 fields
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setAuth({ token: null, username: null, role: null, userId: null });
  }, []);

  const isAuthenticated = Boolean(auth.token);
  const isAdmin = auth.role === ROLES.ADMIN;

  return (
    <AuthContext.Provider value={{ auth, login, logout, isAuthenticated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
