'use client';

import React, { useState, useEffect } from 'react';
import { getCurrentUser, updateUser } from '@/lib/storage';
import { User } from '@/lib/types';
import { useToast } from '@/components/Toast';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Star, 
  Car, 
  Save, 
  Calendar,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function UserProfilePage() {
  const { showToast } = useToast();
  const [currentUser, setCurrentUserState] = useState<User | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const user = getCurrentUser() as User;
    if (user) {
      setCurrentUserState(user);
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setEmergencyContact(user.emergencyContact || '');
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!name.trim()) {
      showToast('Name is required.', 'error');
      return;
    }
    if (phone.replace(/[^0-9]/g, '').length !== 10) {
      showToast('Phone number must be 10 digits.', 'error');
      return;
    }

    setSaving(true);
    setTimeout(() => {
      const updated = updateUser(currentUser.id, {
        name: name.trim(),
        phone: phone.trim(),
        emergencyContact: emergencyContact.trim()
      });

      setSaving(false);
      if (updated) {
        setCurrentUserState(updated);
        showToast('Profile updated successfully!', 'success');
      }
    }, 400);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
          <UserIcon className="w-3.5 h-3.5" /> Account Settings
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Passenger Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage your personal details, contact information, and emergency SOS contacts
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-8 items-start">
        {/* Left: Avatar & Summary Card */}
        <div className="md:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-4">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white font-black text-3xl flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
            {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
          </div>

          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              {currentUser?.name || 'Ravi Kumar'}
            </h3>
            <p className="text-xs text-slate-500">{currentUser?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 text-xs font-bold rounded-full">
              Verified Passenger
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-left text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Rating</span>
              <p className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                {currentUser?.rating || 4.9}
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Total Trips</span>
              <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                {currentUser?.totalRides || 12}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Edit Form */}
        <div className="md:col-span-8 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Email (Account Identifier)
                </label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm opacity-70 cursor-not-allowed font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Phone Number (10 Digits) *
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Emergency SOS Contact (10 Digits)
              </label>
              <input
                type="tel"
                maxLength={10}
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="e.g. 9876543299"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Your emergency contact will be notified during safety alerts or SOS triggers.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all text-xs disabled:opacity-50 mt-4"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
