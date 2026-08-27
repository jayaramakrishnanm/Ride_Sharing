'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCurrentUser, getRides, cancelRide } from '@/lib/storage';
import { formatCurrency } from '@/lib/fareCalculator';
import MapSimulator from '@/components/MapSimulator';
import StatusBadge from '@/components/StatusBadge';
import PaymentModal from '@/components/PaymentModal';
import InvoiceModal from '@/components/InvoiceModal';
import RatingModal from '@/components/RatingModal';
import { useToast } from '@/components/Toast';
import { 
  Car, 
  Bike, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  CreditCard, 
  Star, 
  Clock, 
  CheckCircle2, 
  XCircle,
  FileText,
  AlertCircle
} from 'lucide-react';

export default function UserActiveRidesPage() {
  const { showToast } = useToast();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeRide, setActiveRide] = useState(null);

  // Modals
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);

  const loadData = () => {
    const user = getCurrentUser();
    setCurrentUser(user);
    if (user) {
      const allRides = getRides();
      const userRides = allRides.filter((r) => r.userId === user.id);
      const active = userRides.find(
        (r) => r.status === 'Pending' || r.status === 'Accepted' || r.status === 'Driver Arriving' || r.status === 'Ride Started'
      ) || userRides[0];
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

  const handleCancel = () => {
    if (!activeRide) return;
    if (window.confirm(`Are you sure you want to cancel ride ${activeRide.id}?`)) {
      cancelRide(activeRide.id, 'user');
      showToast(`Ride ${activeRide.id} cancelled.`, 'info');
      loadData();
    }
  };

  const steps = ['Pending', 'Accepted', 'Driver Arriving', 'Ride Started', 'Completed'];
  const currentStepIndex = activeRide ? steps.indexOf(activeRide.status) : 0;

  if (!activeRide) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Live Ride Tracker</h1>
          <p className="page-subtitle">Track your trip status, driver location, and journey progress</p>
        </div>

        <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Car size={48} style={{ color: 'var(--text-light)', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>No Active Trip Right Now</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', maxWidth: '360px', margin: '6px auto 20px' }}>
            You do not have any ongoing ride bookings. Ready to go somewhere?
          </p>
          <Link href="/user/book-ride" className="btn btn-primary">
            <span>Book a New Ride</span>
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

        <div style={{ display: 'flex', gap: '10px' }}>
          {activeRide.status === 'Pending' && (
            <button className="btn btn-danger btn-sm" onClick={handleCancel}>
              <XCircle size={14} /> Cancel Ride
            </button>
          )}

          {activeRide.status === 'Completed' && (
            <>
              {activeRide.paymentStatus !== 'Paid' && (
                <button className="btn btn-primary btn-sm" onClick={() => setIsPaymentOpen(true)}>
                  <CreditCard size={14} /> Pay {formatCurrency(activeRide.fare)}
                </button>
              )}
              <button className="btn btn-secondary btn-sm" onClick={() => setIsInvoiceOpen(true)}>
                <FileText size={14} /> Receipt
              </button>
              {!activeRide.rating && (
                <button className="btn btn-secondary btn-sm" onClick={() => setIsRatingOpen(true)}>
                  <Star size={14} /> Rate Driver
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* 5-Step Status Stepper */}
      <div className="stepper-card">
        <div className="stepper-track">
          {steps.map((step, idx) => {
            const isDone = currentStepIndex > idx || activeRide.status === 'Completed';
            const isCurrent = currentStepIndex === idx;

            return (
              <div key={step} className={`step-node ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}>
                <div className="step-icon-circle">
                  {isDone ? <CheckCircle2 size={18} /> : idx + 1}
                </div>
                <div className="step-name">{step}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* GPS Route Simulator Map */}
      <MapSimulator
        pickup={activeRide.pickup}
        drop={activeRide.drop}
        vehicleType={activeRide.vehicleType}
        status={activeRide.status}
      />

      {/* Details Grid */}
      <div className="trip-info-grid">
        {/* Driver Details Card */}
        <div className="info-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 800 }}>Assigned Driver</h3>
            <span className="badge badge-info">{activeRide.vehicleType} Partner</span>
          </div>

          {activeRide.driverName ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {activeRide.vehicleType === 'Car' ? <Car size={24} /> : <Bike size={24} />}
              </div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {activeRide.driverName}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {activeRide.vehicleModel || activeRide.vehicleType} • <strong style={{ fontFamily: 'monospace', color: 'var(--navy)' }}>{activeRide.vehicleNumber}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--amber)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <Star size={12} fill="var(--amber)" /> 4.9
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>• Phone: {activeRide.driverPhone || '9876543210'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              <Clock size={28} style={{ margin: '0 auto 8px', color: 'var(--amber)' }} />
              <p>Searching for nearest available {activeRide.vehicleType} driver...</p>
            </div>
          )}
        </div>

        {/* Security & Fare Details Box */}
        <div className="info-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 800 }}>Trip Verification</h3>
            <span className="badge badge-success">Ride Secured</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '0.8125rem' }}>
            <div style={{ backgroundColor: 'var(--primary-light)', padding: '14px', borderRadius: '12px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary-text)' }}>
                Start Trip OTP
              </span>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)', fontFamily: 'monospace', marginTop: '2px' }}>
                {activeRide.otp}
              </div>
              <span style={{ fontSize: '0.625rem', color: 'var(--primary-text)' }}>Share with driver</span>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '12px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Total Fare
              </span>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '2px' }}>
                {formatCurrency(activeRide.fare)}
              </div>
              <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                Status: {activeRide.paymentStatus || 'Pending'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        ride={activeRide}
        onPaymentSuccess={() => loadData()}
      />

      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        ride={activeRide}
      />

      <RatingModal
        isOpen={isRatingOpen}
        onClose={() => setIsRatingOpen(false)}
        ride={activeRide}
        onRatingSuccess={() => loadData()}
      />
    </div>
  );
}
