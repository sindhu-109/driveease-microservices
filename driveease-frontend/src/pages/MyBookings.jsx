import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, PlusCircle } from 'lucide-react';
import { getMyBookings, cancelBooking, startBooking, returnVehicle } from '../services/bookingService';
import { BOOKING_STATUS } from '../utils/auth';
import { extractError } from '../utils/errorUtils';
import BookingCard from '../components/BookingCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import ConfirmDialog from '../components/ConfirmDialog';

const STATUS_FILTERS = [
  { value: 'all',       label: 'All'       },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'ACTIVE',    label: 'Active'    },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function MyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [actErr, setActErr]       = useState('');
  const [filter, setFilter]       = useState('all');
  const [confirm, setConfirm]     = useState({ open: false, type: '', booking: null });

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      // GET /ms3/bookings/user — userId from JWT on server
      const data = await getMyBookings();
      setBookings(data);
    } catch {
      setError('Cannot reach the Booking Service. Make sure MS3 is running on :8003.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const openConfirm = (type, booking) => setConfirm({ open: true, type, booking });
  const closeConfirm = () => setConfirm({ open: false, type: '', booking: null });

  const handleConfirm = async () => {
    const { type, booking } = confirm;
    closeConfirm(); setActErr('');
    try {
      if (type === 'cancel') await cancelBooking(booking.bookingId);
      if (type === 'start')  await startBooking(booking.bookingId);
      if (type === 'return') await returnVehicle(booking.bookingId);
      await load();
    } catch (err) {
      // Show exact backend messages like "Rental start date has not arrived"
      setActErr(extractError(err));
    }
  };

  const CONFIRM_META = {
    cancel: { title: 'Cancel Booking',  message: 'Are you sure you want to cancel this booking?',              danger: true  },
    start:  { title: 'Start Rental',    message: 'Start the rental? Note: start date must have arrived.',      danger: false },
    return: { title: 'Return Vehicle',  message: 'Confirm returning the vehicle and completing this booking?', danger: false },
  };
  const meta = CONFIRM_META[confirm.type] ?? {};

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Bookings</h1>
          <p className="page-subtitle">Manage your fleet rentals.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-ghost btn-sm" onClick={load} disabled={loading}>
            <RefreshCw size={15} className={loading ? 'spin' : ''} /> Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/vehicles')}>
            <PlusCircle size={15} /> New Booking
          </button>
        </div>
      </div>

      <div className="filter-pills" style={{ marginBottom: '1.25rem' }}>
        {STATUS_FILTERS.map((f) => (
          <button key={f.value}
            className={`pill ${filter === f.value ? 'pill-active' : ''}`}
            onClick={() => setFilter(f.value)}>
            {f.label}
          </button>
        ))}
      </div>

      {actErr && <ErrorMessage message={actErr} />}
      {loading && <Loading message="Loading bookings…" />}
      {!loading && error && <ErrorMessage message={error} onRetry={load} />}

      {!loading && !error && (
        filtered.length === 0
          ? <div className="empty-state">
              <p>No bookings found.{' '}
                <button className="auth-link" onClick={() => navigate('/vehicles')}>
                  Browse fleet
                </button>{' '}to make one.
              </p>
            </div>
          : <div className="booking-grid">
              {filtered.map((b) => (
                <BookingCard key={b.bookingId} booking={b}
                  onCancel={(bk) => openConfirm('cancel', bk)}
                  onStart={(bk)  => openConfirm('start',  bk)}
                  onReturn={(bk) => openConfirm('return', bk)} />
              ))}
            </div>
      )}

      <ConfirmDialog open={confirm.open} title={meta.title} message={meta.message}
        danger={meta.danger} onConfirm={handleConfirm} onCancel={closeConfirm} />
    </div>
  );
}
