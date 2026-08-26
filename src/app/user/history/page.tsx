'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCurrentUser, getRides } from '@/lib/storage';
import { User, Ride } from '@/lib/types';
import { formatCurrency } from '@/lib/fareCalculator';
import PaymentModal from '@/components/PaymentModal';
import InvoiceModal from '@/components/InvoiceModal';
import RatingModal from '@/components/RatingModal';
import { 
  Car, 
  Bike, 
  Search, 
  Filter, 
  Calendar, 
  CreditCard, 
  Star, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowUpDown,
  History
} from 'lucide-react';

export default function RideHistoryPage() {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [rides, setRides] = useState<Ride[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [vehicleFilter, setVehicleFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'fare_desc' | 'fare_asc'>('date_desc');

  const [selectedRideForPayment, setSelectedRideForPayment] = useState<Ride | null>(null);
  const [selectedRideForInvoice, setSelectedRideForInvoice] = useState<Ride | null>(null);
  const [selectedRideForRating, setSelectedRideForRating] = useState<Ride | null>(null);

  const loadData = () => {
    const user = getCurrentUser() as User;
    setCurrentUserState(user);
    if (user) {
      const allRides = getRides();
      setRides(allRides.filter((r) => r.userId === user.id));
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

  // Filter & Search & Sort
  const filteredRides = rides
    .filter((ride) => {
      // Status filter
      if (statusFilter !== 'All' && ride.status !== statusFilter) return false;
      // Vehicle filter
      if (vehicleFilter !== 'All' && ride.vehicleType !== vehicleFilter) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = ride.id.toLowerCase().includes(q);
        const matchesPickup = ride.pickup.toLowerCase().includes(q);
        const matchesDrop = ride.drop.toLowerCase().includes(q);
        const matchesDriver = (ride.driverName || '').toLowerCase().includes(q);
        return matchesId || matchesPickup || matchesDrop || matchesDriver;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'date_asc') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'fare_desc') return b.fare - a.fare;
      if (sortBy === 'fare_asc') return a.fare - b.fare;
      return 0;
    });

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
          <History className="w-3.5 h-3.5" /> Comprehensive Ride Log
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          My Ride History
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Search, filter, and review receipts for all your past and active journeys
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          {/* Search Box */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Ride ID, pickup, destination, or driver name..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Ride Started">Ride Started</option>
            </select>
          </div>

          {/* Vehicle Filter */}
          <div className="sm:col-span-3">
            <select
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm outline-none"
            >
              <option value="All">All Vehicles (Car & Bike)</option>
              <option value="Car">Car Only</option>
              <option value="Bike">Bike Only</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          <div>
            Showing <span className="font-bold text-slate-800 dark:text-slate-200">{filteredRides.length}</span> of {rides.length} total rides
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-semibold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="fare_desc">Fare: High to Low</option>
              <option value="fare_asc">Fare: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Ride ID</th>
                <th className="p-4">Route</th>
                <th className="p-4">Vehicle</th>
                <th className="p-4">Driver Partner</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Fare & Method</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredRides.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400">
                    No rides found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredRides.map((ride) => (
                  <tr key={ride.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                      {ride.id}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white">{ride.pickup}</div>
                      <div className="text-slate-400">➔ {ride.drop}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{ride.distanceKm} km</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 font-semibold">
                        {ride.vehicleType === 'Car' ? (
                          <Car className="w-4 h-4 text-sky-500" />
                        ) : (
                          <Bike className="w-4 h-4 text-emerald-500" />
                        )}
                        <span>{ride.vehicleType}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {ride.driverName ? (
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">{ride.driverName}</div>
                          <div className="text-[11px] font-mono text-slate-400">{ride.vehicleNumber}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-500">
                      <div>{ride.date}</div>
                      <div className="text-[11px]">{ride.time}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white">{formatCurrency(ride.fare)}</div>
                      <div className="text-[10px] text-slate-400 uppercase">
                        {ride.paymentMethod || 'UPI'} • {ride.paymentStatus}
                      </div>
                    </td>
                    <td className="p-4">
                      {ride.status === 'Completed' && (
                        <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full font-bold text-[11px]">
                          Completed
                        </span>
                      )}
                      {ride.status === 'Cancelled' && (
                        <span className="px-2.5 py-1 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 rounded-full font-bold text-[11px]">
                          Cancelled
                        </span>
                      )}
                      {ride.status !== 'Completed' && ride.status !== 'Cancelled' && (
                        <span className="px-2.5 py-1 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 rounded-full font-bold text-[11px]">
                          {ride.status}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-1.5">
                      <button
                        onClick={() => setSelectedRideForInvoice(ride)}
                        className="p-2 text-slate-500 hover:text-emerald-600 bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors"
                        title="View Official Receipt / Invoice"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {ride.status === 'Completed' && ride.paymentStatus !== 'Paid' && (
                        <button
                          onClick={() => setSelectedRideForPayment(ride)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                        >
                          Pay
                        </button>
                      )}

                      {ride.status === 'Completed' && !ride.rating && (
                        <button
                          onClick={() => setSelectedRideForRating(ride)}
                          className="p-2 text-amber-500 hover:text-amber-600 bg-amber-50 dark:bg-amber-950/50 rounded-xl"
                          title="Rate & Review"
                        >
                          <Star className="w-4 h-4" />
                        </button>
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
