'use client';

import React, { useState, useEffect } from 'react';
import { getCurrentUser, updateDriver } from '@/lib/storage';
import { formatCurrency } from '@/lib/fareCalculator';
import { useToast } from '@/components/Toast';
import { Car, Bike, Phone, Star, ShieldCheck, DollarSign, Save } from 'lucide-react';

export default function DriverProfilePage() {
  const { showToast } = useToast();
  const [driver, setDriver] = useState(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const current = getCurrentUser();
    if (current && current.role === 'driver') {
      setDriver(current);
      setName(current.name || '');
      setPhone(current.phone || '');
      setVehicleModel(current.vehicleModel || '');
      setVehicleNumber(current.vehicleNumber || '');
      setLicenseNumber(current.licenseNumber || '');
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    if (!driver) return;

    if (!name.trim() || !phone.trim() || !vehicleNumber.trim()) {
      showToast('Please fill all required fields.', 'error');
      return;
    }

    const updated = updateDriver(driver.id, {
      name: name.trim(),
      phone: phone.trim(),
      vehicleModel: vehicleModel.trim(),
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      licenseNumber: licenseNumber.trim().toUpperCase()
    });

    if (updated) {
      setDriver(updated);
      showToast('Driver profile updated successfully!', 'success');
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  if (!driver) return null;

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">Driver Partner Profile</h1>
        <p className="page-subtitle">Manage your personal credentials, registered vehicle specs, and driving license</p>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '24px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #0284c7, #0f172a)', color: '#ffffff', fontSize: '1.75rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {driver.vehicleType === 'Car' ? <Car size={32} /> : <Bike size={32} />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900 }}>{driver.name}</h2>
              <span className="badge badge-info">{driver.vehicleType} Driver</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>ID: <strong style={{ fontFamily: 'monospace' }}>{driver.id}</strong></span>
              <span>•</span>
              <span style={{ color: 'var(--amber)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                <Star size={12} fill="var(--amber)" /> {driver.rating || 4.9}
              </span>
              <span>•</span>
              <span>Total Earnings: <strong>{formatCurrency(driver.totalEarnings || 0)}</strong></span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="auth-form-grid">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
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
                value={driver.email}
                disabled
                style={{ backgroundColor: 'var(--bg-subtle)' }}
              />
            </div>
          </div>

          <div className="auth-form-grid">
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
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
              <label className="form-label">Vehicle Type</label>
              <input
                type="text"
                className="form-input"
                value={`${driver.vehicleType} Partner`}
                disabled
                style={{ backgroundColor: 'var(--bg-subtle)' }}
              />
            </div>
          </div>

          <div className="auth-form-grid">
            <div className="form-group">
              <label className="form-label">Vehicle Model *</label>
              <input
                type="text"
                className="form-input"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                placeholder="e.g. Maruti Swift"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Plate / Registration No *</label>
              <input
                type="text"
                className="form-input"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Driving License Number</label>
            <input
              type="text"
              className="form-input"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              <span>{isSaved ? 'Changes Saved!' : 'Save Driver Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
