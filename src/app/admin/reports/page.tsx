'use client';

import React, { useState, useEffect } from 'react';
import { 
  getUsers, 
  getDrivers, 
  getRides, 
  getPayments, 
  initializeStorage 
} from '@/lib/storage';
import { User, Driver, Ride, Payment } from '@/lib/types';
import { formatCurrency } from '@/lib/fareCalculator';
import { useToast } from '@/components/Toast';
import { 
  FileText, 
  Download, 
  DollarSign, 
  Car, 
  Bike, 
  Star, 
  TrendingUp, 
  RotateCcw, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function AdminReportsPage() {
  const { showToast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [rides, setRides] = useState<Ride[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const loadData = () => {
    setUsers(getUsers().filter((u) => u.role !== 'admin'));
    setDrivers(getDrivers());
    setRides(getRides());
    setPayments(getPayments());
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

  const totalCompletedFare = rides
    .filter((r) => r.status === 'Completed')
    .reduce((acc, r) => acc + r.fare, 0);

  const carRevenue = rides
    .filter((r) => r.status === 'Completed' && r.vehicleType === 'Car')
    .reduce((acc, r) => acc + r.fare, 0);

  const bikeRevenue = rides
    .filter((r) => r.status === 'Completed' && r.vehicleType === 'Bike')
    .reduce((acc, r) => acc + r.fare, 0);

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`${filename} downloaded successfully!`, 'success');
  };

  const handleExportUsers = () => {
    const headers = ['User ID', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Total Rides', 'Joined Date'];
    const rows = users.map((u) => [
      u.id,
      `"${u.name}"`,
      u.email,
      u.phone,
      u.role,
      u.status,
      u.totalRides || 0,
      u.joinedDate || ''
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadCSV(csv, `RideShare_Users_Report_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportDrivers = () => {
    const headers = ['Driver ID', 'Name', 'Email', 'Phone', 'Vehicle Type', 'Model', 'Plate Number', 'License', 'Rating', 'Completed Today', 'Total Earnings', 'Online'];
    const rows = drivers.map((d) => [
      d.id,
      `"${d.name}"`,
      d.email,
      d.phone,
      d.vehicleType,
      `"${d.vehicleModel}"`,
      d.vehicleNumber,
      d.licenseNumber,
      d.rating,
      d.completedToday || 0,
      d.totalEarnings || 0,
      d.available ? 'ONLINE' : 'OFFLINE'
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadCSV(csv, `RideShare_Drivers_Report_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportRides = () => {
    const headers = ['Ride ID', 'Passenger', 'Phone', 'Driver', 'Pickup', 'Drop', 'Vehicle Type', 'Distance (km)', 'Fare (INR)', 'Status', 'Payment Method', 'Payment Status', 'Date', 'Time'];
    const rows = rides.map((r) => [
      r.id,
      `"${r.userName}"`,
      r.userPhone,
      `"${r.driverName || 'Unassigned'}"`,
      `"${r.pickup}"`,
      `"${r.drop}"`,
      r.vehicleType,
      r.distanceKm,
      r.fare,
      r.status,
      r.paymentMethod || 'UPI',
      r.paymentStatus || 'Pending',
      r.date,
      r.time
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadCSV(csv, `RideShare_Rides_Report_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const topDrivers = [...drivers].sort((a, b) => (b.totalRides || 0) - (a.totalRides || 0)).slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
          <FileText className="w-3.5 h-3.5" /> Intelligence & Exports
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Reports & Business Intelligence
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Export full dataset CSV reports and inspect fleet performance analytics
        </p>
      </div>

      {/* Export CSV Cards Grid */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Users Export</span>
            <Download className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Passenger Directory</h3>
            <p className="text-xs text-slate-500 mt-1">{users.length} registered accounts formatted in CSV.</p>
          </div>
          <button
            onClick={handleExportUsers}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20"
          >
            <Download className="w-4 h-4" /> Download Users CSV
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Drivers Export</span>
            <Download className="w-5 h-5 text-sky-500" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Fleet & Drivers Directory</h3>
            <p className="text-xs text-slate-500 mt-1">{drivers.length} drivers with vehicle & license info.</p>
          </div>
          <button
            onClick={handleExportDrivers}
            className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-sky-600/20"
          >
            <Download className="w-4 h-4" /> Download Drivers CSV
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Rides Export</span>
            <Download className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Master Rides Log</h3>
            <p className="text-xs text-slate-500 mt-1">{rides.length} trips with route, OTP, fare & status.</p>
          </div>
          <button
            onClick={handleExportRides}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-purple-600/20"
          >
            <Download className="w-4 h-4" /> Download Rides CSV
          </button>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Total Platform Volume</span>
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrency(totalCompletedFare)}
          </div>
          <p className="text-xs text-emerald-600 font-medium">All completed journeys</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Car Fleet Revenue</span>
            <Car className="w-5 h-5 text-sky-500" />
          </div>
          <div className="text-2xl font-black text-sky-600 dark:text-sky-400">
            {formatCurrency(carRevenue)}
          </div>
          <p className="text-xs text-slate-500">From sedan & hatchback rides</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Bike Fleet Revenue</span>
            <Bike className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatCurrency(bikeRevenue)}
          </div>
          <p className="text-xs text-slate-500">From 2-wheeler commute</p>
        </div>
      </div>

      {/* Top Drivers Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
            <span>Top Performing Driver Partners</span>
          </h2>
          <p className="text-xs text-slate-500">Ranked by lifetime trips and passenger ratings</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Rank</th>
                <th className="p-4">Driver Name</th>
                <th className="p-4">Vehicle</th>
                <th className="p-4">Plate Number</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Lifetime Trips</th>
                <th className="p-4 text-right">Lifetime Earnings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {topDrivers.map((d, idx) => (
                <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-4 font-black text-slate-400">
                    #{idx + 1}
                  </td>
                  <td className="p-4 font-bold text-slate-900 dark:text-white">
                    {d.name}
                  </td>
                  <td className="p-4">
                    <span className="flex items-center gap-1">
                      {d.vehicleType === 'Car' ? <Car className="w-3.5 h-3.5 text-sky-500" /> : <Bike className="w-3.5 h-3.5 text-emerald-500" />}
                      {d.vehicleModel}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-semibold">
                    {d.vehicleNumber}
                  </td>
                  <td className="p-4">
                    <span className="flex items-center gap-1 font-bold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> {d.rating}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                    {d.totalRides} trips
                  </td>
                  <td className="p-4 text-right font-black text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(d.totalEarnings || 0)}
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
