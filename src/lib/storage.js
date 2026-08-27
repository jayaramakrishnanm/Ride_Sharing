// =========================================================
// LocalStorage & SessionStorage Engine (JavaScript ES6)
// =========================================================

import seedUsers from '../data/users.json';
import seedDrivers from '../data/drivers.json';
import seedRides from '../data/rides.json';
import seedPayments from '../data/payments.json';
import seedNotifications from '../data/notifications.json';

const STORAGE_KEYS = {
  USERS: 'rss_users',
  DRIVERS: 'rss_drivers',
  RIDES: 'rss_rides',
  PAYMENTS: 'rss_payments',
  NOTIFICATIONS: 'rss_notifications',
  CURRENT_USER: 'rss_currentUser',
  INITIALIZED: 'rss_initialized_v2'
};

// Dispatch local event for reactive updates across components and tabs
function notifyChange(key, data) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('rss_storage_update', { detail: { key, data } }));
  }
}

/**
 * Initialize LocalStorage with seed JSON data if empty or forced reset
 */
export function initializeStorage(forceReset = false) {
  if (typeof window === 'undefined') return;

  const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);

  if (!isInitialized || forceReset) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(seedUsers));
    localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(seedDrivers));
    localStorage.setItem(STORAGE_KEYS.RIDES, JSON.stringify(seedRides));
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(seedPayments));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(seedNotifications));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');

    if (!sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER) || forceReset) {
      sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(seedUsers[0]));
    }

    notifyChange('all');
  }
}

// ----------------------------------------------------
// AUTH & SESSION MANAGEMENT (SessionStorage)
// ----------------------------------------------------

export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  initializeStorage();
  
  const userJson = sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER) || localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
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
    sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  } else {
    sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }
  notifyChange(STORAGE_KEYS.CURRENT_USER, user);
}

export function logout() {
  setCurrentUser(null);
}

export function authenticate(email, password, role) {
  initializeStorage();
  const cleanEmail = (email || '').trim().toLowerCase();

  if (role === 'driver') {
    const drivers = getDrivers();
    const driver = drivers.find((d) => d.email.toLowerCase() === cleanEmail);
    if (!driver) return { success: false, error: 'Driver account not found with this email.' };
    if (password && driver.password && driver.password !== password) {
      return { success: false, error: 'Incorrect password.' };
    }
    if (driver.status === 'Inactive') {
      return { success: false, error: 'Your driver account has been deactivated by the administrator.' };
    }
    setCurrentUser(driver);
    return { success: true, user: driver };
  } else {
    const users = getUsers();
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) return { success: false, error: 'Account not found with this email.' };
    if (password && user.password && user.password !== password) {
      return { success: false, error: 'Incorrect password.' };
    }
    if (role && user.role !== role && !(role === 'user' && user.role === 'admin')) {
      return { success: false, error: `Account exists but role is ${user.role}. Please select the matching tab.` };
    }
    setCurrentUser(user);
    return { success: true, user };
  }
}

// ----------------------------------------------------
// USERS CRUD
// ----------------------------------------------------

export function getUsers() {
  if (typeof window === 'undefined') return seedUsers;
  initializeStorage();
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : seedUsers;
  } catch (e) {
    return seedUsers;
  }
}

export function getUserById(id) {
  return getUsers().find((u) => u.id === id);
}

export function saveUser(user) {
  const users = getUsers();
  const newId = user.id || `U${100 + users.length + 1}`;
  const newUser = {
    ...user,
    id: newId,
    role: user.role || 'user',
    status: user.status || 'Active',
    rating: user.rating || 5.0,
    totalRides: user.totalRides || 0,
    joinedDate: user.joinedDate || new Date().toISOString().split('T')[0]
  };

  const index = users.findIndex((u) => u.id === newUser.id);
  if (index >= 0) {
    users[index] = newUser;
  } else {
    users.push(newUser);
  }

  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  notifyChange(STORAGE_KEYS.USERS, users);
  return newUser;
}

export function updateUser(id, updates) {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return null;

  users[index] = { ...users[index], ...updates };
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === id) {
    setCurrentUser(users[index]);
  }

  notifyChange(STORAGE_KEYS.USERS, users);
  return users[index];
}

export function deleteUser(id) {
  let users = getUsers();
  const initialLength = users.length;
  users = users.filter((u) => u.id !== id);
  if (users.length === initialLength) return false;

  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  notifyChange(STORAGE_KEYS.USERS, users);
  return true;
}

// ----------------------------------------------------
// DRIVERS CRUD
// ----------------------------------------------------

export function getDrivers() {
  if (typeof window === 'undefined') return seedDrivers;
  initializeStorage();
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DRIVERS);
    return data ? JSON.parse(data) : seedDrivers;
  } catch (e) {
    return seedDrivers;
  }
}

export function getDriverById(id) {
  return getDrivers().find((d) => d.id === id);
}

export function saveDriver(driver) {
  const drivers = getDrivers();
  const newId = driver.id || `D${100 + drivers.length + 1}`;
  const newDriver = {
    ...driver,
    id: newId,
    role: 'driver',
    available: driver.available !== undefined ? driver.available : true,
    rating: driver.rating || 5.0,
    totalRides: driver.totalRides || 0,
    completedToday: driver.completedToday || 0,
    earningsToday: driver.earningsToday || 0,
    totalEarnings: driver.totalEarnings || 0,
    status: driver.status || 'Active',
    joinedDate: driver.joinedDate || new Date().toISOString().split('T')[0]
  };

  const index = drivers.findIndex((d) => d.id === newDriver.id);
  if (index >= 0) {
    drivers[index] = newDriver;
  } else {
    drivers.push(newDriver);
  }

  localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
  notifyChange(STORAGE_KEYS.DRIVERS, drivers);
  return newDriver;
}

export function updateDriver(id, updates) {
  const drivers = getDrivers();
  const index = drivers.findIndex((d) => d.id === id);
  if (index === -1) return null;

  drivers[index] = { ...drivers[index], ...updates };
  localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));

  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === id) {
    setCurrentUser(drivers[index]);
  }

  notifyChange(STORAGE_KEYS.DRIVERS, drivers);
  return drivers[index];
}

export function toggleDriverAvailability(id) {
  const driver = getDriverById(id);
  if (!driver) return false;
  const updated = updateDriver(id, { available: !driver.available });
  return !!updated?.available;
}

export function deleteDriver(id) {
  let drivers = getDrivers();
  const initialLength = drivers.length;
  drivers = drivers.filter((d) => d.id !== id);
  if (drivers.length === initialLength) return false;

  localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
  notifyChange(STORAGE_KEYS.DRIVERS, drivers);
  return true;
}

// ----------------------------------------------------
// RIDES CRUD & STATUS LIFECYCLE
// ----------------------------------------------------

export function getRides() {
  if (typeof window === 'undefined') return seedRides;
  initializeStorage();
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RIDES);
    return data ? JSON.parse(data) : seedRides;
  } catch (e) {
    return seedRides;
  }
}

export function getRideById(id) {
  return getRides().find((r) => r.id === id);
}

export function createRide(rideData) {
  const rides = getRides();
  const idNum = Math.floor(100 + Math.random() * 900);
  const now = new Date().toISOString();

  const newRide = {
    ...rideData,
    id: `R${idNum}`,
    createdAt: now,
    updatedAt: now
  };

  rides.unshift(newRide);
  localStorage.setItem(STORAGE_KEYS.RIDES, JSON.stringify(rides));

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

  notifyChange(STORAGE_KEYS.RIDES, rides);
  return newRide;
}

export function acceptRide(rideId, driverId) {
  const rides = getRides();
  const index = rides.findIndex((r) => r.id === rideId);

  if (index === -1) {
    return { success: false, error: 'Ride request not found.' };
  }

  const ride = rides[index];
  // Strict Concurrency Check: Only Pending rides can be accepted
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
  localStorage.setItem(STORAGE_KEYS.RIDES, JSON.stringify(rides));

  // Notify passenger
  createNotification({
    recipientId: ride.userId,
    recipientRole: 'user',
    title: 'Driver Accepted Your Ride!',
    message: `${driver.name} has accepted your ${ride.vehicleType} ride (${driver.vehicleNumber}).`,
    rideId: ride.id,
    type: 'ride_status'
  });

  notifyChange(STORAGE_KEYS.RIDES, rides);
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
  localStorage.setItem(STORAGE_KEYS.RIDES, JSON.stringify(rides));

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
    userMsg = `You have arrived at ${prev.drop}. Total Fare: ₹${prev.fare}. Thank you for riding with us!`;
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

  notifyChange(STORAGE_KEYS.RIDES, rides);
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

export function rateRide(rideId, rating, feedback) {
  const rides = getRides();
  const index = rides.findIndex((r) => r.id === rideId);
  if (index === -1) return false;

  rides[index].rating = rating;
  rides[index].feedback = feedback;
  rides[index].updatedAt = new Date().toISOString();

  localStorage.setItem(STORAGE_KEYS.RIDES, JSON.stringify(rides));

  if (rides[index].driverId) {
    createNotification({
      recipientId: rides[index].driverId,
      recipientRole: 'driver',
      title: `${rating}-Star Rating Received`,
      message: `${rides[index].userName} rated you ${rating} stars: "${feedback || 'No comments'}"`,
      rideId: rides[index].id,
      type: 'rating'
    });
  }

  notifyChange(STORAGE_KEYS.RIDES, rides);
  return true;
}

// ----------------------------------------------------
// PAYMENTS CRUD
// ----------------------------------------------------

export function getPayments() {
  if (typeof window === 'undefined') return seedPayments;
  initializeStorage();
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return data ? JSON.parse(data) : seedPayments;
  } catch (e) {
    return seedPayments;
  }
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
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));

  if (ride) {
    const rides = getRides();
    const rIndex = rides.findIndex((r) => r.id === rideId);
    if (rIndex !== -1) {
      rides[rIndex].paymentStatus = 'Paid';
      rides[rIndex].paymentMethod = method;
      localStorage.setItem(STORAGE_KEYS.RIDES, JSON.stringify(rides));
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

  notifyChange(STORAGE_KEYS.PAYMENTS, payments);
  notifyChange(STORAGE_KEYS.RIDES);
  return { success: true, payment };
}

// ----------------------------------------------------
// NOTIFICATIONS CRUD
// ----------------------------------------------------

export function getNotifications(recipientId) {
  if (typeof window === 'undefined') return seedNotifications;
  initializeStorage();
  try {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const notifications = data ? JSON.parse(data) : seedNotifications;
    if (recipientId) {
      return notifications.filter((n) => n.recipientId === recipientId || n.recipientId === 'ALL');
    }
    return notifications;
  } catch (e) {
    return seedNotifications;
  }
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
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  notifyChange(STORAGE_KEYS.NOTIFICATIONS, notifications);
  return newNotif;
}

export function markNotificationAsRead(id) {
  const notifications = getNotifications();
  const target = notifications.find((n) => n.id === id);
  if (target) {
    target.read = true;
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    notifyChange(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }
}

export function markAllNotificationsAsRead(recipientId) {
  const notifications = getNotifications();
  notifications.forEach((n) => {
    if (n.recipientId === recipientId || n.recipientId === 'ALL') {
      n.read = true;
    }
  });
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  notifyChange(STORAGE_KEYS.NOTIFICATIONS, notifications);
}

export function deleteNotification(id) {
  let notifications = getNotifications();
  notifications = notifications.filter((n) => n.id !== id);
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  notifyChange(STORAGE_KEYS.NOTIFICATIONS, notifications);
}
