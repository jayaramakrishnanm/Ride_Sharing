'use client';

import React, { useState, useEffect } from 'react';
import { METRO_LOCATIONS, getEstimatedDistance, calculateFare, formatCurrency, generateOTP } from '@/lib/fareCalculator';
import { getNearbyAvailableDrivers } from '@/lib/driverMatcher';
import { getDrivers } from '@/lib/storage';
import DriverCard from './DriverCard';
import { Car, Bike, MapPin, Calendar, Clock, Users, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

export default function BookingForm({ 
  onSubmitBooking, 
  isSubmitting = false,
  initialPickup = '',
  initialDrop = '',
  initialVehicleType = 'Car'
}) {
  const [pickup, setPickup] = useState(initialPickup);
  const [drop, setDrop] = useState(initialDrop);
  const [vehicleType, setVehicleType] = useState(initialVehicleType);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(() => {
    const d = new Date();
    return d.toTimeString().substring(0, 5);
  });
  const [passengers, setPassengers] = useState(1);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [errorMessage, setErrorMessage] = useState('');

  const [nearbyDrivers, setNearbyDrivers] = useState([]);

  // Distance & fare estimation
  const hasRoute = Boolean(pickup && drop && pickup.trim().toLowerCase() !== drop.trim().toLowerCase());
  const distanceKm = hasRoute ? getEstimatedDistance(pickup, drop) : 0;
  const fareDetails = calculateFare(vehicleType, distanceKm);

  // Update nearby driver matching whenever pickup or vehicle type changes
  useEffect(() => {
    if (!pickup) {
      setNearbyDrivers([]);
      return;
    }
    const allDrivers = getDrivers();
    const matched = getNearbyAvailableDrivers(pickup, vehicleType, allDrivers);
    setNearbyDrivers(matched.slice(0, 3));
  }, [pickup, vehicleType]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!pickup || !drop) {
      setErrorMessage('Please select both pickup and drop locations.');
      return;
    }

    if (pickup.trim().toLowerCase() === drop.trim().toLowerCase()) {
      setErrorMessage('Pickup and drop locations cannot be the same.');
      return;
    }

    if (!date || !time) {
      setErrorMessage('Please select a valid ride date and time.');
      return;
    }

    if (vehicleType === 'Bike' && passengers > 1) {
      setErrorMessage('Bike rides accommodate a maximum of 1 passenger.');
      return;
    }

    const bookingPayload = {
      pickup,
      drop,
      vehicleType,
      distanceKm,
      fare: fareDetails.totalFare,
      date,
      time,
      passengers: parseInt(passengers, 10),
      notes: notes.trim(),
      paymentMethod,
      otp: generateOTP()
    };

    onSubmitBooking(bookingPayload);
  };

  return (
    <div className="booking-layout">
      {/* Left Column: Booking Form */}
      <div className="booking-card">
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
            Book Your Ride
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Choose your vehicle type, select your pickup & destination, and confirm.
          </p>
        </div>

        {errorMessage && (
          <div className="auth-alert-error" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* 1. Vehicle Selector (Car vs Bike) */}
          <div className="form-group">
            <label className="form-label">1. Select Ride Option *</label>
            <div className="vehicle-selector-grid">
              <button
                type="button"
                className={`vehicle-card-btn ${vehicleType === 'Car' ? 'active' : ''}`}
                onClick={() => {
                  setVehicleType('Car');
                  setPassengers(1);
                }}
              >
                <div className="vehicle-icon-wrap">
                  <Car size={24} />
                </div>
                <div>
                  <div className="vehicle-card-name">City Car</div>
                  <div className="vehicle-card-desc">AC Sedan / Hatchback (1-4 Seats)</div>
                  <div className="vehicle-card-rate">Base ₹50 + ₹15/km</div>
                </div>
              </button>

              <button
                type="button"
                className={`vehicle-card-btn ${vehicleType === 'Bike' ? 'active' : ''}`}
                onClick={() => {
                  setVehicleType('Bike');
                  setPassengers(1);
                }}
              >
                <div className="vehicle-icon-wrap">
                  <Bike size={24} />
                </div>
                <div>
                  <div className="vehicle-card-name">Swift Bike</div>
                  <div className="vehicle-card-desc">Quick 2-Wheeler (1 Helmet Seat)</div>
                  <div className="vehicle-card-rate">Base ₹30 + ₹8/km</div>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Route Pickup & Drop */}
          <div className="form-group route-selector-group">
            <div>
              <label className="form-label">2. Pickup Location *</label>
              <select
                className="form-select"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                required
              >
                <option value="" disabled>Select pickup location...</option>
                {METRO_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc} disabled={loc === drop}>{loc}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Drop-off Destination *</label>
              <select
                className="form-select"
                value={drop}
                onChange={(e) => setDrop(e.target.value)}
                required
              >
                <option value="" disabled>Select drop-off destination...</option>
                {METRO_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc} disabled={loc === pickup}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Date, Time & Passengers */}
          <div className="booking-triplet-row">
            <div>
              <label className="form-label">Date *</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label">Time *</label>
              <input
                type="time"
                className="form-input"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label">Passengers</label>
              <select
                className="form-select"
                value={passengers}
                onChange={(e) => setPassengers(e.target.value)}
                disabled={vehicleType === 'Bike'}
              >
                <option value={1}>1 Passenger</option>
                {vehicleType === 'Car' && (
                  <>
                    <option value={2}>2 Passengers</option>
                    <option value={3}>3 Passengers</option>
                    <option value={4}>4 Passengers</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* 4. Payment Method Option */}
          <div className="form-group">
            <label className="form-label">Payment Preference</label>
            <div className="payment-selector-row">
              <button
                type="button"
                className={`payment-method-pill ${paymentMethod === 'UPI' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('UPI')}
              >
                UPI (GPay / PhonePe)
              </button>
              <button
                type="button"
                className={`payment-method-pill ${paymentMethod === 'Card' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('Card')}
              >
                Credit / Debit Card
              </button>
              <button
                type="button"
                className={`payment-method-pill ${paymentMethod === 'Cash' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('Cash')}
              >
                Cash on Drop
              </button>
            </div>
          </div>

          {/* Optional Notes */}
          <div className="form-group">
            <label className="form-label">Special Driver Notes (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Near Gate 2 / Waiting with luggage"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            className="btn btn-primary btn-lg btn-block"
            disabled={isSubmitting}
          >
            <span>
              {isSubmitting
                ? 'Requesting Ride...'
                : hasRoute
                  ? `Confirm & Request ${vehicleType} (${formatCurrency(fareDetails.totalFare)})`
                  : `Select Locations to Request ${vehicleType}`}
            </span>
            <ArrowRight size={18} />
          </button>
        </form>
      </div>

      {/* Right Column: Fare Estimate & Nearby Driver Radar */}
      <div>
        {/* Fare Breakdown Box */}
        <div className="fare-estimate-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Live Fare Calculation
            </span>
            <span className="badge badge-info">{vehicleType}</span>
          </div>

          <div className="fare-breakdown-list">
            <div className="fare-row">
              <span>Estimated Distance</span>
              <strong style={{ color: 'var(--text-main)' }}>{hasRoute ? `${distanceKm} km` : '—'}</strong>
            </div>
            <div className="fare-row">
              <span>Estimated Duration</span>
              <strong style={{ color: 'var(--text-main)' }}>{hasRoute ? `~${fareDetails.estimatedDurationMins} mins` : '—'}</strong>
            </div>
            <div className="fare-row">
              <span>Base Fare</span>
              <span>{formatCurrency(fareDetails.baseFare)}</span>
            </div>
            <div className="fare-row">
              <span>Distance Rate (₹{fareDetails.ratePerKm}/km)</span>
              <span>{hasRoute ? formatCurrency(fareDetails.distanceFare) : '₹0'}</span>
            </div>
            <div className="fare-total-row">
              <span>Total Estimated Fare</span>
              <span className="fare-highlight-price">
                {hasRoute ? formatCurrency(fareDetails.totalFare) : formatCurrency(fareDetails.baseFare)}
              </span>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--primary-light)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.6875rem', color: 'var(--primary-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} />
            <span>Transparent pricing • Zero surge charges during demo mode.</span>
          </div>
        </div>

        {/* Nearby Drivers Simulated Matching */}
        <div className="nearby-drivers-panel">
          <div className="nearby-drivers-header">
            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} style={{ color: 'var(--primary)' }} />
                <span>Nearby Available Drivers</span>
              </h3>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                {pickup ? `Simulated Geo-matching around ${pickup}` : 'Select pickup location to find drivers'}
              </p>
            </div>
            <span className="badge badge-success">{nearbyDrivers.length} Online</span>
          </div>

          <div className="nearby-drivers-list">
            {nearbyDrivers.length === 0 ? (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>
                {pickup ? `No active ${vehicleType} drivers in range right now.` : 'Please select a pickup location to view available drivers.'}
              </p>
            ) : (
              nearbyDrivers.map((driver) => (
                <DriverCard key={driver.id} driver={driver} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
