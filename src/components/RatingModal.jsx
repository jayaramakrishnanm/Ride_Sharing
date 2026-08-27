'use client';

import React, { useState } from 'react';
import { rateRide } from '@/lib/storage';
import { useToast } from './Toast';
import Modal from './Modal';
import { Star, MessageSquare, CheckCircle2 } from 'lucide-react';

export default function RatingModal({ isOpen, onClose, ride, onRatingSuccess }) {
  const { showToast } = useToast();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('Smooth driving and very punctual!');

  if (!ride) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const ok = rateRide(ride.id, rating, feedback.trim());
    if (ok) {
      showToast(`Thank you! ${rating}-star rating submitted.`, 'success');
      if (onRatingSuccess) onRatingSuccess(rating, feedback);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rate Your Trip Experience">
      <form onSubmit={handleSubmit} style={{ textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--amber-light)', color: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
          <Star size={28} fill="var(--amber)" />
        </div>

        <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)' }}>
          How was your ride with {ride.driverName || 'Driver'}?
        </h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Ride #{ride.id} • {ride.pickup} ➔ {ride.drop}
        </p>

        {/* 5-Star Picker */}
        <div className="star-picker-row">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="star-btn"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
            >
              <Star
                size={32}
                fill={(hoverRating || rating) >= star ? 'var(--amber)' : 'none'}
                stroke={(hoverRating || rating) >= star ? 'var(--amber)' : '#cbd5e1'}
              />
            </button>
          ))}
        </div>

        <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--amber)', marginBottom: '16px' }}>
          {rating === 5 && 'Outstanding & Safe (5 Stars)'}
          {rating === 4 && 'Great Experience (4 Stars)'}
          {rating === 3 && 'Average (3 Stars)'}
          {rating === 2 && 'Needs Improvement (2 Stars)'}
          {rating === 1 && 'Unsatisfactory (1 Star)'}
        </div>

        {/* Compliment Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', marginBottom: '16px' }}>
          {['Clean Vehicle', 'Polite Driver', 'Fast Route', 'Safe Driving', 'AC Working'].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setFeedback(tag)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.6875rem', borderRadius: '20px' }}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Comments textarea */}
        <div className="form-group" style={{ textAlign: 'left' }}>
          <label className="form-label">Feedback / Driver Comments</label>
          <textarea
            className="form-textarea"
            rows={3}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Tell us what you liked about this trip..."
          />
        </div>

        <button type="submit" className="btn btn-primary btn-block">
          Submit Rating & Review
        </button>
      </form>
    </Modal>
  );
}
