'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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

export default function Sidebar({ role, isOpen, onClose, pendingRequestsCount = 0 }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const passengerLinks = [
    { name: 'Dashboard', href: '/user/dashboard', icon: LayoutDashboard },
    { name: 'Book Ride', href: '/user/book-ride', icon: Car },
    { name: 'Active Rides', href: '/user/rides', icon: Compass },
    { name: 'Ride History', href: '/user/history', icon: History },
    { name: 'My Profile', href: '/user/profile', icon: User },
  ];

  const driverLinks = [
    { name: 'Dashboard', href: '/driver/dashboard', icon: LayoutDashboard },
    { 
      name: 'Ride Requests', 
      href: '/driver/requests', 
      icon: Inbox, 
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : null 
    },
    { name: 'Active Trip', href: '/driver/active-ride', icon: Compass },
    { name: 'Earnings & History', href: '/driver/history', icon: DollarSign },
    { name: 'Vehicle & Profile', href: '/driver/profile', icon: User },
  ];

  const adminLinks = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Driver Management', href: '/admin/drivers', icon: ShieldCheck },
    { name: 'All Rides', href: '/admin/rides', icon: Clock },
    { name: 'Reports & Analytics', href: '/admin/reports', icon: FileText },
  ];

  const links = role === 'admin' ? adminLinks : role === 'driver' ? driverLinks : passengerLinks;

  const roleLabel = role === 'admin' ? 'Admin Portal' : role === 'driver' ? 'Driver Partner' : 'Passenger Hub';
  const roleBadgeClass = role === 'admin' ? 'badge-purple' : role === 'driver' ? 'badge-info' : 'badge-success';

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`sidebar-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-content">
          {/* Header & Role Tag */}
          <div className="sidebar-header">
            <span className={`badge ${roleBadgeClass}`}>
              {roleLabel}
            </span>
            <button className="sidebar-close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          {/* Navigation Items */}
          <nav>
            <ul className="sidebar-nav">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;

                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className={`sidebar-link ${isActive ? 'active' : ''}`}
                    >
                      <div className="sidebar-link-left">
                        <Icon size={18} />
                        <span>{link.name}</span>
                      </div>
                      {link.badge && (
                        <span className="sidebar-link-badge">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Footer & Logout */}
        <div className="sidebar-footer">
          <div className="sidebar-status-box">
            <div className="status-box-title">
              <Sparkles size={14} style={{ color: 'var(--primary)' }} />
              <span>Storage Sync</span>
            </div>
            <div className="status-box-sub">
              LocalStorage Connected (Frontend)
            </div>
          </div>

          <button className="sidebar-logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
