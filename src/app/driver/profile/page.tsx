'use client';

import React, { useState, useEffect } from 'react';
import { getCurrentUser, getDrivers, updateDriver } from '@/lib/storage';
import { Driver, VehicleType } from '@/lib/types';
import { useToast } from '@/components/Toast';
import { 
  User as UserIcon, 
  Car, 
  Bike, 
  Phone, 
  Mail, 
  FileText, 
  Save, 
  Power, 
  ShieldCheck, 
  Star,
  Sparkles
} from 'lucide-react';

export default function DriverProfilePage() {
  const { showToast } = useToast();
  const [driver, setDriver] = useState<Driver | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('Car');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [available, setAvailable] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const user = getCurrentUser() as Driver;
    if (user && user.role === 'driver') {
      const allDrivers = getDrivers();
      const current = allDrivers.find((d) => d.id === user.id) || user;
      setDriver(current);
      setName(current.name || '');
      setEmail(current.email || '');
      setPhone(current.phone || '');
      setVehicleType(current.vehicleType || 'Car');
      setVehicleModel(current.vehicleModel || '');
      setVehicleNumber(current.vehicleNumber || '');
      setLicenseNumber(current.licenseNumber || '');
      setAvailable(current.available !== undefined ? current.available : true);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driver) return;

    if (!name.trim()) {
      showToast('Name is required.', 'error');
      return;
    }
    if (phone.replace(/[^0-9]/g, '').length !== 10) {
      showToast('Phone number must be 10 digits.', 'error');
      return;
    }
    if (!vehicleNumber.trim()) {
      showToast('Vehicle number is required.', 'error');
      return;
    }

    setSaving(true);
    setTimeout(() => {
      const updated = updateDriver(driver.id, {
        name: name.trim(),
        phone: phone.trim(),
        vehicleType,
        vehicleModel: vehicleModel.trim(),
        vehicleNumber: vehicleNumber.trim().toUpperCase(),
        licenseNumber: licenseNumber.trim().toUpperCase(),
        available
      });

      setSaving(false);
      if (updated) {
        setDriver(updated);
        showToast('Driver profile and vehicle records updated!', 'success');
      }
    }, 400);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
          <UserIcon className="w-3.5 h-3.5" /> Partner Account
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Driver Profile & Vehicle
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage your personal details, vehicle specifications, and online availability
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-8 items-start">
        {/* Left: Summary Card */}
        <div className="md:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-4">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-black text-3xl flex items-center justify-center mx-auto shadow-xl shadow-sky-500/20">
            {driver?.name ? driver.name.charAt(0) : 'D'}
          </div>

          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              {driver?.name || 'Arun Prakash'}
            </h3>
            <p className="text-xs text-slate-500">{driver?.email}</p>
            <div className="mt-2 flex items-center justify-center gap-2">
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                available
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
                  : 'bg-rose-100 dark:bg-rose-950 text-rose-600'
              }`}>
                {available ? '● ONLINE' : '○ OFFLINE'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-left text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Rating</span>
              <p className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                {driver?.rating || 4.9}
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Total Trips</span>
              <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                {driver?.totalRides || 1420}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Edit Form */}
        <div className="md:col-span-8 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <form onSubmit={handleSave} className="space-y-4">
            {/* Personal Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Phone Number (10 Digits) *
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm opacity-70 cursor-not-allowed font-medium"
              />
            </div>

            {/* Vehicle Details Box */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <Car className="w-4 h-4 text-sky-500" /> Vehicle & License Information
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Vehicle Type</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                  >
                    <option value="Car">Car</option>
                    <option value="Bike">Bike</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Vehicle Model</label>
                  <input
                    type="text"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="e.g. Maruti Dzire (White)"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Registration Plate No</label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    placeholder="TN01AB1234"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold uppercase outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Driving License Number</label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="DL-TN01-2018-0098765"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold uppercase outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Availability Status Checkbox */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Online Availability</span>
                <p className="text-[11px] text-slate-400">Receive new passenger requests when online</p>
              </div>
              <button
                type="button"
                onClick={() => setAvailable(!available)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  available
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {available ? 'ONLINE' : 'OFFLINE'}
              </button>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3.5 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-bold rounded-2xl shadow-lg shadow-sky-600/20 flex items-center gap-2 transition-all text-xs disabled:opacity-50 mt-4"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Driver Records'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
