'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getDrivers, getRides, acceptRide } from '@/lib/storage';
import { Driver, Ride } from '@/lib/types';
import { formatCurrency } from '@/lib/fareCalculator';
import { useToast } from '@/components/Toast';
import { 
  Inbox, 
  Car, 
  Bike, 
  MapPin, 
  Users, 
  CheckCircle2, 
  X, 
  AlertCircle, 
  Phone, 
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function DriverRequestsPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [driver, setDriver] = useState<Driver | null>(null);
  const [rides, setRides] = useState<Ride[]>([]);
  const [filterType, setFilterType] = useState<'matching' | 'all'>('matching');

  const loadData = () => {
    const user = getCurrentUser() as Driver;
    if (user && user.role === 'driver') {
      const allDrivers = getDrivers();
      const current = allDrivers.find((d) => d.id === user.id) || user;
      setDriver(current);

      const allRides = getRides();
      setRides(allRides.filter((r) => r.status === 'Pending'));
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

  const handleAccept = (rideId: string) => {
    if (!driver) return;
    if (!driver.available) {
      showToast('You are currently OFFLINE. Please toggle to ONLINE in your dashboard to accept trips.', 'warning');
      return;
    }

    const result = acceptRide(rideId, driver.id);
    if (!result.success) {
      showToast(result.error || 'This ride has already been accepted by another driver.', 'error');
      loadData();
      return;
    }

    showToast(`Ride #${rideId} accepted successfully! Opening Active Trip Navigation...`, 'success');
    router.push('/driver/active-ride');
  };

  const displayedRides = rides.filter((r) => {
    if (filterType === 'matching' && driver) {
      return r.vehicleType === driver.vehicleType;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Inbox className="w-3.5 h-3.5" /> Real-Time Queue
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Available Ride Requests
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Accept passengers nearby for {driver?.vehicleType || 'Vehicle'} rides
          </p>
        </div>

        {/* Filter toggle */}
        <div className="flex items-center gap-2 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-2xl self-start sm:self-center">
          <button
            onClick={() => setFilterType('matching')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filterType === 'matching'
                ? 'bg-white dark:bg-slate-900 text-sky-600 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            My Vehicle ({driver?.vehicleType})
          </button>
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filterType === 'all'
                ? 'bg-white dark:bg-slate-900 text-sky-600 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            All Pending ({rides.length})
          </button>
        </div>
      </div>

      {!driver?.available && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900 rounded-2xl text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <span>You are currently <strong>OFFLINE</strong>. Go to Dashboard and toggle status to ONLINE to accept ride requests.</span>
          </div>
          <button
            onClick={() => router.push('/driver/dashboard')}
            className="px-3 py-1 bg-amber-600 text-white font-bold rounded-lg text-xs hover:bg-amber-700"
          >
            Go to Toggle
          </button>
        </div>
      )}

      {/* Requests Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedRides.length === 0 ? (
          <div className="md:col-span-3 bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-sm">
            <Inbox className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No Pending Requests in Your Area
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Requests from passengers booking {driver?.vehicleType} rides will automatically appear here live.
            </p>
          </div>
        ) : (
          displayedRides.map((req) => (
            <div
              key={req.id}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs px-2.5 py-1 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 rounded-xl">
                      {req.id}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                      {req.vehicleType === 'Car' ? <Car className="w-3.5 h-3.5 text-sky-500" /> : <Bike className="w-3.5 h-3.5 text-emerald-500" />}
                      {req.vehicleType}
                    </span>
                  </div>
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(req.fare)}
                  </span>
                </div>

                {/* Passenger info */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl space-y-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                    <span>{req.userName}</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-normal">
                      <Users className="w-3 h-3" /> {req.passengers} Rider(s)
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3 text-slate-400" /> {req.userPhone}
                  </div>
                </div>

                {/* Route */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Pickup</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{req.pickup}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Drop</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{req.drop}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trip stats & Action buttons */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Distance: <strong>{req.distanceKm} km</strong></span>
                  <span>Payment: <strong>{req.paymentMethod}</strong></span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleAccept(req.id)}
                    className="py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-2xl text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Accept Ride
                  </button>

                  <button
                    onClick={() => {
                      showToast(`Declined ride ${req.id}.`, 'info');
                    }}
                    className="py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-2xl text-xs transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
