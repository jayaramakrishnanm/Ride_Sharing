'use client';

import React from 'react';
import { Notification } from '@/lib/types';
import { markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from '@/lib/storage';
import { Bell, Check, Trash2, X, Car, Bike, CreditCard, ShieldAlert, Star } from 'lucide-react';
import Link from 'next/link';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  recipientId: string;
}

export default function NotificationModal({
  isOpen,
  onClose,
  notifications,
  recipientId
}: NotificationModalProps) {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAll = () => {
    markAllNotificationsAsRead(recipientId);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_request':
        return <Car className="w-5 h-5 text-emerald-500" />;
      case 'ride_status':
        return <Bike className="w-5 h-5 text-blue-500" />;
      case 'payment_success':
        return <CreditCard className="w-5 h-5 text-purple-500" />;
      case 'rating':
        return <Star className="w-5 h-5 text-amber-500 fill-amber-400" />;
      case 'safety_alert':
      case 'system_alert':
        return <ShieldAlert className="w-5 h-5 text-rose-500" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full sm:max-w-md h-full sm:h-auto sm:max-h-[85vh] bg-white dark:bg-slate-900 sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-lg">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
              <p className="text-xs text-slate-500">
                {unreadCount > 0 ? `${unreadCount} unread updates` : 'All caught up'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium px-2 py-1 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded flex items-center gap-1"
                title="Mark all as read"
              >
                <Check className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No notifications yet.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markNotificationAsRead(n.id)}
                className={`p-4 transition-colors flex items-start gap-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer ${
                  !n.read ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                }`}
              >
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h4 className={`text-sm font-medium ${!n.read ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-700 dark:text-slate-300'}`}>
                      {n.title}
                    </h4>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {n.message}
                  </p>
                  {n.rideId && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded">
                        Ride #{n.rideId}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(n.id);
                  }}
                  className="text-slate-300 hover:text-rose-500 p-1 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-center">
          <p className="text-xs text-slate-500">
            Real-time simulated local events
          </p>
        </div>
      </div>
    </div>
  );
}
