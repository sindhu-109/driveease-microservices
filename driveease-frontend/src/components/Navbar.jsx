import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Car, LayoutDashboard, ClipboardList, ShieldCheck, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { auth, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const active = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  if (!isAuthenticated) return null;

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard',   Icon: LayoutDashboard },
    { to: '/vehicles',  label: 'Vehicles',    Icon: Car },
    { to: '/bookings',  label: 'My Bookings', Icon: ClipboardList },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin', Icon: ShieldCheck }] : []),
  ];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/dashboard" className="navbar-brand">
          <Car size={22} />
          <span>DriveEase</span>
        </Link>

        <ul className="navbar-links">
          {navLinks.map(({ to, label, Icon }) => (
            <li key={to}>
              <Link to={to} className={`nav-link ${active(to) ? 'nav-link-active' : ''}`}>
                <Icon size={16} />{label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="navbar-right">
          <span className="navbar-username">{auth.username}</span>
          <button className="btn btn-ghost btn-sm navbar-logout" onClick={handleLogout}>
            <LogOut size={16} /><span>Logout</span>
          </button>
          <button
            className="navbar-hamburger"
            aria-label="Toggle navigation"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="navbar-mobile">
          {navLinks.map(({ to, label, Icon }) => (
            <Link
              key={to}
              to={to}
              className={`mobile-nav-link ${active(to) ? 'nav-link-active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={16} />{label}
            </Link>
          ))}
          <button className="btn btn-ghost btn-sm mobile-logout" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </nav>
  );
}
