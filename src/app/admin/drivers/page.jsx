'use client';

import React, { useState, useEffect } from 'react';
import { getDrivers, saveDriver, updateDriver, deleteDriver } from '@/lib/storage';
import { formatCurrency } from '@/lib/fareCalculator';
import { useToast } from '@/components/Toast';
import Modal from '@/components/Modal';
import { 
  ShieldCheck, 
  Car, 
  Bike, 
  Search, 
  Plus, 
  Eye, 
  Edit2, 
  Trash2, 
  Star, 
  Power 
} from 'lucide-react';

export default function AdminDriversPage() {
  const { showToast } = useToast();
  const [drivers, setDrivers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [viewingDriver, setViewingDriver] = useState(null);
  const [editingDriver, setEditingDriver] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formVehicleType, setFormVehicleType] = useState('Car');
  const [formVehicleModel, setFormVehicleModel] = useState('');
  const [formVehicleNumber, setFormVehicleNumber] = useState('');
  const [formLicenseNumber, setFormLicenseNumber] = useState('');
  const [formStatus, setFormStatus] = useState('Active');

  const loadData = () => {
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

  const handleToggleActive = (id, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    updateDriver(id, { status: nextStatus });
    showToast(`Driver account marked as ${nextStatus}.`, 'info');
    loadData();
  };

  const handleOpenEdit = (d) => {
    setEditingDriver(d);
    setFormName(d.name);
    setFormEmail(d.email);
    setFormPhone(d.phone);
    setFormVehicleType(d.vehicleType);
    setFormVehicleModel(d.vehicleModel);
    setFormVehicleNumber(d.vehicleNumber);
    setFormLicenseNumber(d.licenseNumber);
    setFormStatus(d.status);
  };

  const handleOpenAdd = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormVehicleType('Car');
    setFormVehicleModel('');
    setFormVehicleNumber('');
    setFormLicenseNumber('');
    setFormStatus('Active');
    setIsAddOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingDriver) return;

    const updated = updateDriver(editingDriver.id, {
      name: formName.trim(),
      phone: formPhone.trim(),
      vehicleType: formVehicleType,
      vehicleModel: formVehicleModel.trim(),
      vehicleNumber: formVehicleNumber.trim().toUpperCase(),
      licenseNumber: formLicenseNumber.trim().toUpperCase(),
      status: formStatus
    });

    if (updated) {
      showToast(`Driver ${updated.name} updated!`, 'success');
      setEditingDriver(null);
      loadData();
    }
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formPhone.trim() || !formVehicleNumber.trim()) {
      showToast('Please fill all required fields.', 'error');
      return;
    }

    saveDriver({
      name: formName.trim(),
      email: formEmail.trim().toLowerCase(),
      phone: formPhone.trim(),
      role: 'driver',
      vehicleType: formVehicleType,
      vehicleModel: formVehicleModel.trim() || `${formVehicleType} Standard`,
      vehicleNumber: formVehicleNumber.trim().toUpperCase(),
      licenseNumber: formLicenseNumber.trim().toUpperCase() || 'DL-PENDING',
      available: true,
      rating: 5.0,
      totalRides: 0,
      completedToday: 0,
      earningsToday: 0,
      totalEarnings: 0,
      status: formStatus
    });

    showToast('New driver registered successfully!', 'success');
    setIsAddOpen(false);
    loadData();
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to permanently remove driver ${name}?`)) {
      const ok = deleteDriver(id);
      if (ok) {
        showToast(`Driver ${name} removed.`, 'info');
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
        d.id.toLowerCase().includes(q) ||
        d.name.toLowerCase().includes(q) ||
        d.phone.includes(q) ||
        d.vehicleNumber.toLowerCase().includes(q)
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
          <p className="page-subtitle">Inspect, edit, register, and monitor car and bike fleet drivers</p>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} />
          <span>Add New Driver</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="search-box-wrap">
          <Search size={16} className="search-box-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by ID, name, plate, or phone..."
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
            <option value="All">All Vehicles</option>
            <option value="Car">Car</option>
            <option value="Bike">Bike</option>
          </select>

          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Deactivated</option>
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
              <th>Vehicle Specs</th>
              <th>Plate & License</th>
              <th>Online Status</th>
              <th>Rating & Earnings</th>
              <th>Account Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No driver accounts match the current filter.
                </td>
              </tr>
            ) : (
              filteredDrivers.map((d) => (
                <tr key={d.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 800 }}>
                    {d.id}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{d.name}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{d.phone}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                      {d.vehicleType === 'Car' ? <Car size={14} style={{ color: 'var(--sky)' }} /> : <Bike size={14} style={{ color: 'var(--primary)' }} />}
                      <span>{d.vehicleType}</span>
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{d.vehicleModel}</div>
                  </td>
                  <td style={{ fontFamily: 'monospace' }}>
                    <div style={{ fontWeight: 800 }}>{d.vehicleNumber}</div>
                    <div style={{ fontSize: '0.625rem', color: 'var(--text-light)' }}>{d.licenseNumber}</div>
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
                      title="Click to toggle status"
                    >
                      {d.status}
                    </button>
                  </td>
                  <td>
                    <div className="action-buttons-cell">
                      <button
                        className="btn-table-action"
                        onClick={() => setViewingDriver(d)}
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        className="btn-table-action"
                        onClick={() => handleOpenEdit(d)}
                        title="Edit Driver"
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      <Modal isOpen={!!viewingDriver} onClose={() => setViewingDriver(null)} title="Driver Profile">
        {viewingDriver && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--sky-light)', color: 'var(--sky)', fontSize: '1.5rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              {viewingDriver.name.charAt(0)}
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>{viewingDriver.name}</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{viewingDriver.email}</p>

            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', margin: '20px 0', textAlign: 'left', fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Driver ID:</span>
                <strong style={{ fontFamily: 'monospace' }}>{viewingDriver.id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Phone:</span>
                <strong>{viewingDriver.phone}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Vehicle:</span>
                <strong>{viewingDriver.vehicleType} • {viewingDriver.vehicleModel}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Plate Number:</span>
                <strong style={{ fontFamily: 'monospace' }}>{viewingDriver.vehicleNumber}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Lifetime Earnings:</span>
                <strong style={{ color: 'var(--primary)' }}>{formatCurrency(viewingDriver.totalEarnings || 0)}</strong>
              </div>
            </div>

            <button className="btn btn-secondary btn-block" onClick={() => setViewingDriver(null)}>
              Close
            </button>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editingDriver} onClose={() => setEditingDriver(null)} title={`Edit Driver (${editingDriver?.id})`}>
        {editingDriver && (
          <form onSubmit={handleSaveEdit}>
            <div className="form-group">
              <label className="form-label">Driver Name</label>
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
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  maxLength={10}
                  className="form-input"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  required
                />
              </div>

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
            </div>

            <div className="auth-form-grid">
              <div className="form-group">
                <label className="form-label">Vehicle Model</label>
                <input
                  type="text"
                  className="form-input"
                  value={formVehicleModel}
                  onChange={(e) => setFormVehicleModel(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Plate Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={formVehicleNumber}
                  onChange={(e) => setFormVehicleNumber(e.target.value)}
                  style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}
                  required
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
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
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
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register New Driver Partner">
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
              <label className="form-label">Email *</label>
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
              <label className="form-label">Phone *</label>
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
              <label className="form-label">Vehicle Model</label>
              <input
                type="text"
                className="form-input"
                value={formVehicleModel}
                onChange={(e) => setFormVehicleModel(e.target.value)}
                placeholder="e.g. Maruti WagonR"
              />
            </div>
          </div>

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

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Driver
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
