'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { METRO_LOCATIONS, getEstimatedDistance, calculateFare, formatCurrency } from '@/lib/fareCalculator';
import { 
  Car, 
  Bike, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  CreditCard, 
  Star, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  Compass, 
  Sparkles 
} from 'lucide-react';

export default function LandingPage() {
  const [pickup, setPickup] = useState('Chennai Central');
  const [drop, setDrop] = useState('T Nagar');
  const [vehicleType, setVehicleType] = useState('Car');

  const distanceKm = getEstimatedDistance(pickup, drop);
  const fareDetails = calculateFare(vehicleType, distanceKm);

  return (
    <div className="app-container">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section style={{ padding: '64px 20px', background: 'radial-gradient(circle at 50% 10%, rgba(16, 185, 129, 0.12) 0%, transparent 65%)', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'center' }}>
            {/* Left Hero Pitch */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', backgroundColor: 'var(--primary-light)', color: 'var(--primary-text)', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '18px' }}>
                <Sparkles size={14} />
                <span>Next-Gen Car & Bike Ride Sharing</span>
              </div>

              <h1 style={{ fontSize: '2.75rem', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.03em', color: 'var(--navy)', marginBottom: '18px' }}>
                Fast, Affordable Rides for <span style={{ color: 'var(--primary)' }}>Cars</span> and <span style={{ color: 'var(--sky)' }}>Bikes</span>.
              </h1>

              <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '28px' }}>
                Connect seamlessly with verified local drivers. Experience transparent distance-based fares, safety OTP verification, simulated GPS tracking, and digital invoices.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: '32px' }}>
                <Link href="/login" className="btn btn-primary btn-lg">
                  <span>Book a Ride Now</span>
                  <ArrowRight size={18} />
                </Link>
                <Link href="/register" className="btn btn-secondary btn-lg">
                  <span>Register as Driver</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={18} style={{ color: 'var(--primary)' }} />
                  <span>4-Digit Start OTP</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={18} style={{ color: 'var(--sky)' }} />
                  <span>Instant Matching</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CreditCard size={18} style={{ color: 'var(--purple)' }} />
                  <span>UPI / Card / Cash</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Fare Calculator Hero Widget */}
            <div id="fare-calculator" className="card" style={{ padding: '32px', boxShadow: 'var(--shadow-xl)', border: '2px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)' }}>Live Fare Estimator</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Test live route calculation instantly</p>
                </div>
                <span className="badge badge-success">Dynamic Engine</span>
              </div>

              {/* Vehicle selector */}
              <div className="vehicle-selector-grid" style={{ marginBottom: '16px' }}>
                <button
                  type="button"
                  className={`vehicle-card-btn ${vehicleType === 'Car' ? 'active' : ''}`}
                  onClick={() => setVehicleType('Car')}
                >
                  <div className="vehicle-icon-wrap"><Car size={20} /></div>
                  <div>
                    <div className="vehicle-card-name">City Car</div>
                    <div className="vehicle-card-desc">Base ₹50 + ₹15/km</div>
                  </div>
                </button>

                <button
                  type="button"
                  className={`vehicle-card-btn ${vehicleType === 'Bike' ? 'active' : ''}`}
                  onClick={() => setVehicleType('Bike')}
                >
                  <div className="vehicle-icon-wrap"><Bike size={20} /></div>
                  <div>
                    <div className="vehicle-card-name">Swift Bike</div>
                    <div className="vehicle-card-desc">Base ₹30 + ₹8/km</div>
                  </div>
                </button>
              </div>

              {/* Pickup & Drop selects */}
              <div className="form-group">
                <label className="form-label">Pickup Location</label>
                <select className="form-select" value={pickup} onChange={(e) => setPickup(e.target.value)}>
                  {METRO_LOCATIONS.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Destination</label>
                <select className="form-select" value={drop} onChange={(e) => setDrop(e.target.value)}>
                  {METRO_LOCATIONS.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
                </select>
              </div>

              {/* Breakdown */}
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', margin: '16px 0', fontSize: '0.8125rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: 'var(--text-muted)' }}>
                  <span>Route Distance:</span>
                  <strong>{distanceKm} km</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: 'var(--text-muted)' }}>
                  <span>Estimated Time:</span>
                  <strong>~{fareDetails.estimatedDurationMins} minutes</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border-color)', fontWeight: 900, fontSize: '1.125rem' }}>
                  <span>Estimated Fare:</span>
                  <span style={{ color: 'var(--primary)' }}>{formatCurrency(fareDetails.totalFare)}</span>
                </div>
              </div>

              <Link href="/user/book-ride" className="btn btn-primary btn-block">
                <span>Book This Route Now</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works Stepper */}
        <section id="how-it-works" style={{ padding: '64px 20px', maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="badge badge-purple" style={{ marginBottom: '8px' }}>Seamless Workflow</span>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--navy)', letterSpacing: '-0.025em' }}>
              How The System Works
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              From ride request to digital payment in 4 clear lifecycle steps
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            {[
              { step: '01', title: '1. Book Car or Bike', desc: 'Select pickup, destination, and vehicle type with transparent dynamic fare.' },
              { step: '02', title: '2. Driver Accepts', desc: 'Nearby verified drivers receive broadcast request in real time.' },
              { step: '03', title: '3. Verify Start OTP', desc: 'Share your secure 4-digit OTP with driver upon arrival before trip begins.' },
              { step: '04', title: '4. Arrive & Pay', desc: 'Complete trip, simulate instant UPI/Card/Cash payment, and download receipt.' }
            ].map((item) => (
              <div key={item.step} className="card" style={{ position: 'relative' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#e2e8f0', lineHeight: 1, marginBottom: '12px' }}>
                  {item.step}
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Key Features Grid */}
        <section id="features" style={{ padding: '64px 20px', backgroundColor: '#ffffff', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <span className="badge badge-info" style={{ marginBottom: '8px' }}>Core Capabilities</span>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--navy)', letterSpacing: '-0.025em' }}>
                Engineered for Performance & Reliability
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                MCA Project Features Checklist
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              <div className="card">
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <Car size={22} />
                </div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, marginBottom: '6px' }}>Car & Bike Multi-Fleet</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Distinct pricing algorithms for 4-wheelers (Base ₹50 + ₹15/km) and 2-wheelers (Base ₹30 + ₹8/km).
                </p>
              </div>

              <div className="card">
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'var(--sky-light)', color: 'var(--sky)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <Compass size={22} />
                </div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, marginBottom: '6px' }}>Simulated Geo Matching</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Haversine formula calculation matching nearby available drivers with real-time distance proximity radar.
                </p>
              </div>

              <div className="card">
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'var(--purple-light)', color: 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <ShieldCheck size={22} />
                </div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, marginBottom: '6px' }}>Admin Oversight & Reports</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Executive KPIs, SVG visual analytics, complete User/Driver CRUD, and 1-click CSV reports export.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
