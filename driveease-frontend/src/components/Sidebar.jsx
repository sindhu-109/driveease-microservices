import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Car, ClipboardList, ShieldCheck, Settings, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { isAdmin } = useAuth();

  const userLinks = [
    { to: '/dashboard', label: 'Dashboard',   Icon: LayoutDashboard },
    { to: '/vehicles',  label: 'Vehicles',    Icon: Car },
    { to: '/bookings',  label: 'My Bookings', Icon: ClipboardList },
  ];

  const adminLinks = [
    { to: '/admin',          label: 'Admin Dashboard', Icon: ShieldCheck },
    { to: '/admin/vehicles', label: 'Manage Vehicles', Icon: Settings },
    { to: '/admin/bookings', label: 'Manage Bookings', Icon: BookOpen },
  ];

  const linkClass = ({ isActive }) =>
    `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`;

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <p className="sidebar-section-label">Menu</p>
        {userLinks.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} end={to === '/dashboard'} className={linkClass}>
            <Icon size={17} /><span>{label}</span>
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <p className="sidebar-section-label" style={{ marginTop: '1.5rem' }}>Admin</p>
            {adminLinks.map(({ to, label, Icon }) => (
              <NavLink key={to} to={to} end={to === '/admin'} className={linkClass}>
                <Icon size={17} /><span>{label}</span>
              </NavLink>
            ))}
          </>
        )}
      </nav>
    </aside>
  );
}
