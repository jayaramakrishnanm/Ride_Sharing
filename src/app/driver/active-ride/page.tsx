'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  getCurrentUser, 
  getRides, 
  updateRideStatus, 
  cancelRide,
  processPaymentSimulation 
} from '@/lib/storage';
import { Driver, Ride, RideStatus } from '@/lib/types';
import { formatCurrency } from '@/lib/fareCalculator';
import MapSimulator from '@/components/MapSimulator';
import InvoiceModal from '@/components/InvoiceModal';
import { useToast } from '@/components/Toast';
import { 
  Compass, 
  Car, 
  Bike, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  ShieldCheck, 
  CreditCard, 
  Eye, 
  ArrowRight,
  AlertCircle,
  Navigation
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DriverActiveRidePage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [driver, setDriver] = useState<Driver | null>(null);
  const [activeTrip, setActiveTrip] = useState<Ride | null>(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [selectedRideForInvoice, setSelectedRideForInvoice] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = () => {
    const user = getCurrentUser() as Driver;
    if (user && user.role === 'driver') {
      setDriver(user);
      const allRides = getRides();
      // Find trip assigned to this driver that is ongoing
      const active = allRides.find(
        (r) => r.driverId === user.id && r.status !== 'Cancelled'
      );
      setActiveTrip(active || null);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('rss_storage_update', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('rss_storage_update', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleProgressStatus = (nextStatus: RideStatus) => {
    if (!activeTrip) return;

    if (nextStatus === 'Ride Started') {
      // Validate OTP
      if (!enteredOtp.trim()) {
        showToast('Please enter the 4-digit passenger OTP to start the ride.', 'error');
        return;
      }
      if (enteredOtp.trim() !== activeTrip.otp) {
        showToast('Incorrect OTP! Please check with the passenger.', 'error');
        return;
      }
    }

    setLoading(true);

    setTimeout(() => {
      const updated = updateRideStatus(activeTrip.id, nextStatus);
      setLoading(false);

      if (updated) {
        setActiveTrip(updated);
        if (nextStatus === 'Driver Arriving') {
          showToast('Status updated: You are arriving at the pickup spot.', 'info');
        } else if (nextStatus === 'Ride Started') {
          showToast('OTP verified! Trip started. Drive safely.', 'success');
        } else if (nextStatus === 'Completed') {
          try {
            confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
          } catch (e) {}
          showToast(`Trip Completed! Earnings of ${formatCurrency(activeTrip.fare)} credited.`, 'success');
        }
      }
    }, 400);
  };

  const handleConfirmPaymentCollected = () => {
    if (!activeTrip) return;
    processPaymentSimulation(activeTrip.id, activeTrip.paymentMethod || 'Cash');
    showToast(`Payment of ${formatCurrency(activeTrip.fare)} marked as received!`, 'success');
    loadData();
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Compass className="w-3.5 h-3.5" /> Driver Navigation Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Active Trip Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Control lifecycle progression from pickup to drop-off and payment collection
          </p>
        </div>

        {activeTrip && activeTrip.status === 'Completed' && (
          <button
            onClick={() => setSelectedRideForInvoice(activeTrip)}
            className="px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-xs flex items-center gap-2 self-start sm:self-center"
          >
            <Eye className="w-4 h-4" />
            <span>View Receipt</span>
          </button>
        )}
      </div>

      {!activeTrip ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Compass className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Active Trip Assigned</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You are not currently assigned to an ongoing ride. Check your incoming requests queue to accept passengers.
          </p>
          <Link
            href="/driver/requests"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20"
          >
            <span>View Ride Requests</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Step Controller Header Card */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-sky-600 bg-sky-50 dark:bg-sky-950 px-3 py-1 rounded-xl">
                    TRIP #{activeTrip.id}
                  </span>
                  <span className="px-3 py-1 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold rounded-xl uppercase">
                    Status: {activeTrip.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
                  {activeTrip.pickup} ➔ {activeTrip.drop}
                </h3>
              </div>

              {/* Dynamic Status Action Button for Driver */}
              <div className="flex items-center gap-3">
                {activeTrip.status === 'Accepted' && (
                  <button
                    disabled={loading}
                    onClick={() => handleProgressStatus('Driver Arriving')}
                    className="px-6 py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-2xl shadow-lg shadow-sky-600/20 flex items-center gap-2 text-xs transition-all"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Mark as Arrived at Pickup</span>
                  </button>
                )}

                {activeTrip.status === 'Driver Arriving' && (
                  <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                    <input
                      type="text"
                      maxLength={4}
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value)}
                      placeholder="Enter 4-Digit OTP"
                      className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-emerald-500 text-center w-full sm:w-36"
                    />
                    <button
                      disabled={loading}
                      onClick={() => handleProgressStatus('Ride Started')}
                      className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md text-xs flex items-center justify-center gap-2 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Start Ride</span>
                    </button>
                  </div>
                )}

                {activeTrip.status === 'Ride Started' && (
                  <button
                    disabled={loading}
                    onClick={() => handleProgressStatus('Completed')}
                    className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 text-xs transition-all animate-pulse"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Ride at Destination</span>
                  </button>
                )}

                {activeTrip.status === 'Completed' && (
                  <div className="flex items-center gap-2">
                    {activeTrip.paymentStatus !== 'Paid' ? (
                      <button
                        onClick={handleConfirmPaymentCollected}
                        className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-lg"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Confirm Payment Received ({formatCurrency(activeTrip.fare)})</span>
                      </button>
                    ) : (
                      <span className="px-4 py-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-xl flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Payment Settled
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Simulated Live Route Map */}
            <MapSimulator
              pickup={activeTrip.pickup}
              drop={activeTrip.drop}
              vehicleType={activeTrip.vehicleType}
              status={activeTrip.status}
              driverName={driver?.name}
              vehicleNumber={driver?.vehicleNumber}
            />
          </div>

          {/* Passenger & Fare Information Cards */}
          <div className="grid md:grid-cols-12 gap-6">
            {/* Passenger Card */}
            <div className="md:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider text-slate-400">
                Passenger Information
              </h3>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-bold flex items-center justify-center text-base">
                  {activeTrip.userName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">
                    {activeTrip.userName}
                  </h4>
                  <p className="text-xs text-slate-500">{activeTrip.passengers} Passenger(s)</p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-500" />
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {activeTrip.userPhone}
                  </span>
                </div>
                <button
                  onClick={() => showToast(`Dialing passenger ${activeTrip.userName} (${activeTrip.userPhone})...`, 'info')}
                  className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold rounded-lg text-xs"
                >
                  Call Passenger
                </button>
              </div>

              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-900 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-emerald-900 dark:text-emerald-200">Trip OTP (Ask Passenger)</span>
                </div>
                <span className="font-mono font-black text-base text-emerald-700 dark:text-emerald-400">
                  {activeTrip.otp}
                </span>
              </div>
            </div>

            {/* Fare & Payout Card */}
            <div className="md:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider text-slate-400">
                  Earnings & Payout Summary
                </h3>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Trip Total Fare:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(activeTrip.fare)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Distance:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{activeTrip.distanceKm} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className="font-bold text-emerald-600">{activeTrip.paymentMethod || 'UPI'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Status:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{activeTrip.paymentStatus}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-900 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Net Driver Earnings
                  </span>
                  <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                    {formatCurrency(activeTrip.fare)}
                  </div>
                </div>
                <div className="text-right text-[11px] text-emerald-600 dark:text-emerald-400">
                  0% Commission Demo
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {selectedRideForInvoice && (
        <InvoiceModal
          isOpen={!!selectedRideForInvoice}
          onClose={() => setSelectedRideForInvoice(null)}
          ride={selectedRideForInvoice}
        />
      )}
    </div>
  );
}
