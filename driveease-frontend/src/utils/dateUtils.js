/**
 * dateUtils.js
 *
 * The backend uses LocalDate serialised as "YYYY-MM-DD" strings in JSON.
 *
 * BookingRequest constraints (from backend @Future annotation):
 *   startDate must be strictly in the future (> today)
 *   endDate   must be strictly in the future (> today)
 *   endDate   must be after startDate (enforced by BookingService)
 *
 * Always send dates to the backend as "YYYY-MM-DD".
 * Never send localised strings.
 */

/**
 * Format a "YYYY-MM-DD" string for human display: "25 Sep 2026"
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    // Parse without timezone shift
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-GB', {
      day:   '2-digit',
      month: 'short',
      year:  'numeric',
    });
  } catch {
    return dateStr;
  }
};

/**
 * Today's date as "YYYY-MM-DD".
 */
export const todayISO = () => new Date().toISOString().split('T')[0];

/**
 * Tomorrow's date as "YYYY-MM-DD".
 * Use as the minimum value for startDate (backend @Future requires > today).
 */
export const tomorrowISO = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

/**
 * Returns a date N days from today as "YYYY-MM-DD".
 */
export const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
};

/**
 * True if endDate is strictly after startDate (both "YYYY-MM-DD").
 */
export const isEndAfterStart = (startDate, endDate) => {
  if (!startDate || !endDate) return false;
  return endDate > startDate;
};

/**
 * Number of days between two "YYYY-MM-DD" strings.
 */
export const daysBetween = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const diff = new Date(endDate) - new Date(startDate);
  return Math.max(0, Math.floor(diff / 86_400_000));
};

/**
 * True if a "YYYY-MM-DD" date is strictly in the future (> today).
 * Used to validate @Future fields before sending to backend.
 */
export const isFuture = (dateStr) => {
  if (!dateStr) return false;
  return dateStr > todayISO();
};
