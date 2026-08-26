'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { UserRole } from '@/lib/types';
import { logout } from '@/lib/storage';
import { 
  LayoutDashboard, 
  Car, 
  Bike, 
  Clock, 
  History, 
  User, 
  LogOut, 
  Inbox, 
  Compass, 
  DollarSign, 
  Users, 
  ShieldCheck, 
  FileText, 
  X,
  Sparkles
} from 'lucide-react';

interface SidebarLink {
  name: string;
  href: string;
  icon: any;
  badge?: number;
}

interface SidebarProps {
  role: UserRole;
  isOpen: boolean;
  onClose: () => void;
  pendingRequestsCount?: number;
}

export default function Sidebar({ role, isOpen, onClose, pendingRequestsCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const passengerLinks: SidebarLink[] = [
    { name: 'Dashboard', href: '/user/dashboard', icon: LayoutDashboard },
    { name: 'Book Ride', href: '/user/book-ride', icon: Car },
    { name: 'Active Rides', href: '/user/rides', icon: Compass },
    { name: 'Ride History', href: '/user/history', icon: History },
    { name: 'My Profile', href: '/user/profile', icon: User },
  ];

  const driverLinks: SidebarLink[] = [
    { name: 'Dashboard', href: '/driver/dashboard', icon: LayoutDashboard },
    { 
      name: 'Ride Requests', 
      href: '/driver/requests', 
      icon: Inbox, 
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined 
    },
    { name: 'Active Trip', href: '/driver/active-ride', icon: Compass },
    { name: 'Earnings & History', href: '/driver/history', icon: DollarSign },
    { name: 'Vehicle & Profile', href: '/driver/profile', icon: User },
  ];

  const adminLinks: SidebarLink[] = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Driver Management', href: '/admin/drivers', icon: ShieldCheck },
    { name: 'All Rides', href: '/admin/rides', icon: Clock },
    { name: 'Reports & Analytics', href: '/admin/reports', icon: FileText },
  ];

  const links: SidebarLink[] = role === 'admin' ? adminLinks : role === 'driver' ? driverLinks : passengerLinks;

  const roleLabel = role === 'admin' ? 'Admin Portal' : role === 'driver' ? 'Driver Partner' : 'Passenger Hub';
  const roleColor = role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' : role === 'driver' ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden animate-in fade-in"
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-6 flex-1 overflow-y-auto">
          {/* Header & Role Badge */}
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${roleColor}`}>
              {roleLabel}
            </span>
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{link.name}</span>
                  </div>
                  {link.badge !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white text-emerald-700'
                          : 'bg-emerald-500 text-white animate-pulse'
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Footer & Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Storage Status</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Client LocalStorage Synced
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
