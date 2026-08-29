// =========================================================
// Reusable LocalStorage Utility Engine (JavaScript ES6)
// =========================================================

export const STORAGE_KEYS = {
  USERS: 'rideSharingUsers',
  CURRENT_USER: 'currentUser',
  DRIVERS: 'rideSharingDrivers',
  RIDES: 'rideSharingRides',
  BOOKINGS: 'rideSharingBookings',
  PAYMENTS: 'rideSharingPayments',
  VEHICLES: 'rideSharingVehicles',
  NOTIFICATIONS: 'rideSharingNotifications',
  INITIALIZED: 'rideSharing_initialized_v3'
};

/**
 * Safely retrieve JSON data from LocalStorage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Fallback value if key is not found or invalid
 * @returns {any} Parsed JSON data or defaultValue
 */
export function getStorageData(key, defaultValue = []) {
  if (typeof window === 'undefined') {
    return defaultValue;
  }

  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`LocalStorage read error for key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Safely write JSON data to LocalStorage
 * @param {string} key - Storage key
 * @param {any} data - Data to serialize and store
 */
export function setStorageData(key, data) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(key, JSON.stringify(data));
    // Dispatch reactive storage update event for cross-component and cross-tab sync
    window.dispatchEvent(new CustomEvent('rss_storage_update', { detail: { key, data } }));
  } catch (error) {
    console.error(`LocalStorage write error for key "${key}":`, error);
  }
}

/**
 * Safely remove an item from LocalStorage
 * @param {string} key - Storage key
 */
export function removeStorageData(key) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(key);
    window.dispatchEvent(new CustomEvent('rss_storage_update', { detail: { key, data: null } }));
  } catch (error) {
    console.error(`LocalStorage remove error for key "${key}":`, error);
  }
}

/**
 * Generate unique User ID in USRxxx format
 */
export function generateUniqueUserId() {
  const users = getStorageData(STORAGE_KEYS.USERS, []);
  const count = users.length + 1;
  return `USR${count < 10 ? `00${count}` : count < 100 ? `0${count}` : count}`;
}

/**
 * Generate unique Driver ID in DRVxxx format
 */
export function generateUniqueDriverId() {
  const drivers = getStorageData(STORAGE_KEYS.DRIVERS, []);
  const count = drivers.length + 1;
  return `DRV${count < 10 ? `00${count}` : count < 100 ? `0${count}` : count}`;
}

/**
 * Generate unique Ride ID in RIDExxx / Rxxx format
 */
export function generateUniqueRideId() {
  const rides = getStorageData(STORAGE_KEYS.RIDES, []);
  const count = 100 + rides.length + 1;
  return `RIDE${count}`;
}
