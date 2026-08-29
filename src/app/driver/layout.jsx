'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { getCurrentUser, getRides } from '@/lib/storage';

export default function DriverLayout({ children }) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const loadPending = () => {
    const user = getCurrentUser();
    if (!user || user.role !== 'driver') {
      router.push('/login');
      return;
    }
    setIsCheckingAuth(false);
    const allRides = getRides();
    const count = allRides.filter((r) => r.status === 'Pending' && r.vehicleType === user.vehicleType).length;
    setPendingCount(count);
  };

  useEffect(() => {
    loadPending();

    const handleUpdate = () => loadPending();
    window.addEventListener('rss_storage_update', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('rss_storage_update', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [router]);

  if (isCheckingAuth) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="main-layout">
        <Sidebar
          role="driver"
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          pendingRequestsCount={pendingCount}
        />

        <main className="main-content-with-sidebar">
          {children}
        </main>
      </div>
    </div>
  );
}
