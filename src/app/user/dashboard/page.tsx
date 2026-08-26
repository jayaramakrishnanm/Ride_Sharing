'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCurrentUser, getRides, cancelRide } from '@/lib/storage';
import { User, Ride } from '@/lib/types';
import { formatCurrency } from '@/lib/fareCalculator';
import PaymentModal from '@/components/PaymentModal';
import InvoiceModal from '@/components/InvoiceModal';
import RatingModal from '@/components/RatingModal';
import { useToast } from '@/components/Toast';
import { 
  Car, 
  Bike, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Plus, 
  CreditCard, 
  Star, 
  Eye, 
  Compass, 
  Navigation,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export default function UserDashboard() {
  const { showToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [rides, setRides] = useState<Ride[]>([]);
  const [selectedRideForPayment, setSelectedRideForPayment] = useState<Ride | null>(null);
  const [selectedRideForInvoice, setSelectedRideForInvoice] = useState<Ride | null>(null);
  const [selectedRideForRating, setSelectedRideForRating] = useState<Ride | null>(null);

  const loadData = () => {
    const current = getCurrentUser() as User;
    setUser(current);
    if (current) {
      const allRides = getRides();
      const userRides = allRides.filter((r) => r.userId === current.id);
      setRides(userRides);
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

  const totalRidesCount = rides.length;
  const activeRide = rides.find((r) => r.status !== 'Completed' && r.status !== 'Cancelled');
  const activeRidesCount = rides.filter((r) => r.status !== 'Completed' && r.status !== 'Cancelled').length;
  const completedRidesCount = rides.filter((r) => r.status === 'Completed').length;
  const cancelledRidesCount = rides.filter((r) => r.status === 'Cancelled').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case 'Pending':
        return (
          <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs font-bold rounded-full flex items-center gap-1 animate-pulse">
            <Clock className="w-3.5 h-3.5" /> Pending Driver
          </span>
        );
      case 'Accepted':
        return (
          <span className="px-2.5 py-1 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-xs font-bold rounded-full flex items-center gap-1">
            <Car className="w-3.5 h-3.5" /> Driver Accepted
          </span>
        );
      case 'Driver Arriving':
        return (
          <span className="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-full flex items-center gap-1 animate-pulse">
            <Navigation className="w-3.5 h-3.5" /> Driver Arriving
          </span>
        );
      case 'Ride Started':
        return (
          <span className="px-2.5 py-1 bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-bold rounded-full flex items-center gap-1">
            <Compass className="w-3.5 h-3.5" /> On Trip
          </span>
        );
      case 'Cancelled':
        return (
          <span className="px-2.5 py-1 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-bold rounded-full flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-200 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Passenger Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-black">
            Welcome, {user?.name || 'Ravi'}!
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100">
            Where would you like to travel today?
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/user/book-ride"
            className="px-5 py-3 bg-white text-emerald-700 hover:bg-emerald-50 font-bold rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Book New Ride</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Rides</span>
            <Car className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {totalRidesCount}
          </div>
          <p className="text-[11px] text-slate-500">All-time bookings</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Ride</span>
            <Compass className="w-5 h-5 text-sky-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {activeRidesCount}
          </div>
          <p className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">
            {activeRidesCount > 0 ? 'Live trip ongoing' : 'No ongoing trip'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {completedRidesCount}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Successful journeys
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Cancelled</span>
            <XCircle className="w-5 h-5 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {cancelledRidesCount}
          </div>
          <p className="text-[11px] text-slate-500">Cancelled requests</p>
        </div>
      </div>

      {/* Active Ride Live Alert Banner */}
      {activeRide && (
        <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl border border-slate-700 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                {activeRide.vehicleType === 'Car' ? (
                  <Car className="w-6 h-6" />
                ) : (
                  <Bike className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    Ride #{activeRide.id}
                  </span>
                  {getStatusBadge(activeRide.status)}
                </div>
                <h3 className="text-base font-bold mt-1">
                  {activeRide.pickup} ➔ {activeRide.drop}
                </h3>
              </div>
            </div>

            <Link
              href="/user/rides"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors self-start sm:self-center"
            >
              <span>Track Live Trip</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs">
            <div>
              <span className="text-slate-400">Vehicle:</span>
              <p className="font-semibold text-slate-200">
                {activeRide.vehicleModel || `${activeRide.vehicleType} Service`}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Driver Partner:</span>
              <p className="font-semibold text-slate-200">
                {activeRide.driverName || 'Matching Driver...'}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Start OTP:</span>
              <p className="font-mono font-bold text-emerald-400 text-sm">
                {activeRide.otp}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Estimated Fare:</span>
              <p className="font-bold text-white text-sm">
                {formatCurrency(activeRide.fare)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Rides Table Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Rides</h2>
            <p className="text-xs text-slate-500">Your recent trip logs and status</p>
          </div>
          <Link
            href="/user/history"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Ride ID</th>
                <th className="p-4">Route</th>
                <th className="p-4">Vehicle</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Fare</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {rides.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No rides booked yet.{' '}
                    <Link href="/user/book-ride" className="text-emerald-600 font-bold underline">
                      Book your first ride!
                    </Link>
                  </td>
                </tr>
              ) : (
                rides.slice(0, 5).map((ride) => (
                  <tr key={ride.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                      {ride.id}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{ride.pickup}</div>
                      <div className="text-slate-400">➔ {ride.drop}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 font-medium">
                        {ride.vehicleType === 'Car' ? (
                          <Car className="w-4 h-4 text-sky-500" />
                        ) : (
                          <Bike className="w-4 h-4 text-emerald-500" />
                        )}
                        <span>{ride.vehicleType}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-500">
                      <div>{ride.date}</div>
                      <div className="text-[11px]">{ride.time}</div>
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {formatCurrency(ride.fare)}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(ride.status)}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {ride.status === 'Completed' && (
                        <>
                          <button
                            onClick={() => setSelectedRideForInvoice(ride)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 bg-slate-100 dark:bg-slate-800 rounded-lg"
                            title="View Receipt"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {ride.paymentStatus !== 'Paid' && (
                            <button
                              onClick={() => setSelectedRideForPayment(ride)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg"
                            >
                              Pay
                            </button>
                          )}

                          {!ride.rating && (
                            <button
                              onClick={() => setSelectedRideForRating(ride)}
                              className="p-1.5 text-amber-500 hover:text-amber-600 bg-amber-50 dark:bg-amber-950/40 rounded-lg"
                              title="Rate Driver"
                            >
                              <Star className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}

                      {ride.status !== 'Completed' && ride.status !== 'Cancelled' && (
                        <Link
                          href="/user/rides"
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold rounded-lg text-[11px]"
                        >
                          Track
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
