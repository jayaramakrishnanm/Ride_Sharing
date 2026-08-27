'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import BookingForm from '@/components/BookingForm';
import { createRide, getCurrentUser } from '@/lib/storage';
import { useToast } from '@/components/Toast';

export default function BookRidePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBookingSubmit = (bookingData) => {
    setIsSubmitting(true);
    const currentUser = getCurrentUser();

    setTimeout(() => {
      const newRide = createRide({
        ...bookingData,
        userId: currentUser?.id || 'U101',
        userName: currentUser?.name || 'Ravi Kumar',
        userPhone: currentUser?.phone || '9876543210',
        status: 'Pending',
        paymentStatus: 'Pending'
      });

      showToast(`Ride #${newRide.id} requested successfully! Searching nearby drivers...`, 'success');
      setIsSubmitting(false);
      router.push('/user/rides');
    }, 600);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Instant Ride Booking</h1>
        <p className="page-subtitle">
          Book Car or Bike rides with transparent distance-based pricing & verified drivers
        </p>
      </div>

      <BookingForm
        onSubmitBooking={handleBookingSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
