'use client';

import React, { useState, useEffect } from 'react';
import { getRides, cancelRide } from '@/lib/storage';
import { formatCurrency } from '@/lib/fareCalculator';
import RideTable from '@/components/RideTable';
import Modal from '@/components/Modal';
import InvoiceModal from '@/components/InvoiceModal';
import { useToast } from '@/components/Toast';
import { Search, Clock, ShieldCheck, XCircle } from 'lucide-react';

export default function AdminRidesPage() {
  const { showToast } = useToast();
  const [rides, setRides] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [vehicleFilter, setVehicleFilter] = useState('All');

  const [viewingDetailsRide, setViewingDetailsRide] = useState(null);
  const [selectedInvoiceRide, setSelectedInvoiceRide] = useState(null);

  const loadData = () => {
    setRides(getRides());
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

  const handleAdminCancel = (rideId) => {
    if (window.confirm(`Are you sure you want to cancel ride ${rideId} as administrator?`)) {
      const ok = cancelRide(rideId, 'admin');
      if (ok) {
        showToast(`Ride ${rideId} cancelled by administrator.`, 'info');
        loadData();
      }
    }
  };

  const filteredRides = rides.filter((r) => {
    if (statusFilter !== 'All' && r.status !== statusFilter) return false;
    if (vehicleFilter !== 'All' && r.vehicleType !== vehicleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.id.toLowerCase().includes(q) ||
        r.userName.toLowerCase().includes(q) ||
        (r.driverName || '').toLowerCase().includes(q) ||
        r.pickup.toLowerCase().includes(q) ||
        r.drop.toLowerCase().includes(q) ||
        r.date.includes(q)
      );
    }
    return true;
  });

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">Master Rides Dispatch</h1>
          <p className="page-subtitle">Monitor and oversee all platform trips in real time</p>
        </div>

        <span className="badge badge-purple">
          {rides.length} Total Bookings
        </span>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="search-box-wrap">
          <Search size={16} className="search-box-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by ID, passenger, driver, or route..."
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
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Driver Arriving">Driver Arriving</option>
            <option value="Ride Started">Ride Started</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
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
        </div>
      </div>

      {/* Table */}
      <RideTable
        rides={filteredRides}
        role="admin"
        onViewDetails={(r) => setViewingDetailsRide(r)}
        onViewInvoice={(r) => setSelectedInvoiceRide(r)}
        onCancelRide={(id) => handleAdminCancel(id)}
      />

      {/* Trip Details Modal */}
      <Modal isOpen={!!viewingDetailsRide} onClose={() => setViewingDetailsRide(null)} title={`Trip Details (${viewingDetailsRide?.id})`}>
        {viewingDetailsRide && (
          <div>
            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Passenger:</span>
                <strong>{viewingDetailsRide.userName} ({viewingDetailsRide.userPhone})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Driver:</span>
                <strong>{viewingDetailsRide.driverName || 'Unassigned'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Vehicle:</span>
                <strong>{viewingDetailsRide.vehicleType} • {viewingDetailsRide.vehicleNumber || 'Standard'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Route:</span>
                <strong>{viewingDetailsRide.pickup} ➔ {viewingDetailsRide.drop}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Distance:</span>
                <strong>{viewingDetailsRide.distanceKm} km</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Start OTP:</span>
                <strong style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{viewingDetailsRide.otp}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Fare:</span>
                <strong style={{ color: 'var(--primary)', fontSize: '1rem' }}>{formatCurrency(viewingDetailsRide.fare)}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => setViewingDetailsRide(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={!!selectedInvoiceRide}
        onClose={() => setSelectedInvoiceRide(null)}
        ride={selectedInvoiceRide}
      />
    </div>
  );
}
