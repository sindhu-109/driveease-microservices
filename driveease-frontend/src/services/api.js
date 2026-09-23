/**
 * api.js — Central Axios instance for DriveEase frontend.
 *
 * All requests go through Vite proxy → API Gateway :8000, which routes:
 *   /ms1/**  → User Service    :8001
 *   /ms2/**  → Vehicle Service :8002
 *   /ms3/**  → Booking Service :8003
 *
 * JWT format required by Vehicle Service and Booking Service:
 *   Authorization: Bearer <token>
 *
 * The request interceptor reads the token from localStorage and injects
 * this header automatically on every outgoing request.
 *
 * The response interceptor handles 401 globally:
 *   - clears localStorage auth keys
 *   - redirects the browser to /login
 */

import axios from 'axios';

const api = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor: attach Bearer token ──────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 globally ────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear auth and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
