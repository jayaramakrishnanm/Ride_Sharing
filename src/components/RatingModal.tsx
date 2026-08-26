'use client';

import React, { useState } from 'react';
import { Ride } from '@/lib/types';
import { rateRide } from '@/lib/storage';
import { useToast } from './Toast';
import { Star, X, Check, ThumbsUp } from 'lucide-react';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  ride: Ride;
  onSuccess?: () => void;
}

export default function RatingModal({ isOpen, onClose, ride, onSuccess }: RatingModalProps) {
  const { showToast } = useToast();
  const [stars, setStars] = useState(5);
  const [hoverStars, setHoverStars] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Clean & Sanitized', 'Polite Driver']);

  if (!isOpen) return null;

  const quickTags = [
    'Clean & Sanitized',
    'Polite Driver',
    'Smooth Driving',
    'Great Music',
    'Punctual Arrival',
    'Safe Speed',
    'Comfortable AC'
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalComment = [
      selectedTags.join(', '),
      feedback.trim()
    ].filter(Boolean).join(' - ');

    rateRide(ride.id, stars, finalComment || 'Great ride!');
    showToast(`Thank you! ${stars}-star rating submitted.`, 'success');
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ThumbsUp className="w-5 h-5" />
            <h3 className="font-bold text-lg">Rate Your Trip</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="text-center space-y-1">
            <h4 className="font-bold text-base text-slate-900 dark:text-white">
              How was your ride with {ride.driverName || 'your driver'}?
            </h4>
            <p className="text-xs text-slate-500">
              Trip #{ride.id} • {ride.vehicleModel || ride.vehicleType}
            </p>
          </div>

          {/* Star Rating selector */}
          <div className="flex justify-center gap-2 py-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                type="button"
                key={num}
                onMouseEnter={() => setHoverStars(num)}
                onMouseLeave={() => setHoverStars(0)}
                onClick={() => setStars(num)}
                className="p-1 text-slate-300 hover:scale-125 transition-transform"
              >
                <Star
                  className={`w-9 h-9 transition-colors ${
                    (hoverStars || stars) >= num
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-300 dark:text-slate-700'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Quick compliment tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
              What went well?
            </label>
            <div className="flex flex-wrap gap-2">
              {quickTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-semibold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comment input */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Additional Feedback (Optional)
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us about the driver, vehicle cleanliness, route taken..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-2xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" /> Submit Review
          </button>
        </form>
      </div>
    </div>
  );
}
