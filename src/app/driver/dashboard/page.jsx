'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  getCurrentUser, 
  toggleDriverAvailability, 
  getRides, 
  acceptRide, 
  updateDriver 
} from '@/lib/storage';
import { formatCurrency } from '@/lib/fareCalculator';
import DashboardCard from '@/components/DashboardCard';
import StatusBadge from '@/components/StatusBadge';
import RideTable from '@/components/RideTable';
import { useToast } from '@/components/Toast';
import { 
  Car, 
  Bike, 
  DollarSign, 
  CheckCircle2, 
  Star, 
  Power, 
  Inbox, 
  Compass, 
  ArrowRight, 
  MapPin, 
  Clock, 
  Check 
} from 'lucide-react';

export default function DriverDashboardPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [driver, setDriver] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeRide, setActiveRide] = useState(null);
  const [completedRides, setCompletedRides] = useState([]);

  const loadData = () => {
    const current = getCurrentUser();
    setDriver(current);
    if (current && current.role === 'driver') {
      const allRides = getRides();

      // Pending requests matching driver's vehicle type
      const pending = allRides.filter(
        (r) => r.status === 'Pending' && r.vehicleType === current.vehicleType
      );
      setPendingRequests(pending);

      // Active ride assigned to this driver
      const active = allRides.find(
        (r) => r.driverId === current.id && (r.status === 'Accepted' || r.status === 'Driver Arriving' || r.status === 'Ride Started')
      );
      setActiveRide(active || null);

      // Completed rides
      const done = allRides.filter((r) => r.driverId === current.id && r.status === 'Completed');
      setCompletedRides(done);
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

  const handleToggleOnline = () => {
    if (!driver) return;
    const nextState = toggleDriverAvailability(driver.id);
    showToast(
      nextState ? 'You are now ONLINE and ready to receive ride requests.' : 'You are now OFFLINE.',
      nextState ? 'success' : 'info'
    );
    loadData();
  };

  const handleAcceptRide = (rideId) => {
    if (!driver) return;
    const res = acceptRide(rideId, driver.id);

    if (res.success) {
      showToast(`Ride #${rideId} accepted! Navigating to passenger.`, 'success');
      router.push('/driver/active-ride');
    } else {
      showToast(res.error || 'Failed to accept ride.', 'error');
      loadData();
    }
  };

  return (
    <div>
      {/* Driver Hero Banner */}
      <div className="driver-hero-banner">
        <div>
          <div className="hero-tag">
            {driver?.vehicleType === 'Car' ? <Car size={14} /> : <Bike size={14} />}
            <span>Driver Partner Console</span>
          </div>
          <h1 className="hero-title">
            Hello, {driver?.name || 'Partner'}!
          </h1>
          <p className="hero-desc">
            {driver?.vehicleType} • {driver?.vehicleModel} (<strong style={{ fontFamily: 'monospace' }}>{driver?.vehicleNumber}</strong>) • Rating {driver?.rating || 4.9} ★
          </p>
        </div>

        {/* Online / Offline Toggle Button */}
        <button
          className={`btn-online-toggle ${driver?.available ? 'online' : 'offline'}`}
          onClick={handleToggleOnline}
        >
          <Power size={18} />
          <span>{driver?.available ? '● ONLINE (ACCEPTING)' : '○ OFFLINE'}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <DashboardCard
          title="Today's Earnings"
          value={formatCurrency(driver?.earningsToday || 0)}
          subtitle={`${driver?.completedToday || 0} trips completed today`}
          icon={DollarSign}
          color="emerald"
        />
        <DashboardCard
          title="New Requests"
          value={pendingRequests.length}
          subtitle={`Pending ${driver?.vehicleType || 'vehicle'} bookings`}
          icon={Inbox}
          color="sky"
        />
        <DashboardCard
          title="Lifetime Trips"
          value={driver?.totalRides || 0}
          subtitle="Completed journeys"
          icon={CheckCircle2}
          color="emerald"
        />
        <DashboardCard
          title="Lifetime Revenue"
          value={formatCurrency(driver?.totalEarnings || 0)}
          subtitle="Total platform payouts"
          icon={DollarSign}
          color="purple"
        />
      </div>

      {/* Active Trip Banner */}
      {activeRide && (
        <div className="active-trip-banner" style={{ backgroundColor: '#0f172a' }}>
          <div className="active-trip-header">
            <div className="active-trip-left">
              <div className="active-trip-icon">
                <Compass size={24} />
              </div>
              <div>
                <div className="active-trip-id">ONGOING TRIP #{activeRide.id}</div>
                <div className="active-trip-route">{activeRide.pickup} ➔ {activeRide.drop}</div>
              </div>
            </div>
            <StatusBadge status={activeRide.status} />
          </div>

          <div className="active-trip-details">
            <div>
              <span className="trip-detail-label">Passenger Name</span>
              <div className="trip-detail-val">{activeRide.userName} ({activeRide.userPhone})</div>
            </div>
            <div>
              <span className="trip-detail-label">Fare Amount</span>
              <div className="trip-detail-val" style={{ color: 'var(--primary)' }}>{formatCurrency(activeRide.fare)}</div>
            </div>
            <div>
              <span className="trip-detail-label">Distance</span>
              <div className="trip-detail-val">{activeRide.distanceKm} km</div>
            </div>
            <div>
              <span className="trip-detail-label">Verification</span>
              <div className="trip-detail-val" style={{ color: '#38bdf8' }}>OTP Required on Pickup</div>
            </div>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <Link href="/driver/active-ride" className="btn btn-primary btn-sm">
              <span>Manage Trip Lifecycle</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {/* Incoming Requests Queue */}
      <div style={{ marginTop: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 className="section-title">Incoming Ride Requests</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Live broadcast queue for {driver?.vehicleType} drivers in Chennai Metro
            </p>
          </div>

          <Link href="/driver/requests" className="btn btn-secondary btn-sm">
            <span>View Full Queue ({pendingRequests.length})</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {!driver?.available ? (
          <div className="card" style={{ padding: '36px', textAlign: 'center', backgroundColor: '#fff1f2', border: '1px solid #fecdd3' }}>
            <Power size={32} style={{ color: 'var(--rose)', margin: '0 auto 8px' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--rose-text)' }}>You are currently Offline</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--rose-text)', marginTop: '4px' }}>
              Switch your status to <strong>Online</strong> to start receiving incoming ride requests.
            </p>
          </div>
        ) : pendingRequests.length === 0 ? (
          <div className="card" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Inbox size={32} style={{ margin: '0 auto 8px', color: 'var(--text-light)' }} />
            <p style={{ fontSize: '0.8125rem' }}>No pending {driver?.vehicleType} requests right now. Waiting for new passengers...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {pendingRequests.slice(0, 4).map((req) => (
              <div key={req.id} className="card card-hover">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--primary)' }}>#{req.id}</span>
                  <span className="badge badge-pending">Pending</span>
                </div>

                <div style={{ fontSize: '0.8125rem', marginBottom: '12px' }}>
                  <div style={{ fontWeight: 700 }}>{req.userName}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{req.pickup} ➔ {req.drop} ({req.distanceKm} km)</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-main)' }}>
                    {formatCurrency(req.fare)}
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleAcceptRide(req.id)}
                  >
                    <Check size={14} />
                    <span>Accept Ride</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
