import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Car, Calendar, User, Hash } from 'lucide-react';
import { getBookingById, cancelBooking, startBooking, returnVehicle } from '../services/bookingService';
import { getVehicleById } from '../services/vehicleService';
import { BOOKING_STATUS } from '../utils/auth';
import { formatDate } from '../utils/dateUtils';
import { extractError } from '../utils/errorUtils';
import StatusBadge from '../components/StatusBadge';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import ConfirmDialog from '../components/ConfirmDialog';

export default function BookingDetails() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [booking, setBooking]   = useState(null);
  const [vehicle, setVehicle]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [actErr, setActErr]     = useState('');
  const [confirm, setConfirm]   = useState({ open: false, type: '' });

  const load = async () => {
    setLoading(true); setError('');
    try {
      // GET /ms3/bookings/{id}
      const b = await getBookingById(id);
      setBooking(b);
      // Also fetch vehicle info for display
      try {
        const v = await getVehicleById(b.vehicleId);
        setVehicle(v);
      } catch { /* vehicle info is optional */ }
    } catch {
      setError('Could not load booking details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]); // eslint-disable-line

  const handleConfirm = async () => {
    const type = confirm.type;
    setConfirm({ open: false, type: '' }); setActErr('');
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
    cancel: { title: 'Cancel Booking', message: 'Cancel this booking?',              danger: true  },
    start:  { title: 'Start Rental',   message: 'Start the rental for this booking? Start date must have arrived.', danger: false },
    return: { title: 'Return Vehicle', message: 'Return the vehicle and complete this booking?', danger: false },
  };
  const meta = CONFIRM_META[confirm.type] ?? {};

  const canCancel = booking?.status === BOOKING_STATUS.CONFIRMED;
  const canStart  = booking?.status === BOOKING_STATUS.CONFIRMED;
  const canReturn = booking?.status === BOOKING_STATUS.ACTIVE;

  return (
    <div className="page">
      <div className="page-header">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      {loading && <Loading message="Loading booking details…" />}
      {!loading && error && <ErrorMessage message={error} onRetry={load} />}
      {actErr && <ErrorMessage message={actErr} />}

      {!loading && !error && booking && (
        <div className="detail-card">
          <div className="detail-header">
            <div className="detail-icon-wrap"><Car size={36} /></div>
            <div className="detail-header-text">
              <h1 className="detail-title">
                {vehicle ? `${vehicle.model} (${vehicle.type})` : `Vehicle #${booking.vehicleId}`}
              </h1>
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                <span className="detail-id"><Hash size={13}/>{booking.bookingId}</span>
                <StatusBadge status={booking.status} />
              </div>
            </div>
          </div>

          <div className="detail-body">
            <div className="detail-meta-grid">
              <MetaRow icon={<Hash size={16}/>}      label="Booking ID"  value={`#${booking.bookingId}`} />
              <MetaRow icon={<User size={16}/>}      label="User ID"     value={`#${booking.userId}`} />
              <MetaRow icon={<Car size={16}/>}       label="Vehicle ID"  value={`#${booking.vehicleId}`} />
              <MetaRow icon={<Calendar size={16}/>}  label="Start Date"  value={formatDate(booking.startDate)} />
              <MetaRow icon={<Calendar size={16}/>}  label="End Date"    value={formatDate(booking.endDate)} />
              {vehicle && (
                <MetaRow icon={<Car size={16}/>} label="Daily Rate"
                  value={`$${Number(vehicle.rentalPrice).toFixed(2)}`} />
              )}
            </div>
          </div>

          {(canCancel || canStart || canReturn) && (
            <div className="detail-footer">
              {canStart && (
                <button className="btn btn-primary"
                  onClick={() => setConfirm({ open: true, type: 'start' })}>
                  Start Rental
                </button>
              )}
              {canReturn && (
                <button className="btn btn-secondary"
                  onClick={() => setConfirm({ open: true, type: 'return' })}>
                  Return Vehicle
                </button>
              )}
              {canCancel && (
                <button className="btn btn-danger"
                  onClick={() => setConfirm({ open: true, type: 'cancel' })}>
                  Cancel Booking
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog open={confirm.open} title={meta.title} message={meta.message}
        danger={meta.danger} onConfirm={handleConfirm}
        onCancel={() => setConfirm({ open: false, type: '' })} />
    </div>
  );
}

function MetaRow({ icon, label, value }) {
  return (
    <div className="meta-row">
      <span className="meta-icon">{icon}</span>
      <span className="meta-label">{label}</span>
      <span className="meta-value">{value}</span>
    </div>
  );
}
