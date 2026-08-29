'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { registerUser, registerDriver } from '@/lib/storage';
import { useToast } from '@/components/Toast';
import { 
  User, 
  Car, 
  Bike, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle 
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [role, setRole] = useState('user');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Driver specific fields
  const [vehicleType, setVehicleType] = useState('Car');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [drivingExperience, setDrivingExperience] = useState(3);

  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (val) => {
    return String(val)
      .toLowerCase()
      .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // 1. Validate required fields
    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !validateEmail(email.trim())) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setErrorMessage('Please provide a valid 10-digit phone number.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (role === 'driver') {
      if (!vehicleModel.trim() || !vehicleNumber.trim()) {
        setErrorMessage('Please provide vehicle model and registration number.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (role === 'driver') {
        const result = await registerDriver({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password,
          vehicleType,
          vehicleModel: vehicleModel.trim(),
          vehicleNumber: vehicleNumber.trim().toUpperCase(),
          vehicleColor: vehicleColor.trim() || 'Standard',
          licenseNumber: licenseNumber.trim().toUpperCase() || 'DL-PENDING',
          drivingExperience: Number(drivingExperience) || 1
        });

        if (!result.success) {
          setErrorMessage(result.error);
          showToast(result.error, 'error');
          setIsLoading(false);
          return;
        }

        showToast(`Driver account registered successfully (${result.user.id})! Saved to users.json`, 'success');
        router.push('/driver/dashboard');
      } else {
        const result = await registerUser({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password
        });

        if (!result.success) {
          setErrorMessage(result.error);
          showToast(result.error, 'error');
          setIsLoading(false);
          return;
        }

        showToast(`User registered successfully (${result.user.id})! Saved to users.json`, 'success');
        router.push('/user/dashboard');
      }
    } catch (err) {
      setErrorMessage('Registration failed. Please try again.');
      showToast('Registration failed.', 'error');
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar />

      <div className="auth-wrapper">
        <div className="auth-container-wide">
          <div className="auth-header">
            <div className="auth-icon-badge">
              {role === 'driver' ? <Car size={26} /> : <User size={26} />}
            </div>
            <h1 className="auth-title">Create an Account</h1>
            <p className="auth-subtitle">Permanent JSON Registration in users.json</p>
          </div>

          {/* Role selector tabs */}
          <div className="role-tabs role-tabs-two">
            <button
              type="button"
              className={`role-tab ${role === 'user' ? 'active' : ''}`}
              onClick={() => {
                setRole('user');
                setErrorMessage('');
              }}
            >
              <User size={16} />
              <span>Passenger / User (U###)</span>
            </button>

            <button
              type="button"
              className={`role-tab ${role === 'driver' ? 'active' : ''}`}
              onClick={() => {
                setRole('driver');
                setErrorMessage('');
              }}
            >
              <Car size={16} />
              <span>Driver Partner (D###)</span>
            </button>
          </div>

          <div className="auth-card">
            {errorMessage && (
              <div className="auth-alert-error" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleRegister}>
              <div className="auth-form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Anand Kumar"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    required
                  />
                </div>
              </div>

              <div className="auth-form-grid">
                <div className="form-group">
                  <label className="form-label">Phone Number (10 Digits) *</label>
                  <input
                    type="tel"
                    maxLength={10}
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Account Role</label>
                  <input
                    type="text"
                    className="form-input"
                    value={role === 'driver' ? 'Driver Partner (D###)' : 'Passenger User (U###)'}
                    disabled
                    style={{ backgroundColor: 'var(--bg-subtle)' }}
                  />
                </div>
              </div>

              {/* Driver Specific Fields */}
              {role === 'driver' && (
                <div className="driver-fields-panel">
                  <div className="driver-panel-title">
                    <ShieldCheck size={16} />
                    <span>Driver & Vehicle Information</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Vehicle Category *</label>
                    <div className="vehicle-type-group">
                      <button
                        type="button"
                        className={`vehicle-type-btn ${vehicleType === 'Car' ? 'active' : ''}`}
                        onClick={() => setVehicleType('Car')}
                      >
                        <Car size={16} />
                        <span>Car (Sedan / Hatchback)</span>
                      </button>

                      <button
                        type="button"
                        className={`vehicle-type-btn ${vehicleType === 'Bike' ? 'active' : ''}`}
                        onClick={() => setVehicleType('Bike')}
                      >
                        <Bike size={16} />
                        <span>Bike (Motorcycle / Scooter)</span>
                      </button>
                    </div>
                  </div>

                  <div className="auth-form-grid">
                    <div className="form-group">
                      <label className="form-label">Vehicle Make & Model *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={vehicleModel}
                        onChange={(e) => setVehicleModel(e.target.value)}
                        placeholder={vehicleType === 'Car' ? 'e.g. Hyundai i20' : 'e.g. TVS Raider 125'}
                        required={role === 'driver'}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Plate / Registration No *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value)}
                        placeholder="TN37AB1234"
                        style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}
                        required={role === 'driver'}
                      />
                    </div>
                  </div>

                  <div className="auth-form-grid">
                    <div className="form-group">
                      <label className="form-label">Driving License Number</label>
                      <input
                        type="text"
                        className="form-input"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        placeholder="TN38 20260012345"
                        style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Vehicle Color</label>
                      <input
                        type="text"
                        className="form-input"
                        value={vehicleColor}
                        onChange={(e) => setVehicleColor(e.target.value)}
                        placeholder="e.g. White / Black / Silver"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="auth-form-grid">
                <div className="form-group">
                  <label className="form-label">Create Password *</label>
                  <input
                    type="password"
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm Password *</label>
                  <input
                    type="password"
                    className="form-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block btn-lg"
                disabled={isLoading}
              >
                <span>{isLoading ? 'Registering Account...' : 'Complete Registration'}</span>
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="auth-footer">
              Already have an account?{' '}
              <Link href="/login" className="auth-footer-link">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
