import { useNavigate } from 'react-router-dom';
import { Car, DollarSign } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { VEHICLE_STATUS } from '../utils/auth';

/**
 * VehicleCard — displays a vehicle from the Vehicle Service.
 *
 * Vehicle fields (from VehicleResponse):
 *   vehicleId          Long
 *   type               String  e.g. "CAR"
 *   model              String  e.g. "Toyota Camry"
 *   availabilityStatus String  "AVAILABLE" | "RESERVED" | "RENTED"
 *   rentalPrice        BigDecimal  (serialised as number in JSON)
 *
 * Props:
 *   vehicle      VehicleResponse object
 *   showActions  boolean  show Edit/Delete buttons (admin use)
 *   onEdit       fn(vehicle)
 *   onDelete     fn(vehicle)
 */
export default function VehicleCard({ vehicle, showActions = false, onEdit, onDelete }) {
  const navigate = useNavigate();
  const isAvailable = vehicle.availabilityStatus === VEHICLE_STATUS.AVAILABLE;

  return (
    <div className="vehicle-card">
      <div className="vehicle-card-header">
        <div className="vehicle-icon"><Car size={24} /></div>
        <StatusBadge status={vehicle.availabilityStatus} />
      </div>

      <div className="vehicle-card-body">
        <p className="vehicle-type">{vehicle.type}</p>
        <h3 className="vehicle-title">{vehicle.model}</h3>
        <div className="vehicle-price">
          <DollarSign size={14} />
          <span>{Number(vehicle.rentalPrice).toFixed(2)} / day</span>
        </div>
      </div>

      <div className="vehicle-card-footer">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate(`/vehicles/${vehicle.vehicleId}`)}
        >
          View Details
        </button>

        {isAvailable && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate(`/bookings/create/${vehicle.vehicleId}`)}
          >
            Book Now
          </button>
        )}

        {showActions && (
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => onEdit?.(vehicle)}>
              Edit
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => onDelete?.(vehicle)}>
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
