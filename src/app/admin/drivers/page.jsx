'use client';

import React, { useState, useEffect } from 'react';
import { getDrivers, registerDriver, updateDriver, deleteDriver } from '@/lib/storage';
import { formatCurrency } from '@/lib/fareCalculator';
import { formatLastLogin, formatJoinedDate } from '@/lib/dateUtils';
import { useToast } from '@/components/Toast';
import Modal from '@/components/Modal';
import { 
  ShieldCheck, 
  Car, 
  Bike, 
  Search, 
  Plus, 
  Eye, 
  EyeOff,
  Edit2, 
  Trash2, 
  Star, 
  Power,
  Calendar,
  LogIn,
  Key,
  Copy,
  Check,
  MapPin,
  Clock,
  Phone,
  Mail,
  Award,
  DollarSign
} from 'lucide-react';

export default function AdminDriversPage() {
  const { showToast } = useToast();
  const [drivers, setDrivers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Password visibility controls
  const [showAllPasswords, setShowAllPasswords] = useState(false);
  const [visiblePasswordMap, setVisiblePasswordMap] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  // Modals
  const [viewingDriver, setViewingDriver] = useState(null);
  const [editingDriver, setEditingDriver] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('password123');
  const [formVehicleType, setFormVehicleType] = useState('Car');
  const [formVehicleModel, setFormVehicleModel] = useState('');
  const [formVehicleColor, setFormVehicleColor] = useState('Standard');
  const [formVehicleNumber, setFormVehicleNumber] = useState('');
  const [formLicenseNumber, setFormLicenseNumber] = useState('');
  const [formDrivingExperience, setFormDrivingExperience] = useState(2);
  const [formCurrentLocation, setFormCurrentLocation] = useState('Chennai Central');
  const [formEmergencyContact, setFormEmergencyContact] = useState('');
  const [formStatus, setFormStatus] = useState('Active');
  const [showFormPassword, setShowFormPassword] = useState(false);

  // Modal-specific password visibility
  const [isViewingPasswordVisible, setIsViewingPasswordVisible] = useState(true);

  const loadData = async () => {
    try {
      const res = await fetch('/api/users?role=driver');
      const data = await res.json();
      if (data.success && data.users) {
        setDrivers(data.users);
        return;
      }
    } catch (e) {}
    setDrivers(getDrivers());
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('rss_storage_update', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('rss_storage_update', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const togglePasswordVisibility = (driverId) => {
    setVisiblePasswordMap((prev) => ({
      ...prev,
      [driverId]: !prev[driverId]
    }));
  };

  const handleCopyPassword = (password, id) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(password);
      setCopiedId(id);
      showToast('Password copied to clipboard!', 'success');
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    setDrivers((prev) => prev.map((d) => (d.id === id ? { ...d, status: nextStatus } : d)));
    await updateDriver(id, { status: nextStatus });
    showToast(`Driver account marked as ${nextStatus}.`, 'info');
    loadData();
  };

  const handleOpenEdit = (d) => {
    setEditingDriver(d);
    setFormName(d.name || '');
    setFormEmail(d.email || '');
    setFormPhone(d.phone || '');
    setFormPassword(d.password || 'password123');
    setFormVehicleType(d.vehicleType || 'Car');
    setFormVehicleModel(d.vehicleModel || '');
    setFormVehicleColor(d.vehicleColor || 'Standard');
    setFormVehicleNumber(d.vehicleNumber || '');
    setFormLicenseNumber(d.licenseNumber || '');
    setFormDrivingExperience(d.drivingExperience || 1);
    setFormCurrentLocation(d.currentLocation || 'Chennai Central');
    setFormEmergencyContact(d.emergencyContact || '');
    setFormStatus(d.status || 'Active');
    setShowFormPassword(false);
  };

  const handleOpenAdd = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormPassword('password123');
    setFormVehicleType('Car');
    setFormVehicleModel('');
    setFormVehicleColor('Standard');
    setFormVehicleNumber('');
    setFormLicenseNumber('');
    setFormDrivingExperience(2);
    setFormCurrentLocation('Chennai Central');
    setFormEmergencyContact('');
    setFormStatus('Active');
    setShowFormPassword(false);
    setIsAddOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingDriver) return;
    if (!formName.trim() || !formPhone.trim() || !formVehicleNumber.trim()) {
      showToast('Name, Phone and Plate Number are required.', 'error');
      return;
    }
    if (formPassword && formPassword.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }

    const updated = await updateDriver(editingDriver.id, {
      name: formName.trim(),
      email: formEmail.trim().toLowerCase(),
      phone: formPhone.trim(),
      password: formPassword,
      vehicleType: formVehicleType,
      vehicleModel: formVehicleModel.trim(),
      vehicleColor: formVehicleColor.trim() || 'Standard',
      vehicleNumber: formVehicleNumber.trim().toUpperCase(),
      licenseNumber: formLicenseNumber.trim().toUpperCase(),
      drivingExperience: Number(formDrivingExperience) || 1,
      currentLocation: formCurrentLocation.trim() || 'Chennai Central',
      emergencyContact: formEmergencyContact.trim(),
      status: formStatus
    });

    if (updated) {
      setDrivers((prev) => prev.map((d) => (d.id === editingDriver.id ? { ...d, ...updated } : d)));
      showToast(`Driver ${updated.name} updated successfully!`, 'success');
      setEditingDriver(null);
      loadData();
    } else {
      showToast('Failed to update driver.', 'error');
    }
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formPhone.trim() || !formVehicleNumber.trim()) {
      showToast('Please fill all required fields.', 'error');
      return;
    }
    if (!formPassword || formPassword.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }

    const result = await registerDriver({
      name: formName.trim(),
      email: formEmail.trim().toLowerCase(),
      phone: formPhone.trim(),
      password: formPassword,
      role: 'driver',
      vehicleType: formVehicleType,
      vehicleModel: formVehicleModel.trim() || `${formVehicleType} Standard`,
      vehicleColor: formVehicleColor.trim() || 'Standard',
      vehicleNumber: formVehicleNumber.trim().toUpperCase(),
      licenseNumber: formLicenseNumber.trim().toUpperCase() || 'DL-PENDING',
      drivingExperience: Number(formDrivingExperience) || 1,
      currentLocation: formCurrentLocation.trim() || 'Chennai Central',
      emergencyContact: formEmergencyContact.trim(),
      status: formStatus
    }, false);

    if (!result.success) {
      showToast(result.error, 'error');
      return;
    }

    if (result.user) {
      setDrivers((prev) => [result.user, ...prev]);
    }
    showToast(`New driver partner ${result.user.name || result.user.id} registered successfully!`, 'success');
    setIsAddOpen(false);
    loadData();
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove driver ${name}?`)) {
      setDrivers((prev) => prev.filter((d) => d.id !== id));
      const ok = await deleteDriver(id);
      if (ok) {
        showToast(`Driver ${name} removed successfully.`, 'info');
        loadData();
      } else {
        showToast('Failed to delete driver.', 'error');
        loadData();
      }
    }
  };

  const filteredDrivers = drivers.filter((d) => {
    if (vehicleFilter !== 'All' && d.vehicleType !== vehicleFilter) return false;
    if (statusFilter !== 'All' && d.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (d.id || '').toLowerCase().includes(q) ||
        (d.name || '').toLowerCase().includes(q) ||
        (d.email || '').toLowerCase().includes(q) ||
        (d.phone || '').includes(q) ||
        (d.password || '').toLowerCase().includes(q) ||
        (d.vehicleNumber || '').toLowerCase().includes(q) ||
        (d.licenseNumber || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">Driver Partner Management</h1>
          <p className="page-subtitle">Inspect, edit, register, and view complete driver profiles, fleet specs, and login activity</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => setShowAllPasswords(!showAllPasswords)}
            title="Toggle visibility of all passwords in table"
          >
            {showAllPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
            <span>{showAllPasswords ? 'Mask Passwords' : 'Show All Passwords'}</span>
          </button>

          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>Add New Driver</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="search-box-wrap">
          <Search size={16} className="search-box-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by ID, name, email, phone, plate, license, or password..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-selects-row">
          <select
            className="form-select"
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
          >
            <option value="All">All Vehicles ({drivers.length})</option>
            <option value="Car">Car ({drivers.filter(d => d.vehicleType === 'Car').length})</option>
            <option value="Bike">Bike ({drivers.filter(d => d.vehicleType === 'Bike').length})</option>
          </select>

          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses ({drivers.length})</option>
            <option value="Active">Active ({drivers.filter(d => d.status === 'Active').length})</option>
            <option value="Inactive">Deactivated ({drivers.filter(d => d.status === 'Inactive').length})</option>
          </select>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Driver ID</th>
              <th>Name & Phone</th>
              <th>Email</th>
              <th>Password</th>
              <th>Vehicle Specs</th>
              <th>Plate & License</th>
              <th>Joined Date</th>
              <th>Last Login</th>
              <th>Online</th>
              <th>Rating & Earnings</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.length === 0 ? (
              <tr>
                <td colSpan={12} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No driver accounts match the current filter.
                </td>
              </tr>
            ) : (
              filteredDrivers.map((d) => {
                const isPasswordVisible = showAllPasswords || !!visiblePasswordMap[d.id];
                const driverPassword = d.password || 'password123';

                return (
                  <tr key={d.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--sky-text)' }}>
                      {d.id}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{d.name}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{d.phone}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-main)' }}>{d.email}</div>
                    </td>
                    <td>
                      <div className="password-cell">
                        <Key size={12} style={{ color: 'var(--sky)' }} />
                        <span className="password-text">
                          {isPasswordVisible ? driverPassword : '••••••••'}
                        </span>
                        <button
                          type="button"
                          className="password-btn"
                          onClick={() => togglePasswordVisibility(d.id)}
                          title={isPasswordVisible ? 'Mask password' : 'Show password'}
                        >
                          {isPasswordVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                        <button
                          type="button"
                          className="password-btn"
                          onClick={() => handleCopyPassword(driverPassword, d.id)}
                          title="Copy password"
                        >
                          {copiedId === d.id ? <Check size={13} style={{ color: 'var(--primary)' }} /> : <Copy size={13} />}
                        </button>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                        {d.vehicleType === 'Car' ? <Car size={14} style={{ color: 'var(--sky)' }} /> : <Bike size={14} style={{ color: 'var(--primary)' }} />}
                        <span>{d.vehicleType}</span>
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        {d.vehicleModel} {d.vehicleColor && d.vehicleColor !== 'Standard' ? `(${d.vehicleColor})` : ''}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace' }}>
                      <div style={{ fontWeight: 800 }}>{d.vehicleNumber}</div>
                      <div style={{ fontSize: '0.625rem', color: 'var(--text-light)' }}>{d.licenseNumber}</div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {formatJoinedDate(d.joinedDate)}
                    </td>
                    <td>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        color: d.lastLogin ? 'var(--text-main)' : 'var(--text-light)',
                        fontWeight: d.lastLogin ? 600 : 400 
                      }}>
                        {formatLastLogin(d.lastLogin)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${d.available ? 'badge-success' : 'badge-dark'}`}>
                        {d.available ? '● Online' : '○ Offline'}
                      </span>
                    </td>
                    <td>
                      <div style={{ color: 'var(--amber)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <Star size={12} fill="var(--amber)" /> {d.rating || 4.9}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 700, marginTop: '2px' }}>
                        {formatCurrency(d.totalEarnings || 0)}
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleActive(d.id, d.status)}
                        className={`badge ${d.status === 'Active' ? 'badge-success' : 'badge-danger'}`}
                        style={{ cursor: 'pointer' }}
                        title="Click to toggle active status"
                      >
                        {d.status}
                      </button>
                    </td>
                    <td>
                      <div className="action-buttons-cell">
                        <button
                          className="btn-table-action"
                          onClick={() => {
                            setViewingDriver(d);
                            setIsViewingPasswordVisible(true);
                          }}
                          title="View Full Profile & Password"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="btn-table-action"
                          onClick={() => handleOpenEdit(d)}
                          title="Edit Driver & Password"
                          style={{ color: 'var(--sky)' }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn-table-action"
                          onClick={() => handleDelete(d.id, d.name)}
                          title="Delete Driver"
                          style={{ color: 'var(--rose)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* View Modal - Complete Driver Details */}
      <Modal isOpen={!!viewingDriver} onClose={() => setViewingDriver(null)} title="Driver Partner Profile & Security Details">
        {viewingDriver && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--sky-light)', 
                color: 'var(--sky)', 
                fontSize: '1.75rem', 
                fontWeight: 900, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 12px' 
              }}>
                {viewingDriver.name ? viewingDriver.name.charAt(0).toUpperCase() : 'D'}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>{viewingDriver.name}</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{viewingDriver.email}</p>
            </div>

            {/* Password Highlight Box */}
            <div className="password-box-highlight" style={{ backgroundColor: '#f0f9ff', borderColor: '#bae6fd' }}>
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--sky-text)', letterSpacing: '0.5px' }}>
                  Driver Account Password (Plaintext)
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '1.125rem', fontWeight: 800, color: 'var(--navy)', marginTop: '2px' }}>
                  {isViewingPasswordVisible ? (viewingDriver.password || 'password123') : '••••••••••••'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsViewingPasswordVisible(!isViewingPasswordVisible)}
                  title={isViewingPasswordVisible ? 'Hide password' : 'Show password'}
                >
                  {isViewingPasswordVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => handleCopyPassword(viewingDriver.password || 'password123', 'driver-view-modal')}
                  title="Copy password to clipboard"
                  style={{ backgroundColor: 'var(--sky)' }}
                >
                  {copiedId === 'driver-view-modal' ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedId === 'driver-view-modal' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Detailed Attributes Grid */}
            <div className="admin-details-grid">
              <div className="admin-detail-row">
                <span className="admin-detail-label">Driver ID:</span>
                <strong style={{ fontFamily: 'monospace', color: 'var(--sky-text)' }}>{viewingDriver.id}</strong>
              </div>
              <div className="admin-detail-row">
                <span className="admin-detail-label">Phone Number:</span>
                <strong style={{ fontFamily: 'monospace' }}>{viewingDriver.phone}</strong>
              </div>
              <div className="admin-detail-row">
                <span className="admin-detail-label">Email Address:</span>
                <strong>{viewingDriver.email}</strong>
              </div>
              <div className="admin-detail-row">
                <span className="admin-detail-label">Vehicle Type:</span>
                <strong>{viewingDriver.vehicleType}</strong>
              </div>
              <div className="admin-detail-row">
                <span className="admin-detail-label">Vehicle Model & Make:</span>
                <strong>{viewingDriver.vehicleModel}</strong>
              </div>
              <div className="admin-detail-row">
                <span className="admin-detail-label">Vehicle Body Color:</span>
                <strong>{viewingDriver.vehicleColor || 'Standard'}</strong>
              </div>
              <div className="admin-detail-row">
                <span className="admin-detail-label">Registration Plate Number:</span>
                <strong style={{ fontFamily: 'monospace' }}>{viewingDriver.vehicleNumber}</strong>
              </div>
              <div className="admin-detail-row">
                <span className="admin-detail-label">Driving License Number:</span>
                <strong style={{ fontFamily: 'monospace' }}>{viewingDriver.licenseNumber || 'DL-PENDING'}</strong>
              </div>
              <div className="admin-detail-row">
                <span className="admin-detail-label">Driving Experience:</span>
                <strong>{viewingDriver.drivingExperience || 1} Years</strong>
              </div>
              <div className="admin-detail-row">
                <span className="admin-detail-label">Current Dispatch Location:</span>
                <strong>{viewingDriver.currentLocation || 'Chennai Central'}</strong>
              </div>
              <div className="admin-detail-row">
                <span className="admin-detail-label">Online Dispatch Status:</span>
                <span className={`badge ${viewingDriver.available ? 'badge-success' : 'badge-dark'}`}>
                  {viewingDriver.available ? '● Online' : '○ Offline'}
                </span>
              </div>
              <div className="admin-detail-row">
                <span className="admin-detail-label">Registration Date:</span>
                <strong>{formatJoinedDate(viewingDriver.joinedDate)} ({viewingDriver.joinedDate || 'N/A'})</strong>
              </div>
              <div className="admin-detail-row">
                <span className="admin-detail-label">Last Login Timestamp:</span>
                <strong style={{ color: viewingDriver.lastLogin ? 'var(--primary)' : 'var(--text-muted)' }}>
                  {formatLastLogin(viewingDriver.lastLogin)}
                  {viewingDriver.lastLogin && ` (${viewingDriver.lastLogin})`}
                </strong>
              </div>
              <div className="admin-detail-row">
                <span className="admin-detail-label">Partner Rating:</span>
                <strong style={{ color: 'var(--amber)' }}>★ {viewingDriver.rating || 4.9} / 5.0</strong>
              </div>
              <div className="admin-detail-row">
                <span className="admin-detail-label">Rides Completed Today:</span>
                <strong>{viewingDriver.completedToday || 0} rides</strong>
              </div>
              <div className="admin-detail-row">
                <span className="admin-detail-label">Today's Earnings:</span>
                <strong style={{ color: 'var(--primary)' }}>{formatCurrency(viewingDriver.earningsToday || 0)}</strong>
              </div>
              <div className="admin-detail-row">
                <span className="admin-detail-label">Lifetime Total Earnings:</span>
                <strong style={{ color: 'var(--primary)', fontSize: '1rem' }}>{formatCurrency(viewingDriver.totalEarnings || 0)}</strong>
              </div>
              <div className="admin-detail-row">
                <span className="admin-detail-label">Total Completed Trips:</span>
                <strong>{viewingDriver.totalRides || 0} trips</strong>
              </div>
              <div className="admin-detail-row">
                <span className="admin-detail-label">Emergency Contact Phone:</span>
                <strong>{viewingDriver.emergencyContact || 'Not Set'}</strong>
              </div>
              <div className="admin-detail-row">
                <span className="admin-detail-label">Account Status:</span>
                <span className={`badge ${viewingDriver.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                  {viewingDriver.status}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                className="btn btn-secondary btn-block" 
                onClick={() => {
                  const d = viewingDriver;
                  setViewingDriver(null);
                  handleOpenEdit(d);
                }}
              >
                <Edit2 size={16} />
                <span>Edit Driver</span>
              </button>
              <button className="btn btn-primary btn-block" onClick={() => setViewingDriver(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editingDriver} onClose={() => setEditingDriver(null)} title={`Edit Driver Partner (${editingDriver?.id})`}>
        {editingDriver && (
          <form onSubmit={handleSaveEdit}>
            <div className="form-group">
              <label className="form-label">Driver Full Name *</label>
              <input
                type="text"
                className="form-input"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
              />
            </div>

            <div className="auth-form-grid">
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-input"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  maxLength={10}
                  className="form-input"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password input with toggle */}
            <div className="form-group">
              <label className="form-label">Driver Account Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showFormPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingRight: '42px', fontFamily: 'monospace' }}
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowFormPassword(!showFormPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                  title={showFormPassword ? 'Hide password' : 'Show password'}
                >
                  {showFormPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Administrator can view or update the driver password.
              </span>
            </div>

            <div className="auth-form-grid">
              <div className="form-group">
                <label className="form-label">Vehicle Type</label>
                <select
                  className="form-select"
                  value={formVehicleType}
                  onChange={(e) => setFormVehicleType(e.target.value)}
                >
                  <option value="Car">Car</option>
                  <option value="Bike">Bike</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Vehicle Model & Make</label>
                <input
                  type="text"
                  className="form-input"
                  value={formVehicleModel}
                  onChange={(e) => setFormVehicleModel(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-form-grid">
              <div className="form-group">
                <label className="form-label">Registration Plate Number *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formVehicleNumber}
                  onChange={(e) => setFormVehicleNumber(e.target.value)}
                  style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Vehicle Color</label>
                <input
                  type="text"
                  className="form-input"
                  value={formVehicleColor}
                  onChange={(e) => setFormVehicleColor(e.target.value)}
                  placeholder="e.g. White, Silver, Black"
                />
              </div>
            </div>

            <div className="auth-form-grid">
              <div className="form-group">
                <label className="form-label">Driving License Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={formLicenseNumber}
                  onChange={(e) => setFormLicenseNumber(e.target.value)}
                  style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Driving Experience (Years)</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  className="form-input"
                  value={formDrivingExperience}
                  onChange={(e) => setFormDrivingExperience(e.target.value)}
                />
              </div>
            </div>

            <div className="auth-form-grid">
              <div className="form-group">
                <label className="form-label">Current Location / Station</label>
                <input
                  type="text"
                  className="form-input"
                  value={formCurrentLocation}
                  onChange={(e) => setFormCurrentLocation(e.target.value)}
                  placeholder="e.g. Chennai Central"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Emergency Contact Phone</label>
                <input
                  type="tel"
                  maxLength={10}
                  className="form-input"
                  value={formEmergencyContact}
                  onChange={(e) => setFormEmergencyContact(e.target.value)}
                  placeholder="9876543299"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Account Status</label>
              <select
                className="form-select"
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value)}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Deactivated (Inactive)</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setEditingDriver(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Add Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register New Fleet Driver Partner">
        <form onSubmit={handleSaveAdd}>
          <div className="form-group">
            <label className="form-label">Driver Full Name *</label>
            <input
              type="text"
              className="form-input"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Mani Kandan"
              required
            />
          </div>

          <div className="auth-form-grid">
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="driver@gmail.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="tel"
                maxLength={10}
                className="form-input"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="9876543210"
                required
              />
            </div>
          </div>

          {/* Password with toggle */}
          <div className="form-group">
            <label className="form-label">Account Password *</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showFormPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingRight: '42px', fontFamily: 'monospace' }}
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                placeholder="password123"
                required
              />
              <button
                type="button"
                onClick={() => setShowFormPassword(!showFormPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
                title={showFormPassword ? 'Hide password' : 'Show password'}
              >
                {showFormPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              Default: password123. Minimum 6 characters.
            </span>
          </div>

          <div className="auth-form-grid">
            <div className="form-group">
              <label className="form-label">Vehicle Type *</label>
              <select
                className="form-select"
                value={formVehicleType}
                onChange={(e) => setFormVehicleType(e.target.value)}
              >
                <option value="Car">Car</option>
                <option value="Bike">Bike</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Vehicle Model & Make</label>
              <input
                type="text"
                className="form-input"
                value={formVehicleModel}
                onChange={(e) => setFormVehicleModel(e.target.value)}
                placeholder="e.g. Maruti Suzuki Dzire"
              />
            </div>
          </div>

          <div className="auth-form-grid">
            <div className="form-group">
              <label className="form-label">Registration Plate Number *</label>
              <input
                type="text"
                className="form-input"
                value={formVehicleNumber}
                onChange={(e) => setFormVehicleNumber(e.target.value)}
                placeholder="TN09AB1234"
                style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Vehicle Body Color</label>
              <input
                type="text"
                className="form-input"
                value={formVehicleColor}
                onChange={(e) => setFormVehicleColor(e.target.value)}
                placeholder="e.g. White, Silver, Black"
              />
            </div>
          </div>

          <div className="auth-form-grid">
            <div className="form-group">
              <label className="form-label">Driving License Number</label>
              <input
                type="text"
                className="form-input"
                value={formLicenseNumber}
                onChange={(e) => setFormLicenseNumber(e.target.value)}
                placeholder="DL-TN09-2022-0012345"
                style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Driving Experience (Years)</label>
              <input
                type="number"
                min="0"
                max="50"
                className="form-input"
                value={formDrivingExperience}
                onChange={(e) => setFormDrivingExperience(e.target.value)}
              />
            </div>
          </div>

          <div className="auth-form-grid">
            <div className="form-group">
              <label className="form-label">Current Location / Station</label>
              <input
                type="text"
                className="form-input"
                value={formCurrentLocation}
                onChange={(e) => setFormCurrentLocation(e.target.value)}
                placeholder="Chennai Central"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Emergency Contact Phone</label>
              <input
                type="tel"
                maxLength={10}
                className="form-input"
                value={formEmergencyContact}
                onChange={(e) => setFormEmergencyContact(e.target.value)}
                placeholder="9876543299"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Initial Account Status</label>
            <select
              className="form-select"
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value)}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Driver Partner
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
