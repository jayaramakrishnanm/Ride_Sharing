'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getUsers, 
  getDrivers, 
  getRides, 
  getPayments, 
  initializeStorage 
} from '@/lib/storage';
import { User, Driver, Ride } from '@/lib/types';
import { formatCurrency } from '@/lib/fareCalculator';
import { 
  RidesPerDayChart, 
  RideStatusDistributionChart, 
  VehicleDistributionChart 
} from '@/components/Charts';
import { useToast } from '@/components/Toast';
import { 
  Users as UsersIcon, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Compass, 
  DollarSign, 
  RotateCcw, 
  TrendingUp, 
  ArrowRight, 
  Activity,
  Car,
  Bike
} from 'lucide-react';

export default function AdminDashboard() {
  const { showToast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [rides, setRides] = useState<Ride[]>([]);

  const loadData = () => {
    setUsers(getUsers().filter((u) => u.role !== 'admin'));
    setDrivers(getDrivers());
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

  const totalUsers = users.length;
  const totalDrivers = drivers.length;
  const totalRides = rides.length;
  const activeRides = rides.filter((r) => r.status !== 'Completed' && r.status !== 'Cancelled').length;
  const completedRides = rides.filter((r) => r.status === 'Completed').length;
  const cancelledRides = rides.filter((r) => r.status === 'Cancelled').length;

  const totalRevenue = rides
    .filter((r) => r.status === 'Completed')
    .reduce((acc, r) => acc + r.fare, 0);

  const carRidesCount = rides.filter((r) => r.vehicleType === 'Car').length;
  const bikeRidesCount = rides.filter((r) => r.vehicleType === 'Bike').length;

  const handleResetData = () => {
    if (window.confirm('Reset all LocalStorage data to the initial realistic MCA Demo datasets?')) {
      initializeStorage(true);
      loadData();
      showToast('Database reset to initial demo state!', 'success');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-purple-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" /> Administrator Control Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            System Administration Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-purple-200">
            Real-time fleet operations, user accounts, and platform revenue metrics
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          <button
            onClick={handleResetData}
            className="px-4 py-2.5 bg-purple-800/80 hover:bg-purple-700 text-white text-xs font-bold rounded-xl border border-purple-600 flex items-center gap-2 transition-colors shadow-lg"
            title="Reset database to demo seed data"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo DB</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">Users</span>
            <UsersIcon className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{totalUsers}</div>
          <p className="text-[10px] text-slate-500">Registered</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">Drivers</span>
            <Car className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{totalDrivers}</div>
          <p className="text-[10px] text-slate-500">Active fleet</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">Total Rides</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{totalRides}</div>
          <p className="text-[10px] text-slate-500">All bookings</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">Active</span>
            <Compass className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{activeRides}</div>
          <p className="text-[10px] text-amber-600">In progress</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{completedRides}</div>
          <p className="text-[10px] text-emerald-600">Fulfilled</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">Cancelled</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">{cancelledRides}</div>
          <p className="text-[10px] text-rose-600">Discontinued</p>
        </div>
      </div>

      {/* Revenue Highlight Card */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-500" /> Platform Transaction Volume
          </span>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            {formatCurrency(totalRevenue)}
          </div>
          <p className="text-xs text-slate-500">
            Total gross passenger bookings processed through simulation
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/admin/rides"
            className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-purple-600/20"
          >
            <span>Manage All Rides</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/admin/reports"
            className="px-5 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-2xl text-xs flex items-center gap-2"
          >
            <span>View Reports</span>
          </Link>
        </div>
      </div>

      {/* Interactive Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        <RidesPerDayChart />
        <RideStatusDistributionChart
          completed={completedRides}
          cancelled={cancelledRides}
          active={activeRides}
        />
        <VehicleDistributionChart
          carRides={carRidesCount}
          bikeRides={bikeRidesCount}
        />
      </div>

      {/* Recent Rides Quick Monitor */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <span>Live Fleet Activity Feed</span>
            </h2>
            <p className="text-xs text-slate-500">Recent bookings across all city locations</p>
          </div>
          <Link
            href="/admin/rides"
            className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
          >
            <span>View All Rides ({rides.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Ride ID</th>
                <th className="p-4">Passenger</th>
                <th className="p-4">Driver</th>
                <th className="p-4">Route</th>
                <th className="p-4">Vehicle</th>
                <th className="p-4">Fare</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {rides.slice(0, 6).map((ride) => (
                <tr key={ride.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                    {ride.id}
                  </td>
                  <td className="p-4 font-semibold text-slate-900 dark:text-white">
                    {ride.userName}
                  </td>
                  <td className="p-4">
                    {ride.driverName || <span className="text-slate-400 italic">Unassigned</span>}
                  </td>
                  <td className="p-4">
                    <div>{ride.pickup} ➔ {ride.drop}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{ride.distanceKm} km</div>
                  </td>
                  <td className="p-4">
                    <span className="flex items-center gap-1 font-medium">
                      {ride.vehicleType === 'Car' ? <Car className="w-3.5 h-3.5 text-sky-500" /> : <Bike className="w-3.5 h-3.5 text-emerald-500" />}
                      {ride.vehicleType}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-slate-900 dark:text-white">
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
