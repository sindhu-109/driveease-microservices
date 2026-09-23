/**
 * bookingService.js — Booking Service (MS3) API calls.
 *
 * All requests via Vite proxy → Booking Service :8003
 * (Gateway /ms3 route not configured — see vite.config.js note)
 *
 * Authentication: Authorization: Bearer <token>  (handled by api.js)
 * userId is extracted from the JWT on the server — NOT sent in request body.
 *
 * Booking entity fields:
 *   bookingId   Long
 *   userId      Long    (set from JWT server-side)
 *   vehicleId   Long
 *   startDate   LocalDate  "YYYY-MM-DD"
 *   endDate     LocalDate  "YYYY-MM-DD"
 *   status      String  "CONFIRMED" | "ACTIVE" | "COMPLETED" | "CANCELLED"
 *
 * BookingRequest body:
 *   { vehicleId: Long, startDate: "YYYY-MM-DD", endDate: "YYYY-MM-DD" }
 *   NOTE: startDate and endDate must be @Future (strictly in the future).
 *
 * Business rules enforced by backend:
 *   - Vehicle must be AVAILABLE
 *   - No overlapping bookings for same vehicle
 *   - Start rental only when startDate has arrived (today >= startDate)
 *   - Cancel: only CONFIRMED or ACTIVE (not COMPLETED/CANCELLED)
 *   - Return: only ACTIVE bookings
 */

import api from './api';

/**
 * POST /ms3/bookings — create a booking.
 * Body: { vehicleId, startDate, endDate }
 * userId is read from JWT on the server.
 * Returns: BookingResponse (status 201)
 */
export const createBooking = async (bookingData) => {
  const response = await api.post('/ms3/bookings', bookingData);
  return response.data;
};

/**
 * GET /ms3/bookings — get all bookings (admin).
 * Returns: BookingResponse[]
 */
export const getAllBookings = async () => {
  const response = await api.get('/ms3/bookings');
  return response.data;
};

/**
 * GET /ms3/bookings/{id} — get a single booking.
 * Returns: BookingResponse
 */
export const getBookingById = async (id) => {
  const response = await api.get(`/ms3/bookings/${id}`);
  return response.data;
};

/**
 * GET /ms3/bookings/user — get current user's bookings.
 * userId extracted from JWT on server.
 * Returns: BookingResponse[]
 */
export const getMyBookings = async () => {
  const response = await api.get('/ms3/bookings/user');
  return response.data;
};

/**
 * PUT /ms3/bookings/{id}/cancel — cancel a booking.
 * Only the booking owner can cancel.
 * Returns: BookingResponse
 */
export const cancelBooking = async (id) => {
  const response = await api.put(`/ms3/bookings/${id}/cancel`);
  return response.data;
};

/**
 * PUT /ms3/bookings/{id}/start — start the rental.
 * Only allowed when today >= startDate.
 * Backend error: "Rental start date has not arrived"
 * Returns: BookingResponse
 */
export const startBooking = async (id) => {
  const response = await api.put(`/ms3/bookings/${id}/start`);
  return response.data;
};

/**
 * PUT /ms3/bookings/{id}/return — return the vehicle.
 * Only ACTIVE bookings can be returned.
 * Returns: BookingResponse
 */
export const returnVehicle = async (id) => {
  const response = await api.put(`/ms3/bookings/${id}/return`);
  return response.data;
};
