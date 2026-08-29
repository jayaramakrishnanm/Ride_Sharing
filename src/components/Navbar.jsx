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
import NotificationPanel from './NotificationPanel';
import { 
  Car, 
  Bike, 
  Bell, 
  LogOut, 
  User as UserIcon, 
  ShieldCheck, 
  ChevronDown, 
  Menu, 
  Sparkles 
} from 'lucide-react';

export default function Navbar({ onToggleSidebar }) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUserState] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSwitchRoleOpen, setIsSwitchRoleOpen] = useState(false);

  const syncData = () => {
    if (pathname === '/') {
      // Home page is strictly public: no logged in persona
      setCurrentUserState(null);
      setNotifications([]);
      return;
    }

    const user = getCurrentUser();
    setCurrentUserState(user);
    if (user) {
      setNotifications(getNotifications(user.id));
    } else {
      setNotifications([]);
    }
  };

  useEffect(() => {
    initializeStorage();

    if (pathname === '/') {
      // Visiting the public homepage clears any leftover previous session
      logout();
      setCurrentUserState(null);
      setNotifications([]);
    } else {
      syncData();
    }

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

  const handleQuickSwitch = (role) => {
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
    }
  };

  const isPublicPage = pathname === '/' || pathname === '/login' || pathname === '/register';

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand & Mobile Toggle */}
        <div className="navbar-brand-section">
          {!isPublicPage && onToggleSidebar && (
            <button className="navbar-menu-toggle" onClick={onToggleSidebar}>
              <Menu size={20} />
            </button>
          )}

          <Link href="/" className="navbar-brand">
            <div className="navbar-brand-icon">
              <Car size={20} />
            </div>
            <div>
              <div className="navbar-brand-text">
                RideShare <span className="navbar-brand-tag">System</span>
              </div>
              <div className="navbar-brand-sub">Car & Bike Platform</div>
            </div>
          </Link>
        </div>

        {/* Public Nav Links */}
        {isPublicPage && (
          <ul className="navbar-nav">
            <li><Link href="/" className="navbar-link">Home</Link></li>
            <li><a href="#features" className="navbar-link">Features</a></li>
            <li><a href="#how-it-works" className="navbar-link">How It Works</a></li>
            <li><a href="#fare-calculator" className="navbar-link">Fare Estimator</a></li>
          </ul>
        )}

        {/* Right Actions */}
        <div className="navbar-actions">
          {/* Demo Persona Switcher */}
          <div className="demo-switcher-dropdown">
            <button
              className="btn-demo-switcher"
              onClick={() => setIsSwitchRoleOpen(!isSwitchRoleOpen)}
            >
              <Sparkles size={14} />
              <span>Demo Switcher</span>
              <ChevronDown size={14} />
            </button>

            {isSwitchRoleOpen && (
              <div className="demo-menu">
                <div className="demo-menu-header">1-Click Persona Switch</div>
                <button className="demo-menu-item" onClick={() => handleQuickSwitch('user')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <UserIcon size={14} style={{ color: 'var(--primary)' }} />
                    <span>Ravi (Passenger - U101)</span>
                  </div>
                  <span className="demo-item-badge">User</span>
                </button>
                <button className="demo-menu-item" onClick={() => handleQuickSwitch('driver_car')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Car size={14} style={{ color: 'var(--sky)' }} />
                    <span>Arun (Car Driver - D101)</span>
                  </div>
                  <span className="demo-item-badge">Car</span>
                </button>
                <button className="demo-menu-item" onClick={() => handleQuickSwitch('driver_bike')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Bike size={14} style={{ color: 'var(--amber)' }} />
                    <span>Priya (Bike Driver - D102)</span>
                  </div>
                  <span className="demo-item-badge">Bike</span>
                </button>
              </div>
            )}
          </div>

          {/* Notifications Trigger (Only when logged in on dashboard pages) */}
          {currentUser && pathname !== '/' && (
            <button className="btn-icon-badge" onClick={() => setIsNotifOpen(true)}>
              <Bell size={20} />
              {unreadCount > 0 && <span className="badge-counter">{unreadCount}</span>}
            </button>
          )}

          {/* Profile Dropdown / Sign in */}
          {currentUser && pathname !== '/' ? (
            <div className="profile-dropdown-wrapper">
              <button
                className="profile-trigger"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className="profile-avatar">
                  {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                </div>
                <div className="profile-info">
                  <div className="profile-name">{currentUser.name}</div>
                  <div className="profile-role-tag">{currentUser.role}</div>
                </div>
                <ChevronDown size={14} style={{ color: 'var(--text-light)' }} />
              </button>

              {isProfileOpen && (
                <div className="profile-menu">
                  <div className="profile-menu-header">
                    <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>{currentUser.name}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{currentUser.email}</div>
                  </div>
                  <Link
                    href={
                      currentUser.role === 'admin'
                        ? '/admin/dashboard'
                        : currentUser.role === 'driver'
                        ? '/driver/profile'
                        : '/user/profile'
                    }
                    className="profile-menu-link"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <UserIcon size={14} /> My Profile
                  </Link>
                  <button className="profile-menu-link profile-menu-logout" onClick={handleLogout}>
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link href="/login" className="btn btn-secondary btn-sm">Sign In</Link>
              <Link href="/register" className="btn btn-primary btn-sm">Register</Link>
            </div>
          )}
        </div>
      </div>

      {/* Notification Drawer */}
      <NotificationPanel
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={notifications}
        recipientId={currentUser?.id || 'U101'}
      />
    </header>
  );
}
