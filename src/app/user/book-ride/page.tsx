'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  getCurrentUser, 
  createRide, 
  getDrivers 
} from '@/lib/storage';
import { User, VehicleType } from '@/lib/types';
import { 
  METRO_LOCATIONS, 
  getEstimatedDistance, 
  calculateFare, 
  formatCurrency, 
  generateOTP 
} from '@/lib/fareCalculator';
import { useToast } from '@/components/Toast';
import { 
  Car, 
  Bike, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

function BookRideContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [pickup, setPickup] = useState('Chennai Central');
  const [drop, setDrop] = useState('T Nagar');
  const [vehicleType, setVehicleType] = useState<VehicleType>('Car');
  const [passengers, setPassengers] = useState(1);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:30 AM');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Cash'>('UPI');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = getCurrentUser() as User;
    setCurrentUserState(user);

    const qPickup = searchParams.get('pickup');
    const qDrop = searchParams.get('drop');
    const qVeh = searchParams.get('vehicle') as VehicleType;

    if (qPickup) setPickup(qPickup);
    if (qDrop) setDrop(qDrop);
    if (qVeh && (qVeh === 'Car' || qVeh === 'Bike')) setVehicleType(qVeh);
  }, [searchParams]);

  // Adjust passenger limit when switching vehicle
  const handleVehicleChange = (v: VehicleType) => {
    setVehicleType(v);
    if (v === 'Bike') {
      setPassengers(1);
    }
  };

  const distanceKm = getEstimatedDistance(pickup, drop);
  const fareResult = calculateFare(vehicleType, distanceKm);

  // Check online drivers count
  const onlineDrivers = getDrivers().filter(
    (d) => d.available && d.status === 'Active' && d.vehicleType === vehicleType
  );

  const handleBookRide = (e: React.FormEvent) => {
    e.preventDefault();

    if (!pickup.trim()) {
      showToast('Pickup location is required.', 'error');
      return;
    }
    if (!drop.trim()) {
      showToast('Drop location is required.', 'error');
      return;
    }
    if (pickup.trim().toLowerCase() === drop.trim().toLowerCase()) {
      showToast('Pickup and Drop locations cannot be the same.', 'error');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const ride = createRide({
        userId: currentUser?.id || 'U101',
        userName: currentUser?.name || 'Ravi Kumar',
        userPhone: currentUser?.phone || '9876543210',
        driverId: null,
        driverName: null,
        driverPhone: null,
        vehicleModel: null,
        vehicleNumber: null,
        pickup: pickup.trim(),
        drop: drop.trim(),
        vehicleType,
        distanceKm,
        fare: fareResult.totalFare,
        baseFare: fareResult.baseFare,
        distanceFare: fareResult.distanceFare,
        date,
        time,
        passengers,
        status: 'Pending',
        paymentMethod,
        paymentStatus: 'Pending',
        otp: generateOTP(),
        rating: null,
        feedback: null
      });

      showToast(`Ride #${ride.id} booked successfully! Searching for drivers...`, 'success');
      router.push('/user/rides');
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Title */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Fast Booking Engine
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Book a Car or Bike Ride
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Instant matching with verified local drivers across the city
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <form onSubmit={handleBookRide} className="space-y-5">
            {/* Vehicle Selection Cards */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                1. Select Vehicle Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleVehicleChange('Car')}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-start gap-2 text-left transition-all ${
                    vehicleType === 'Car'
                      ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="p-2 bg-sky-100 dark:bg-sky-950 text-sky-600 rounded-xl">
                    <Car className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">City Car</h4>
                    <p className="text-[11px] text-slate-500">Up to 4 seats • AC Sedan / Hatchback</p>
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                      Base ₹50 + ₹15/km
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleVehicleChange('Bike')}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-start gap-2 text-left transition-all ${
                    vehicleType === 'Bike'
                      ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-xl">
                    <Bike className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Swift Bike</h4>
                    <p className="text-[11px] text-slate-500">1 Passenger • Quick Traffic Bypass</p>
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                      Base ₹30 + ₹8/km
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Pickup & Drop */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-500" /> Pickup Location *
                </label>
                <select
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {METRO_LOCATIONS.map((loc) => (
                    <option key={`p-${loc}`} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-500" /> Drop Location *
                </label>
                <select
                  value={drop}
                  onChange={(e) => setDrop(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {METRO_LOCATIONS.map((loc) => (
                    <option key={`d-${loc}`} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date, Time & Passengers */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Time
                </label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" /> Passengers
                </label>
                <select
                  value={passengers}
                  disabled={vehicleType === 'Bike'}
                  onChange={(e) => setPassengers(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none disabled:opacity-50"
                >
                  <option value={1}>1 Rider</option>
                  {vehicleType === 'Car' && (
                    <>
                      <option value={2}>2 Riders</option>
                      <option value={3}>3 Riders</option>
                      <option value={4}>4 Riders</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Payment Method Option */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Preferred Payment Option
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['UPI', 'Card', 'Cash'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m as any)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      paymentMethod === m
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>Generating Ride Request...</span>
              ) : (
                <>
                  <span>Book {vehicleType} Ride • {formatCurrency(fareResult.totalFare)}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Fare Summary & Driver Availability Column */}
        <div className="lg:col-span-5 space-y-5">
          {/* Fare Breakdown Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider text-slate-400">
              Trip Fare Estimate
            </h3>

            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Base Fare ({vehicleType})</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(fareResult.baseFare)}</span>
              </div>
              <div className="flex justify-between">
                <span>
                  Distance Rate ({distanceKm} km @ {vehicleType === 'Car' ? '₹15' : '₹8'}/km)
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(fareResult.distanceFare)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Duration</span>
                <span className="font-semibold text-slate-900 dark:text-white">~{fareResult.estimatedDurationMins} minutes</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & Fees</span>
                <span className="font-semibold text-emerald-600">Included</span>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-sm font-bold text-slate-900 dark:text-white">
                <span>Total Amount:</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(fareResult.totalFare)}
                </span>
              </div>
            </div>
          </div>

          {/* Driver Fleet Status Card */}
          <div className="bg-slate-100 dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Nearby Online Drivers
                </span>
              </div>
              <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-full">
                {onlineDrivers.length} Available
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Drivers are currently active near {pickup}. Your request will be instantly broadcasted upon confirmation.
            </p>

            <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>4-digit OTP protection enabled for this trip</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookRidePage() {
  return (
    <Suspense fallback={<div className="text-center p-8 text-slate-500">Loading booking engine...</div>}>
      <BookRideContent />
    </Suspense>
  );
}
