'use client';

import React, { useState, useEffect } from 'react';
import { Car, Bike, Navigation, MapPin, Gauge, ShieldCheck, Compass } from 'lucide-react';

export default function MapSimulator({ pickup = 'Pickup', drop = 'Destination', vehicleType = 'Car', status = 'Accepted' }) {
  const [progress, setProgress] = useState(35);
  const [speed, setSpeed] = useState(38);

  useEffect(() => {
    if (status === 'Ride Started') {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 92) return 92;
          return prev + 1;
        });
        setSpeed(Math.floor(32 + Math.random() * 15));
      }, 1000);
      return () => clearInterval(interval);
    } else if (status === 'Driver Arriving') {
      setProgress(20);
      setSpeed(28);
    } else if (status === 'Completed') {
      setProgress(100);
      setSpeed(0);
    } else {
      setProgress(10);
      setSpeed(0);
    }
  }, [status]);

  const carX = 100 + (progress / 100) * 440;
  const carY = 160 + Math.sin(progress / 10) * 20;

  return (
    <div className="map-canvas-container">
      {/* Background Metro Grid SVG */}
      <svg className="map-svg-layer" viewBox="0 0 640 320" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="1" />
          </pattern>
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <rect width="640" height="320" fill="url(#grid)" />

        {/* Secondary roads */}
        <path d="M 0 100 Q 200 120 400 60 T 640 80" stroke="#1e293b" strokeWidth="6" fill="none" />
        <path d="M 0 240 Q 150 200 350 250 T 640 220" stroke="#1e293b" strokeWidth="6" fill="none" />
        <path d="M 220 0 L 220 320" stroke="#1e293b" strokeWidth="6" fill="none" />
        <path d="M 460 0 L 460 320" stroke="#1e293b" strokeWidth="6" fill="none" />

        {/* Active Journey Route Path */}
        <path
          d="M 100 160 Q 240 120 380 200 T 540 160"
          stroke="url(#routeGradient)"
          strokeWidth="6"
          strokeDasharray="8 6"
          fill="none"
        />

        {/* Pickup Marker */}
        <circle cx="100" cy="160" r="10" fill="#10b981" fillOpacity="0.3" className="pulse-marker" />
        <circle cx="100" cy="160" r="5" fill="#10b981" />

        {/* Drop Marker */}
        <circle cx="540" cy="160" r="10" fill="#e11d48" fillOpacity="0.3" />
        <circle cx="540" cy="160" r="5" fill="#e11d48" />

        {/* Animated Moving Vehicle Icon */}
        <g transform={`translate(${carX - 16}, ${carY - 16})`}>
          <circle cx="16" cy="16" r="18" fill="#10b981" fillOpacity="0.3" className="pulse-marker" />
          <rect width="32" height="32" rx="8" fill="#ffffff" stroke="#10b981" strokeWidth="2" />
        </g>
      </svg>

      {/* Top HUD Overlay */}
      <div className="map-hud-top">
        <div className="map-hud-pill">
          <Navigation size={14} style={{ color: '#34d399' }} />
          <span>Simulated GPS Live Radar</span>
        </div>

        <div className="map-hud-pill">
          <Gauge size={14} style={{ color: '#38bdf8' }} />
          <span>{speed} km/h • Real-Time Movement</span>
        </div>
      </div>

      {/* Bottom Route Progress HUD */}
      <div className="map-hud-bottom">
        <div className="hud-route-info">
          <div className="hud-route-icon">
            {vehicleType === 'Car' ? <Car size={20} /> : <Bike size={20} />}
          </div>
          <div>
            <div className="hud-route-text">{pickup} ➔ {drop}</div>
            <div className="hud-route-sub">
              {status === 'Completed'
                ? 'Arrived at Destination'
                : status === 'Ride Started'
                ? 'En Route to Destination'
                : 'Driver Navigating to Pickup Point'}
            </div>
          </div>
        </div>

        <div className="hud-progress-wrap">
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#94a3b8' }}>
            <span>Progress</span>
            <strong style={{ color: '#ffffff' }}>{progress}%</strong>
          </div>
          <div className="hud-progress-bar">
            <div className="hud-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
