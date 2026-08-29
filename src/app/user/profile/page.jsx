'use client';

import React, { useState, useEffect } from 'react';
import { getCurrentUser, updateUser } from '@/lib/storage';
import { formatLastLogin, formatJoinedDate } from '@/lib/dateUtils';
import { useToast } from '@/components/Toast';
import { User, Phone, Mail, ShieldAlert, Star, CheckCircle2, Save, Calendar, LogIn } from 'lucide-react';

export default function UserProfilePage() {
  const { showToast } = useToast();
  const [currentUser, setCurrentUserState] = useState(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('9840123456 (Father)');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUserState(user);
      setName(user.name || '');
      setPhone(user.phone || '');
      setEmergencyContact(user.emergencyContact || '');
    }
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!name.trim() || !phone.trim()) {
      showToast('Name and Phone are required.', 'error');
      return;
    }

    const updated = await updateUser(currentUser.id, {
      name: name.trim(),
      phone: phone.trim(),
      emergencyContact: emergencyContact.trim()
    });

    if (updated) {
      setCurrentUserState(updated);
      showToast('Profile updated successfully!', 'success');
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } else {
      showToast('Failed to update profile.', 'error');
    }
  };

  if (!currentUser) return null;

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">Passenger Profile</h1>
        <p className="page-subtitle">Manage your personal information, contact details, and emergency SOS</p>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '24px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #06b6d4)', color: '#ffffff', fontSize: '1.75rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {currentUser.name ? currentUser.name.charAt(0) : 'U'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900 }}>{currentUser.name}</h2>
              <span className="badge badge-success">Verified Passenger</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>Account ID: <strong style={{ fontFamily: 'monospace' }}>{currentUser.id}</strong></span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={12} /> Joined Date: <strong>{formatJoinedDate(currentUser.joinedDate)}</strong>
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <LogIn size={12} /> Last Login: <strong>{formatLastLogin(currentUser.lastLogin)}</strong>
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="auth-form-grid">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Read Only)</label>
              <input
                type="email"
                className="form-input"
                value={currentUser.email}
                disabled
                style={{ backgroundColor: 'var(--bg-subtle)' }}
              />
            </div>
          </div>

          <div className="auth-form-grid">
            <div className="form-group">
              <label className="form-label">Phone Number (10 Digits)</label>
              <input
                type="tel"
                maxLength={10}
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Emergency SOS Contact</label>
              <input
                type="text"
                className="form-input"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              <span>{isSaved ? 'Changes Saved!' : 'Save Profile Updates'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
