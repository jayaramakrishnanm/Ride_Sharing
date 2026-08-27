'use client';

import React from 'react';
import { 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification 
} from '@/lib/storage';
import { Bell, Check, Trash2, X, Car, Bike, CreditCard, ShieldAlert, Star } from 'lucide-react';

export default function NotificationPanel({ isOpen, onClose, notifications = [], recipientId }) {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type) => {
    switch (type) {
      case 'new_request':
        return <Car size={16} style={{ color: 'var(--primary)' }} />;
      case 'ride_status':
        return <Bike size={16} style={{ color: 'var(--sky)' }} />;
      case 'payment_success':
        return <CreditCard size={16} style={{ color: 'var(--purple)' }} />;
      case 'rating':
        return <Star size={16} style={{ color: 'var(--amber)' }} />;
      case 'safety_alert':
      case 'system_alert':
        return <ShieldAlert size={16} style={{ color: 'var(--rose)' }} />;
      default:
        return <Bell size={16} style={{ color: 'var(--text-muted)' }} />;
    }
  };

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ padding: '6px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '8px' }}>
              <Bell size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-main)' }}>Notifications</h3>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                {unreadCount > 0 ? `${unreadCount} unread updates` : 'All caught up'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllNotificationsAsRead(recipientId)}
                style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Check size={14} /> Mark all read
              </button>
            )}
            <button onClick={onClose} style={{ padding: '4px', color: 'var(--text-muted)' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {notifications.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-light)' }}>
              <Bell size={36} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
              <p style={{ fontSize: '0.8125rem' }}>No notifications yet.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markNotificationAsRead(n.id)}
                className={`notification-item ${!n.read ? 'unread' : ''}`}
              >
                <div style={{ padding: '8px', backgroundColor: '#f1f5f9', borderRadius: '10px', marginTop: '2px' }}>
                  {getIcon(n.type)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <h4 style={{ fontSize: '0.8125rem', fontWeight: !n.read ? 800 : 600, color: 'var(--text-main)' }}>
                      {n.title}
                    </h4>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-light)' }}>
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {n.message}
                  </p>
                  {n.rideId && (
                    <span style={{ display: 'inline-block', fontSize: '0.625rem', fontWeight: 800, padding: '2px 6px', backgroundColor: '#e2e8f0', borderRadius: '4px', marginTop: '6px' }}>
                      Ride #{n.rideId}
                    </span>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(n.id);
                  }}
                  style={{ color: '#cbd5e1', padding: '4px' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
