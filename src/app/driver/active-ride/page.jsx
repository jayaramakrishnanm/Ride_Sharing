'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getRides, updateRideStatus } from '@/lib/storage';
import { formatCurrency } from '@/lib/fareCalculator';
import MapSimulator from '@/components/MapSimulator';
import StatusBadge from '@/components/StatusBadge';
import { useToast } from '@/components/Toast';
import { 
  Car, 
  Bike, 
  MapPin, 
  Phone, 
  Navigation, 
  KeyRound, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck,
  Compass,
  AlertCircle 
} from 'lucide-react';

export default function DriverActiveRidePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [driver, setDriver] = useState(null);
  const [activeRide, setActiveRide] = useState(null);

  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');

  const loadData = () => {
    const current = getCurrentUser();
    setDriver(current);
    if (current && current.role === 'driver') {
      const allRides = getRides();
      const active = allRides.find(
        (r) => r.driverId === current.id && (r.status === 'Accepted' || r.status === 'Driver Arriving' || r.status === 'Ride Started')
      );
      setActiveRide(active || null);
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

  const handleMarkArrived = () => {
    if (!activeRide) return;
    updateRideStatus(activeRide.id, 'Driver Arriving');
    showToast('Passenger notified: You have arrived at the pickup location!', 'info');
    loadData();
  };

  const handleStartTrip = (e) => {
    e.preventDefault();
    if (!activeRide) return;

    if (otpInput.trim() !== activeRide.otp) {
      setOtpError('Invalid OTP! Please ask the passenger for their 4-digit start OTP.');
      return;
    }

    setOtpError('');
    updateRideStatus(activeRide.id, 'Ride Started');
    showToast('OTP verified! Trip started. Navigate safely to destination.', 'success');
    loadData();
  };

  const handleCompleteTrip = () => {
    if (!activeRide) return;
    updateRideStatus(activeRide.id, 'Completed');
    showToast(`Trip completed! Payout of ${formatCurrency(activeRide.fare)} credited to your account.`, 'success');
    loadData();
  };

  if (!activeRide) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Active Trip Lifecycle</h1>
          <p className="page-subtitle">Manage customer pickup, OTP verification, and trip completion</p>
        </div>

        <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Compass size={48} style={{ color: 'var(--text-light)', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>No Active Trip In Progress</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', maxWidth: '360px', margin: '6px auto 20px' }}>
            You are not currently assigned to an active trip. View pending requests to accept new rides.
          </p>
          <Link href="/driver/requests" className="btn btn-primary">
            <span>Check Available Requests</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1rem', color: 'var(--primary)' }}>
              #{activeRide.id}
            </span>
            <StatusBadge status={activeRide.status} />
          </div>
          <h1 className="page-title">{activeRide.pickup} ➔ {activeRide.drop}</h1>
        </div>

        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)' }}>
          Fare: {formatCurrency(activeRide.fare)}
        </div>
      </div>

      {/* Map Simulator */}
      <MapSimulator
        pickup={activeRide.pickup}
        drop={activeRide.drop}
        vehicleType={activeRide.vehicleType}
        status={activeRide.status}
      />

      {/* Step Actions Card */}
      <div className="card" style={{ marginTop: '24px', backgroundColor: '#fafbfc' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} style={{ color: 'var(--primary)' }} />
          <span>Trip Step Controls</span>
        </h2>

        {/* Stage 1: Accepted -> Arrived */}
        {activeRide.status === 'Accepted' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9375rem' }}>Step 1: Navigate to Pickup</div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Head towards <strong>{activeRide.pickup}</strong> and notify passenger once you reach.
              </p>
            </div>
            <button className="btn btn-primary" onClick={handleMarkArrived}>
              <Navigation size={16} />
              <span>Mark Arrived at Pickup</span>
            </button>
          </div>
        )}

        {/* Stage 2: Driver Arriving -> Enter OTP & Start Trip */}
        {activeRide.status === 'Driver Arriving' && (
          <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontWeight: 800, fontSize: '0.9375rem' }}>Step 2: Enter Passenger Start OTP</div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Ask passenger <strong>{activeRide.userName}</strong> for their 4-digit security OTP to begin the trip.
              </p>
            </div>

            {otpError && (
              <div className="auth-alert-error" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <AlertCircle size={16} />
                <span>{otpError}</span>
              </div>
            )}

            <form onSubmit={handleStartTrip} style={{ display: 'flex', gap: '12px', maxWidth: '360px' }}>
              <input
                type="text"
                maxLength={4}
                className="form-input"
                placeholder="4-digit OTP"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                style={{ textAlign: 'center', fontSize: '1.25rem', fontFamily: 'monospace', letterSpacing: '0.2em' }}
                required
              />
              <button type="submit" className="btn btn-primary">
                <KeyRound size={16} />
                <span>Verify & Start Ride</span>
              </button>
            </form>
          </div>
        )}

        {/* Stage 3: Ride Started -> Complete Ride */}
        {activeRide.status === 'Ride Started' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--primary-text)' }}>
                Step 3: En Route to Destination
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Driving to <strong>{activeRide.drop}</strong>. Click below once passenger arrives safely.
              </p>
            </div>
            <button className="btn btn-primary btn-lg" onClick={handleCompleteTrip}>
              <CheckCircle2 size={18} />
              <span>Complete Trip ({formatCurrency(activeRide.fare)})</span>
            </button>
          </div>
        )}
      </div>

      {/* Passenger Information */}
      <div className="trip-info-grid" style={{ marginTop: '20px' }}>
        <div className="info-box">
          <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>
            Passenger Information
          </h3>
          <div style={{ fontSize: '1.125rem', fontWeight: 900 }}>{activeRide.userName}</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <Phone size={14} /> {activeRide.userPhone}
          </div>
          {activeRide.notes && (
            <div style={{ marginTop: '12px', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <strong>Notes:</strong> &quot;{activeRide.notes}&quot;
            </div>
          )}
        </div>

        <div className="info-box">
          <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>
            Payment Summary
          </h3>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>
            {formatCurrency(activeRide.fare)}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Payment Method: <strong>{activeRide.paymentMethod || 'UPI Instant'}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
