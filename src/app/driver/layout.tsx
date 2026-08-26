'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { getCurrentUser, setCurrentUser, getDrivers, getRides } from '@/lib/storage';
import { Driver } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const sync = () => {
    let user = getCurrentUser() as Driver;
    if (!user || user.role !== 'driver') {
      // Auto-set demo driver Arun if empty
      const demoDriver = getDrivers()[0] || {
        id: 'D101',
        name: 'Arun Prakash',
        email: 'arun@gmail.com',
        phone: '9876543211',
        role: 'driver',
        vehicleType: 'Car',
        vehicleModel: 'Maruti Dzire',
        vehicleNumber: 'TN01AB1234',
        licenseNumber: 'DL-TN01-2018-0098765',
        available: true,
        status: 'Active'
      };
      setCurrentUser(demoDriver as Driver);
      user = demoDriver as Driver;
    }

    const pending = getRides().filter(
      (r) => r.status === 'Pending' && r.vehicleType === user.vehicleType
    ).length;
    setPendingCount(pending);
  };

  useEffect(() => {
    sync();
    setLoaded(true);

    const handleUpdate = () => sync();
    window.addEventListener('rss_storage_update', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('rss_storage_update', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  if (!loaded) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex">
        <Sidebar
          role="driver"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          pendingRequestsCount={pendingCount}
        />
        <main className="flex-1 lg:pl-64 p-4 sm:p-6 lg:p-8 min-w-0 max-w-7xl">
          {children}
        </main>
      </div>
    </div>
  );
}
