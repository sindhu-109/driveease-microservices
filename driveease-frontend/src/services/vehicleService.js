/**
 * vehicleService.js — Vehicle Service (MS2) API calls.
 *
 * All requests via Vite proxy → Vehicle Service :8002
 * (Gateway /ms2 route not configured — see vite.config.js note)
 *
 * Authentication: Authorization: Bearer <token>  (handled by api.js)
 *
 * Vehicle entity fields:
 *   vehicleId         Long
 *   type              String   e.g. "CAR", "TRUCK", "VAN"
 *   model             String   e.g. "Toyota Camry"
 *   availabilityStatus String  "AVAILABLE" | "RESERVED" | "RENTED"
 *   rentalPrice       BigDecimal
 *
 * VehicleRequest body (create / update):
 *   { type, model, rentalPrice }
 *   (availabilityStatus is managed by the service, not sent in create/update)
 *
 * Status update:
 *   PUT /ms2/vehicles/{id}/status?status=AVAILABLE|RESERVED|RENTED
 */

import api from './api';

/** GET /ms2/vehicles — returns VehicleResponse[] */
export const getAllVehicles = async () => {
  const response = await api.get('/ms2/vehicles');
  return response.data; // VehicleResponse[]
};

/** GET /ms2/vehicles/available — returns VehicleResponse[] where status=AVAILABLE */
export const getAvailableVehicles = async () => {
  const response = await api.get('/ms2/vehicles/available');
  return response.data;
};

/** GET /ms2/vehicles/{id} — returns VehicleResponse */
export const getVehicleById = async (id) => {
  const response = await api.get(`/ms2/vehicles/${id}`);
  return response.data;
};

/**
 * POST /ms2/vehicles — create a new vehicle (admin only).
 * Body: { type: string, model: string, rentalPrice: number }
 * Returns: VehicleResponse (status 201)
 */
export const createVehicle = async (vehicleData) => {
  const response = await api.post('/ms2/vehicles', vehicleData);
  return response.data;
};

/**
 * PUT /ms2/vehicles/{id} — update vehicle fields (admin only).
 * Body: { type: string, model: string, rentalPrice: number }
 * Returns: VehicleResponse
 */
export const updateVehicle = async (id, vehicleData) => {
  const response = await api.put(`/ms2/vehicles/${id}`, vehicleData);
  return response.data;
};

/**
 * DELETE /ms2/vehicles/{id} — delete a vehicle (admin only).
 * Returns: { message: "Vehicle deleted successfully", vehicleId: id }
 */
export const deleteVehicle = async (id) => {
  const response = await api.delete(`/ms2/vehicles/${id}`);
  return response.data;
};

/**
 * PUT /ms2/vehicles/{id}/status?status=AVAILABLE|RESERVED|RENTED
 * Returns: VehicleResponse
 */
export const updateVehicleStatus = async (id, status) => {
  const response = await api.put(`/ms2/vehicles/${id}/status`, null, {
    params: { status },
  });
  return response.data;
};
