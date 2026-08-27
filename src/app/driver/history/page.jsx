'use client';

import React, { useState, useEffect } from 'react';
import { getCurrentUser, getRides } from '@/lib/storage';
import { formatCurrency } from '@/lib/fareCalculator';
import RideTable from '@/components/RideTable';
import { Search, DollarSign, Star, CheckCircle2 } from 'lucide-react';

export default function DriverHistoryPage() {
  const [driver, setDriver] = useState(null);
  const [rides, setRides] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = () => {
    const current = getCurrentUser();
    setDriver(current);
    if (current && current.role === 'driver') {
      const allRides = getRides();
      const myRides = allRides.filter((r) => r.driverId === current.id && r.status === 'Completed');
      setRides(myRides);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('rss_storage_update', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('rss_storage_update', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const filteredRides = rides.filter((r) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.id.toLowerCase().includes(q) ||
        r.userName.toLowerCase().includes(q) ||
        r.pickup.toLowerCase().includes(q) ||
        r.drop.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalEarnings = rides.reduce((sum, r) => sum + r.fare, 0);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">Earnings & Completed Rides</h1>
          <p className="page-subtitle">Track your fulfilled trips, passenger payouts, and customer reviews</p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Fulfilled Volume
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>
            {formatCurrency(totalEarnings)}
          </div>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="admin-toolbar">
        <div className="search-box-wrap">
          <Search size={16} className="search-box-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search completed trips by ID, passenger, or route..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <span className="badge badge-success">{filteredRides.length} Trips Completed</span>
      </div>

      {/* Rides Table */}
      <RideTable
        rides={filteredRides}
        role="driver"
      />
    </div>
  );
}
