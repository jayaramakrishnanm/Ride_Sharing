'use client';

import React, { useState, useEffect } from 'react';
import { getCurrentUser, getRides } from '@/lib/storage';
import RideTable from '@/components/RideTable';
import InvoiceModal from '@/components/InvoiceModal';
import RatingModal from '@/components/RatingModal';
import { Search, Filter, History as HistoryIcon, Download } from 'lucide-react';

export default function UserHistoryPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [rides, setRides] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [vehicleFilter, setVehicleFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const [selectedInvoiceRide, setSelectedInvoiceRide] = useState(null);
  const [selectedRatingRide, setSelectedRatingRide] = useState(null);

  const loadData = () => {
    const user = getCurrentUser();
    setCurrentUser(user);
    if (user) {
      const allRides = getRides();
      setRides(allRides.filter((r) => r.userId === user.id));
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

  const filteredRides = rides
    .filter((r) => {
      if (statusFilter !== 'All' && r.status !== statusFilter) return false;
      if (vehicleFilter !== 'All' && r.vehicleType !== vehicleFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          r.id.toLowerCase().includes(q) ||
          r.pickup.toLowerCase().includes(q) ||
          r.drop.toLowerCase().includes(q) ||
          (r.driverName || '').toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
      if (sortBy === 'oldest') return new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date);
      if (sortBy === 'fare_high') return b.fare - a.fare;
      if (sortBy === 'fare_low') return a.fare - b.fare;
      return 0;
    });

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">Ride History & Receipts</h1>
          <p className="page-subtitle">Inspect your lifetime trip records, download invoices, and rate drivers</p>
        </div>

        <span className="badge badge-success">
          {rides.length} Total Trips
        </span>
      </div>

      {/* Filter Toolbar */}
      <div className="admin-toolbar">
        <div className="search-box-wrap">
          <Search size={16} className="search-box-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by Ride ID, pickup, drop, or driver..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-selects-row">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
          </select>

          <select
            className="form-select"
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
          >
            <option value="All">All Vehicles</option>
            <option value="Car">Car</option>
            <option value="Bike">Bike</option>
          </select>

          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="fare_high">Highest Fare</option>
            <option value="fare_low">Lowest Fare</option>
          </select>
        </div>
      </div>

      {/* Rides Table */}
      <RideTable
        rides={filteredRides}
        role="user"
        onViewInvoice={(r) => setSelectedInvoiceRide(r)}
        onRateDriver={(r) => setSelectedRatingRide(r)}
      />

      {/* Modals */}
      <InvoiceModal
        isOpen={!!selectedInvoiceRide}
        onClose={() => setSelectedInvoiceRide(null)}
        ride={selectedInvoiceRide}
      />

      <RatingModal
        isOpen={!!selectedRatingRide}
        onClose={() => setSelectedRatingRide(null)}
        ride={selectedRatingRide}
        onRatingSuccess={() => loadData()}
      />
    </div>
  );
}
