import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { getAllBookings, cancelBooking, startBooking, returnVehicle } from '../services/bookingService';
import { BOOKING_STATUS } from '../utils/auth';
import { formatDate } from '../utils/dateUtils';
import { extractError } from '../utils/errorUtils';
import StatusBadge from '../components/StatusBadge';
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

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [actErr, setActErr]     = useState('');
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all');
  const [confirm, setConfirm]   = useState({ open: false, type: '', booking: null });

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      setBookings(await getAllBookings()); // GET /ms3/bookings
    } catch { setError('Cannot reach Booking Service.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = bookings.filter(b => {
    const matchSearch = !search.trim() || String(b.bookingId).includes(search) ||
      String(b.userId).includes(search) || String(b.vehicleId).includes(search);
    const matchStatus = filter === 'all' || b.status === filter;
    return matchSearch && matchStatus;
  });

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
      setActErr(extractError(err));
    }
  };

  const CONFIRM_META = {
    cancel: { title: 'Cancel Booking', message: 'Cancel this booking?',          danger: true  },
    start:  { title: 'Start Rental',   message: 'Mark this booking as ACTIVE?',  danger: false },
    return: { title: 'Return Vehicle', message: 'Mark this booking as COMPLETED?', danger: false },
  };
  const meta = CONFIRM_META[confirm.type] ?? {};

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Bookings</h1>
          <p className="page-subtitle">View and manage all bookings across all users.</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={load} disabled={loading}>
          <RefreshCw size={15} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      <div className="filter-bar" style={{ marginBottom: '1.25rem' }}>
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input type="text" className="search-input"
            placeholder="Search by booking ID, user ID, or vehicle ID…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="filter-pills">
          {STATUS_FILTERS.map(f => (
            <button key={f.value}
              className={`pill ${filter === f.value ? 'pill-active' : ''}`}
              onClick={() => setFilter(f.value)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {actErr  && <ErrorMessage message={actErr} />}
      {loading && <Loading message="Loading bookings…" />}
      {!loading && error && <ErrorMessage message={error} onRetry={load} />}

      {!loading && !error && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th><th>User</th><th>Vehicle</th>
                <th>Start</th><th>End</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={7} className="table-empty">No bookings found.</td></tr>
                : filtered.map((b) => (
                  <tr key={b.bookingId}>
                    <td className="td-id">#{b.bookingId}</td>
                    <td>User #{b.userId}</td>
                    <td>Vehicle #{b.vehicleId}</td>
                    <td>{formatDate(b.startDate)}</td>
                    <td>{formatDate(b.endDate)}</td>
                    <td><StatusBadge status={b.status} /></td>
                    <td className="td-actions">
                      {b.status === BOOKING_STATUS.CONFIRMED && (
                        <button className="btn btn-primary btn-sm"
                          onClick={() => openConfirm('start', b)}>Start</button>
                      )}
                      {b.status === BOOKING_STATUS.ACTIVE && (
                        <button className="btn btn-secondary btn-sm"
                          onClick={() => openConfirm('return', b)}>Return</button>
                      )}
                      {b.status === BOOKING_STATUS.CONFIRMED && (
                        <button className="btn btn-danger btn-sm"
                          onClick={() => openConfirm('cancel', b)}>Cancel</button>
                      )}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog open={confirm.open} title={meta.title} message={meta.message}
        danger={meta.danger} onConfirm={handleConfirm} onCancel={closeConfirm} />
    </div>
  );
}
