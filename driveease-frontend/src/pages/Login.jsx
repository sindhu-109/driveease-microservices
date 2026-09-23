import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Car, Eye, EyeOff, LogIn } from 'lucide-react';
import { signin } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { extractError } from '../utils/errorUtils';
import { ROLES } from '../utils/auth';

export default function Login() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  const [form, setForm]       = useState({ username: '', password: '' });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = (e) => {
    setError('');
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) {
      setError('Username and password are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // POST /ms1/signin → { token, username, role }
      // role is read directly from the backend response — never hardcoded
      const data = await signin(form.username.trim(), form.password);

      login(data); // stores token/username/role/userId to localStorage + updates context

      // Determine redirect target based on role returned by the backend:
      //   ADMIN → /admin
      //   USER  → /dashboard (or the page they were trying to reach)
      if (data.role === ROLES.ADMIN) {
        navigate('/admin', { replace: true });
      } else {
        // If the user was redirected here from a protected page, send them back
        const from = location.state?.from?.pathname;
        // Only honour 'from' if it's not an admin route (USER cannot access /admin)
        const destination =
          from && !from.startsWith('/admin') ? from : '/dashboard';
        navigate(destination, { replace: true });
      }
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <Car size={36} className="brand-icon" />
          <h1 className="brand-name">DriveEase</h1>
          <p className="brand-tagline">Fleet Lifecycle &amp; Rental Asset Management</p>
        </div>

        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Sign in to your account to continue</p>

        {error && <div className="form-error-banner" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              id="username" name="username" type="text"
              autoComplete="username" autoFocus
              className="form-input" placeholder="Enter your username"
              value={form.username} onChange={handleChange} disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="input-wrapper">
              <input
                id="password" name="password"
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                className="form-input" placeholder="Enter your password"
                value={form.password} onChange={handleChange} disabled={loading}
              />
              <button type="button" className="input-eye"
                aria-label={showPw ? 'Hide password' : 'Show password'}
                onClick={() => setShowPw((v) => !v)}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading
              ? <span className="btn-loading"><span className="spinner-sm" />Signing in…</span>
              : <span className="btn-content"><LogIn size={16} />Sign In</span>}
          </button>
        </form>

        <p className="auth-switch">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="auth-link">Create Account</Link>
        </p>
      </div>
    </div>
  );
}
