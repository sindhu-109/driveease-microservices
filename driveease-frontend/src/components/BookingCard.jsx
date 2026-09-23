import { useNavigate } from 'react-router-dom';
import { Hash, Calendar, Car } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatDate } from '../utils/dateUtils';
import { BOOKING_STATUS } from '../utils/auth';

/**
 * BookingCard — displays a BookingResponse from Booking Service.
 *
 * Booking fields (from BookingResponse):
 *   bookingId   Long
 *   userId      Long
 *   vehicleId   Long
 *   startDate   "YYYY-MM-DD"
 *   endDate     "YYYY-MM-DD"
 *   status      "CONFIRMED" | "ACTIVE" | "COMPLETED" | "CANCELLED"
 *
 * Action rules (matching BookingService business logic):
 *   CONFIRMED → can Cancel, can Start (if today >= startDate — backend enforces)
 *   ACTIVE    → can Return
 *   COMPLETED → no actions
 *   CANCELLED → no actions
 */
export default function BookingCard({ booking, onCancel, onStart, onReturn }) {
  const navigate = useNavigate();

  const canCancel = booking.status === BOOKING_STATUS.CONFIRMED;
  const canStart  = booking.status === BOOKING_STATUS.CONFIRMED;
  const canReturn = booking.status === BOOKING_STATUS.ACTIVE;

  return (
    <div className="booking-card">
      <div className="booking-card-header">
        <div className="booking-icon"><Car size={20} /></div>
        <span className="booking-id"><Hash size={13} />{booking.bookingId}</span>
        <StatusBadge status={booking.status} />
      </div>

      <div className="booking-card-body">
        <p className="booking-vehicle">Vehicle #{booking.vehicleId}</p>

        <div className="booking-dates">
          <span className="meta-item">
            <Calendar size={13} />
            {formatDate(booking.startDate)} — {formatDate(booking.endDate)}
          </span>
        </div>
      </div>

      <div className="booking-card-footer">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate(`/bookings/${booking.bookingId}`)}
        >
          Details
        </button>

        {canStart && (
          <button className="btn btn-primary btn-sm" onClick={() => onStart?.(booking)}>
            Start Rental
          </button>
        )}

        {canReturn && (
          <button className="btn btn-secondary btn-sm" onClick={() => onReturn?.(booking)}>
            Return Vehicle
          </button>
        )}

        {canCancel && (
          <button className="btn btn-danger btn-sm" onClick={() => onCancel?.(booking)}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
