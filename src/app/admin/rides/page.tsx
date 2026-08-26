'use client';

import React, { useState, useEffect } from 'react';
import { getRides, updateRideStatus, cancelRide } from '@/lib/storage';
import { Ride, RideStatus, VehicleType } from '@/lib/types';
import { formatCurrency } from '@/lib/fareCalculator';
import InvoiceModal from '@/components/InvoiceModal';
import { useToast } from '@/components/Toast';
import { 
  Clock, 
  Search, 
  Filter, 
  Car, 
  Bike, 
  Eye, 
  XCircle, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  X, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export default function AdminRidesPage() {
  const { showToast } = useToast();
  const [rides, setRides] = useState<Ride[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [vehicleFilter, setVehicleFilter] = useState('All');
  const [selectedRideForInvoice, setSelectedRideForInvoice] = useState<Ride | null>(null);
  const [viewingRideDetails, setViewingRideDetails] = useState<Ride | null>(null);

  const loadData = () => {
    setRides(getRides());
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

  const handleAdminCancel = (rideId: string) => {
    if (window.confirm(`Are you sure you want to cancel ride ${rideId} as admin?`)) {
      const ok = cancelRide(rideId, 'admin');
      if (ok) {
        showToast(`Ride ${rideId} was cancelled by administrator.`, 'info');
        loadData();
      }
    }
  };

  const filteredRides = rides.filter((r) => {
    if (statusFilter !== 'All' && r.status !== statusFilter) return false;
    if (vehicleFilter !== 'All' && r.vehicleType !== vehicleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.id.toLowerCase().includes(q) ||
        r.userName.toLowerCase().includes(q) ||
        (r.driverName || '').toLowerCase().includes(q) ||
        r.pickup.toLowerCase().includes(q) ||
        r.drop.toLowerCase().includes(q) ||
        r.date.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Clock className="w-3.5 h-3.5" /> Platform Ride Dispatch
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            All Rides Master Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time status monitor, trip filter, invoice inspection, and admin override
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl self-start sm:self-center">
          Total Bookings: {rides.length}
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Ride ID, passenger, driver, pickup, drop, or date..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Driver Arriving">Driver Arriving</option>
              <option value="Ride Started">Ride Started</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm outline-none"
            >
              <option value="All">All Vehicles (Car & Bike)</option>
              <option value="Car">Car Trips</option>
              <option value="Bike">Bike Trips</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rides Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Ride ID</th>
                <th className="p-4">Passenger</th>
                <th className="p-4">Driver</th>
                <th className="p-4">Route</th>
                <th className="p-4">Vehicle</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Fare</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredRides.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    No rides match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredRides.map((ride) => (
                  <tr key={ride.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                      {ride.id}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white">{ride.userName}</div>
                      <div className="text-slate-400 text-[11px] font-mono">{ride.userPhone}</div>
                    </td>
                    <td className="p-4">
                      {ride.driverName ? (
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">{ride.driverName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{ride.vehicleNumber}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-900 dark:text-white">{ride.pickup}</div>
                      <div className="text-slate-400">➔ {ride.drop}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 font-semibold">
                        {ride.vehicleType === 'Car' ? <Car className="w-3.5 h-3.5 text-sky-500" /> : <Bike className="w-3.5 h-3.5 text-emerald-500" />}
                        <span>{ride.vehicleType}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-500">
                      <div>{ride.date}</div>
                      <div className="text-[11px]">{ride.time}</div>
                    </td>
                    <td className="p-4 font-black text-slate-900 dark:text-white">
                      {formatCurrency(ride.fare)}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${
                        ride.status === 'Completed'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : ride.status === 'Cancelled'
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          : 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300'
                      }`}>
                        {ride.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1.5">
                      <button
                        onClick={() => setViewingRideDetails(ride)}
                        className="p-2 text-slate-500 hover:text-purple-600 bg-slate-100 dark:bg-slate-800 rounded-xl"
                        title="View Trip Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {ride.status === 'Completed' && (
                        <button
                          onClick={() => setSelectedRideForInvoice(ride)}
                          className="p-2 text-slate-500 hover:text-emerald-600 bg-slate-100 dark:bg-slate-800 rounded-xl"
                          title="Print / View Receipt"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}

                      {ride.status !== 'Completed' && ride.status !== 'Cancelled' && (
                        <button
                          onClick={() => handleAdminCancel(ride.id)}
                          className="p-2 text-rose-500 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 rounded-xl"
                          title="Admin Cancel Ride"
                        >
                          <XCircle className="w-4 h-4" />
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

      {/* Ride Details Modal */}
      {viewingRideDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Trip Details (Ride #{viewingRideDetails.id})
              </h3>
              <button onClick={() => setViewingRideDetails(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-xs space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Passenger:</span>
                <span className="font-bold">{viewingRideDetails.userName} ({viewingRideDetails.userPhone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Assigned Driver:</span>
                <span className="font-bold">{viewingRideDetails.driverName || 'None assigned'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vehicle:</span>
                <span className="font-bold">{viewingRideDetails.vehicleType} • {viewingRideDetails.vehicleModel || 'Standard'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Route:</span>
                <span className="font-semibold">{viewingRideDetails.pickup} ➔ {viewingRideDetails.drop}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Distance & Duration:</span>
                <span>{viewingRideDetails.distanceKm} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Start OTP:</span>
                <span className="font-mono font-bold text-emerald-600">{viewingRideDetails.otp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Fare:</span>
                <span className="font-black text-sm text-emerald-600">{formatCurrency(viewingRideDetails.fare)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold uppercase text-purple-600">{viewingRideDetails.status}</span>
              </div>
            </div>

            <button
              onClick={() => setViewingRideDetails(null)}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {selectedRideForInvoice && (
        <InvoiceModal
          isOpen={!!selectedRideForInvoice}
          onClose={() => setSelectedRideForInvoice(null)}
          ride={selectedRideForInvoice}
        />
      )}
    </div>
  );
}
