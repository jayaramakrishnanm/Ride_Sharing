// =========================================================
// Data Storage & Business Logic Engine (JavaScript ES6)
// Single Source of Truth: src/data/ (users.json, rides.json, payments.json, notifications.json)
// Client Session: localStorage ('currentUser')
// =========================================================

import seedUsersAndDrivers from '../data/users.json';
import seedRides from '../data/rides.json';
import seedPayments from '../data/payments.json';
import seedNotifications from '../data/notifications.json';

import {
  STORAGE_KEYS,
  getStorageData,
  setStorageData,
  removeStorageData
} from './localStorage';

export { STORAGE_KEYS, getStorageData, setStorageData, removeStorageData };

/**
 * Initialize storage with default rides/payments/notifications if empty.
 * NOTE: currentUser is initially null so new website visits start without any logged in user.
 */
export function initializeStorage(forceReset = false) {
  if (typeof window === 'undefined') return;

  const isInitialized = localStorage.getItem('rss_initialized_single_db_v8');

  if (!isInitialized || forceReset) {
    // Accounts (Users, Drivers, Admin)
    const existingUsers = getStorageData(STORAGE_KEYS.USERS, null);
    if (!existingUsers || forceReset) {
      setStorageData(STORAGE_KEYS.USERS, seedUsersAndDrivers);
    }

    // Rides
    const existingRides = getStorageData(STORAGE_KEYS.RIDES, null);
    if (!existingRides || forceReset) {
      setStorageData(STORAGE_KEYS.RIDES, seedRides);
      setStorageData(STORAGE_KEYS.BOOKINGS, seedRides);
    }

    // Payments
    const existingPayments = getStorageData(STORAGE_KEYS.PAYMENTS, null);
    if (!existingPayments || forceReset) {
      setStorageData(STORAGE_KEYS.PAYMENTS, seedPayments);
    }

    // Notifications
    const existingNotifs = getStorageData(STORAGE_KEYS.NOTIFICATIONS, null);
    if (!existingNotifs || forceReset) {
      setStorageData(STORAGE_KEYS.NOTIFICATIONS, seedNotifications);
    }

    // Always start logged out on reset
    if (forceReset) {
      setCurrentUser(null);
    }

    localStorage.setItem('rss_initialized_single_db_v8', 'true');
  }
}

// ----------------------------------------------------
// AUTH & SESSION MANAGEMENT (currentUser in LocalStorage)
// ----------------------------------------------------

export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  const userJson = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch (e) {
    return null;
  }
}

export function setCurrentUser(user) {
  if (typeof window === 'undefined') return;
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    window.dispatchEvent(new CustomEvent('rss_storage_update', { detail: { key: STORAGE_KEYS.CURRENT_USER, data: null } }));
  } else {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent('rss_storage_update', { detail: { key: STORAGE_KEYS.CURRENT_USER, data: user } }));
  }
}

export function logout() {
  setCurrentUser(null);
}

// ----------------------------------------------------
// ACCOUNTS (USERS, DRIVERS, ADMINS) - SINGLE SOURCE OF TRUTH
// ----------------------------------------------------

export function getAllAccounts() {
  if (typeof window !== 'undefined') {
    const stored = getStorageData(STORAGE_KEYS.USERS, null);
    if (stored && Array.isArray(stored) && stored.length > 0) {
      return stored;
    }
  }
  return seedUsersAndDrivers;
}

export function syncAccountToStorage(account, action = 'upsert') {
  if (typeof window === 'undefined') return;
  let accounts = getAllAccounts().slice();
  if (action === 'delete') {
    const targetId = typeof account === 'object' ? account.id : account;
    accounts = accounts.filter((a) => a.id !== targetId);
  } else {
    const index = accounts.findIndex((a) => a.id === account.id);
    if (index !== -1) {
      accounts[index] = { ...accounts[index], ...account };
    } else {
      accounts.push(account);
    }
  }
  setStorageData(STORAGE_KEYS.USERS, accounts);
}

export function getUsers() {
  return getAllAccounts().filter((a) => a.role === 'user' || a.role === 'passenger');
}

export function getUserById(id) {
  return getAllAccounts().find((u) => u.id === id);
}

export function getDrivers() {
  return getAllAccounts().filter((a) => a.role === 'driver');
}

export function getDriverById(id) {
  return getAllAccounts().find((d) => d.id === id);
}

export function getAdmins() {
  return getAllAccounts().filter((a) => a.role === 'admin');
}

/**
 * Client-Side / API Authenticate
 */
export async function authenticate(identifier, password, role) {
  const cleanId = (identifier || '').trim().toLowerCase();

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanId, password, role })
    });
    const data = await res.json();

    if (data.success && data.user) {
      syncAccountToStorage(data.user);
      setCurrentUser(data.user);
      return { success: true, user: data.user };
    } else if (res.status === 400 || res.status === 401 || res.status === 403 || res.status === 404) {
      return { success: false, error: data.error || 'Authentication failed.' };
    }
  } catch (err) {}

  // Fallback to local accounts
  const accounts = getAllAccounts();
  const account = accounts.find(
    (a) =>
      (a.email || '').toLowerCase() === cleanId ||
      (a.phone && a.phone.trim() === identifier.trim())
  );

  if (!account) {
    return { success: false, error: 'Account not found with this email or phone.' };
  }
  if (account.password && account.password !== password) {
    return { success: false, error: 'Incorrect password. Please try again.' };
  }
  if (account.status === 'Inactive') {
    return { success: false, error: 'Your account has been deactivated. Please contact support.' };
  }

  const updatedAccount = {
    ...account,
    lastLogin: new Date().toISOString()
  };
  syncAccountToStorage(updatedAccount);
  setCurrentUser(updatedAccount);
  return { success: true, user: updatedAccount };
}

/**
 * Register User via /api/users with robust client sync
 */
export async function registerUser(userData, isSelfRegister = true) {
  const cleanEmail = (userData.email || '').trim().toLowerCase();
  const cleanPhone = (userData.phone || '').trim();

  try {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...userData, role: 'user' })
    });
    const data = await res.json();

    if (data.success && data.user) {
      syncAccountToStorage(data.user);
      if (isSelfRegister) {
        setCurrentUser(data.user);
      }
      return { success: true, user: data.user };
    } else if (res.status === 400) {
      return { success: false, error: data.error || 'Registration failed.' };
    }
  } catch (error) {}

  // Client-Side Fallback Registration
  const accounts = getAllAccounts();
  if (accounts.some((a) => (a.email || '').toLowerCase() === cleanEmail)) {
    return { success: false, error: 'Email already registered' };
  }
  if (accounts.some((a) => (a.phone || '').trim() === cleanPhone)) {
    return { success: false, error: 'Phone number already registered' };
  }

  const userIds = accounts
    .filter((a) => (a.role === 'user' || a.role === 'passenger') && typeof a.id === 'string' && a.id.startsWith('U'))
    .map((a) => {
      const num = parseInt(a.id.replace(/\D/g, ''), 10);
      return isNaN(num) ? 0 : num;
    });
  const maxId = userIds.length > 0 ? Math.max(...userIds) : 100;
  const newId = `U${maxId + 1}`;

  const newAccount = {
    id: newId,
    name: userData.name.trim(),
    email: cleanEmail,
    phone: cleanPhone,
    password: userData.password,
    role: 'user',
    avatar: '',
    rating: 5.0,
    totalRides: 0,
    joinedDate: new Date().toISOString().split('T')[0],
    lastLogin: isSelfRegister ? new Date().toISOString() : null,
    emergencyContact: userData.emergencyContact || '',
    status: userData.status || 'Active'
  };

  syncAccountToStorage(newAccount);
  if (isSelfRegister) {
    setCurrentUser(newAccount);
  }
  return { success: true, user: newAccount };
}

export function saveUser(userData) {
  return registerUser(userData, false);
}

/**
 * Register Driver via /api/users with robust client sync
 */
export async function registerDriver(driverData, isSelfRegister = true) {
  const cleanEmail = (driverData.email || '').trim().toLowerCase();
  const cleanPhone = (driverData.phone || '').trim();

  try {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...driverData, role: 'driver' })
    });
    const data = await res.json();

    if (data.success && data.user) {
      syncAccountToStorage(data.user);
      if (isSelfRegister) {
        setCurrentUser(data.user);
      }
      return { success: true, user: data.user, driver: data.user };
    } else if (res.status === 400) {
      return { success: false, error: data.error || 'Driver registration failed.' };
    }
  } catch (error) {}

  // Client-Side Fallback Driver Registration
  const accounts = getAllAccounts();
  if (accounts.some((a) => (a.email || '').toLowerCase() === cleanEmail)) {
    return { success: false, error: 'Email already registered' };
  }
  if (accounts.some((a) => (a.phone || '').trim() === cleanPhone)) {
    return { success: false, error: 'Phone number already registered' };
  }

  const driverIds = accounts
    .filter((a) => a.role === 'driver' && typeof a.id === 'string' && a.id.startsWith('D'))
    .map((a) => {
      const num = parseInt(a.id.replace(/\D/g, ''), 10);
      return isNaN(num) ? 0 : num;
    });
  const maxId = driverIds.length > 0 ? Math.max(...driverIds) : 100;
  const newId = `D${maxId + 1}`;

  const newDriver = {
    id: newId,
    name: driverData.name.trim(),
    email: cleanEmail,
    phone: cleanPhone,
    password: driverData.password,
    role: 'driver',
    avatar: '',
    rating: 5.0,
    totalRides: 0,
    completedToday: 0,
    earningsToday: 0,
    totalEarnings: 0,
    joinedDate: new Date().toISOString().split('T')[0],
    lastLogin: isSelfRegister ? new Date().toISOString() : null,
    emergencyContact: driverData.emergencyContact || '',
    status: driverData.status || 'Active',
    licenseNumber: (driverData.licenseNumber || 'DL-PENDING').trim().toUpperCase(),
    vehicleType: driverData.vehicleType || 'Car',
    vehicleNumber: (driverData.vehicleNumber || 'TN01AB0000').trim().toUpperCase(),
    vehicleModel: driverData.vehicleModel || `${driverData.vehicleType || 'Car'} Standard`,
    vehicleColor: driverData.vehicleColor || 'Standard',
    drivingExperience: Number(driverData.drivingExperience) || 1,
    available: true,
    currentLocation: driverData.currentLocation || 'Chennai Central'
  };

  syncAccountToStorage(newDriver);
  if (isSelfRegister) {
    setCurrentUser(newDriver);
  }
  return { success: true, user: newDriver, driver: newDriver };
}

export function saveDriver(driverData) {
  return registerDriver(driverData, false);
}

/**
 * Update User or Driver Profile via /api/users (PUT) with client sync
 */
export async function updateAccount(id, updates) {
  let updatedAccount = null;

  try {
    const res = await fetch('/api/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates })
    });
    const data = await res.json();

    if (data.success && data.user) {
      updatedAccount = data.user;
    }
  } catch (e) {}

  if (!updatedAccount) {
    const accounts = getAllAccounts();
    const existing = accounts.find((a) => a.id === id);
    if (existing) {
      updatedAccount = { ...existing, ...updates };
    }
  }

  if (updatedAccount) {
    syncAccountToStorage(updatedAccount);
    const current = getCurrentUser();
    if (current && current.id === id) {
      setCurrentUser({ ...current, ...updatedAccount });
    }
  }

  return updatedAccount;
}

export function updateUser(id, updates) {
  return updateAccount(id, updates);
}

export function updateDriver(id, updates) {
  return updateAccount(id, updates);
}

/**
 * Delete User or Driver Account via /api/users (DELETE) with client sync
 */
export async function deleteAccount(id) {
  try {
    fetch(`/api/users?id=${encodeURIComponent(id)}`, {
      method: 'DELETE'
    }).catch(() => {});
  } catch (e) {}

  syncAccountToStorage(id, 'delete');
  return true;
}

export function deleteUser(id) {
  return deleteAccount(id);
}

export function deleteDriver(id) {
  return deleteAccount(id);
}

export function toggleDriverAvailability(id) {
  const driver = getDriverById(id);
  if (!driver) return false;
  const newStatus = !driver.available;
  updateDriver(id, { available: newStatus });
  return newStatus;
}

// ----------------------------------------------------
// RIDES & BOOKINGS CRUD (Persisted to src/data/rides.json)
// ----------------------------------------------------

export function getRides() {
  if (typeof window === 'undefined') return seedRides;
  initializeStorage();
  return getStorageData(STORAGE_KEYS.RIDES, seedRides);
}

export function getRideById(id) {
  return getRides().find((r) => r.id === id);
}

export function createRide(rideData) {
  const rides = getRides();
  const count = 100 + rides.length + 1;
  const newId = `R${count}`;
  const now = new Date().toISOString();

  const newRide = {
    ...rideData,
    id: newId,
    createdAt: now,
    updatedAt: now
  };

  rides.unshift(newRide);
  setStorageData(STORAGE_KEYS.RIDES, rides);
  setStorageData(STORAGE_KEYS.BOOKINGS, rides);

  // Asynchronously persist to src/data/rides.json
  if (typeof window !== 'undefined') {
    fetch('/api/rides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRide)
    }).catch((e) => console.warn('Could not sync ride to JSON file:', e));
  }

  // Notify online drivers
  const matchingDrivers = getDrivers().filter(
    (d) => d.available && d.status === 'Active' && d.vehicleType === newRide.vehicleType
  );
  matchingDrivers.forEach((driver) => {
    createNotification({
      recipientId: driver.id,
      recipientRole: 'driver',
      title: `New ${newRide.vehicleType} Request`,
      message: `${newRide.userName} requested a ride from ${newRide.pickup} to ${newRide.drop} (₹${newRide.fare}).`,
      rideId: newRide.id,
      type: 'new_request'
    });
  });

  return newRide;
}

export function acceptRide(rideId, driverId) {
  const rides = getRides();
  const index = rides.findIndex((r) => r.id === rideId);

  if (index === -1) {
    return { success: false, error: 'Ride request not found.' };
  }

  const ride = rides[index];
  if (ride.status !== 'Pending') {
    return {
      success: false,
      error: `This ride has already been ${ride.status.toLowerCase()} by another driver.`
    };
  }

  const driver = getDriverById(driverId);
  if (!driver) {
    return { success: false, error: 'Driver profile not found.' };
  }

  const updatedRide = {
    ...ride,
    driverId: driver.id,
    driverName: driver.name,
    driverPhone: driver.phone,
    vehicleModel: driver.vehicleModel,
    vehicleNumber: driver.vehicleNumber,
    status: 'Accepted',
    updatedAt: new Date().toISOString()
  };

  rides[index] = updatedRide;
  setStorageData(STORAGE_KEYS.RIDES, rides);
  setStorageData(STORAGE_KEYS.BOOKINGS, rides);

  // Sync to src/data/rides.json
  if (typeof window !== 'undefined') {
    fetch('/api/rides', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedRide)
    }).catch((e) => console.warn('Could not sync accept ride to JSON:', e));
  }

  createNotification({
    recipientId: ride.userId,
    recipientRole: 'user',
    title: 'Driver Accepted Your Ride!',
    message: `${driver.name} has accepted your ${ride.vehicleType} ride (${driver.vehicleNumber}).`,
    rideId: ride.id,
    type: 'ride_status'
  });

  return { success: true, ride: updatedRide };
}

export function updateRideStatus(rideId, status) {
  const rides = getRides();
  const index = rides.findIndex((r) => r.id === rideId);
  if (index === -1) return null;

  const prev = rides[index];
  const updatedRide = {
    ...prev,
    status,
    updatedAt: new Date().toISOString()
  };

  if (status === 'Completed' && prev.status !== 'Completed' && prev.driverId) {
    const driver = getDriverById(prev.driverId);
    if (driver) {
      updateDriver(driver.id, {
        completedToday: (driver.completedToday || 0) + 1,
        earningsToday: (driver.earningsToday || 0) + prev.fare,
        totalEarnings: (driver.totalEarnings || 0) + prev.fare,
        totalRides: (driver.totalRides || 0) + 1
      });
    }

    const user = getUserById(prev.userId);
    if (user) {
      updateUser(user.id, {
        totalRides: (user.totalRides || 0) + 1
      });
    }
  }

  rides[index] = updatedRide;
  setStorageData(STORAGE_KEYS.RIDES, rides);
  setStorageData(STORAGE_KEYS.BOOKINGS, rides);

  // Persist to src/data/rides.json
  if (typeof window !== 'undefined') {
    fetch('/api/rides', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedRide)
    }).catch((e) => console.warn('Could not sync ride status to JSON:', e));
  }

  let userMsg = '';
  let title = '';
  if (status === 'Driver Arriving') {
    title = 'Driver Arriving';
    userMsg = `Your driver ${prev.driverName || 'Partner'} is arriving at ${prev.pickup}.`;
  } else if (status === 'Ride Started') {
    title = 'Ride Started';
    userMsg = `Your ride to ${prev.drop} has started. OTP verified. Have a safe trip!`;
  } else if (status === 'Completed') {
    title = 'Ride Completed';
    userMsg = `You have arrived at ${prev.drop}. Total Fare: ₹${prev.fare}. Thank you for riding with us! Please rate your driver.`;
  } else if (status === 'Cancelled') {
    title = 'Ride Cancelled';
    userMsg = `Your ride request ${prev.id} has been cancelled.`;
  }

  if (userMsg) {
    createNotification({
      recipientId: prev.userId,
      recipientRole: 'user',
      title,
      message: userMsg,
      rideId: prev.id,
      type: 'ride_status'
    });
  }

  return updatedRide;
}

export function cancelRide(rideId, cancelledByRole) {
  const ride = getRideById(rideId);
  if (!ride) return false;
  if (ride.status === 'Completed' || ride.status === 'Cancelled') return false;

  updateRideStatus(rideId, 'Cancelled');

  if (cancelledByRole === 'user' && ride.driverId) {
    createNotification({
      recipientId: ride.driverId,
      recipientRole: 'driver',
      title: 'Ride Cancelled by Passenger',
      message: `Ride ${ride.id} (${ride.pickup} -> ${ride.drop}) was cancelled by the passenger.`,
      rideId: ride.id,
      type: 'ride_status'
    });
  }

  return true;
}

/**
 * Rate a completed ride and update driver's lifetime rating
 */
export function rateRide(rideId, rating, feedback) {
  const rides = getRides();
  const index = rides.findIndex((r) => r.id === rideId);
  if (index === -1) return false;

  const numRating = Number(rating) || 5;
  rides[index].rating = numRating;
  rides[index].feedback = feedback || 'Great ride!';
  rides[index].updatedAt = new Date().toISOString();

  setStorageData(STORAGE_KEYS.RIDES, rides);
  setStorageData(STORAGE_KEYS.BOOKINGS, rides);

  // Persist to src/data/rides.json
  if (typeof window !== 'undefined') {
    fetch('/api/rides', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rides[index])
    }).catch((e) => console.warn('Could not sync rating to JSON:', e));
  }

  // Update driver's overall rating
  if (rides[index].driverId) {
    const driverId = rides[index].driverId;
    const allDriverRides = rides.filter((r) => r.driverId === driverId && r.rating);
    const avgRating = allDriverRides.length > 0
      ? Number((allDriverRides.reduce((sum, r) => sum + Number(r.rating), 0) / allDriverRides.length).toFixed(1))
      : numRating;

    updateDriver(driverId, { rating: avgRating });

    createNotification({
      recipientId: driverId,
      recipientRole: 'driver',
      title: `${numRating}-Star Rating Received!`,
      message: `${rides[index].userName} rated you ${numRating} stars: "${feedback || 'No comments'}"`,
      rideId: rides[index].id,
      type: 'rating'
    });
  }

  window.dispatchEvent(new CustomEvent('rss_storage_update', { detail: { key: STORAGE_KEYS.RIDES, data: rides } }));
  return true;
}

// ----------------------------------------------------
// PAYMENTS CRUD (Persisted to src/data/payments.json)
// ----------------------------------------------------

export function getPayments() {
  if (typeof window === 'undefined') return seedPayments;
  initializeStorage();
  return getStorageData(STORAGE_KEYS.PAYMENTS, seedPayments);
}

export function processPaymentSimulation(rideId, method) {
  const ride = getRideById(rideId);
  const now = new Date();
  const payments = getPayments();

  const idNum = Math.floor(100 + payments.length + 1);
  const payment = {
    id: `PAY${idNum}`,
    rideId,
    userId: ride?.userId || 'U101',
    userName: ride?.userName || 'Passenger',
    driverId: ride?.driverId || null,
    driverName: ride?.driverName || null,
    amount: ride?.fare || 150,
    method,
    status: 'Success',
    transactionId: `TXN_${(method || 'UPI').toUpperCase()}_${Date.now()}`,
    date: now.toISOString().split('T')[0],
    time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  payments.unshift(payment);
  setStorageData(STORAGE_KEYS.PAYMENTS, payments);

  // Persist to src/data/payments.json
  if (typeof window !== 'undefined') {
    fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payment)
    }).catch((e) => console.warn('Could not sync payment to JSON:', e));
  }

  if (ride) {
    const rides = getRides();
    const rIndex = rides.findIndex((r) => r.id === rideId);
    if (rIndex !== -1) {
      rides[rIndex].paymentStatus = 'Paid';
      rides[rIndex].paymentMethod = method;
      setStorageData(STORAGE_KEYS.RIDES, rides);
      setStorageData(STORAGE_KEYS.BOOKINGS, rides);

      if (typeof window !== 'undefined') {
        fetch('/api/rides', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rides[rIndex])
        }).catch((e) => console.warn('Could not sync paymentStatus to JSON:', e));
      }
    }

    createNotification({
      recipientId: ride.userId,
      recipientRole: 'user',
      title: 'Payment Successful',
      message: `Payment of ₹${ride.fare} for ride ${ride.id} completed via ${method}.`,
      rideId: ride.id,
      type: 'payment_success'
    });
  }

  return { success: true, payment };
}

// ----------------------------------------------------
// NOTIFICATIONS CRUD (Persisted to src/data/notifications.json)
// ----------------------------------------------------

export function getNotifications(recipientId) {
  if (typeof window === 'undefined') return seedNotifications;
  initializeStorage();
  const notifications = getStorageData(STORAGE_KEYS.NOTIFICATIONS, seedNotifications);
  if (recipientId) {
    return notifications.filter((n) => n.recipientId === recipientId || n.recipientId === 'ALL');
  }
  return notifications;
}

export function createNotification(notif) {
  const notifications = getNotifications();
  const idNum = Math.floor(100 + notifications.length + 1);

  const newNotif = {
    ...notif,
    id: `N${idNum}`,
    read: false,
    createdAt: new Date().toISOString()
  };

  notifications.unshift(newNotif);
  setStorageData(STORAGE_KEYS.NOTIFICATIONS, notifications);

  // Persist to src/data/notifications.json
  if (typeof window !== 'undefined') {
    fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNotif)
    }).catch((e) => console.warn('Could not sync notif to JSON:', e));
  }

  return newNotif;
}

export function markNotificationAsRead(id) {
  const notifications = getNotifications();
  const target = notifications.find((n) => n.id === id);
  if (target) {
    target.read = true;
    setStorageData(STORAGE_KEYS.NOTIFICATIONS, notifications);

    if (typeof window !== 'undefined') {
      fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      }).catch((e) => console.warn('Could not sync markRead to JSON:', e));
    }
  }
}

export function markAllNotificationsAsRead(recipientId) {
  const notifications = getNotifications();
  notifications.forEach((n) => {
    if (n.recipientId === recipientId || n.recipientId === 'ALL') {
      n.read = true;
    }
  });
  setStorageData(STORAGE_KEYS.NOTIFICATIONS, notifications);

  if (typeof window !== 'undefined') {
    fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientId, markAll: true })
    }).catch((e) => console.warn('Could not sync markAll to JSON:', e));
  }
}

export function deleteNotification(id) {
  let notifications = getNotifications();
  notifications = notifications.filter((n) => n.id !== id);
  setStorageData(STORAGE_KEYS.NOTIFICATIONS, notifications);
}
