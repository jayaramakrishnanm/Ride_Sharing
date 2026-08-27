'use client';

import React from 'react';
import { Car, Bike, Star, Navigation, ShieldCheck } from 'lucide-react';

export default function DriverCard({ driver, isSelected, onSelect }) {
  if (!driver) return null;

  return (
    <div
      onClick={onSelect}
      className={`driver-item-card ${isSelected ? 'active' : ''}`}
      style={{
        cursor: onSelect ? 'pointer' : 'default',
        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
        backgroundColor: isSelected ? 'var(--primary-light)' : '#ffffff'
      }}
    >
      <div className="driver-item-left">
        <div className="driver-item-avatar">
          {driver.vehicleType === 'Car' ? <Car size={18} /> : <Bike size={18} />}
        </div>
        <div>
          <div className="driver-item-name">{driver.name}</div>
          <div className="driver-item-meta">
            <span>{driver.vehicleModel || driver.vehicleType}</span>
            <span>•</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{driver.vehicleNumber}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', fontSize: '0.6875rem' }}>
            <span style={{ color: 'var(--amber)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
              <Star size={12} fill="var(--amber)" /> {driver.rating || 4.9}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>({driver.totalRides || 120} rides)</span>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'right' }}>
        <span className="driver-distance-badge">
          {driver.distanceAwayKm ? `${driver.distanceAwayKm} km away` : 'Nearby'}
        </span>
        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          ETA ~{driver.estimatedArrivalMins || 4} mins
        </div>
      </div>
    </div>
  );
}
