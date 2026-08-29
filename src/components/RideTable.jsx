'use client';

import React from 'react';
import { formatCurrency } from '@/lib/fareCalculator';
import StatusBadge from './StatusBadge';
import { Car, Bike, Eye, FileText, Star, XCircle } from 'lucide-react';

export default function RideTable({ 
  rides = [], 
  role = 'user',
  onViewInvoice, 
  onRateDriver, 
  onCancelRide,
  onViewDetails 
}) {
  if (rides.length === 0) {
    return (
      <div className="table-container" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p style={{ fontSize: '0.875rem' }}>No ride records found matching the criteria.</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Ride ID</th>
            {role !== 'user' && <th>Passenger</th>}
            {role !== 'driver' && <th>Driver</th>}
            <th>Pickup & Drop</th>
            <th>Vehicle</th>
            <th>Date & Time</th>
            <th>Fare</th>
            <th>Status</th>
            <th>Rating</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rides.map((ride) => (
            <tr key={ride.id}>
              <td style={{ fontFamily: 'monospace', fontWeight: 800 }}>
                {ride.id}
              </td>
              {role !== 'user' && (
                <td>
                  <div style={{ fontWeight: 700 }}>{ride.userName}</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{ride.userPhone}</div>
                </td>
              )}
              {role !== 'driver' && (
                <td>
                  {ride.driverName ? (
                    <div>
                      <div style={{ fontWeight: 700 }}>{ride.driverName}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        {ride.vehicleNumber}
                      </div>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>Unassigned</span>
                  )}
                </td>
              )}
              <td>
                <div style={{ fontWeight: 600 }}>{ride.pickup}</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>➔ {ride.drop}</div>
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                  {ride.vehicleType === 'Car' ? <Car size={14} style={{ color: 'var(--sky)' }} /> : <Bike size={14} style={{ color: 'var(--primary)' }} />}
                  <span>{ride.vehicleType}</span>
                </div>
              </td>
              <td>
                <div>{ride.date}</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{ride.time}</div>
              </td>
              <td style={{ fontWeight: 900 }}>
                {formatCurrency(ride.fare)}
              </td>
              <td>
                <StatusBadge status={ride.status} />
              </td>
              <td>
                {ride.rating ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--amber)', fontWeight: 800, fontSize: '0.8125rem' }}>
                    <Star size={13} fill="var(--amber)" />
                    <span>{ride.rating}.0</span>
                  </div>
                ) : ride.status === 'Completed' ? (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Unrated</span>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>-</span>
                )}
              </td>
              <td>
                <div className="action-buttons-cell">
                  {onViewDetails && (
                    <button
                      className="btn-table-action"
                      onClick={() => onViewDetails(ride)}
                      title="View Details"
                    >
                      <Eye size={14} />
                    </button>
                  )}

                  {onViewInvoice && ride.status === 'Completed' && (
                    <button
                      className="btn-table-action"
                      onClick={() => onViewInvoice(ride)}
                      title="Print Invoice Receipt"
                      style={{ color: 'var(--primary)' }}
                    >
                      <FileText size={14} />
                    </button>
                  )}

                  {onRateDriver && ride.status === 'Completed' && (
                    <button
                      className="btn-table-action"
                      onClick={() => onRateDriver(ride)}
                      title={ride.rating ? 'Edit Driver Rating' : 'Rate Driver'}
                      style={{ color: 'var(--amber)' }}
                    >
                      <Star size={14} fill={ride.rating ? 'var(--amber)' : 'none'} />
                    </button>
                  )}

                  {onCancelRide && ride.status === 'Pending' && (
                    <button
                      className="btn-table-action"
                      onClick={() => onCancelRide(ride.id)}
                      title="Cancel Ride"
                      style={{ color: 'var(--rose)' }}
                    >
                      <XCircle size={14} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
