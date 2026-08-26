import { User, Driver, Ride, Payment, Notification, UserRole, RideStatus, PaymentMethod } from './types';
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
  INITIALIZED: 'rss_initialized_v1'
};

// Dispatch local event for instant reactive component updates across the app
function notifyChange(key: string, data?: any) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('rss_storage_update', { detail: { key, data } }));
  }
}

/**
 * Initialize LocalStorage with seed JSON data if empty or not initialized
 */
export function initializeStorage(forceReset = false): void {
  if (typeof window === 'undefined') return;

  const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);

  if (!isInitialized || forceReset) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(seedUsers));
    localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(seedDrivers));
    localStorage.setItem(STORAGE_KEYS.RIDES, JSON.stringify(seedRides));
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(seedPayments));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(seedNotifications));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');

    // Default demo session if none set
    if (!sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER) || forceReset) {
      sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(seedUsers[0]));
    }

    notifyChange('all');
  }
}

// ----------------------------------------------------
// AUTH & SESSION MANAGEMENT (SessionStorage)
// ----------------------------------------------------

export function getCurrentUser(): (User | Driver) | null {
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

export function setCurrentUser(user: User | Driver | null): void {
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

export function logout(): void {
  setCurrentUser(null);
}

export function authenticate(email: string, password?: string, role?: UserRole): { success: boolean; user?: User | Driver; error?: string } {
  initializeStorage();
  const cleanEmail = email.trim().toLowerCase();

  if (role === 'driver') {
    const drivers = getDrivers();
    const driver = drivers.find(d => d.email.toLowerCase() === cleanEmail);
    if (!driver) return { success: false, error: 'Driver account not found with this email.' };
    if (password && driver.password && driver.password !== password) {
      return { success: false, error: 'Incorrect password.' };
    }
    if (driver.status === 'Inactive') {
      return { success: false, error: 'Your driver account has been deactivated by the admin.' };
    }
    setCurrentUser(driver);
    return { success: true, user: driver };
  } else {
    // Passenger or Admin
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);
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

export function getUsers(): User[] {
  if (typeof window === 'undefined') return seedUsers as User[];
  initializeStorage();
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : seedUsers as User[];
  } catch (e) {
    return seedUsers as User[];
  }
}

export function getUserById(id: string): User | undefined {
  return getUsers().find(u => u.id === id);
}

export function saveUser(user: Omit<User, 'id'> & { id?: string }): User {
  const users = getUsers();
  const newId = user.id || `U${100 + users.length + 1}`;
  const newUser: User = {
    ...user,
    id: newId,
    role: user.role || 'user',
    status: user.status || 'Active',
    rating: user.rating || 5.0,
    totalRides: user.totalRides || 0,
    joinedDate: user.joinedDate || new Date().toISOString().split('T')[0]
  };

  const index = users.findIndex(u => u.id === newUser.id);
  if (index >= 0) {
    users[index] = newUser;
  } else {
    users.push(newUser);
  }

  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  notifyChange(STORAGE_KEYS.USERS, users);
  return newUser;
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  const users = getUsers();
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return null;

  users[index] = { ...users[index], ...updates };
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

  // If current logged-in user was updated, sync session
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === id) {
    setCurrentUser(users[index]);
  }

  notifyChange(STORAGE_KEYS.USERS, users);
  return users[index];
}

export function deleteUser(id: string): boolean {
  let users = getUsers();
  const initialLength = users.length;
  users = users.filter(u => u.id !== id);
  if (users.length === initialLength) return false;

  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  notifyChange(STORAGE_KEYS.USERS, users);
  return true;
}

// ----------------------------------------------------
// DRIVERS CRUD
// ----------------------------------------------------

export function getDrivers(): Driver[] {
  if (typeof window === 'undefined') return seedDrivers as Driver[];
  initializeStorage();
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DRIVERS);
    return data ? JSON.parse(data) : seedDrivers as Driver[];
  } catch (e) {
    return seedDrivers as Driver[];
  }
}

export function getDriverById(id: string): Driver | undefined {
  return getDrivers().find(d => d.id === id);
}

export function saveDriver(driver: Omit<Driver, 'id'> & { id?: string }): Driver {
  const drivers = getDrivers();
  const newId = driver.id || `D${100 + drivers.length + 1}`;
  const newDriver: Driver = {
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

  const index = drivers.findIndex(d => d.id === newDriver.id);
  if (index >= 0) {
    drivers[index] = newDriver;
  } else {
    drivers.push(newDriver);
  }

  localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
  notifyChange(STORAGE_KEYS.DRIVERS, drivers);
  return newDriver;
}

export function updateDriver(id: string, updates: Partial<Driver>): Driver | null {
  const drivers = getDrivers();
  const index = drivers.findIndex(d => d.id === id);
  if (index === -1) return null;

  drivers[index] = { ...drivers[index], ...updates };
  localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));

  // If current logged-in driver was updated, sync session
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === id) {
    setCurrentUser(drivers[index]);
  }

  notifyChange(STORAGE_KEYS.DRIVERS, drivers);
  return drivers[index];
}

export function toggleDriverAvailability(id: string): boolean {
  const driver = getDriverById(id);
  if (!driver) return false;
  const updated = updateDriver(id, { available: !driver.available });
  return !!updated?.available;
}

export function deleteDriver(id: string): boolean {
  let drivers = getDrivers();
  const initialLength = drivers.length;
  drivers = drivers.filter(d => d.id !== id);
  if (drivers.length === initialLength) return false;

  localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
  notifyChange(STORAGE_KEYS.DRIVERS, drivers);
  return true;
}

// ----------------------------------------------------
// RIDES CRUD & STATUS LIFECYCLE
// ----------------------------------------------------

export function getRides(): Ride[] {
  if (typeof window === 'undefined') return seedRides as Ride[];
  initializeStorage();
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RIDES);
    return data ? JSON.parse(data) : seedRides as Ride[];
  } catch (e) {
    return seedRides as Ride[];
  }
}

export function getRideById(id: string): Ride | undefined {
  return getRides().find(r => r.id === id);
}

export function createRide(rideData: Omit<Ride, 'id' | 'createdAt' | 'updatedAt'>): Ride {
  const rides = getRides();
  const idNum = Math.floor(100 + Math.random() * 900);
  const now = new Date().toISOString();

  const newRide: Ride = {
    ...rideData,
    id: `R${idNum}`,
    createdAt: now,
    updatedAt: now
  };

  rides.unshift(newRide); // Put newest on top
  localStorage.setItem(STORAGE_KEYS.RIDES, JSON.stringify(rides));

  // Notify online drivers of matching vehicle type
  const matchingDrivers = getDrivers().filter(d => d.available && d.status === 'Active' && d.vehicleType === newRide.vehicleType);
  matchingDrivers.forEach(driver => {
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

export function acceptRide(rideId: string, driverId: string): { success: boolean; ride?: Ride; error?: string } {
  const rides = getRides();
  const index = rides.findIndex(r => r.id === rideId);

  if (index === -1) {
    return { success: false, error: 'Ride request not found.' };
  }

  const ride = rides[index];
  // Strict check: Only Pending rides can be accepted
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

  const updatedRide: Ride = {
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

export function updateRideStatus(rideId: string, status: RideStatus): Ride | null {
  const rides = getRides();
  const index = rides.findIndex(r => r.id === rideId);
  if (index === -1) return null;

  const prev = rides[index];
  const updatedRide: Ride = {
    ...prev,
    status,
    updatedAt: new Date().toISOString()
  };

  // If completed, update driver earnings
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

  // Dynamic notification generation based on status
  let userMsg = '';
  let title = '';
  if (status === 'Driver Arriving') {
    title = 'Driver Arriving';
    userMsg = `Your driver ${prev.driverName || 'Partner'} is arriving at your pickup location: ${prev.pickup}.`;
  } else if (status === 'Ride Started') {
    title = 'Ride Started';
    userMsg = `Your ride to ${prev.drop} has started. OTP verified. Have a safe journey!`;
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

export function cancelRide(rideId: string, cancelledByRole: 'user' | 'driver' | 'admin'): boolean {
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

export function rateRide(rideId: string, rating: number, feedback: string): boolean {
  const rides = getRides();
  const index = rides.findIndex(r => r.id === rideId);
  if (index === -1) return false;

  rides[index].rating = rating;
  rides[index].feedback = feedback;
  rides[index].updatedAt = new Date().toISOString();

  localStorage.setItem(STORAGE_KEYS.RIDES, JSON.stringify(rides));

  // Notify driver of the rating
  if (rides[index].driverId) {
    createNotification({
      recipientId: rides[index].driverId!,
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

export function getPayments(): Payment[] {
  if (typeof window === 'undefined') return seedPayments as Payment[];
  initializeStorage();
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return data ? JSON.parse(data) : seedPayments as Payment[];
  } catch (e) {
    return seedPayments as Payment[];
  }
}

export function processPaymentSimulation(rideId: string, method: PaymentMethod): { success: boolean; payment: Payment } {
  const ride = getRideById(rideId);
  const now = new Date();
  const payments = getPayments();

  const idNum = Math.floor(100 + payments.length + 1);
  const payment: Payment = {
    id: `PAY${idNum}`,
    rideId,
    userId: ride?.userId || 'U101',
    userName: ride?.userName || 'Passenger',
    driverId: ride?.driverId || null,
    driverName: ride?.driverName || null,
    amount: ride?.fare || 150,
    method,
    status: 'Success',
    transactionId: `TXN_${method.toUpperCase()}_${Date.now()}`,
    date: now.toISOString().split('T')[0],
    time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  payments.unshift(payment);
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));

  // Mark ride as Paid
  if (ride) {
    const rides = getRides();
    const rIndex = rides.findIndex(r => r.id === rideId);
    if (rIndex !== -1) {
      rides[rIndex].paymentStatus = 'Paid';
      rides[rIndex].paymentMethod = method;
      localStorage.setItem(STORAGE_KEYS.RIDES, JSON.stringify(rides));
    }

    // Add confirmation notification
    createNotification({
      recipientId: ride.userId,
      recipientRole: 'user',
      title: 'Payment Successful',
      message: `Payment of ₹${ride.fare} for ride ${ride.id} completed via ${method}.`,
      rideId: ride.id,
      type: 'payment_success'
    });

    if (ride.driverId) {
      createNotification({
        recipientId: ride.driverId,
        recipientRole: 'driver',
        title: 'Payment Received',
        message: `₹${ride.fare} received for ride ${ride.id} via ${method}.`,
        rideId: ride.id,
        type: 'payment_success'
      });
    }
  }

  notifyChange(STORAGE_KEYS.PAYMENTS, payments);
  notifyChange(STORAGE_KEYS.RIDES);
  return { success: true, payment };
}

// ----------------------------------------------------
// NOTIFICATIONS CRUD
// ----------------------------------------------------

export function getNotifications(recipientId?: string): Notification[] {
  if (typeof window === 'undefined') return seedNotifications as Notification[];
  initializeStorage();
  try {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const notifications: Notification[] = data ? JSON.parse(data) : seedNotifications as Notification[];
    if (recipientId) {
      return notifications.filter(n => n.recipientId === recipientId || n.recipientId === 'ALL');
    }
    return notifications;
  } catch (e) {
    return seedNotifications as Notification[];
  }
}

export function createNotification(notif: Omit<Notification, 'id' | 'read' | 'createdAt'>): Notification {
  const notifications = getNotifications();
  const idNum = Math.floor(100 + notifications.length + 1);

  const newNotif: Notification = {
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

export function markNotificationAsRead(id: string): void {
  const notifications = getNotifications();
  const target = notifications.find(n => n.id === id);
  if (target) {
    target.read = true;
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    notifyChange(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }
}

export function markAllNotificationsAsRead(recipientId: string): void {
  const notifications = getNotifications();
  notifications.forEach(n => {
    if (n.recipientId === recipientId || n.recipientId === 'ALL') {
      n.read = true;
    }
  });
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  notifyChange(STORAGE_KEYS.NOTIFICATIONS, notifications);
}

export function deleteNotification(id: string): void {
  let notifications = getNotifications();
  notifications = notifications.filter(n => n.id !== id);
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  notifyChange(STORAGE_KEYS.NOTIFICATIONS, notifications);
}
