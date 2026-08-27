'use client';

import React from 'react';

export function DailyRidesChart({ rides = [] }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const counts = [12, 18, 15, 24, 30, 42, 36];
  const maxVal = Math.max(...counts, 45);

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <div className="chart-title">Daily Trip Demand</div>
          <div className="chart-subtitle">Completed & active bookings this week</div>
        </div>
        <span className="badge badge-success">Live Volume</span>
      </div>

      <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px', paddingTop: '20px' }}>
        {days.map((day, idx) => {
          const heightPercent = (counts[idx] / maxVal) * 100;
          return (
            <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-muted)' }}>{counts[idx]}</span>
              <div
                style={{
                  width: '100%',
                  height: `${heightPercent}%`,
                  background: idx >= 4 ? 'linear-gradient(180deg, #10b981, #059669)' : 'linear-gradient(180deg, #38bdf8, #0284c7)',
                  borderRadius: '6px 6px 0 0',
                  transition: 'height 0.5s ease'
                }}
              />
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-light)' }}>{day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CompletionDonutChart({ completed = 85, cancelled = 15 }) {
  const total = completed + cancelled || 100;
  const compPercent = Math.round((completed / total) * 100);

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <div className="chart-title">Trip Completion Rate</div>
          <div className="chart-subtitle">Fulfilled vs cancelled journeys</div>
        </div>
        <span className="badge badge-info">{compPercent}% Ratio</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '180px', position: 'relative' }}>
        <svg width="140" height="140" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="12" fill="none" />
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="#10b981"
            strokeWidth="12"
            strokeDasharray={`${compPercent * 2.51} 251`}
            strokeDashoffset="0"
            strokeLinecap="round"
            fill="none"
            transform="rotate(-90 50 50)"
          />
        </svg>

        <div style={{ position: 'absolute', textAlign: 'center' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)' }}>{compPercent}%</div>
          <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>Success</div>
        </div>
      </div>
    </div>
  );
}

export function VehicleFleetChart({ carCount = 8, bikeCount = 6 }) {
  const total = carCount + bikeCount || 1;
  const carPercent = Math.round((carCount / total) * 100);
  const bikePercent = 100 - carPercent;

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <div className="chart-title">Fleet Distribution</div>
          <div className="chart-subtitle">Active 4-Wheelers vs 2-Wheelers</div>
        </div>
        <span className="badge badge-purple">{total} Registered</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '180px', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
            <span style={{ color: 'var(--sky)' }}>City Car (Sedan & Hatch)</span>
            <span>{carCount} ({carPercent}%)</span>
          </div>
          <div style={{ height: '10px', width: '100%', backgroundColor: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${carPercent}%`, backgroundColor: 'var(--sky)' }} />
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
            <span style={{ color: 'var(--primary)' }}>Swift Bike (2-Wheeler)</span>
            <span>{bikeCount} ({bikePercent}%)</span>
          </div>
          <div style={{ height: '10px', width: '100%', backgroundColor: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${bikePercent}%`, backgroundColor: 'var(--primary)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
