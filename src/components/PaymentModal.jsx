'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { processPaymentSimulation } from '@/lib/storage';
import { formatCurrency } from '@/lib/fareCalculator';
import { useToast } from './Toast';
import Modal from './Modal';
import { QrCode, CreditCard, Banknote, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export default function PaymentModal({ isOpen, onClose, ride, onPaymentSuccess }) {
  const { showToast } = useToast();
  const [method, setMethod] = useState('UPI');
  const [isProcessing, setIsProcessing] = useState(false);

  // Form states
  const [upiId, setUpiId] = useState('passenger@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 8912 3456 7890');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('888');

  if (!ride) return null;

  const handlePay = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const result = processPaymentSimulation(ride.id, method);

      if (result.success) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {
          // ignore if canvas-confetti is not loaded
        }

        showToast(`Payment of ${formatCurrency(ride.fare)} via ${method} successful!`, 'success');
        setIsProcessing(false);
        if (onPaymentSuccess) onPaymentSuccess(result.payment);
        onClose();
      }
    }, 1200);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Simulated Payment Gateway">
      <div>
        {/* Fare Summary Box */}
        <div style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '18px', textAlign: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Trip Fare Balance
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)', margin: '4px 0' }}>
            {formatCurrency(ride.fare)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Ride #{ride.id} • {ride.pickup} ➔ {ride.drop}
          </div>
        </div>

        {/* Method Selector Tabs */}
        <div className="payment-methods-grid">
          <button
            type="button"
            className={`payment-method-card ${method === 'UPI' ? 'active' : ''}`}
            onClick={() => setMethod('UPI')}
          >
            <QrCode size={22} style={{ color: method === 'UPI' ? 'var(--primary)' : 'var(--text-muted)' }} />
            <span>UPI Instant</span>
          </button>

          <button
            type="button"
            className={`payment-method-card ${method === 'Card' ? 'active' : ''}`}
            onClick={() => setMethod('Card')}
          >
            <CreditCard size={22} style={{ color: method === 'Card' ? 'var(--primary)' : 'var(--text-muted)' }} />
            <span>Card Payment</span>
          </button>

          <button
            type="button"
            className={`payment-method-card ${method === 'Cash' ? 'active' : ''}`}
            onClick={() => setMethod('Cash')}
          >
            <Banknote size={22} style={{ color: method === 'Cash' ? 'var(--primary)' : 'var(--text-muted)' }} />
            <span>Cash on Hand</span>
          </button>
        </div>

        {/* Dynamic Payment Body */}
        {method === 'UPI' && (
          <div style={{ marginBottom: '20px' }}>
            <div className="upi-qr-box">
              <div className="demo-qr-graphic">
                [ UPI QR ]<br />SCAN TO PAY
              </div>
              <div style={{ flex: 1, fontSize: '0.75rem' }}>
                <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>Scan with any UPI App</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.6875rem' }}>Google Pay, PhonePe, Paytm, BHIM</div>
                <div style={{ marginTop: '8px', color: 'var(--primary)', fontWeight: 700 }}>
                  rideshare.system@bankupi
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Or enter Virtual Payment Address (VPA)</label>
              <input
                type="text"
                className="form-input"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="username@bank"
              />
            </div>
          </div>
        )}

        {method === 'Card' && (
          <div style={{ marginBottom: '20px' }}>
            <div className="form-group">
              <label className="form-label">Card Number</label>
              <input
                type="text"
                className="form-input"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                style={{ fontFamily: 'monospace' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="form-label">Expiry (MM/YY)</label>
                <input
                  type="text"
                  className="form-input"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  style={{ fontFamily: 'monospace' }}
                />
              </div>

              <div>
                <label className="form-label">CVV</label>
                <input
                  type="password"
                  maxLength={3}
                  className="form-input"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value)}
                  style={{ fontFamily: 'monospace' }}
                />
              </div>
            </div>
          </div>
        )}

        {method === 'Cash' && (
          <div style={{ backgroundColor: 'var(--amber-light)', border: '1px solid #fde68a', borderRadius: '12px', padding: '16px', fontSize: '0.8125rem', color: 'var(--amber-text)', marginBottom: '20px' }}>
            <div style={{ fontWeight: 800, marginBottom: '4px' }}>Cash on Delivery</div>
            <p>Please pay exact amount of <strong>{formatCurrency(ride.fare)}</strong> in cash to driver <strong>{ride.driverName || 'Partner'}</strong> upon completion.</p>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          <ShieldCheck size={14} style={{ color: 'var(--primary)' }} />
          <span>Simulated Academic Payment Gateway • No actual funds charged</span>
        </div>

        {/* CTA Button */}
        <button
          className="btn btn-primary btn-block btn-lg"
          onClick={handlePay}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <span>Processing Payment...</span>
          ) : (
            <>
              <span>Authorize & Pay {formatCurrency(ride.fare)}</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </Modal>
  );
}
