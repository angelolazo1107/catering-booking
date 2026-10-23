/**
 * Booking utility functions for Catering Management
 * Handles Booking Reference formatting (Date-Time-ClientName)
 * and Daily Capacity Limits (Max 3 Confirmed Bookings per Date)
 */

export const MAX_CONFIRMED_BOOKINGS_PER_DAY = 3;

/**
 * Converts time to 12-hour format with AM and PM (e.g. "18:00" -> "6:00 PM")
 */
export function formatTime12Hour(timeStr) {
  if (!timeStr) return "TBA";
  const trimmed = String(timeStr).trim();
  if (!trimmed) return "TBA";
  if (/am|pm/i.test(trimmed)) return trimmed;

  const parts = trimmed.split(":");
  if (parts.length >= 2) {
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1].slice(0, 2).padStart(2, "0");
    if (isNaN(hours)) return trimmed;
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return `${hours}:${minutes} ${ampm}`;
  }
  return trimmed;
}

/**
 * Computes conference end date based on start date and number of days
 */
export function getConferenceEndDate(startDateStr, days = 3) {
  if (!startDateStr) return "";
  try {
    const parts = startDateStr.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      d.setDate(d.getDate() + (Math.max(1, Number(days)) - 1));
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }
    const d = new Date(startDateStr);
    d.setDate(d.getDate() + (Math.max(1, Number(days)) - 1));
    return d.toISOString().split("T")[0];
  } catch (e) {
    return startDateStr;
  }
}

/**
 * Format a human-readable and system-standard Booking Reference
 * Format requested: Date then time - the name of client
 * Example: BK-2025-12-01-1630-CleoMarieTanquerido
 */
export function formatBookingReference(date, time, clientName) {
  const cleanDate = date 
    ? date.split("T")[0] 
    : new Date().toISOString().split("T")[0];

  let cleanTime = "TBA";
  if (time) {
    // If time is like "16:30" -> "1630", or "4:30 PM" -> "430PM"
    cleanTime = time.replace(/[^a-zA-Z0-9]/g, "");
  }

  // Remove spaces and punctuation from client name for a clean, URL-safe reference
  let cleanName = "Client";
  if (clientName) {
    cleanName = clientName
      .replace(/[^a-zA-Z0-9]/g, "")
      .trim();
  }

  return `BK-${cleanDate}-${cleanTime}-${cleanName}`;
}

/**
 * Count how many confirmed or ongoing bookings exist on a specific date
 */
export function getConfirmedBookingsCountForDate(bookings = [], targetDate, excludeBookingId = null) {
  if (!targetDate || !Array.isArray(bookings)) return 0;
  
  const normalizedTarget = targetDate.split("T")[0];

  return bookings.filter(b => {
    if (excludeBookingId && (b.id === excludeBookingId || b.bookingReference === excludeBookingId)) {
      return false;
    }
    if (!b.eventDate) return false;
    const bookingDate = b.eventDate.split("T")[0];
    const isConfirmedStatus = b.status === "Confirmed" || b.status === "Ongoing";
    return bookingDate === normalizedTarget && isConfirmedStatus;
  }).length;
}

/**
 * Check if a date has reached its maximum capacity of 3 confirmed bookings
 */
export function isDateFullyBooked(bookings = [], targetDate, excludeBookingId = null, maxLimit = MAX_CONFIRMED_BOOKINGS_PER_DAY) {
  return getConfirmedBookingsCountForDate(bookings, targetDate, excludeBookingId) >= maxLimit;
}

/**
 * Get remaining slots for a specific date
 */
export function getRemainingSlotsForDate(bookings = [], targetDate, maxLimit = MAX_CONFIRMED_BOOKINGS_PER_DAY) {
  const count = getConfirmedBookingsCountForDate(bookings, targetDate);
  return Math.max(0, maxLimit - count);
}

/**
 * Returns an array of date strings (YYYY-MM-DD) that are fully booked (>= 3 confirmed events)
 */
export function getFullyBookedDatesList(bookings = [], maxLimit = MAX_CONFIRMED_BOOKINGS_PER_DAY) {
  if (!Array.isArray(bookings)) return [];

  const dateCounts = {};
  bookings.forEach(b => {
    if (b.eventDate && (b.status === "Confirmed" || b.status === "Ongoing")) {
      const d = b.eventDate.split("T")[0];
      dateCounts[d] = (dateCounts[d] || 0) + 1;
    }
  });

  return Object.keys(dateCounts).filter(date => dateCounts[date] >= maxLimit);
}
