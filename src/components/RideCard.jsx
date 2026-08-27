'use client';

import React from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/fareCalculator';
import StatusBadge from './StatusBadge';
import { Car, Bike, MapPin, Calendar, Clock, ArrowRight } from 'lucide-react';

export default function RideCard({ ride, onAction, actionLabel }) {
  if (!ride) return null;

  return (
    <div className="card card-hover" style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ padding: '6px', backgroundColor: '#f1f5f9', borderRadius: '8px', color: 'var(--primary)' }}>
            {ride.vehicleType === 'Car' ? <Car size={16} /> : <Bike size={16} />}
          </div>
          <div>
            <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.8125rem', color: 'var(--text-main)' }}>
              #{ride.id}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
              • {ride.vehicleType}
            </span>
          </div>
        </div>
        <StatusBadge status={ride.status} />
      </div>

      <div className="route-stop-line">
        <div className="route-bullets">
          <div className="bullet-pickup" />
          <div className="bullet-line" />
          <div className="bullet-drop" />
        </div>
        <div className="route-stop-texts">
          <div>
            <div className="stop-label">Pickup</div>
            <div className="stop-name">{ride.pickup}</div>
          </div>
          <div>
            <div className="stop-label">Drop-off</div>
            <div className="stop-name">{ride.drop}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid var(--border-color)', marginTop: '14px' }}>
        <div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 700 }}>
            {ride.date} • {ride.time}
          </div>
          <div style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '2px' }}>
            {formatCurrency(ride.fare)}
          </div>
        </div>

        {onAction ? (
          <button className="btn btn-primary btn-sm" onClick={() => onAction(ride)}>
            <span>{actionLabel || 'View Details'}</span>
            <ArrowRight size={14} />
          </button>
        ) : (
          <Link href={`/user/rides`} className="btn btn-secondary btn-sm">
            <span>Track Trip</span>
            <ArrowRight size={14} />
          </Link>
        )}
      </div>
    </div>
  );
}
