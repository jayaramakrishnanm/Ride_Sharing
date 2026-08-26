'use client';

import React from 'react';
import { Ride } from '@/lib/types';
import { formatCurrency } from '@/lib/fareCalculator';
import { X, Printer, Car, Bike, MapPin, Calendar, Clock, ShieldCheck } from 'lucide-react';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  ride: Ride;
}

export default function InvoiceModal({ isOpen, onClose, ride }: InvoiceModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const gstTax = Math.round(ride.fare * 0.05); // 5% GST
  const netFare = ride.fare - gstTax;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="p-4 bg-slate-100 dark:bg-slate-800/80 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold text-sm text-slate-800 dark:text-white">Official Ride Receipt</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div className="p-8 overflow-y-auto space-y-6 text-slate-800 dark:text-slate-200 print:p-0">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black">
                  RS
                </div>
                <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  Ride Sharing System
                </h1>
              </div>
              <p className="text-xs text-slate-500">Academic Project Demonstration Receipt</p>
              <p className="text-xs text-slate-500">GSTIN: 33AABCR1234F1Z5</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-full">
                RECEIPT #{ride.id}
              </span>
              <p className="text-xs text-slate-500 mt-1">Date: {ride.date}</p>
              <p className="text-xs text-slate-500">Time: {ride.time}</p>
            </div>
          </div>

          {/* Passenger & Driver Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Passenger</span>
              <p className="font-bold text-sm text-slate-900 dark:text-white">{ride.userName}</p>
              <p className="text-xs text-slate-500">{ride.userPhone}</p>
              <p className="text-xs text-slate-500">User ID: {ride.userId}</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Driver & Vehicle</span>
              <p className="font-bold text-sm text-slate-900 dark:text-white">
                {ride.driverName || 'Designated Driver'}
              </p>
              <p className="text-xs text-slate-500">
                {ride.vehicleType === 'Car' ? '🚘 ' : '🏍️ '} {ride.vehicleModel || `${ride.vehicleType} Service`}
              </p>
              <p className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                {ride.vehicleNumber || 'TN--'}
              </p>
            </div>
          </div>

          {/* Route Overview */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Trip Route</span>
            
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center mt-1">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <div className="w-0.5 h-8 bg-slate-300 dark:bg-slate-700"></div>
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-[11px] text-slate-400">Pickup Location</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{ride.pickup}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">Drop Location</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{ride.drop}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-900 dark:text-white">{ride.distanceKm} km</p>
                <p className="text-[11px] text-slate-500">Total Distance</p>
              </div>
            </div>
          </div>

          {/* Fare Breakdown Table */}
          <div>
            <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3">Fare Breakdown</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Base Fare ({ride.vehicleType})</span>
                <span className="font-medium">{formatCurrency(ride.baseFare || (ride.vehicleType === 'Car' ? 50 : 30))}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">
                  Distance Charge ({ride.distanceKm} km @ {ride.vehicleType === 'Car' ? '₹15/km' : '₹8/km'})
                </span>
                <span className="font-medium">
                  {formatCurrency(ride.distanceFare || (ride.fare - (ride.baseFare || (ride.vehicleType === 'Car' ? 50 : 30))))}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Platform & Convenience Fee</span>
                <span className="font-medium">₹0.00 (Waived)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Applicable Taxes (GST 5% included)</span>
                <span className="font-medium">{formatCurrency(gstTax)}</span>
              </div>
              <div className="flex justify-between pt-2 text-base font-bold text-slate-900 dark:text-white">
                <span>Total Amount Charged</span>
                <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(ride.fare)}</span>
              </div>
            </div>
          </div>

          {/* Payment Status Banner */}
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900 flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              Payment Status: {ride.paymentStatus === 'Paid' ? 'PAID IN FULL' : 'PENDING'}
            </span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
              Via {ride.paymentMethod || 'UPI'}
            </span>
          </div>

          {/* Footer Note */}
          <div className="text-center text-[11px] text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-4">
            <p>Thank you for choosing Ride Sharing System!</p>
            <p>For support, contact support@rideshare.com | MCA Academic Project</p>
          </div>
        </div>
      </div>
    </div>
  );
}
