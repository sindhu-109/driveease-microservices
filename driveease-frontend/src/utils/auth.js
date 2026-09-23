/**
 * auth.js — constants and localStorage helpers.
 *
 * Vehicle availabilityStatus values (exact strings from backend):
 *   "AVAILABLE"  — can be booked
 *   "RESERVED"   — booking CONFIRMED, not yet started
 *   "RENTED"     — booking ACTIVE, currently in use
 *
 * Booking status values (exact strings from backend):
 *   "CONFIRMED"  — booking created, waiting for start date
 *   "ACTIVE"     — rental started
 *   "COMPLETED"  — vehicle returned
 *   "CANCELLED"  — booking cancelled
 *
 * User roles (exact strings from backend):
 *   "USER"   — regular user
 *   "ADMIN"  — admin (full CRUD on vehicles, view all bookings)
 */

// Vehicle availability statuses
export const VEHICLE_STATUS = {
  AVAILABLE: 'AVAILABLE',
  RESERVED:  'RESERVED',
  RENTED:    'RENTED',
};

// Booking statuses
export const BOOKING_STATUS = {
  CONFIRMED: 'CONFIRMED',
  ACTIVE:    'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

// User roles
export const ROLES = {
  USER:  'USER',
  ADMIN: 'ADMIN',
};

// localStorage accessors
export const getToken    = () => localStorage.getItem('token');
export const getUsername = () => localStorage.getItem('username');
export const getRole     = () => localStorage.getItem('role');
export const getUserId   = () => localStorage.getItem('userId');
export const isLoggedIn  = () => Boolean(localStorage.getItem('token'));
