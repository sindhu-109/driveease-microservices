/**
 * StatusBadge — coloured pill for vehicle and booking status strings.
 *
 * Vehicle availabilityStatus (from Vehicle entity):
 *   "AVAILABLE"  green
 *   "RESERVED"   blue
 *   "RENTED"     amber
 *
 * Booking status (from Booking entity):
 *   "CONFIRMED"  blue
 *   "ACTIVE"     amber
 *   "COMPLETED"  slate
 *   "CANCELLED"  red
 */

const CONFIG = {
  // Vehicle statuses
  AVAILABLE:  { cls: 'badge-available' },
  RESERVED:   { cls: 'badge-reserved'  },
  RENTED:     { cls: 'badge-rented'    },
  // Booking statuses
  CONFIRMED:  { cls: 'badge-confirmed' },
  ACTIVE:     { cls: 'badge-active'    },
  COMPLETED:  { cls: 'badge-completed' },
  CANCELLED:  { cls: 'badge-cancelled' },
};

export default function StatusBadge({ status }) {
  const cfg = CONFIG[status] ?? { cls: 'badge-unknown' };
  return <span className={`badge ${cfg.cls}`}>{status ?? '—'}</span>;
}
