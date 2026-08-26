'use client';

import React from 'react';
import { Car, Bike, CheckCircle2, XCircle, TrendingUp, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/fareCalculator';

interface ChartProps {
  ridesPerDay?: { day: string; count: number }[];
  completedCount?: number;
  cancelledCount?: number;
  activeCount?: number;
  carRidesCount?: number;
  bikeRidesCount?: number;
  totalRevenue?: number;
}

export function RidesPerDayChart({ data }: { data?: { day: string; count: number }[] }) {
  const chartData = data || [
    { day: 'Mon', count: 18 },
    { day: 'Tue', count: 24 },
    { day: 'Wed', count: 22 },
    { day: 'Thu', count: 35 },
    { day: 'Fri', count: 42 },
    { day: 'Sat', count: 48 },
    { day: 'Sun', count: 38 },
  ];

  const maxVal = Math.max(...chartData.map((d) => d.count), 1);

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Rides Overview (This Week)</h3>
          <p className="text-xs text-slate-500">Daily booking distribution</p>
        </div>
        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full">
          <TrendingUp className="w-3.5 h-3.5" /> +18.4%
        </span>
      </div>

      <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
        {chartData.map((item, idx) => {
          const heightPercent = (item.count / maxVal) * 100;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.count}
              </span>
              <div className="w-full max-w-[36px] bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden h-32 flex items-end">
                <div
                  className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-xl transition-all duration-500 group-hover:from-emerald-500 group-hover:to-teal-300"
                  style={{ height: `${heightPercent}%` }}
                ></div>
              </div>
              <span className="text-xs font-medium text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                {item.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function RideStatusDistributionChart({
  completed = 79,
  cancelled = 4,
  active = 8
}: {
  completed?: number;
  cancelled?: number;
  active?: number;
}) {
  const total = (completed + cancelled + active) || 1;
  const compPct = Math.round((completed / total) * 100);
  const cancPct = Math.round((cancelled / total) * 100);
  const actPct = 100 - compPct - cancPct;

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
      <div className="mb-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-base">Ride Completion Rate</h3>
        <p className="text-xs text-slate-500">Lifecycle performance metrics</p>
      </div>

      <div className="flex items-center justify-center my-4">
        {/* SVG Circular Donut Chart */}
        <div className="relative w-36 h-36">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-100 dark:text-slate-800"
              strokeWidth="4"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-emerald-500 transition-all duration-1000"
              strokeDasharray={`${compPct}, 100`}
              strokeWidth="4.2"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-rose-500 transition-all duration-1000"
              strokeDasharray={`${cancPct}, 100`}
              strokeDashoffset={`-${compPct}`}
              strokeWidth="4.2"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{compPct}%</span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Completed</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
        <div>
          <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Completed
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{completed}</p>
        </div>
        <div>
          <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-sky-500">
            <span className="w-2 h-2 rounded-full bg-sky-500"></span> In-Progress
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{active}</p>
        </div>
        <div>
          <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-rose-500">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Cancelled
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{cancelled}</p>
        </div>
      </div>
    </div>
  );
}

export function VehicleDistributionChart({
  carRides = 14,
  bikeRides = 18
}: {
  carRides?: number;
  bikeRides?: number;
}) {
  const total = (carRides + bikeRides) || 1;
  const carPct = Math.round((carRides / total) * 100);
  const bikePct = 100 - carPct;

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Vehicle Type Breakdown</h3>
          <p className="text-xs text-slate-500">Car vs Bike preference</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Car bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Car className="w-4 h-4 text-sky-500" /> Car Rides
            </span>
            <span className="text-slate-900 dark:text-white">{carRides} rides ({carPct}%)</span>
          </div>
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-500 rounded-full transition-all duration-700"
              style={{ width: `${carPct}%` }}
            ></div>
          </div>
        </div>

        {/* Bike bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Bike className="w-4 h-4 text-emerald-500" /> Bike Rides
            </span>
            <span className="text-slate-900 dark:text-white">{bikeRides} rides ({bikePct}%)</span>
          </div>
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${bikePct}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
        <span>Total Fleet Trips:</span>
        <span className="font-bold text-slate-900 dark:text-white">{total} Recorded Rides</span>
      </div>
    </div>
  );
}
