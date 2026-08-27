'use client';

import React from 'react';
import { CheckCircle2, Clock, Navigation, Compass, XCircle } from 'lucide-react';

export default function StatusBadge({ status }) {
  switch (status) {
    case 'Completed':
      return (
        <span className="badge badge-success">
          <CheckCircle2 size={12} /> Completed
        </span>
      );
    case 'Pending':
      return (
        <span className="badge badge-pending">
          <Clock size={12} /> Pending Driver
        </span>
      );
    case 'Accepted':
      return (
        <span className="badge badge-info">
          <CheckCircle2 size={12} /> Driver Accepted
        </span>
      );
    case 'Driver Arriving':
      return (
        <span className="badge badge-info">
          <Navigation size={12} /> Driver Arriving
        </span>
      );
    case 'Ride Started':
      return (
        <span className="badge badge-purple">
          <Compass size={12} /> On Trip
        </span>
      );
    case 'Cancelled':
      return (
        <span className="badge badge-danger">
          <XCircle size={12} /> Cancelled
        </span>
      );
    default:
      return <span className="badge badge-dark">{status}</span>;
  }
}
