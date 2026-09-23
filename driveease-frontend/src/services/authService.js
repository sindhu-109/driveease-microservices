/**
 * authService.js — User Service (MS1) API calls.
 *
 * Endpoints (via Vite proxy → API Gateway :8000 → User Service :8001):
 *
 *   POST /ms1/signup
 *     Request:  { username: string, password: string }
 *     Response: { message: string, status: 201 }
 *     Errors:   RuntimeException → 500 with { message: "Username already exists" }
 *
 *   POST /ms1/signin
 *     Request:  { username: string, password: string }
 *     Response: { token: string, username: string, role: string }
 *     Roles:    "USER" | "ADMIN"
 *     Errors:   RuntimeException → 500 with { message: "Invalid username or password" }
 *
 * JWT Claims:
 *   subject  = username
 *   userId   = Long
 *   role     = "USER" | "ADMIN"
 *
 * localStorage keys used:
 *   token, username, role, userId
 */

import api from './api';

/**
 * Register a new account.
 * POST /ms1/signup
 */
export const signup = async (username, password) => {
  const response = await api.post('/ms1/signup', { username, password });
  return response.data;
  // Success: { message: "User registered successfully", status: 201 }
};

/**
 * Sign in and receive a JWT.
 * POST /ms1/signin
 */
export const signin = async (username, password) => {
  const response = await api.post('/ms1/signin', { username, password });
  return response.data;
  // Success: { token: "...", username: "...", role: "USER"|"ADMIN" }
};

/**
 * Decode the JWT payload without verification (client-side display only).
 * Real validation happens on the backend on every protected request.
 */
export const parseJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
    // Returns: { sub: username, userId: number, role: "USER"|"ADMIN", iat, exp }
  } catch {
    return null;
  }
};

/**
 * Persist auth state to localStorage after a successful signin.
 * AuthResponse fields: token, username, role
 * userId comes from the JWT payload.
 */
export const storeAuth = (authResponse) => {
  const { token, username, role } = authResponse;
  localStorage.setItem('token', token);
  localStorage.setItem('username', username);
  localStorage.setItem('role', role);

  // Extract userId from JWT payload
  const payload = parseJWT(token);
  if (payload?.userId != null) {
    localStorage.setItem('userId', String(payload.userId));
  }
};

/**
 * Remove all auth data from localStorage (logout).
 */
export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('role');
  localStorage.removeItem('userId');
};

/**
 * Read current auth state from localStorage.
 */
export const getAuthState = () => ({
  token:    localStorage.getItem('token'),
  username: localStorage.getItem('username'),
  role:     localStorage.getItem('role'),
  userId:   localStorage.getItem('userId'),
});
