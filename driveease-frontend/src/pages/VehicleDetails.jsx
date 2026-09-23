import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Car, DollarSign, Tag, BookOpen } from 'lucide-react';
import { getVehicleById } from '../services/vehicleService';
import StatusBadge from '../components/StatusBadge';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { VEHICLE_STATUS } from '../utils/auth';

export default function VehicleDetails() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      // GET /ms2/vehicles/{id} → VehicleResponse
      const data = await getVehicleById(id);
      setVehicle(data);
    } catch {
      setError('Could not load vehicle details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]); // eslint-disable-line

  return (
    <div className="page">
      <div className="page-header">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      {loading && <Loading message="Loading vehicle…" />}
      {!loading && error && <ErrorMessage message={error} onRetry={load} />}

      {!loading && !error && vehicle && (
        <div className="detail-card">
          <div className="detail-header">
            <div className="detail-icon-wrap"><Car size={40} /></div>
            <div className="detail-header-text">
              <h1 className="detail-title">{vehicle.model}</h1>
              <StatusBadge status={vehicle.availabilityStatus} />
            </div>
          </div>

          <div className="detail-body">
            <div className="detail-meta-grid">
              <MetaRow icon={<Tag size={16}/>}       label="Type"         value={vehicle.type} />
              <MetaRow icon={<Car size={16}/>}       label="Model"        value={vehicle.model} />
              <MetaRow icon={<DollarSign size={16}/>}label="Rental Price" value={`$${Number(vehicle.rentalPrice).toFixed(2)} / day`} />
              <MetaRow icon={<Car size={16}/>}       label="Vehicle ID"   value={`#${vehicle.vehicleId}`} />
            </div>
          </div>

          <div className="detail-footer">
            {vehicle.availabilityStatus === VEHICLE_STATUS.AVAILABLE ? (
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/bookings/create/${vehicle.vehicleId}`)}>
                <BookOpen size={16} /> Book Now
              </button>
            ) : (
              <div className="unavailable-note">
                This vehicle is <StatusBadge status={vehicle.availabilityStatus} /> and cannot be booked.
              </div>
            )}
            <button className="btn btn-ghost" onClick={() => navigate('/vehicles')}>
              Back to Fleet
            </button>
          </div>
        </div>
      )}
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
