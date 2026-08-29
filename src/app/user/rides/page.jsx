'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCurrentUser, getRides, cancelRide, rateRide } from '@/lib/storage';
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
  AlertCircle,
  Sparkles,
  Send
} from 'lucide-react';

export default function UserActiveRidesPage() {
  const { showToast } = useToast();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeRide, setActiveRide] = useState(null);

  // Inline Rating states
  const [inlineRating, setInlineRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [inlineFeedback, setInlineFeedback] = useState('Smooth driving and very punctual!');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

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

  const handleInlineRatingSubmit = (e) => {
    e.preventDefault();
    if (!activeRide) return;

    setIsSubmittingRating(true);
    const ok = rateRide(activeRide.id, inlineRating, inlineFeedback.trim());

    if (ok) {
      showToast(`Thank you! ${inlineRating}-star rating submitted for ${activeRide.driverName || 'driver'}.`, 'success');
      setIsSubmittingRating(false);
      loadData();
    } else {
      showToast('Failed to submit rating.', 'error');
      setIsSubmittingRating(false);
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
                <button className="btn btn-secondary btn-sm" onClick={() => setIsRatingOpen(true)} style={{ color: 'var(--amber)', fontWeight: 700 }}>
                  <Star size={14} fill="var(--amber)" /> Rate Driver
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

      {/* Ride Completed: Prominent Driver Rating Feature Banner */}
      {activeRide.status === 'Completed' && (
        <div className="card" style={{ 
          marginBottom: '24px', 
          background: activeRide.rating ? 'linear-gradient(135deg, #ecfdf5, #f0fdf4)' : 'linear-gradient(135deg, #fffbeb, #fef3c7)',
          border: activeRide.rating ? '2px solid #a7f3d0' : '2px solid #fde68a',
          padding: '24px'
        }}>
          {activeRide.rating ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--emerald-light)', color: 'var(--emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={28} />
                </div>
                <div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--emerald-text)' }}>
                    Trip Completed & Rated!
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '0.8125rem' }}>
                    <span style={{ color: 'var(--amber)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={16} fill="var(--amber)" /> {activeRide.rating}.0 / 5.0 Stars
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>• &ldquo;{activeRide.feedback}&rdquo;</span>
                  </div>
                </div>
              </div>

              <button className="btn btn-secondary btn-sm" onClick={() => setIsRatingOpen(true)}>
                <span>Edit Review</span>
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--amber-light)', color: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Star size={20} fill="var(--amber)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--amber-text)' }}>
                    How was your trip with {activeRide.driverName || 'Driver'}?
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Please take a moment to rate your driver partner and share your feedback.
                  </p>
                </div>
              </div>

              <form onSubmit={handleInlineRatingSubmit} style={{ marginTop: '16px' }}>
                {/* 5 Interactive Stars */}
                <div className="star-picker-row" style={{ justifyContent: 'flex-start', margin: '12px 0' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="star-btn"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setInlineRating(star)}
                    >
                      <Star
                        size={32}
                        fill={(hoverRating || inlineRating) >= star ? 'var(--amber)' : 'none'}
                        stroke={(hoverRating || inlineRating) >= star ? 'var(--amber)' : '#cbd5e1'}
                      />
                    </button>
                  ))}
                  <span style={{ marginLeft: '12px', fontSize: '0.9375rem', fontWeight: 800, color: 'var(--amber)' }}>
                    {inlineRating === 5 && '★★★★★ Outstanding (5 Stars)'}
                    {inlineRating === 4 && '★★★★☆ Great (4 Stars)'}
                    {inlineRating === 3 && '★★★☆☆ Average (3 Stars)'}
                    {inlineRating === 2 && '★★☆☆☆ Needs Improvement (2 Stars)'}
                    {inlineRating === 1 && '★☆☆☆☆ Unsatisfactory (1 Star)'}
                  </span>
                </div>

                {/* Quick feedback tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '12px 0' }}>
                  {['Clean Vehicle', 'Polite Driver', 'Fast Route', 'Safe Driving', 'AC Working', 'Great Conversation'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setInlineFeedback(tag)}
                      className={`btn btn-sm ${inlineFeedback === tag ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '0.75rem', borderRadius: '20px' }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '14px', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={inlineFeedback}
                    onChange={(e) => setInlineFeedback(e.target.value)}
                    placeholder="Write a quick comment for the driver..."
                    style={{ flex: 1 }}
                  />

                  <button type="submit" className="btn btn-primary" disabled={isSubmittingRating}>
                    <Send size={16} />
                    <span>{isSubmittingRating ? 'Submitting...' : 'Submit Rating'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

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
