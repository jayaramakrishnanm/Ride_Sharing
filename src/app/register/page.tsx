'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { saveUser, saveDriver, setCurrentUser, getUsers, getDrivers } from '@/lib/storage';
import { UserRole, VehicleType } from '@/lib/types';
import { useToast } from '@/components/Toast';
import { 
  User as UserIcon, 
  Car, 
  Bike, 
  Mail, 
  Lock, 
  Phone, 
  FileText, 
  ArrowRight, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [role, setRole] = useState<'user' | 'driver'>('user');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Driver specific fields
  const [vehicleType, setVehicleType] = useState<VehicleType>('Car');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'driver') {
      setRole('driver');
    }
  }, [searchParams]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!name.trim()) {
      errs.name = 'Full Name is required.';
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please enter a valid email address.';
    } else {
      const existingUser = getUsers().some(u => u.email.toLowerCase() === email.trim().toLowerCase());
      const existingDriver = getDrivers().some(d => d.email.toLowerCase() === email.trim().toLowerCase());
      if (existingUser || existingDriver) {
        errs.email = 'An account with this email already exists.';
      }
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 10) {
      errs.phone = 'Phone number must contain exactly 10 digits.';
    }

    if (!password || password.length < 8) {
      errs.password = 'Password must be at least 8 characters long.';
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    if (role === 'driver') {
      if (!vehicleModel.trim()) {
        errs.vehicleModel = 'Vehicle model is required (e.g. Maruti Dzire).';
      }
      if (!vehicleNumber.trim() || vehicleNumber.length < 6) {
        errs.vehicleNumber = 'Valid vehicle registration plate number is required.';
      }
      if (!licenseNumber.trim()) {
        errs.licenseNumber = 'Driving License number is required.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Please fix the errors in the form.', 'error');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      if (role === 'driver') {
        const newDriver = saveDriver({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password,
          role: 'driver',
          vehicleType,
          vehicleModel: vehicleModel.trim(),
          vehicleNumber: vehicleNumber.trim().toUpperCase(),
          licenseNumber: licenseNumber.trim().toUpperCase(),
          available: true,
          rating: 5.0,
          totalRides: 0,
          completedToday: 0,
          earningsToday: 0,
          totalEarnings: 0,
          status: 'Active',
          currentLocation: 'Chennai Central'
        });

        setCurrentUser(newDriver);
        showToast('Driver Registration Successful! Welcome aboard.', 'success');
        router.push('/driver/dashboard');
      } else {
        const newUser = saveUser({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password,
          role: 'user',
          rating: 5.0,
          totalRides: 0,
          status: 'Active',
          emergencyContact: ''
        });

        setCurrentUser(newUser);
        showToast('Registration Successful! Welcome to RideShare.', 'success');
        router.push('/user/dashboard');
      }
    }, 400);
  };

  return (
    <div className="w-full max-w-xl space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Create a New Account
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Join thousands of commuters and drivers today
        </p>
      </div>

      {/* Role Switcher */}
      <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-200/70 dark:bg-slate-900 rounded-2xl">
        <button
          type="button"
          onClick={() => setRole('user')}
          className={`py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            role === 'user'
              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>I am a Passenger</span>
        </button>

        <button
          type="button"
          onClick={() => setRole('driver')}
          className={`py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            role === 'driver'
              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>I want to Drive</span>
        </button>
      </div>

      {/* Registration Form Card */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Kannan"
              className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.name ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
              }`}
            />
            {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@gmail.com"
                className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.email ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                }`}
              />
              {errors.email && <p className="text-[11px] text-rose-500 mt-1">{errors.email}</p>}
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
                placeholder="9876543210"
                className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.phone ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                }`}
              />
              {errors.phone && <p className="text-[11px] text-rose-500 mt-1">{errors.phone}</p>}
            </div>
          </div>

          {/* Driver specific details */}
          {role === 'driver' && (
            <div className="p-4 bg-sky-50/60 dark:bg-sky-950/30 rounded-2xl border border-sky-200 dark:border-sky-900 space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-800 dark:text-sky-300">
                <Car className="w-4 h-4" /> Driver & Vehicle Information
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Vehicle Type *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setVehicleType('Car')}
                    className={`py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 ${
                      vehicleType === 'Car'
                        ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Car className="w-4 h-4" /> Car (Sedan/Hatchback)
                  </button>
                  <button
                    type="button"
                    onClick={() => setVehicleType('Bike')}
                    className={`py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 ${
                      vehicleType === 'Bike'
                        ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Bike className="w-4 h-4" /> Bike / Scooter
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Vehicle Make & Model *
                </label>
                <input
                  type="text"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  placeholder={vehicleType === 'Car' ? 'e.g. Maruti Suzuki Dzire (White)' : 'e.g. Honda Activa 6G (Black)'}
                  className={`w-full px-3.5 py-2 bg-white dark:bg-slate-900 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-sky-500 ${
                    errors.vehicleModel ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
                {errors.vehicleModel && <p className="text-[11px] text-rose-500 mt-1">{errors.vehicleModel}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Registration Number *
                  </label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    placeholder="TN01AB1234"
                    className={`w-full px-3.5 py-2 bg-white dark:bg-slate-900 border rounded-xl text-xs font-mono uppercase outline-none focus:ring-2 focus:ring-sky-500 ${
                      errors.vehicleNumber ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {errors.vehicleNumber && <p className="text-[11px] text-rose-500 mt-1">{errors.vehicleNumber}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Driving License No *
                  </label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="DL-TN01-2022-0012345"
                    className={`w-full px-3.5 py-2 bg-white dark:bg-slate-900 border rounded-xl text-xs font-mono uppercase outline-none focus:ring-2 focus:ring-sky-500 ${
                      errors.licenseNumber ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {errors.licenseNumber && <p className="text-[11px] text-rose-500 mt-1">{errors.licenseNumber}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Password & Confirm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Password (Min 8 chars) *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.password ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                }`}
              />
              {errors.password && <p className="text-[11px] text-rose-500 mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Confirm Password *
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.confirmPassword ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                }`}
              />
              {errors.confirmPassword && <p className="text-[11px] text-rose-500 mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-6"
          >
            {loading ? 'Creating Account...' : `Register as ${role === 'user' ? 'Passenger' : 'Driver Partner'}`}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="text-emerald-600 font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <Suspense fallback={<div className="text-center p-8 text-slate-500">Loading form...</div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
