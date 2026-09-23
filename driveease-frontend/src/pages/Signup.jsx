import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Eye, EyeOff, UserPlus } from 'lucide-react';
import { signup } from '../services/authService';
import { extractError } from '../utils/errorUtils';

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm]       = useState({ username: '', password: '', confirm: '' });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setError(''); setSuccess('');
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (!form.username.trim()) { setError('Username is required.'); return; }
    if (form.password.length < 4) { setError('Password must be at least 4 characters.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      // POST /ms1/signup → { message: "User registered successfully", status: 201 }
      await signup(form.username.trim(), form.password);
      setSuccess('Account created! Redirecting to login…');
      setTimeout(() => navigate('/login'), 1800);
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

        <h2 className="auth-title">Create an account</h2>
        <p className="auth-subtitle">Join DriveEase to manage fleet assets</p>

        {error   && <div className="form-error-banner"   role="alert">{error}</div>}
        {success && <div className="form-success-banner" role="status">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <input id="username" name="username" type="text" autoFocus
              autoComplete="username" className="form-input" placeholder="Choose a username"
              value={form.username} onChange={handleChange} disabled={loading} />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="input-wrapper">
              <input id="password" name="password"
                type={showPw ? 'text' : 'password'} autoComplete="new-password"
                className="form-input" placeholder="Create a password"
                value={form.password} onChange={handleChange} disabled={loading} />
              <button type="button" className="input-eye"
                aria-label={showPw ? 'Hide' : 'Show'}
                onClick={() => setShowPw((v) => !v)}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirm" className="form-label">Confirm Password</label>
            <input id="confirm" name="confirm"
              type={showPw ? 'text' : 'password'} autoComplete="new-password"
              className="form-input" placeholder="Repeat your password"
              value={form.confirm} onChange={handleChange} disabled={loading} />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading
              ? <span className="btn-loading"><span className="spinner-sm" />Creating…</span>
              : <span className="btn-content"><UserPlus size={16} />Create Account</span>}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
