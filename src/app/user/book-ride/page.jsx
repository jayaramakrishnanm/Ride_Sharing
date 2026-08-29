'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BookingForm from '@/components/BookingForm';
import { createRide, getCurrentUser } from '@/lib/storage';
import { useToast } from '@/components/Toast';

function BookRideContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPickup = searchParams?.get('pickup') || '';
  const initialDrop = searchParams?.get('drop') || '';
  const initialVehicleType = searchParams?.get('vehicleType') || 'Car';

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
        initialPickup={initialPickup}
        initialDrop={initialDrop}
        initialVehicleType={initialVehicleType}
      />
    </div>
  );
}

export default function BookRidePage() {
  return (
    <Suspense fallback={<div style={{ padding: '24px', textAlign: 'center' }}>Loading booking engine...</div>}>
      <BookRideContent />
    </Suspense>
  );
}
