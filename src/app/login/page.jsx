'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { authenticate } from '@/lib/storage';
import { useToast } from '@/components/Toast';
import { 
  User, 
  Car, 
  Bike, 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  AlertCircle 
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [role, setRole] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setErrorMessage('');
    setEmail('');
    setPassword('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your email or phone number.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await authenticate(email, password, role);

      if (result.success && result.user) {
        showToast(`Welcome back, ${result.user.name}!`, 'success');
        const userRole = (result.user.role || '').toLowerCase();

        switch (userRole) {
          case 'admin':
            router.push('/admin/dashboard');
            break;
          case 'driver':
            router.push('/driver/dashboard');
            break;
          case 'user':
          case 'passenger':
          default:
            router.push('/user/dashboard');
            break;
        }
      } else {
        setErrorMessage(result.error || 'Invalid login credentials.');
        showToast(result.error || 'Invalid credentials', 'error');
        setIsLoading(false);
      }
    } catch (err) {
      setErrorMessage('Login failed. Please check your network.');
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (demoRole) => {
    setIsLoading(true);
    setErrorMessage('');

    let targetEmail = 'ravi@gmail.com';
    let targetPassword = 'password123';
    let targetRole = 'user';

    if (demoRole === 'user') {
      targetEmail = 'ravi@gmail.com';
      targetPassword = 'password123';
      targetRole = 'user';
    } else if (demoRole === 'driver_car') {
      targetEmail = 'arun@gmail.com';
      targetPassword = 'password123';
      targetRole = 'driver';
    } else if (demoRole === 'driver_bike') {
      targetEmail = 'priya@gmail.com';
      targetPassword = 'password123';
      targetRole = 'driver';
    } else if (demoRole === 'admin') {
      targetEmail = 'admin@rideshare.com';
      targetPassword = 'adminpassword';
      targetRole = 'admin';
    }

    try {
      const result = await authenticate(targetEmail, targetPassword, targetRole);
      if (result.success && result.user) {
        showToast(`Logged in as ${result.user.name} (${result.user.role.toUpperCase()})`, 'success');
        if (targetRole === 'admin') router.push('/admin/dashboard');
        else if (targetRole === 'driver') router.push('/driver/dashboard');
        else router.push('/user/dashboard');
      } else {
        showToast(result.error || 'Quick login failed.', 'error');
        setIsLoading(false);
      }
    } catch (err) {
      showToast('Quick login network error.', 'error');
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar />

      <div className="auth-wrapper">
        <div className="auth-container">
          <div className="auth-header">
            <div className="auth-icon-badge">
              {role === 'admin' ? <ShieldCheck size={26} /> : role === 'driver' ? <Car size={26} /> : <User size={26} />}
            </div>
            <h1 className="auth-title">Sign In to RideShare</h1>
            <p className="auth-subtitle">Enter your credentials to access your account</p>
          </div>

          {/* Role Tabs */}
          <div className="role-tabs">
            <button
              type="button"
              className={`role-tab ${role === 'user' ? 'active' : ''}`}
              onClick={() => handleRoleChange('user')}
            >
              <User size={14} />
              <span>Passenger (USER)</span>
            </button>

            <button
              type="button"
              className={`role-tab ${role === 'driver' ? 'active' : ''}`}
              onClick={() => handleRoleChange('driver')}
            >
              <Car size={14} />
              <span>Driver (DRIVER)</span>
            </button>

            <button
              type="button"
              className={`role-tab ${role === 'admin' ? 'active' : ''}`}
              onClick={() => handleRoleChange('admin')}
            >
              <ShieldCheck size={14} />
              <span>Admin (ADMIN)</span>
            </button>
          </div>

          {/* Auth Card */}
          <div className="auth-card">
            {errorMessage && (
              <div className="auth-alert-error" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Email Address or Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. name@gmail.com or 9876543210"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block btn-lg"
                disabled={isLoading}
              >
                <span>{isLoading ? 'Signing In...' : `Sign In as ${role.toUpperCase()}`}</span>
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="auth-footer">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="auth-footer-link">
                Register here
              </Link>
            </div>
          </div>

          {/* 1-Click Quick Demo Login Switcher Panel */}
          <div className="demo-quick-panel">
            <div className="demo-panel-title">
              <Sparkles size={14} style={{ color: 'var(--primary)' }} />
              <span>Quick 1-Click Demo Login</span>
            </div>
            <div className="demo-quick-grid">
              <button
                type="button"
                className="demo-quick-btn"
                onClick={() => handleQuickLogin('user')}
                disabled={isLoading}
              >
                <div className="demo-btn-title">Ravi (User - U101)</div>
                <div className="demo-btn-email">ravi@gmail.com</div>
              </button>

              <button
                type="button"
                className="demo-quick-btn"
                onClick={() => handleQuickLogin('driver_car')}
                disabled={isLoading}
              >
                <div className="demo-btn-title">Arun (Driver - D101)</div>
                <div className="demo-btn-email">arun@gmail.com</div>
              </button>

              <button
                type="button"
                className="demo-quick-btn"
                onClick={() => handleQuickLogin('driver_bike')}
                disabled={isLoading}
              >
                <div className="demo-btn-title">Priya (Driver - D102)</div>
                <div className="demo-btn-email">priya@gmail.com</div>
              </button>

              <button
                type="button"
                className="demo-quick-btn"
                onClick={() => handleQuickLogin('admin')}
                disabled={isLoading}
              >
                <div className="demo-btn-title">Admin (ADM001)</div>
                <div className="demo-btn-email">admin@rideshare.com</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
