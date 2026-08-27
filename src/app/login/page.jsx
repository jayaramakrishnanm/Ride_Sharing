'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { authenticate, setCurrentUser, getUsers, getDrivers } from '@/lib/storage';
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
  const [email, setEmail] = useState('ravi@gmail.com');
  const [password, setPassword] = useState('password123');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setErrorMessage('');
    if (newRole === 'user') {
      setEmail('ravi@gmail.com');
      setPassword('password123');
    } else if (newRole === 'driver') {
      setEmail('arun@gmail.com');
      setPassword('password123');
    } else if (newRole === 'admin') {
      setEmail('admin@rideshare.com');
      setPassword('adminpassword');
    }
  };

  const handleLogin = (e) => {
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

    setTimeout(() => {
      const result = authenticate(email, password, role);

      if (result.success) {
        showToast(`Welcome back, ${result.user.name}!`, 'success');
        if (role === 'admin' || result.user.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (role === 'driver' || result.user.role === 'driver') {
          router.push('/driver/dashboard');
        } else {
          router.push('/user/dashboard');
        }
      } else {
        setErrorMessage(result.error || 'Invalid login credentials.');
        setIsLoading(false);
      }
    }, 400);
  };

  const handleQuickLogin = (demoRole) => {
    if (demoRole === 'user') {
      const u = getUsers().find((x) => x.id === 'U101') || getUsers()[0];
      setCurrentUser(u);
      showToast('Logged in as Passenger (Ravi Kumar)', 'success');
      router.push('/user/dashboard');
    } else if (demoRole === 'driver_car') {
      const d = getDrivers().find((x) => x.id === 'D101') || getDrivers()[0];
      setCurrentUser(d);
      showToast('Logged in as Car Driver (Arun Prakash)', 'success');
      router.push('/driver/dashboard');
    } else if (demoRole === 'driver_bike') {
      const d = getDrivers().find((x) => x.id === 'D102') || getDrivers()[1];
      setCurrentUser(d);
      showToast('Logged in as Bike Driver (Priya Sundaram)', 'success');
      router.push('/driver/dashboard');
    } else if (demoRole === 'admin') {
      const admin = getUsers().find((x) => x.role === 'admin') || {
        id: 'ADM001',
        name: 'System Administrator',
        email: 'admin@rideshare.com',
        role: 'admin',
        status: 'Active'
      };
      setCurrentUser(admin);
      showToast('Logged in as Administrator', 'success');
      router.push('/admin/dashboard');
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
            <p className="auth-subtitle">Choose your account role and enter credentials</p>
          </div>

          {/* Role Tabs */}
          <div className="role-tabs">
            <button
              type="button"
              className={`role-tab ${role === 'user' ? 'active' : ''}`}
              onClick={() => handleRoleChange('user')}
            >
              <User size={14} />
              <span>Passenger</span>
            </button>

            <button
              type="button"
              className={`role-tab ${role === 'driver' ? 'active' : ''}`}
              onClick={() => handleRoleChange('driver')}
            >
              <Car size={14} />
              <span>Driver</span>
            </button>

            <button
              type="button"
              className={`role-tab ${role === 'admin' ? 'active' : ''}`}
              onClick={() => handleRoleChange('admin')}
            >
              <ShieldCheck size={14} />
              <span>Admin</span>
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
                <label className="form-label">Email or Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@gmail.com"
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
                    placeholder="••••••••"
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
              >
                <div className="demo-btn-title">Ravi (Passenger)</div>
                <div className="demo-btn-email">ravi@gmail.com</div>
              </button>

              <button
                type="button"
                className="demo-quick-btn"
                onClick={() => handleQuickLogin('driver_car')}
              >
                <div className="demo-btn-title">Arun (Car Driver)</div>
                <div className="demo-btn-email">arun@gmail.com</div>
              </button>

              <button
                type="button"
                className="demo-quick-btn"
                onClick={() => handleQuickLogin('driver_bike')}
              >
                <div className="demo-btn-title">Priya (Bike Driver)</div>
                <div className="demo-btn-email">priya@gmail.com</div>
              </button>

              <button
                type="button"
                className="demo-quick-btn"
                onClick={() => handleQuickLogin('admin')}
              >
                <div className="demo-btn-title">Administrator</div>
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
