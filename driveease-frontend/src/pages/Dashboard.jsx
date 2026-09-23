import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, ClipboardList, CheckCircle, Activity, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAllVehicles } from '../services/vehicleService';
import { getMyBookings } from '../services/bookingService';
import { VEHICLE_STATUS, BOOKING_STATUS } from '../utils/auth';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function Dashboard() {
  const { auth } = useAuth();
  const navigate  = useNavigate();

  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [vehicles, bookings] = await Promise.all([
        getAllVehicles(),   // GET /ms2/vehicles → VehicleResponse[]
        getMyBookings(),   // GET /ms3/bookings/user → BookingResponse[]
      ]);

      setStats({
        totalVehicles:     vehicles.length,
        availableVehicles: vehicles.filter(v => v.availabilityStatus === VEHICLE_STATUS.AVAILABLE).length,
        myBookings:        bookings.length,
        activeRentals:     bookings.filter(b => b.status === BOOKING_STATUS.ACTIVE).length,
      });
    } catch {
      setError('Could not load dashboard data. Make sure all backend services are running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {auth.username} 👋</h1>
          <p className="page-subtitle">Here&apos;s your fleet overview for today.</p>
        </div>
      </div>

      {loading && <Loading message="Loading dashboard…" />}
      {!loading && error && <ErrorMessage message={error} onRetry={load} />}

      {!loading && !error && stats && (
        <>
          <div className="stats-grid">
            <StatCard icon={<Car size={22}/>}          label="Total Vehicles"    value={stats.totalVehicles}     color="blue"   />
            <StatCard icon={<CheckCircle size={22}/>}  label="Available"         value={stats.availableVehicles} color="green"  />
            <StatCard icon={<ClipboardList size={22}/>}label="My Bookings"       value={stats.myBookings}        color="purple" />
            <StatCard icon={<Activity size={22}/>}     label="Active Rentals"    value={stats.activeRentals}     color="amber"  />
          </div>

          <div className="dashboard-actions">
            <h2 className="section-title">Quick Actions</h2>
            <div className="action-cards">
              <ActionCard title="Browse Vehicles"
                description="View the full fleet and book an available vehicle."
                icon={<Car size={28}/>} onClick={() => navigate('/vehicles')} />
              <ActionCard title="My Bookings"
                description="View your current and past rental bookings."
                icon={<ClipboardList size={28}/>} onClick={() => navigate('/bookings')} />
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
