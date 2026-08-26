'use client';

import React, { useState } from 'react';
import { Ride, PaymentMethod } from '@/lib/types';
import { processPaymentSimulation } from '@/lib/storage';
import { formatCurrency } from '@/lib/fareCalculator';
import { useToast } from './Toast';
import { 
  CreditCard, 
  QrCode, 
  Banknote, 
  CheckCircle2, 
  X, 
  Loader2, 
  ShieldCheck, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  ride: Ride;
  onSuccess?: () => void;
}

export default function PaymentModal({ isOpen, onClose, ride, onSuccess }: PaymentModalProps) {
  const { showToast } = useToast();
  const [method, setMethod] = useState<PaymentMethod>('UPI');
  const [upiId, setUpiId] = useState('user@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 8910 2341 9081');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('482');
  const [cardName, setCardName] = useState(ride.userName || 'Passenger');
  const [cashGiven, setCashGiven] = useState(ride.fare.toString());
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [txnDetails, setTxnDetails] = useState<any>(null);

  if (!isOpen) return null;

  const handlePay = () => {
    // Validate inputs
    if (method === 'UPI' && !upiId.includes('@')) {
      showToast('Please enter a valid UPI ID (e.g. name@upi)', 'error');
      return;
    }
    if (method === 'Card') {
      if (cardNumber.replace(/\s/g, '').length < 16) {
        showToast('Please enter a valid 16-digit card number', 'error');
        return;
      }
      if (cardCvv.length < 3) {
        showToast('Please enter a valid CVV', 'error');
        return;
      }
    }

    setIsProcessing(true);

    // Simulate gateway roundtrip
    setTimeout(() => {
      const result = processPaymentSimulation(ride.id, method);
      setIsProcessing(false);
      setIsCompleted(true);
      setTxnDetails(result.payment);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Fallback if confetti fails
      }

      showToast(`Payment of ${formatCurrency(ride.fare)} successful!`, 'success');
      if (onSuccess) onSuccess();
    }, 1800);
  };

  const handleFinish = () => {
    setIsCompleted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" /> Secure Payment Simulation
            </div>
            <h2 className="text-2xl font-bold">Ride Fare: {formatCurrency(ride.fare)}</h2>
            <p className="text-emerald-100 text-xs mt-0.5">Ride #{ride.id} • {ride.vehicleType} Ride</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!isCompleted ? (
          <div className="p-6 space-y-6">
            {/* Trip summary */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs space-y-2">
              <div className="flex justify-between text-slate-500">
                <span>Pickup:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{ride.pickup}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Drop:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{ride.drop}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Distance:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{ride.distanceKm} km</span>
              </div>
              {ride.driverName && (
                <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span>Driver:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{ride.driverName} ({ride.vehicleNumber})</span>
                </div>
              )}
            </div>

            {/* Payment Methods Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Select Payment Method
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setMethod('UPI')}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                    method === 'UPI'
                      ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <QrCode className="w-6 h-6" />
                  <span className="text-xs font-bold">UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('Card')}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                    method === 'Card'
                      ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <CreditCard className="w-6 h-6" />
                  <span className="text-xs font-bold">Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('Cash')}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                    method === 'Cash'
                      ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Banknote className="w-6 h-6" />
                  <span className="text-xs font-bold">Cash</span>
                </button>
              </div>
            </div>

            {/* Method Details */}
            {method === 'UPI' && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white dark:bg-slate-900 border rounded-xl shadow-sm text-center">
                    <div className="w-24 h-24 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-slate-900 p-2 font-mono text-[9px] text-center leading-tight">
                      [DEMO UPI QR CODE]
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Scan with any UPI App
                    </p>
                    <p className="text-[11px] text-slate-500">Google Pay, PhonePe, Paytm, BHIM</p>
                    <div className="pt-2">
                      <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded">
                        Instant Verification
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Or Enter Virtual Payment Address (VPA / UPI ID)
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="username@bank"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            )}

            {method === 'Card' && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Card Number (Demo)
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Expiry (MM/YY)
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      CVV
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {method === 'Cash' && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900/50 space-y-3">
                <div className="flex items-center gap-3">
                  <Banknote className="w-8 h-8 text-amber-600 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">Pay Cash to Driver</h4>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      Hand over exact cash of {formatCurrency(ride.fare)} to your driver {ride.driverName || ''} at destination.
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-amber-800 dark:text-amber-300 mb-1">
                    Amount Received Confirmation (₹)
                  </label>
                  <input
                    type="number"
                    value={cashGiven}
                    onChange={(e) => setCashGiven(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 rounded-xl text-sm font-bold outline-none"
                  />
                </div>
              </div>
            )}

            {/* Action button */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={handlePay}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing Secure Simulation...</span>
                </>
              ) : (
                <>
                  <span>Confirm & Pay {formatCurrency(ride.fare)}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        ) : (
          /* Payment Success View */
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5" /> Simulation Completed
              </span>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Payment Successful!</h3>
              <p className="text-xs text-slate-500">
                Transaction ID: <span className="font-mono font-semibold">{txnDetails?.transactionId}</span>
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-left text-xs space-y-2 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-bold text-slate-800 dark:text-white">{formatCurrency(ride.fare)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Method:</span>
                <span className="font-semibold text-slate-800 dark:text-white">{method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Time:</span>
                <span className="text-slate-700 dark:text-slate-300">{txnDetails?.date} {txnDetails?.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="text-emerald-600 font-bold">Settled</span>
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-2xl transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
