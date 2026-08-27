'use client';

import React from 'react';
import { formatCurrency } from '@/lib/fareCalculator';
import Modal from './Modal';
import { Car, Bike, Printer, Download, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function InvoiceModal({ isOpen, onClose, ride }) {
  if (!ride) return null;

  const handlePrint = () => {
    window.print();
  };

  const baseFare = ride.vehicleType === 'Car' ? 50 : 30;
  const distanceFare = ride.fare - baseFare;
  const tax = Math.round(ride.fare * 0.05);
  const total = ride.fare + tax;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ride Trip Invoice & Receipt" maxWidth="600px">
      <div className="invoice-container" id="printable-invoice">
        {/* Invoice Header */}
        <div className="invoice-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="invoice-brand-logo">
              {ride.vehicleType === 'Car' ? <Car size={18} /> : <Bike size={18} />}
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: '1.125rem', color: 'var(--navy)' }}>
                RideShare System
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                Official Ride Receipt & Trip Summary
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 800, fontSize: '0.875rem', fontFamily: 'monospace' }}>
              INV-{ride.id}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              Date: {ride.date} {ride.time}
            </div>
          </div>
        </div>

        {/* Passenger & Driver Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>Passenger</span>
            <div style={{ fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>{ride.userName}</div>
            <div style={{ color: 'var(--text-muted)' }}>Phone: {ride.userPhone}</div>
          </div>

          <div>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>Driver Partner</span>
            <div style={{ fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>{ride.driverName || 'Verified Partner'}</div>
            <div style={{ color: 'var(--text-muted)' }}>{ride.vehicleType} • {ride.vehicleNumber || 'TN09AB1234'}</div>
          </div>
        </div>

        {/* Route Details */}
        <div style={{ marginBottom: '20px', fontSize: '0.8125rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-success">Pickup</span>
            <strong>{ride.pickup}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-danger">Drop-off</span>
            <strong>{ride.drop}</strong>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            Distance: <strong>{ride.distanceKm} km</strong> • Verified via Start OTP <strong>{ride.otp}</strong>
          </div>
        </div>

        {/* Fare Itemized Table */}
        <div style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '14px 0', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Base Fare ({ride.vehicleType})</span>
            <span>{formatCurrency(baseFare)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Distance Fare ({ride.distanceKm} km)</span>
            <span>{formatCurrency(distanceFare)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--text-muted)' }}>
            <span>Platform GST / Fee (5%)</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '1rem', color: 'var(--text-main)', paddingTop: '10px', borderTop: '1px dashed var(--border-color)' }}>
            <span>Total Amount Paid</span>
            <span style={{ color: 'var(--primary)' }}>{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Payment & Security Status */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-text)' }}>
            <CheckCircle2 size={16} />
            <span>Paid via <strong>{ride.paymentMethod || 'UPI Instant'}</strong> (Status: Success)</span>
          </div>
          <div style={{ color: 'var(--text-muted)' }}>
            MCA Academic Project Verified
          </div>
        </div>

        {/* Print & Close Actions */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary btn-sm" onClick={handlePrint}>
            <Printer size={14} />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
