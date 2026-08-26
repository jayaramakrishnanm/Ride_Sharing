'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { authenticate, setCurrentUser, getUsers, getDrivers } from '@/lib/storage';
import { UserRole } from '@/lib/types';
import { useToast } from '@/components/Toast';
import { 
  User as UserIcon, 
  Car, 
  Bike, 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [role, setRole] = useState<UserRole>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const result = authenticate(email, password, role);

      if (!result.success) {
        setErrorMsg(result.error || 'Invalid login credentials.');
        showToast(result.error || 'Invalid login credentials.', 'error');
        setLoading(false);
        return;
      }

      showToast(`Welcome back, ${result.user?.name}!`, 'success');

      if (result.user?.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (result.user?.role === 'driver') {
        router.push('/driver/dashboard');
      } else {
        router.push('/user/dashboard');
      }
    }, 400);
  };

  const handleDemoQuickLogin = (demoRole: 'passenger' | 'driver_car' | 'driver_bike' | 'admin') => {
    setErrorMsg('');
    if (demoRole === 'passenger') {
      const user = getUsers().find((u) => u.id === 'U101') || getUsers()[0];
      setCurrentUser(user);
      showToast(`Logged in as Demo Passenger (${user.name})`, 'success');
      router.push('/user/dashboard');
    } else if (demoRole === 'driver_car') {
      const driver = getDrivers().find((d) => d.id === 'D101') || getDrivers()[0];
      setCurrentUser(driver);
      showToast(`Logged in as Demo Car Driver (${driver.name})`, 'success');
      router.push('/driver/dashboard');
    } else if (demoRole === 'driver_bike') {
      const driver = getDrivers().find((d) => d.id === 'D102') || getDrivers()[1];
      setCurrentUser(driver);
      showToast(`Logged in as Demo Bike Driver (${driver.name})`, 'success');
      router.push('/driver/dashboard');
    } else if (demoRole === 'admin') {
      const admin = getUsers().find((u) => u.role === 'admin') || {
        id: 'ADM001',
        name: 'System Administrator',
        email: 'admin@rideshare.com',
        role: 'admin',
        status: 'Active'
      };
      setCurrentUser(admin as any);
      showToast('Logged in as Administrator', 'success');
      router.push('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Sign In to Your Account
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Access your personalized Ride Sharing dashboard
            </p>
          </div>

          {/* Role Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-200/70 dark:bg-slate-900 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setRole('user');
                setEmail('ravi@gmail.com');
                setPassword('password123');
              }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                role === 'user'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>Passenger</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole('driver');
                setEmail('arun@gmail.com');
                setPassword('password123');
              }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                role === 'driver'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>Driver</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole('admin');
                setEmail('admin@rideshare.com');
                setPassword('adminpassword');
              }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                role === 'admin'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin</span>
            </button>
          </div>

          {/* Form Card */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
            {errorMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 animate-in fade-in">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. ravi@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" /> Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : `Sign in as ${role === 'user' ? 'Passenger' : role === 'driver' ? 'Driver' : 'Admin'}`}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-500">
                Don't have an account?{' '}
                <Link href="/register" className="text-emerald-600 font-bold hover:underline">
                  Register here
                </Link>
              </p>
            </div>
          </div>

          {/* Quick Demo Login Grid */}
          <div className="bg-slate-100 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>1-Click Project Demonstration Logins:</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleDemoQuickLogin('passenger')}
                className="p-2 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-left rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">👤 Ravi (User)</div>
                <div className="text-[10px] text-slate-400">ravi@gmail.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoQuickLogin('driver_car')}
                className="p-2 bg-white dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950 text-left rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">🚘 Arun (Car Driver)</div>
                <div className="text-[10px] text-slate-400">arun@gmail.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoQuickLogin('driver_bike')}
                className="p-2 bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950 text-left rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">🏍️ Priya (Bike Driver)</div>
                <div className="text-[10px] text-slate-400">priya@gmail.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoQuickLogin('admin')}
                className="p-2 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950 text-left rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">🛡️ Admin Portal</div>
                <div className="text-[10px] text-slate-400">admin@rideshare.com</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
