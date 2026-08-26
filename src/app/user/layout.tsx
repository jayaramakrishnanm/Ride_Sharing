'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { getCurrentUser, setCurrentUser, getUsers } from '@/lib/storage';
import { useRouter } from 'next/navigation';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let user = getCurrentUser();
    if (!user) {
      // Auto-set demo passenger if empty
      const demoUser = getUsers()[0] || {
        id: 'U101',
        name: 'Ravi Kumar',
        email: 'ravi@gmail.com',
        phone: '9876543210',
        role: 'user',
        status: 'Active'
      };
      setCurrentUser(demoUser);
    }
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex">
        <Sidebar
          role="user"
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
