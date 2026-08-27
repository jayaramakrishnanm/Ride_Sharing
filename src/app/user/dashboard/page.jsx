'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCurrentUser, getRides, cancelRide } from '@/lib/storage';
import { formatCurrency } from '@/lib/fareCalculator';
import DashboardCard from '@/components/DashboardCard';
import RideTable from '@/components/RideTable';
import StatusBadge from '@/components/StatusBadge';
import InvoiceModal from '@/components/InvoiceModal';
import RatingModal from '@/components/RatingModal';
import { useToast } from '@/components/Toast';
import { 
  Car, 
  Bike, 
  Compass, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  MapPin, 
  Plus 
} from 'lucide-react';

export default function UserDashboardPage() {
  const { showToast } = useToast();
  const [currentUser, setCurrentUser] = useState(null);
  const [rides, setRides] = useState([]);
  const [selectedInvoiceRide, setSelectedInvoiceRide] = useState(null);
  const [selectedRatingRide, setSelectedRatingRide] = useState(null);

  const loadData = () => {
    const user = getCurrentUser();
    setCurrentUser(user);
    if (user) {
      const allRides = getRides();
      const userRides = allRides.filter((r) => r.userId === user.id);
      setRides(userRides);
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

  const activeRide = rides.find(
    (r) => r.status === 'Pending' || r.status === 'Accepted' || r.status === 'Driver Arriving' || r.status === 'Ride Started'
  );

  const completedCount = rides.filter((r) => r.status === 'Completed').length;
  const cancelledCount = rides.filter((r) => r.status === 'Cancelled').length;

  const handleCancelRide = (rideId) => {
    if (window.confirm(`Are you sure you want to cancel ride ${rideId}?`)) {
      cancelRide(rideId, 'user');
      showToast(`Ride ${rideId} was cancelled.`, 'info');
      loadData();
    }
  };

  return (
    <div>
      {/* Welcome Banner */}
      <div className="dashboard-hero-banner">
        <div>
          <div className="hero-tag">
            <Compass size={14} />
            <span>Passenger Dashboard</span>
          </div>
          <h1 className="hero-title">
            Welcome, {currentUser?.name || 'Passenger'}!
          </h1>
          <p className="hero-desc">
            Book instant city Car and Bike rides with guaranteed transparent pricing.
          </p>
        </div>

        <Link href="/user/book-ride" className="btn btn-secondary btn-lg" style={{ backgroundColor: '#ffffff', color: 'var(--primary-text)', fontWeight: 800 }}>
          <Plus size={18} />
          <span>Book a New Ride</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <DashboardCard
          title="Total Bookings"
          value={rides.length}
          subtitle="Lifetime requested trips"
          icon={Car}
          color="emerald"
        />
        <DashboardCard
          title="Active Journeys"
          value={activeRide ? 1 : 0}
          subtitle={activeRide ? activeRide.status : 'No active trips'}
          icon={Compass}
          color="sky"
        />
        <DashboardCard
          title="Completed Trips"
          value={completedCount}
          subtitle="Fulfilled rides"
          icon={CheckCircle2}
          color="emerald"
        />
        <DashboardCard
          title="Cancelled Trips"
          value={cancelledCount}
          subtitle="Refunded / aborted"
          icon={XCircle}
          color="rose"
        />
      </div>

      {/* Active Trip Live Monitor Banner */}
      {activeRide && (
        <div className="active-trip-banner">
          <div className="active-trip-header">
            <div className="active-trip-left">
              <div className="active-trip-icon">
                {activeRide.vehicleType === 'Car' ? <Car size={24} /> : <Bike size={24} />}
              </div>
              <div>
                <div className="active-trip-id">ACTIVE RIDE #{activeRide.id} • {activeRide.vehicleType}</div>
                <div className="active-trip-route">{activeRide.pickup} ➔ {activeRide.drop}</div>
              </div>
            </div>
            <StatusBadge status={activeRide.status} />
          </div>

          <div className="active-trip-details">
            <div>
              <span className="trip-detail-label">Assigned Driver</span>
              <div className="trip-detail-val">{activeRide.driverName || 'Finding Driver...'}</div>
            </div>

            <div>
              <span className="trip-detail-label">Vehicle Specs</span>
              <div className="trip-detail-val">{activeRide.vehicleNumber || 'Pending Match'}</div>
            </div>

            <div>
              <span className="trip-detail-label">Trip Fare</span>
              <div className="trip-detail-val" style={{ color: 'var(--primary)' }}>{formatCurrency(activeRide.fare)}</div>
            </div>

            <div>
              <span className="trip-detail-label">Security Start OTP</span>
              <div className="otp-val">{activeRide.otp}</div>
            </div>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            {activeRide.status === 'Pending' && (
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleCancelRide(activeRide.id)}
              >
                Cancel Ride
              </button>
            )}
            <Link href="/user/rides" className="btn btn-primary btn-sm">
              <span>Open Live GPS Tracker</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {/* Recent Rides Section */}
      <div style={{ marginTop: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 className="section-title">Recent Ride History</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Your latest bookings, completed trips, and invoices
            </p>
          </div>

          <Link href="/user/history" className="btn btn-secondary btn-sm">
            <span>View All History</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <RideTable
          rides={rides.slice(0, 5)}
          role="user"
          onViewInvoice={(r) => setSelectedInvoiceRide(r)}
          onRateDriver={(r) => setSelectedRatingRide(r)}
          onCancelRide={(id) => handleCancelRide(id)}
        />
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={!!selectedInvoiceRide}
        onClose={() => setSelectedInvoiceRide(null)}
        ride={selectedInvoiceRide}
      />

      {/* Rating Modal */}
      <RatingModal
        isOpen={!!selectedRatingRide}
        onClose={() => setSelectedRatingRide(null)}
        ride={selectedRatingRide}
        onRatingSuccess={() => loadData()}
      />
    </div>
  );
}
