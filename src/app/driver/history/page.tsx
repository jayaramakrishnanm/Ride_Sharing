'use client';

import React, { useState, useEffect } from 'react';
import { getCurrentUser, getRides, getDrivers } from '@/lib/storage';
import { Driver, Ride } from '@/lib/types';
import { formatCurrency } from '@/lib/fareCalculator';
import InvoiceModal from '@/components/InvoiceModal';
import { 
  DollarSign, 
  Car, 
  Bike, 
  Search, 
  Star, 
  Eye, 
  CheckCircle2, 
  Calendar, 
  TrendingUp,
  History
} from 'lucide-react';

export default function DriverHistoryPage() {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [completedRides, setCompletedRides] = useState<Ride[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRideForInvoice, setSelectedRideForInvoice] = useState<Ride | null>(null);

  const loadData = () => {
    const user = getCurrentUser() as Driver;
    if (user && user.role === 'driver') {
      const allDrivers = getDrivers();
      const current = allDrivers.find((d) => d.id === user.id) || user;
      setDriver(current);

      const allRides = getRides();
      setCompletedRides(
        allRides.filter((r) => r.driverId === current.id && r.status === 'Completed')
      );
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

  const filteredRides = completedRides.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.id.toLowerCase().includes(q) ||
      r.userName.toLowerCase().includes(q) ||
      r.pickup.toLowerCase().includes(q) ||
      r.drop.toLowerCase().includes(q)
    );
  });

  const totalEarnings = completedRides.reduce((acc, r) => acc + r.fare, 0);

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
          <History className="w-3.5 h-3.5" /> Driver Trip Archive
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Earnings & Trip History
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Review your completed trips, payouts, and passenger reviews
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Completed</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {completedRides.length}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium">Logged trips</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Session Earnings</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalEarnings)}
          </div>
          <p className="text-[11px] text-slate-500">From listed rides</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Driver Rating</span>
          <div className="text-2xl sm:text-3xl font-black text-amber-500 flex items-center gap-1">
            <Star className="w-6 h-6 fill-amber-400" />
            <span>{driver?.rating || 4.9}</span>
          </div>
          <p className="text-[11px] text-slate-500">Top performer standard</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Today Payout</span>
          <div className="text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400">
            {formatCurrency(driver?.earningsToday || 850)}
          </div>
          <p className="text-[11px] text-sky-600 font-medium">Daily collection</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by trip ID, passenger name, or location..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Trip ID</th>
                <th className="p-4">Passenger</th>
                <th className="p-4">Route</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Earnings</th>
                <th className="p-4">Review & Rating</th>
                <th className="p-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredRides.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No completed trips recorded yet.
                  </td>
                </tr>
              ) : (
                filteredRides.map((ride) => (
                  <tr key={ride.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                      {ride.id}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{ride.userName}</div>
                      <div className="text-slate-400 font-mono text-[11px]">{ride.userPhone}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-900 dark:text-white">{ride.pickup}</div>
                      <div className="text-slate-400">➔ {ride.drop}</div>
                    </td>
                    <td className="p-4 text-slate-500">
                      <div>{ride.date}</div>
                      <div className="text-[11px]">{ride.time}</div>
                    </td>
                    <td className="p-4 font-black text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(ride.fare)}
                    </td>
                    <td className="p-4">
                      {ride.rating ? (
                        <div>
                          <div className="flex items-center gap-1 font-bold text-amber-500">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{ride.rating} / 5</span>
                          </div>
                          {ride.feedback && (
                            <p className="text-[11px] text-slate-500 italic max-w-xs truncate mt-0.5">
                              "{ride.feedback}"
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No rating left</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedRideForInvoice(ride)}
                        className="p-2 text-slate-500 hover:text-sky-600 bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors"
                        title="View Trip Receipt"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
