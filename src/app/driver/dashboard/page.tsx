'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  getCurrentUser, 
  getDrivers, 
  getRides, 
  updateDriver, 
  acceptRide,
  toggleDriverAvailability 
} from '@/lib/storage';
import { Driver, Ride } from '@/lib/types';
import { formatCurrency } from '@/lib/fareCalculator';
import { useToast } from '@/components/Toast';
import { 
  Car, 
  Bike, 
  Power, 
  Inbox, 
  Compass, 
  CheckCircle2, 
  DollarSign, 
  Clock, 
  ArrowRight, 
  MapPin, 
  User, 
  Star,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export default function DriverDashboard() {
  const router = useRouter();
  const { showToast } = useToast();

  const [driver, setDriver] = useState<Driver | null>(null);
  const [pendingRequests, setPendingRequests] = useState<Ride[]>([]);
  const [activeTrip, setActiveTrip] = useState<Ride | null>(null);
  const [todayCompletedRides, setTodayCompletedRides] = useState<Ride[]>([]);

  const loadData = () => {
    const user = getCurrentUser() as Driver;
    if (user && user.role === 'driver') {
      const allDrivers = getDrivers();
      const current = allDrivers.find((d) => d.id === user.id) || user;
      setDriver(current);

      const allRides = getRides();

      // Pending requests matching driver's vehicle type
      const pending = allRides.filter(
        (r) => r.status === 'Pending' && r.vehicleType === current.vehicleType
      );
      setPendingRequests(pending);

      // Active trip assigned to this driver
      const active = allRides.find(
        (r) => r.driverId === current.id && r.status !== 'Completed' && r.status !== 'Cancelled'
      );
      setActiveTrip(active || null);

      // Completed rides today
      const today = new Date().toISOString().split('T')[0];
      const completedToday = allRides.filter(
        (r) => r.driverId === current.id && r.status === 'Completed' && r.date === today
      );
      setTodayCompletedRides(completedToday);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('rss_storage_update', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('rss_storage_update', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleToggleOnline = () => {
    if (!driver) return;
    const newStatus = !driver.available;
    updateDriver(driver.id, { available: newStatus });
    setDriver({ ...driver, available: newStatus });
    showToast(
      newStatus ? 'You are now ONLINE and ready to receive ride requests.' : 'You are now OFFLINE. No new requests will be assigned.',
      newStatus ? 'success' : 'info'
    );
  };

  const handleAcceptRequest = (rideId: string) => {
    if (!driver) return;
    if (!driver.available) {
      showToast('Please toggle your status to ONLINE before accepting rides.', 'warning');
      return;
    }

    const result = acceptRide(rideId, driver.id);
    if (!result.success) {
      showToast(result.error || 'Failed to accept ride.', 'error');
      loadData();
      return;
    }

    showToast(`Ride #${rideId} accepted! Proceed to pickup location.`, 'success');
    router.push('/driver/active-ride');
  };

  const todayEarnings = driver?.earningsToday || todayCompletedRides.reduce((acc, r) => acc + r.fare, 0);

  return (
    <div className="space-y-8">
      {/* Driver Header & Online Toggle Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-slate-700">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400">
              Partner ID: {driver?.id || 'D101'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
            <span className="text-xs text-slate-300 flex items-center gap-1 font-medium">
              {driver?.vehicleType === 'Car' ? <Car className="w-3.5 h-3.5 text-sky-400" /> : <Bike className="w-3.5 h-3.5 text-emerald-400" />}
              {driver?.vehicleModel || 'Standard Vehicle'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black">
            Driver: {driver?.name || 'Arun Prakash'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Plate No: <span className="font-mono font-bold text-white">{driver?.vehicleNumber || 'TN01AB1234'}</span> • License: <span className="font-mono">{driver?.licenseNumber}</span>
          </p>
        </div>

        {/* Online / Offline Toggle Button */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          <button
            onClick={handleToggleOnline}
            className={`px-5 py-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2.5 transition-all shadow-lg active:scale-95 ${
              driver?.available
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30 animate-pulse-slow'
                : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{driver?.available ? '● ONLINE' : '○ OFFLINE'}</span>
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">New Requests</span>
            <Inbox className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {pendingRequests.length}
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            {driver?.available ? 'Waiting for acceptance' : 'Go Online to accept'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Ride</span>
            <Compass className="w-5 h-5 text-sky-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {activeTrip ? '1' : '0'}
          </div>
          <p className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">
            {activeTrip ? 'Trip in progress' : 'Ready for pickup'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed Today</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {driver?.completedToday || todayCompletedRides.length}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Total lifetime: {driver?.totalRides || 0}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Today's Earnings</span>
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {formatCurrency(todayEarnings)}
          </div>
          <p className="text-[11px] text-slate-500">
            Lifetime: {formatCurrency(driver?.totalEarnings || 0)}
          </p>
        </div>
      </div>

      {/* Active Trip Banner if ongoing */}
      {activeTrip && (
        <div className="p-6 bg-gradient-to-r from-sky-900 to-indigo-900 text-white rounded-3xl shadow-xl border border-sky-700 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 text-sky-300 rounded-2xl">
                <Compass className="w-6 h-6 animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-sky-300">
                    TRIP #{activeTrip.id}
                  </span>
                  <span className="px-2.5 py-0.5 bg-sky-500 text-white text-[11px] font-bold rounded-full">
                    {activeTrip.status}
                  </span>
                </div>
                <h3 className="text-base font-bold mt-1">
                  {activeTrip.pickup} ➔ {activeTrip.drop}
                </h3>
              </div>
            </div>

            <Link
              href="/driver/active-ride"
              className="px-5 py-3 bg-white text-sky-900 hover:bg-sky-50 font-bold rounded-xl text-xs flex items-center justify-center gap-2 self-start sm:self-center shadow-lg"
            >
              <span>Manage / Progress Trip</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-sky-800 text-xs">
            <div>
              <span className="text-sky-300">Passenger:</span>
              <p className="font-bold text-white">{activeTrip.userName}</p>
            </div>
            <div>
              <span className="text-sky-300">Contact:</span>
              <p className="font-semibold text-white">{activeTrip.userPhone}</p>
            </div>
            <div>
              <span className="text-sky-300">Trip Fare:</span>
              <p className="font-bold text-emerald-300">{formatCurrency(activeTrip.fare)}</p>
            </div>
            <div>
              <span className="text-sky-300">Passenger OTP:</span>
              <p className="font-mono font-bold text-white">{activeTrip.otp}</p>
            </div>
          </div>
        </div>
      )}

      {/* Incoming Ride Requests Queue */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Inbox className="w-5 h-5 text-emerald-600" />
              <span>Incoming Ride Requests ({pendingRequests.length})</span>
            </h2>
            <p className="text-xs text-slate-500">
              Real-time bookings matching your {driver?.vehicleType} vehicle
            </p>
          </div>
          <Link
            href="/driver/requests"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="py-10 text-center text-slate-400 space-y-2">
            <Clock className="w-10 h-10 mx-auto opacity-30 animate-pulse" />
            <p className="text-sm font-semibold">No pending requests right now</p>
            <p className="text-xs text-slate-500">
              Keep your status ONLINE. New requests will pop up here instantly when passengers book!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {pendingRequests.slice(0, 4).map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4 hover:border-emerald-500 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-lg">
                      {req.id}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {req.userName}
                    </span>
                  </div>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(req.fare)}
                  </span>
                </div>

                {/* Route points */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="font-medium truncate">{req.pickup}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="font-medium truncate">{req.drop}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>Distance: {req.distanceKm} km</span>
                  <span>Method: {req.paymentMethod}</span>
                </div>

                {/* Accept / Reject Action buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleAcceptRequest(req.id)}
                    className="py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Accept
                  </button>

                  <button
                    onClick={() => {
                      showToast(`Declined request ${req.id}.`, 'info');
                    }}
                    className="py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
