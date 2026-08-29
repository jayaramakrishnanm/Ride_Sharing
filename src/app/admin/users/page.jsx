'use client';

import React, { useState, useEffect } from 'react';
import { getUsers, registerUser, updateUser, deleteUser } from '@/lib/storage';
import { formatLastLogin, formatJoinedDate } from '@/lib/dateUtils';
import { useToast } from '@/components/Toast';
import Modal from '@/components/Modal';
import { 
  Users as UsersIcon, 
  Search, 
  Plus, 
  Eye, 
  EyeOff,
  Edit2, 
  Trash2, 
  Star, 
  CheckCircle2, 
  XCircle,
  Calendar,
  LogIn,
  Key,
  Copy,
  Check,
  ShieldCheck,
  Phone,
  Mail,
  User,
  Lock
} from 'lucide-react';

export default function AdminUsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Password visibility controls
  const [showAllPasswords, setShowAllPasswords] = useState(false);
  const [visiblePasswordMap, setVisiblePasswordMap] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  // Modals
  const [viewingUser, setViewingUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('password123');
  const [formEmergencyContact, setFormEmergencyContact] = useState('');
  const [formStatus, setFormStatus] = useState('Active');
  const [showFormPassword, setShowFormPassword] = useState(false);

  // Modal-specific password visibility
  const [isViewingPasswordVisible, setIsViewingPasswordVisible] = useState(true);

  const loadData = async () => {
    try {
      const res = await fetch('/api/users?role=user');
      const data = await res.json();
      if (data.success && data.users) {
        setUsers(data.users);
        return;
      }
    } catch (e) {}
    setUsers(getUsers());
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

  const togglePasswordVisibility = (userId) => {
    setVisiblePasswordMap((prev) => ({
      ...prev,
      [userId]: !prev[userId]
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

  const handleOpenEdit = (u) => {
    setEditingUser(u);
    setFormName(u.name || '');
    setFormEmail(u.email || '');
    setFormPhone(u.phone || '');
    setFormPassword(u.password || 'password123');
    setFormEmergencyContact(u.emergencyContact || '');
    setFormStatus(u.status || 'Active');
    setShowFormPassword(false);
  };

  const handleOpenAdd = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormPassword('password123');
    setFormEmergencyContact('');
    setFormStatus('Active');
    setShowFormPassword(false);
    setIsAddOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!formName.trim() || !formPhone.trim()) {
      showToast('Name and Phone are required.', 'error');
      return;
    }
    if (formPassword && formPassword.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }

    const updated = await updateUser(editingUser.id, {
      name: formName.trim(),
      email: formEmail.trim().toLowerCase(),
      phone: formPhone.trim(),
      password: formPassword,
      emergencyContact: formEmergencyContact.trim(),
      status: formStatus
    });

    if (updated) {
      setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? { ...u, ...updated } : u)));
      showToast(`User ${updated.name} updated successfully.`, 'success');
      setEditingUser(null);
      loadData();
    } else {
      showToast('Failed to update user.', 'error');
    }
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formPhone.trim()) {
      showToast('Name, Email and Phone are required.', 'error');
      return;
    }
    if (!formPassword || formPassword.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }

    const result = await registerUser({
      name: formName.trim(),
      email: formEmail.trim().toLowerCase(),
      phone: formPhone.trim(),
      password: formPassword,
      role: 'user',
      emergencyContact: formEmergencyContact.trim(),
      status: formStatus
    }, false);

    if (!result.success) {
      showToast(result.error, 'error');
      return;
    }

    if (result.user) {
      setUsers((prev) => [result.user, ...prev]);
    }
    showToast(`New user ${result.user.name || result.user.id} registered successfully!`, 'success');
    setIsAddOpen(false);
    loadData();
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete user ${name}?`)) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      const ok = await deleteUser(id);
      if (ok) {
        showToast(`User ${name} deleted successfully.`, 'info');
        loadData();
      } else {
        showToast('Failed to delete user.', 'error');
        loadData();
      }
    }
  };

  const filteredUsers = users.filter((u) => {
    if (statusFilter !== 'All' && u.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (u.id || '').toLowerCase().includes(q) ||
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.phone || '').includes(q) ||
        (u.password || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">Passenger User Management</h1>
          <p className="page-subtitle">Inspect, edit, register, and view passenger account details and login activity</p>
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
            <span>Add New User</span>
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
            placeholder="Search by ID, name, email, phone, or password..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-selects-row">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses ({users.length})</option>
            <option value="Active">Active ({users.filter(u => u.status === 'Active').length})</option>
            <option value="Inactive">Inactive ({users.filter(u => u.status === 'Inactive').length})</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name & Email</th>
              <th>Phone</th>
              <th>Password</th>
              <th>Joined Date</th>
              <th>Last Login</th>
              <th>Total Rides</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No passenger accounts match the current filter.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const isPasswordVisible = showAllPasswords || !!visiblePasswordMap[u.id];
                const userPassword = u.password || 'password123';

                return (
                  <tr key={u.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--purple-text)' }}>
                      {u.id}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{u.name}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{u.email}</div>
                    </td>
                    <td style={{ fontFamily: 'monospace' }}>
                      {u.phone}
                    </td>
                    <td>
                      <div className="password-cell">
                        <Key size={12} style={{ color: 'var(--purple)' }} />
                        <span className="password-text">
                          {isPasswordVisible ? userPassword : '••••••••'}
                        </span>
                        <button
                          type="button"
                          className="password-btn"
                          onClick={() => togglePasswordVisibility(u.id)}
                          title={isPasswordVisible ? 'Mask password' : 'Show password'}
                        >
                          {isPasswordVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                        <button
                          type="button"
                          className="password-btn"
                          onClick={() => handleCopyPassword(userPassword, u.id)}
                          title="Copy password"
                        >
                          {copiedId === u.id ? <Check size={13} style={{ color: 'var(--primary)' }} /> : <Copy size={13} />}
                        </button>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {formatJoinedDate(u.joinedDate)}
                    </td>
                    <td>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        color: u.lastLogin ? 'var(--text-main)' : 'var(--text-light)',
                        fontWeight: u.lastLogin ? 600 : 400 
                      }}>
                        {formatLastLogin(u.lastLogin)}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {u.totalRides || 0} rides
                    </td>
                    <td>
                      <span className={`badge ${u.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons-cell">
                        <button
                          className="btn-table-action"
                          onClick={() => {
                            setViewingUser(u);
                            setIsViewingPasswordVisible(true);
                          }}
                          title="View Full Profile & Password"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="btn-table-action"
                          onClick={() => handleOpenEdit(u)}
                          title="Edit User & Password"
                          style={{ color: 'var(--sky)' }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn-table-action"
                          onClick={() => handleDelete(u.id, u.name)}
                          title="Delete User"
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

      {/* View Modal - Complete Account Details */}
      <Modal isOpen={!!viewingUser} onClose={() => setViewingUser(null)} title="Passenger Account & Security Details">
        {viewingUser && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--purple-light)', 
                color: 'var(--purple)', 
                fontSize: '1.75rem', 
                fontWeight: 900, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 12px' 
              }}>
                {viewingUser.name ? viewingUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>{viewingUser.name}</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{viewingUser.email}</p>
            </div>

            {/* Password Highlight Box */}
            <div className="password-box-highlight">
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--purple-text)', letterSpacing: '0.5px' }}>
                  Account Password (Plaintext)
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '1.125rem', fontWeight: 800, color: 'var(--navy)', marginTop: '2px' }}>
                  {isViewingPasswordVisible ? (viewingUser.password || 'password123') : '••••••••••••'}
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
                  onClick={() => handleCopyPassword(viewingUser.password || 'password123', 'view-modal')}
                  title="Copy password to clipboard"
                >
                  {copiedId === 'view-modal' ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedId === 'view-modal' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Detailed Attributes Grid */}
            <div className="admin-details-grid">
              <div className="admin-detail-row">
                <span className="admin-detail-label">User ID:</span>
                <strong style={{ fontFamily: 'monospace', color: 'var(--purple-text)' }}>{viewingUser.id}</strong>
              </div>
              <div className="admin-detail-row">
                <span className="admin-detail-label">Account Role:</span>
                <strong style={{ textTransform: 'capitalize' }}>{viewingUser.role || 'user'}</strong>
              </div>
              <div className="admin-detail-row">
                <span className="admin-detail-label">Phone Number:</span>
                <strong style={{ fontFamily: 'monospace' }}>{viewingUser.phone}</strong>
              </div>
              <div className="admin-detail-row">
                <span className="admin-detail-label">Email Address:</span>
                <strong>{viewingUser.email}</strong>
              </div>
              <div className="admin-detail-row">
                <span className="admin-detail-label">Joined Date:</span>
                <strong>{formatJoinedDate(viewingUser.joinedDate)} ({viewingUser.joinedDate || 'N/A'})</strong>
              </div>
              <div className="admin-detail-row">
                <span className="admin-detail-label">Last Login Activity:</span>
                <strong style={{ color: viewingUser.lastLogin ? 'var(--primary)' : 'var(--text-muted)' }}>
                  {formatLastLogin(viewingUser.lastLogin)}
                  {viewingUser.lastLogin && ` (${viewingUser.lastLogin})`}
                </strong>
              </div>
              <div className="admin-detail-row">
                <span className="admin-detail-label">Passenger Rating:</span>
                <strong style={{ color: 'var(--amber)' }}>★ {viewingUser.rating || 5.0} / 5.0</strong>
              </div>
              <div className="admin-detail-row">
                <span className="admin-detail-label">Total Completed Rides:</span>
                <strong>{viewingUser.totalRides || 0} rides</strong>
              </div>
              <div className="admin-detail-row">
                <span className="admin-detail-label">Emergency Contact:</span>
                <strong>{viewingUser.emergencyContact || 'Not Set'}</strong>
              </div>
              <div className="admin-detail-row">
                <span className="admin-detail-label">Account Status:</span>
                <span className={`badge ${viewingUser.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                  {viewingUser.status}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                className="btn btn-secondary btn-block" 
                onClick={() => {
                  const u = viewingUser;
                  setViewingUser(null);
                  handleOpenEdit(u);
                }}
              >
                <Edit2 size={16} />
                <span>Edit User</span>
              </button>
              <button className="btn btn-primary btn-block" onClick={() => setViewingUser(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editingUser} onClose={() => setEditingUser(null)} title={`Edit Passenger User (${editingUser?.id})`}>
        {editingUser && (
          <form onSubmit={handleSaveEdit}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
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
              <label className="form-label">Account Password *</label>
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
                Administrator can view or update the account password.
              </span>
            </div>

            <div className="auth-form-grid">
              <div className="form-group">
                <label className="form-label">Emergency Contact Phone</label>
                <input
                  type="tel"
                  maxLength={10}
                  className="form-input"
                  value={formEmergencyContact}
                  onChange={(e) => setFormEmergencyContact(e.target.value)}
                  placeholder="e.g. 9876543299"
                />
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
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setEditingUser(null)}>
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
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register New Passenger Account">
        <form onSubmit={handleSaveAdd}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-input"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Anand Raj"
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
                placeholder="user@gmail.com"
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
              <label className="form-label">Emergency Contact (Optional)</label>
              <input
                type="tel"
                maxLength={10}
                className="form-input"
                value={formEmergencyContact}
                onChange={(e) => setFormEmergencyContact(e.target.value)}
                placeholder="9876543299"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Initial Status</label>
              <select
                className="form-select"
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value)}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Passenger
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
