'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { getCurrentUser, setCurrentUser, getUsers } from '@/lib/storage';
import { User } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let user = getCurrentUser();
    if (!user || user.role !== 'admin') {
      const admin = getUsers().find((u) => u.role === 'admin') || {
        id: 'ADM001',
        name: 'System Administrator',
        email: 'admin@rideshare.com',
        phone: '9999988888',
        role: 'admin',
        status: 'Active'
      };
      setCurrentUser(admin as User);
    }
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex">
        <Sidebar
          role="admin"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 lg:pl-64 p-4 sm:p-6 lg:p-8 min-w-0 max-w-7xl">
          {children}
        </main>
      </div>
    </div>
  );
}
