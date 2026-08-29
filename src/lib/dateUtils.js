// =========================================================
// Date & Time Utility for Indian Standard Time (Asia/Kolkata)
// =========================================================

/**
 * Returns current timestamp in Indian Standard Time (IST) with +05:30 offset
 * Example format: "2026-08-28T11:42:35+05:30"
 */
export function getIndiaTimestamp() {
  const now = new Date();
  const istOffsetMinutes = 330; // +05:30 = 330 minutes
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const istDate = new Date(utc + istOffsetMinutes * 60000);

  const pad = (n) => String(n).padStart(2, '0');
  const year = istDate.getFullYear();
  const month = pad(istDate.getMonth() + 1);
  const day = pad(istDate.getDate());
  const hours = pad(istDate.getHours());
  const minutes = pad(istDate.getMinutes());
  const seconds = pad(istDate.getSeconds());

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+05:30`;
}

/**
 * Formats an ISO / IST timestamp into a user-friendly display string
 * Example: "28 Aug 2026, 11:42 AM"
 * If null / empty: returns "Never logged in"
 */
export function formatLastLogin(timestamp) {
  if (!timestamp) return 'Never logged in';

  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return 'Never logged in';

    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    }).format(d);
  } catch (error) {
    return 'Never logged in';
  }
}

/**
 * Formats a joinedDate (YYYY-MM-DD) into display string
 * Example: "28 Aug 2026"
 */
export function formatJoinedDate(dateStr) {
  if (!dateStr) return 'N/A';

  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;

    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata'
    }).format(d);
  } catch (error) {
    return dateStr;
  }
}
