import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, CheckCircle, XCircle, Clock, Activity, ArrowRight, Settings, BookOpen } from 'lucide-react';
import { getAllVehicles } from '../services/vehicleService';
import { getAllBookings } from '../services/bookingService';
import { VEHICLE_STATUS, BOOKING_STATUS } from '../utils/auth';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [vehicles, bookings] = await Promise.all([
        getAllVehicles(),   // GET /ms2/vehicles
        getAllBookings(),   // GET /ms3/bookings
      ]);

      setStats({
        totalVehicles:   vehicles.length,
        available:       vehicles.filter(v => v.availabilityStatus === VEHICLE_STATUS.AVAILABLE).length,
        reserved:        vehicles.filter(v => v.availabilityStatus === VEHICLE_STATUS.RESERVED).length,
        rented:          vehicles.filter(v => v.availabilityStatus === VEHICLE_STATUS.RENTED).length,
        totalBookings:   bookings.length,
        confirmed:       bookings.filter(b => b.status === BOOKING_STATUS.CONFIRMED).length,
        activeBookings:  bookings.filter(b => b.status === BOOKING_STATUS.ACTIVE).length,
        completed:       bookings.filter(b => b.status === BOOKING_STATUS.COMPLETED).length,
        cancelled:       bookings.filter(b => b.status === BOOKING_STATUS.CANCELLED).length,
      });
    } catch {
      setError('Could not load admin statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Fleet operations overview — all users, all vehicles.</p>
        </div>
      </div>

      {loading && <Loading message="Loading statistics…" />}
      {!loading && error && <ErrorMessage message={error} onRetry={load} />}

      {!loading && !error && stats && (
        <>
          <h2 className="section-title">Vehicle Fleet</h2>
          <div className="stats-grid" style={{ marginBottom: '2rem' }}>
            <StatCard icon={<Car size={22}/>}        label="Total Vehicles" value={stats.totalVehicles} color="blue"   />
            <StatCard icon={<CheckCircle size={22}/>}label="Available"      value={stats.available}     color="green"  />
            <StatCard icon={<Clock size={22}/>}      label="Reserved"       value={stats.reserved}      color="purple" />
            <StatCard icon={<Activity size={22}/>}   label="Rented"         value={stats.rented}        color="amber"  />
          </div>

          <h2 className="section-title">Bookings</h2>
          <div className="stats-grid" style={{ marginBottom: '2rem' }}>
            <StatCard icon={<BookOpen size={22}/>}   label="Total Bookings" value={stats.totalBookings}  color="blue"   />
            <StatCard icon={<Clock size={22}/>}      label="Confirmed"      value={stats.confirmed}      color="purple" />
            <StatCard icon={<Activity size={22}/>}   label="Active"         value={stats.activeBookings} color="amber"  />
            <StatCard icon={<CheckCircle size={22}/>}label="Completed"      value={stats.completed}      color="green"  />
            <StatCard icon={<XCircle size={22}/>}    label="Cancelled"      value={stats.cancelled}      color="red"    />
          </div>

          <div className="dashboard-actions">
            <h2 className="section-title">Admin Actions</h2>
            <div className="action-cards">
              <ActionCard title="Manage Vehicles"
                description="Add, edit, delete vehicles or change availability status."
                icon={<Settings size={28}/>}
                onClick={() => navigate('/admin/vehicles')} />
              <ActionCard title="Manage Bookings"
                description="View all bookings across all users. Start, return, or cancel."
                icon={<BookOpen size={28}/>}
                onClick={() => navigate('/admin/bookings')} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className={`stat-icon stat-icon-${color}`}>{icon}</div>
      <div className="stat-info">
        <p className="stat-value">{value}</p>
        <p className="stat-label">{label}</p>
      </div>
    </div>
  );
}

function ActionCard({ title, description, onClick, icon }) {
  return (
    <button className="action-card" onClick={onClick}>
      <div className="action-icon">{icon}</div>
      <div className="action-text">
        <h3 className="action-title">{title}</h3>
        <p className="action-desc">{description}</p>
      </div>
      <ArrowRight size={20} className="action-arrow" />
    </button>
  );
}
