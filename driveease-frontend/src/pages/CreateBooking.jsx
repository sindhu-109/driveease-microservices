import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Car, DollarSign, Calendar } from 'lucide-react';
import { getVehicleById } from '../services/vehicleService';
import { createBooking } from '../services/bookingService';
import { VEHICLE_STATUS } from '../utils/auth';
import { tomorrowISO, daysFromNow, isEndAfterStart, isFuture, daysBetween } from '../utils/dateUtils';
import { extractError } from '../utils/errorUtils';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function CreateBooking() {
  const { vehicleId } = useParams();
  const navigate      = useNavigate();

  const [vehicle, setVehicle]   = useState(null);
  const [loadingVeh, setLoadV]  = useState(true);
  const [vehError, setVehErr]   = useState('');

  // BookingRequest fields: vehicleId, startDate, endDate (all @Future)
  const [startDate, setStartDate] = useState(tomorrowISO());
  const [endDate,   setEndDate]   = useState(daysFromNow(3));
  const [submitting, setSub]      = useState(false);
  const [formError,  setFormErr]  = useState('');
  const [success,    setSuccess]  = useState('');

  useEffect(() => {
    const load = async () => {
      setLoadV(true); setVehErr('');
      try {
        const data = await getVehicleById(vehicleId);
        if (data.availabilityStatus !== VEHICLE_STATUS.AVAILABLE) {
          setVehErr('This vehicle is not available for booking.');
        } else {
          setVehicle(data);
        }
      } catch {
        setVehErr('Could not load vehicle information.');
      } finally {
        setLoadV(false);
      }
    };
    load();
  }, [vehicleId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErr('');

    if (!isFuture(startDate)) { setFormErr('Start date must be in the future.'); return; }
    if (!isFuture(endDate))   { setFormErr('End date must be in the future.');   return; }
    if (!isEndAfterStart(startDate, endDate)) {
      setFormErr('End date must be after start date.');
      return;
    }

    setSub(true);
    try {
      // POST /ms3/bookings
      // Body: { vehicleId: Long, startDate: "YYYY-MM-DD", endDate: "YYYY-MM-DD" }
      // userId is extracted from JWT on the server — NOT sent here
      await createBooking({
        vehicleId: parseInt(vehicleId, 10),
        startDate,
        endDate,
      });
      setSuccess('Booking created successfully! Redirecting…');
      setTimeout(() => navigate('/bookings'), 1500);
    } catch (err) {
      // Show exact backend message (e.g. "Vehicle is already booked for selected dates")
      setFormErr(extractError(err));
    } finally {
      setSub(false);
    }
  };

  const nights = daysBetween(startDate, endDate);
  const total  = vehicle ? (nights * Number(vehicle.rentalPrice)).toFixed(2) : '0.00';

  return (
    <div className="page">
      <div className="page-header">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="detail-card">
        <div className="detail-header">
          <div className="detail-icon-wrap"><BookOpen size={32} /></div>
          <div className="detail-header-text">
            <h1 className="detail-title">New Booking</h1>
            <p className="page-subtitle">Reserve a fleet vehicle</p>
          </div>
        </div>

        {loadingVeh && <Loading message="Loading vehicle…" />}
        {!loadingVeh && vehError && <ErrorMessage message={vehError} />}

        {!loadingVeh && !vehError && vehicle && (
          <div style={{ padding: '1.5rem 2rem' }}>
            {/* Vehicle summary */}
            <div className="booking-vehicle-summary">
              <Car size={22} />
              <div>
                <p className="summary-label">Vehicle</p>
                <p className="summary-value">{vehicle.model} ({vehicle.type})</p>
                <p className="summary-desc">
                  <DollarSign size={13} style={{ display:'inline', verticalAlign:'middle' }} />
                  {Number(vehicle.rentalPrice).toFixed(2)} / day
                </p>
              </div>
            </div>

            {success  && <div className="form-success-banner">{success}</div>}
            {formError && <div className="form-error-banner">{formError}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startDate" className="form-label">
                    <Calendar size={14} style={{ verticalAlign:'middle', marginRight:4 }} />
                    Start Date *
                  </label>
                  <input id="startDate" type="date" className="form-input"
                    min={tomorrowISO()} value={startDate}
                    onChange={(e) => { setFormErr(''); setStartDate(e.target.value); }}
                    disabled={submitting} required />
                  <small className="form-hint">Must be a future date</small>
                </div>

                <div className="form-group">
                  <label htmlFor="endDate" className="form-label">
                    <Calendar size={14} style={{ verticalAlign:'middle', marginRight:4 }} />
                    End Date *
                  </label>
                  <input id="endDate" type="date" className="form-input"
                    min={startDate || tomorrowISO()} value={endDate}
                    onChange={(e) => { setFormErr(''); setEndDate(e.target.value); }}
                    disabled={submitting} required />
                </div>
              </div>

              {nights > 0 && (
                <div className="booking-cost-summary">
                  <span>{nights} day{nights !== 1 ? 's' : ''} × ${Number(vehicle.rentalPrice).toFixed(2)}</span>
                  <strong>Total: ${total}</strong>
                </div>
              )}

              <div className="form-actions">
                <button type="button" className="btn btn-ghost"
                  onClick={() => navigate(-1)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting
                    ? <span className="btn-loading"><span className="spinner-sm" />Creating…</span>
                    : <span className="btn-content"><BookOpen size={16} />Confirm Booking</span>}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
