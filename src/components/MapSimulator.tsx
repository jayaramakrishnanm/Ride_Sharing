'use client';

import React, { useEffect, useState } from 'react';
import { VehicleType, RideStatus } from '@/lib/types';
import { Car, Bike, Navigation, MapPin, Compass, Shield, Radio } from 'lucide-react';

interface MapSimulatorProps {
  pickup: string;
  drop: string;
  vehicleType: VehicleType;
  status: RideStatus;
  driverName?: string | null;
  vehicleNumber?: string | null;
}

export default function MapSimulator({
  pickup,
  drop,
  vehicleType,
  status,
  driverName,
  vehicleNumber
}: MapSimulatorProps) {
  const [progress, setProgress] = useState(30);
  const [etaMins, setEtaMins] = useState(8);
  const [speedKmh, setSpeedKmh] = useState(38);

  useEffect(() => {
    let initialProgress = 15;
    let initialEta = 12;
    let initialSpeed = 35;

    if (status === 'Pending') {
      initialProgress = 5;
      initialEta = 15;
      initialSpeed = 0;
    } else if (status === 'Accepted') {
      initialProgress = 20;
      initialEta = 10;
      initialSpeed = 25;
    } else if (status === 'Driver Arriving') {
      initialProgress = 40;
      initialEta = 4;
      initialSpeed = 30;
    } else if (status === 'Ride Started') {
      initialProgress = 65;
      initialEta = 6;
      initialSpeed = 42;
    } else if (status === 'Completed') {
      initialProgress = 100;
      initialEta = 0;
      initialSpeed = 0;
    }

    setProgress(initialProgress);
    setEtaMins(initialEta);
    setSpeedKmh(initialSpeed);

    // Subtle interval simulation for live feeling
    const interval = setInterval(() => {
      if (status === 'Ride Started' || status === 'Driver Arriving') {
        setProgress((prev) => {
          const next = prev + (Math.random() * 0.4);
          return next > 95 ? 95 : next;
        });
        setSpeedKmh(Math.floor(32 + Math.random() * 14));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [status]);

  // Calculate vehicle SVG position along a curved SVG path
  // Quadratic bezier path: (100, 200) -> (300, 80) -> (500, 220) -> (700, 120)
  const t = progress / 100;
  // Approximate path coords
  const vehX = 100 + t * 600;
  const vehY = 200 - Math.sin(t * Math.PI) * 110 + (Math.sin(t * Math.PI * 2) * 20);

  return (
    <div className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl flex flex-col justify-between p-4 select-none">
      {/* Map Vector Graphic Background */}
      <svg
        className="absolute inset-0 w-full h-full opacity-60"
        viewBox="0 0 800 350"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="roadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="1" />
          </pattern>
        </defs>

        {/* Map grid */}
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* City water body representation */}
        <path
          d="M 680,0 Q 640,150 720,250 T 800,350 L 800,0 Z"
          fill="#0c4a6e"
          opacity="0.3"
        />

        {/* Major background highway grid lines */}
        <path d="M 0,90 L 800,90" stroke="#334155" strokeWidth="3" strokeDasharray="6 6" />
        <path d="M 0,250 L 800,250" stroke="#334155" strokeWidth="3" strokeDasharray="6 6" />
        <path d="M 220,0 L 220,350" stroke="#334155" strokeWidth="3" strokeDasharray="6 6" />
        <path d="M 580,0 L 580,350" stroke="#334155" strokeWidth="3" strokeDasharray="6 6" />

        {/* Active Route Guideline */}
        <path
          d="M 100,200 Q 250,70 400,160 T 700,120"
          fill="none"
          stroke="#1e293b"
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* Active Dynamic Route Glow Line */}
        <path
          d="M 100,200 Q 250,70 400,160 T 700,120"
          fill="none"
          stroke="url(#roadGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="12 6"
        />

        {/* Pickup Pin Marker */}
        <g transform="translate(100, 200)">
          <circle r="16" fill="#10b981" opacity="0.3" className="pulse-marker" />
          <circle r="8" fill="#10b981" />
          <circle r="3" fill="#ffffff" />
          <text x="0" y="24" fill="#6ee7b7" fontSize="11" fontWeight="bold" textAnchor="middle">
            Pickup
          </text>
        </g>

        {/* Drop Pin Marker */}
        <g transform="translate(700, 120)">
          <circle r="16" fill="#f43f5e" opacity="0.3" className="pulse-marker" />
          <circle r="8" fill="#f43f5e" />
          <circle r="3" fill="#ffffff" />
          <text x="0" y="24" fill="#fda4af" fontSize="11" fontWeight="bold" textAnchor="middle">
            Destination
          </text>
        </g>

        {/* Moving Vehicle Marker */}
        <g
          transform={`translate(${vehX}, ${vehY})`}
          className="transition-all duration-1000 ease-out"
        >
          <circle r="22" fill="#0284c7" opacity="0.25" className="animate-ping" />
          <circle r="16" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
        </g>
      </svg>

      {/* Top Map HUD Bar */}
      <div className="relative z-10 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700/80 text-xs text-white">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="font-semibold">Simulated GPS Live Feed</span>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
          <span className="text-slate-400">Anna Salai Express Corridor</span>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-700/80 text-xs text-white">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <Compass className="w-4 h-4" />
            <span>{speedKmh} km/h</span>
          </div>
          {status !== 'Completed' && status !== 'Cancelled' && (
            <div className="text-slate-300 font-medium">
              ETA: <span className="text-white font-bold">{etaMins} mins</span>
            </div>
          )}
        </div>
      </div>

      {/* Floating Center Vehicle Badge */}
      <div
        className="absolute z-20 pointer-events-none transition-all duration-1000 ease-out -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${Math.max(10, Math.min(90, progress))}%`,
          top: `${45 - Math.sin((progress / 100) * Math.PI) * 15}%`
        }}
      >
        <div className="bg-slate-950 text-white p-2.5 rounded-2xl shadow-2xl border-2 border-sky-400 flex items-center gap-2">
          {vehicleType === 'Car' ? (
            <Car className="w-5 h-5 text-sky-400" />
          ) : (
            <Bike className="w-5 h-5 text-emerald-400" />
          )}
          {driverName && (
            <div className="hidden sm:block text-[10px] leading-tight font-semibold">
              <div>{driverName}</div>
              <div className="text-sky-300 font-mono text-[9px]">{vehicleNumber}</div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Map Card overlay */}
      <div className="relative z-10 bg-slate-950/85 backdrop-blur-md p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Live Route Navigation
            </div>
            <div className="text-xs font-semibold text-white flex items-center gap-2">
              <span className="truncate max-w-[120px] sm:max-w-[180px]">{pickup}</span>
              <span className="text-slate-500">➔</span>
              <span className="truncate max-w-[120px] sm:max-w-[180px]">{drop}</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-32 hidden sm:block">
          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
            <span>Trip Progress</span>
            <span className="font-bold text-white">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 transition-all duration-1000"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
