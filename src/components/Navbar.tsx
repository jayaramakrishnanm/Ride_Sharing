'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  getCurrentUser, 
  logout, 
  getNotifications, 
  setCurrentUser, 
  getUsers, 
  getDrivers,
  initializeStorage 
} from '@/lib/storage';
import { User, Driver, Notification } from '@/lib/types';
import NotificationModal from './NotificationModal';
import { 
  Car, 
  Bike, 
  Bell, 
  LogOut, 
  User as UserIcon, 
  ShieldCheck, 
  ChevronDown, 
  Menu, 
  X,
  Sparkles,
  ArrowRightLeft
} from 'lucide-react';

export default function Navbar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUserState] = useState<(User | Driver) | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSwitchRoleOpen, setIsSwitchRoleOpen] = useState(false);

  const syncData = () => {
    const user = getCurrentUser();
    setCurrentUserState(user);
    if (user) {
      setNotifications(getNotifications(user.id));
    } else {
      setNotifications(getNotifications());
    }
  };

  useEffect(() => {
    initializeStorage();
    syncData();

    const handleStorageUpdate = () => {
      syncData();
    };

    window.addEventListener('rss_storage_update', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      window.removeEventListener('rss_storage_update', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, [pathname]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    logout();
    setCurrentUserState(null);
    router.push('/login');
  };

  const handleQuickSwitch = (role: 'user' | 'driver_car' | 'driver_bike' | 'admin') => {
    setIsSwitchRoleOpen(false);
    if (role === 'user') {
      const u = getUsers().find((x) => x.id === 'U101') || getUsers()[0];
      setCurrentUser(u);
      router.push('/user/dashboard');
    } else if (role === 'driver_car') {
      const d = getDrivers().find((x) => x.id === 'D101') || getDrivers()[0];
      setCurrentUser(d);
      router.push('/driver/dashboard');
    } else if (role === 'driver_bike') {
      const d = getDrivers().find((x) => x.id === 'D102') || getDrivers()[1];
      setCurrentUser(d);
      router.push('/driver/dashboard');
    } else if (role === 'admin') {
      const admin = getUsers().find((x) => x.role === 'admin') || {
        id: 'ADM001',
        name: 'System Administrator',
        email: 'admin@rideshare.com',
        phone: '9999988888',
        role: 'admin',
        status: 'Active'
      };
      setCurrentUser(admin as User);
      router.push('/admin/dashboard');
    }
  };

  const isPublicPage = pathname === '/' || pathname === '/login' || pathname === '/register';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Hamburger */}
        <div className="flex items-center gap-3">
          {!isPublicPage && onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <div className="flex -space-x-1">
                <Car className="w-4 h-4" />
                <Bike className="w-4 h-4 text-emerald-100" />
              </div>
            </div>
            <div>
              <div className="font-black text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                RideShare <span className="text-emerald-600 text-xs px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/80 rounded-md font-bold uppercase tracking-wider">System</span>
              </div>
              <p className="text-[10px] text-slate-400 -mt-1 font-medium hidden sm:block">
                Car & Bike Platform
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Navigation Links for Public Pages */}
        {isPublicPage && (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <Link href="/" className="hover:text-emerald-600 transition-colors">
              Home
            </Link>
            <a href="#features" className="hover:text-emerald-600 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-emerald-600 transition-colors">
              How It Works
            </a>
            <a href="#safety" className="hover:text-emerald-600 transition-colors">
              Safety
            </a>
            <a href="#fare-calculator" className="hover:text-emerald-600 transition-colors">
              Fare Estimator
            </a>
          </nav>
        )}

        {/* Right: Actions, Quick Switcher, Notifications, Auth */}
        <div className="flex items-center gap-2.5">
          {/* Quick Demo Role Switcher Button */}
          <div className="relative">
            <button
              onClick={() => setIsSwitchRoleOpen(!isSwitchRoleOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold border border-emerald-200 dark:border-emerald-800 transition-all shadow-sm"
              title="Switch demo persona instantly"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin-slow" />
              <span className="hidden sm:inline">Demo Switcher</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {isSwitchRoleOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-1">
                  1-Click Role Switch
                </div>
                <button
                  onClick={() => handleQuickSwitch('user')}
                  className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-emerald-600" />
                    <span>Ravi (Passenger)</span>
                  </div>
                  <span className="text-[10px] text-slate-400">User</span>
                </button>
                <button
                  onClick={() => handleQuickSwitch('driver_car')}
                  className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-sky-600" />
                    <span>Arun (Car Driver)</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Car</span>
                </button>
                <button
                  onClick={() => handleQuickSwitch('driver_bike')}
                  className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <Bike className="w-4 h-4 text-amber-600" />
                    <span>Priya (Bike Driver)</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Bike</span>
                </button>
                <button
                  onClick={() => handleQuickSwitch('admin')}
                  className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-200 border-t border-slate-100 dark:border-slate-800 mt-1"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span>Administrator</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Admin</span>
                </button>
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <button
            onClick={() => setIsNotifOpen(true)}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Profile / Login Button */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-800"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-bold flex items-center justify-center text-xs overflow-hidden">
                  {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[100px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-emerald-600 uppercase font-semibold">
                    {currentUser.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      href={
                        currentUser.role === 'admin'
                          ? '/admin/dashboard'
                          : currentUser.role === 'driver'
                          ? '/driver/profile'
                          : '/user/profile'
                      }
                      onClick={() => setIsProfileOpen(false)}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2"
                    >
                      <UserIcon className="w-4 h-4 text-slate-500" />
                      <span>My Profile</span>
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Notification Drawer */}
      <NotificationModal
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={notifications}
        recipientId={currentUser?.id || 'U101'}
      />
    </header>
  );
}
