'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCurrentUser, getRides, cancelRide } from '@/lib/storage';
import { User, Ride, RideStatus } from '@/lib/types';
import { formatCurrency } from '@/lib/fareCalculator';
import MapSimulator from '@/components/MapSimulator';
import PaymentModal from '@/components/PaymentModal';
import InvoiceModal from '@/components/InvoiceModal';
import RatingModal from '@/components/RatingModal';
import { useToast } from '@/components/Toast';
import { 
  Car, 
  Bike, 
  MapPin, 
  Clock, 
  Phone, 
  Star, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Navigation, 
  CreditCard, 
  Eye, 
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function ActiveRidesPage() {
  const { showToast } = useToast();
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [allActiveRides, setAllActiveRides] = useState<Ride[]>([]);
  
  const [selectedRideForPayment, setSelectedRideForPayment] = useState<Ride | null>(null);
  const [selectedRideForInvoice, setSelectedRideForInvoice] = useState<Ride | null>(null);
  const [selectedRideForRating, setSelectedRideForRating] = useState<Ride | null>(null);

  const loadData = () => {
    const user = getCurrentUser() as User;
    setCurrentUserState(user);
    if (user) {
      const rides = getRides().filter((r) => r.userId === user.id);
      // Look for any active/ongoing ride first
      const active = rides.find((r) => r.status !== 'Cancelled');
      setAllActiveRides(rides.filter((r) => r.status !== 'Completed' && r.status !== 'Cancelled'));
      setActiveRide(active || null);
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

  const handleCancel = (rideId: string) => {
    if (window.confirm('Are you sure you want to cancel this ride?')) {
      const ok = cancelRide(rideId, 'user');
      if (ok) {
        showToast('Ride cancelled successfully.', 'info');
        loadData();
      } else {
        showToast('Could not cancel ride.', 'error');
      }
    }
  };

  const steps: RideStatus[] = ['Pending', 'Accepted', 'Driver Arriving', 'Ride Started', 'Completed'];

  const getStepIndex = (status: RideStatus) => {
    return steps.indexOf(status);
  };

  const currentStepIdx = activeRide ? getStepIndex(activeRide.status) : 0;

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Navigation className="w-3.5 h-3.5" /> Live Trip Tracking
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Active & Ongoing Trips
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time status progression, GPS route simulator, and driver verification
          </p>
        </div>

        <Link
          href="/user/book-ride"
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 self-start sm:self-center"
        >
          <Car className="w-4 h-4" />
          <span>Book Another Ride</span>
        </Link>
      </div>

      {!activeRide ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Car className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Active Ride Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don't have any ongoing car or bike rides at this moment. Book a new trip to start tracking!
          </p>
          <Link
            href="/user/book-ride"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20"
          >
            <span>Book a Ride Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Status Stepper Card */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-xl">
                  RIDE #{activeRide.id}
                </span>
                <span className="text-xs text-slate-500">
                  Booked on {activeRide.date} at {activeRide.time}
                </span>
              </div>

              {activeRide.status !== 'Completed' && activeRide.status !== 'Cancelled' && (
                <button
                  onClick={() => handleCancel(activeRide.id)}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors self-start sm:self-center"
                >
                  Cancel Ride
                </button>
              )}
            </div>

            {/* Step-by-step Lifecycle Visualizer */}
            {activeRide.status !== 'Cancelled' ? (
              <div className="pt-2">
                <div className="grid grid-cols-5 gap-2 relative">
                  {steps.map((step, idx) => {
                    const isDone = currentStepIdx >= idx;
                    const isCurrent = currentStepIdx === idx;

                    return (
                      <div key={step} className="flex flex-col items-center text-center space-y-2 group">
                        <div
                          className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${
                            isDone
                              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                          } ${isCurrent ? 'ring-4 ring-emerald-500/20 scale-105' : ''}`}
                        >
                          {isDone ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                        </div>
                        <span
                          className={`text-[10px] sm:text-xs font-bold leading-tight ${
                            isCurrent
                              ? 'text-emerald-600 dark:text-emerald-400 font-extrabold'
                              : isDone
                              ? 'text-slate-800 dark:text-slate-200'
                              : 'text-slate-400'
                          }`}
                        >
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-900 text-xs font-bold text-rose-600 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                <span>This ride was cancelled.</span>
              </div>
            )}
          </div>

          {/* Interactive Simulated GPS Route Map */}
          <MapSimulator
            pickup={activeRide.pickup}
            drop={activeRide.drop}
            vehicleType={activeRide.vehicleType}
            status={activeRide.status}
            driverName={activeRide.driverName}
            vehicleNumber={activeRide.vehicleNumber}
          />

          {/* Trip Details Grid */}
          <div className="grid md:grid-cols-12 gap-6">
            {/* Route & Security Details */}
            <div className="md:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider text-slate-400">
                Route & Security Information
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center mt-1">
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-500"></div>
                    <div className="w-0.5 h-10 bg-slate-200 dark:bg-slate-700"></div>
                    <div className="w-3.5 h-3.5 rounded-full bg-rose-500"></div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Pickup</span>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{activeRide.pickup}</p>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Destination</span>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{activeRide.drop}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Estimated Distance</span>
                    <p className="text-sm font-black text-slate-900 dark:text-white">{activeRide.distanceKm} km</p>
                  </div>

                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-900">
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase">
                      Ride Start OTP
                    </span>
                    <p className="text-lg font-mono font-black text-emerald-600 dark:text-emerald-300">
                      {activeRide.otp}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Driver Card & Payment Actions */}
            <div className="md:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider text-slate-400">
                  Assigned Driver Partner
                </h3>

                {activeRide.driverName ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold flex items-center justify-center text-base">
                        {activeRide.driverName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-slate-900 dark:text-white">
                          {activeRide.driverName}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400" /> 4.9
                          </span>
                          <span>•</span>
                          <span>{activeRide.driverPhone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                      <div className="text-[11px] text-slate-400 font-semibold">Vehicle Details</div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {activeRide.vehicleModel || `${activeRide.vehicleType} Service`}
                      </div>
                      <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {activeRide.vehicleNumber}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900/50 text-center space-y-2">
                    <Clock className="w-8 h-8 text-amber-500 mx-auto animate-spin" />
                    <h4 className="font-bold text-sm text-amber-900 dark:text-amber-200">
                      Searching for Drivers...
                    </h4>
                    <p className="text-[11px] text-amber-700 dark:text-amber-300">
                      Broadcasting your request to available {activeRide.vehicleType} drivers in the area.
                    </p>
                  </div>
                )}
              </div>

              {/* Fare & Post-trip Action Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-500">Trip Fare</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    {formatCurrency(activeRide.fare)}
                  </span>
                </div>

                {activeRide.status === 'Completed' && (
                  <div className="space-y-2">
                    {activeRide.paymentStatus !== 'Paid' ? (
                      <button
                        onClick={() => setSelectedRideForPayment(activeRide)}
                        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 text-xs"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Pay {formatCurrency(activeRide.fare)} Now</span>
                      </button>
                    ) : (
                      <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Payment Settled
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setSelectedRideForInvoice(activeRide)}
                        className="py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-4 h-4" /> View Invoice
                      </button>

                      <button
                        onClick={() => setSelectedRideForRating(activeRide)}
                        className="py-2.5 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-700 dark:text-amber-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
                      >
                        <Star className="w-4 h-4" /> Rate Driver
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedRideForPayment && (
        <PaymentModal
          isOpen={!!selectedRideForPayment}
          onClose={() => setSelectedRideForPayment(null)}
          ride={selectedRideForPayment}
          onSuccess={() => loadData()}
        />
      )}

      {selectedRideForInvoice && (
        <InvoiceModal
          isOpen={!!selectedRideForInvoice}
          onClose={() => setSelectedRideForInvoice(null)}
          ride={selectedRideForInvoice}
        />
      )}

      {selectedRideForRating && (
        <RatingModal
          isOpen={!!selectedRideForRating}
          onClose={() => setSelectedRideForRating(null)}
          ride={selectedRideForRating}
          onSuccess={() => loadData()}
        />
      )}
    </div>
  );
}
