'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getRides, acceptRide, toggleDriverAvailability } from '@/lib/storage';
import { formatCurrency } from '@/lib/fareCalculator';
import { useToast } from '@/components/Toast';
import { Car, Bike, Inbox, Check, X, MapPin, Clock, Users, ArrowRight, Power } from 'lucide-react';

export default function DriverRequestsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [driver, setDriver] = useState(null);
  const [requests, setRequests] = useState([]);

  const loadData = () => {
    const current = getCurrentUser();
    setDriver(current);
    if (current && current.role === 'driver') {
      const allRides = getRides();
      const pending = allRides.filter(
        (r) => r.status === 'Pending' && r.vehicleType === current.vehicleType
      );
      setRequests(pending);
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

  const handleAccept = (rideId) => {
    if (!driver) return;
    const res = acceptRide(rideId, driver.id);

    if (res.success) {
      showToast(`Ride #${rideId} accepted! Heading to pickup point.`, 'success');
      router.push('/driver/active-ride');
    } else {
      showToast(res.error || 'This ride is no longer available.', 'error');
      loadData();
    }
  };

  const handleReject = (rideId) => {
    setRequests((prev) => prev.filter((r) => r.id !== rideId));
    showToast(`Request #${rideId} dismissed from your view.`, 'info');
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">Live Ride Requests Queue</h1>
          <p className="page-subtitle">Incoming broadcast requests for {driver?.vehicleType} drivers</p>
        </div>

        <span className="badge badge-success">
          {requests.length} Available Requests
        </span>
      </div>

      {!driver?.available ? (
        <div className="card" style={{ padding: '48px', textAlign: 'center', backgroundColor: '#fff1f2', border: '1px solid #fecdd3' }}>
          <Power size={36} style={{ color: 'var(--rose)', margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--rose-text)' }}>You are currently Offline</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--rose-text)', maxWidth: '420px', margin: '8px auto 20px' }}>
            Turn your availability switch to <strong>Online</strong> to receive live passenger bookings in Chennai.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => {
              toggleDriverAvailability(driver.id);
              loadData();
            }}
          >
            Go Online Now
          </button>
        </div>
      ) : requests.length === 0 ? (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Inbox size={48} style={{ margin: '0 auto 12px', color: 'var(--text-light)' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>No Incoming Requests Right Now</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            You will be automatically notified when a passenger books a {driver?.vehicleType} ride in your zone.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {requests.map((req) => (
            <div key={req.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ padding: '6px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '8px' }}>
                      {req.vehicleType === 'Car' ? <Car size={18} /> : <Bike size={18} />}
                    </div>
                    <span style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--text-main)' }}>
                      #{req.id}
                    </span>
                  </div>
                  <span className="badge badge-pending">New Request</span>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9375rem' }}>{req.userName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phone: {req.userPhone}</div>
                </div>

                <div className="route-stop-line">
                  <div className="route-bullets">
                    <div className="bullet-pickup" />
                    <div className="bullet-line" />
                    <div className="bullet-drop" />
                  </div>
                  <div className="route-stop-texts">
                    <div>
                      <div className="stop-label">Pickup Location</div>
                      <div className="stop-name">{req.pickup}</div>
                    </div>
                    <div>
                      <div className="stop-label">Destination</div>
                      <div className="stop-name">{req.drop}</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: 'var(--text-muted)', margin: '14px 0' }}>
                  <div>Distance: <strong>{req.distanceKm} km</strong></div>
                  <div>Payment: <strong>{req.paymentMethod || 'UPI'}</strong></div>
                </div>

                {req.notes && (
                  <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '10px 12px', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    <strong>Note:</strong> &quot;{req.notes}&quot;
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 700 }}>Total Payout</div>
                  <div style={{ fontSize: '1.375rem', fontWeight: 900, color: 'var(--primary)' }}>
                    {formatCurrency(req.fare)}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleReject(req.id)}
                    title="Dismiss"
                  >
                    <X size={16} />
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleAccept(req.id)}
                  >
                    <Check size={16} />
                    <span>Accept</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
