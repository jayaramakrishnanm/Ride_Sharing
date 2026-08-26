export type UserRole = 'user' | 'driver' | 'admin';
export type VehicleType = 'Car' | 'Bike';
export type RideStatus = 'Pending' | 'Accepted' | 'Driver Arriving' | 'Ride Started' | 'Completed' | 'Cancelled';
export type PaymentMethod = 'UPI' | 'Card' | 'Cash';
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: 'user' | 'admin';
  avatar?: string;
  rating?: number;
  totalRides?: number;
  joinedDate?: string;
  emergencyContact?: string;
  status: 'Active' | 'Inactive';
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: 'driver';
  avatar?: string;
  vehicleType: VehicleType;
  vehicleModel: string;
  vehicleNumber: string;
  licenseNumber: string;
  available: boolean;
  rating: number;
  totalRides: number;
  completedToday: number;
  earningsToday: number;
  totalEarnings: number;
  status: 'Active' | 'Inactive';
  currentLocation: string;
  joinedDate?: string;
}

export interface Ride {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  driverId: string | null;
  driverName: string | null;
  driverPhone: string | null;
  pickup: string;
  drop: string;
  vehicleType: VehicleType;
  vehicleModel: string | null;
  vehicleNumber: string | null;
  distanceKm: number;
  fare: number;
  baseFare: number;
  distanceFare: number;
  date: string;
  time: string;
  passengers: number;
  status: RideStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  otp: string;
  rating: number | null;
  feedback: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  rideId: string;
  userId: string;
  userName: string;
  driverId: string | null;
  driverName: string | null;
  amount: number;
  method: PaymentMethod;
  status: 'Success' | 'Pending' | 'Failed';
  transactionId: string;
  date: string;
  time: string;
}

export interface Notification {
  id: string;
  recipientId: string;
  recipientRole: UserRole;
  title: string;
  message: string;
  rideId?: string | null;
  type: 'ride_status' | 'new_request' | 'ride_assignment' | 'payment_success' | 'rating' | 'system_alert' | 'driver_alert' | 'safety_alert' | 'promo';
  read: boolean;
  createdAt: string;
}

export interface FareCalculationResult {
  vehicleType: VehicleType;
  baseFare: number;
  ratePerKm: number;
  distanceKm: number;
  distanceFare: number;
  estimatedDurationMins: number;
  totalFare: number;
}
