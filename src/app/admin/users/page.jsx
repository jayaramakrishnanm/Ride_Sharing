'use client';

import React, { useState, useEffect } from 'react';
import { getUsers, saveUser, updateUser, deleteUser } from '@/lib/storage';
import { useToast } from '@/components/Toast';
import Modal from '@/components/Modal';
import { 
  Users as UsersIcon, 
  Search, 
  Plus, 
  Eye, 
  Edit2, 
  Trash2, 
  Star, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react';

export default function AdminUsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [viewingUser, setViewingUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formStatus, setFormStatus] = useState('Active');

  const loadData = () => {
    const all = getUsers().filter((u) => u.role !== 'admin');
    setUsers(all);
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

  const handleOpenEdit = (u) => {
    setEditingUser(u);
    setFormName(u.name);
    setFormEmail(u.email);
    setFormPhone(u.phone);
    setFormStatus(u.status);
  };

  const handleOpenAdd = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormStatus('Active');
    setIsAddOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!formName.trim() || !formPhone.trim()) {
      showToast('Name and Phone are required.', 'error');
      return;
    }

    const updated = updateUser(editingUser.id, {
      name: formName.trim(),
      phone: formPhone.trim(),
      status: formStatus
    });

    if (updated) {
      showToast(`User ${updated.name} updated successfully.`, 'success');
      setEditingUser(null);
      loadData();
    }
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formPhone.trim()) {
      showToast('All fields are required.', 'error');
      return;
    }

    saveUser({
      name: formName.trim(),
      email: formEmail.trim().toLowerCase(),
      phone: formPhone.trim(),
      role: 'user',
      status: formStatus,
      rating: 5.0,
      totalRides: 0
    });

    showToast('New passenger user registered!', 'success');
    setIsAddOpen(false);
    loadData();
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to permanently delete user ${name}?`)) {
      const ok = deleteUser(id);
      if (ok) {
        showToast(`User ${name} deleted successfully.`, 'info');
        loadData();
      }
    }
  };

  const filteredUsers = users.filter((u) => {
    if (statusFilter !== 'All' && u.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        u.id.toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q)
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
          <p className="page-subtitle">Inspect, edit, register, and manage passenger accounts</p>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} />
          <span>Add New User</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="search-box-wrap">
          <Search size={16} className="search-box-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by ID, name, email, or phone..."
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
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
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
              <th>Joined Date</th>
              <th>Total Rides</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No passenger accounts match the current filter.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 800 }}>
                    {u.id}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{u.name}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{u.email}</div>
                  </td>
                  <td style={{ fontFamily: 'monospace' }}>
                    {u.phone}
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {u.joinedDate || '2025-01-15'}
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
                        onClick={() => setViewingUser(u)}
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        className="btn-table-action"
                        onClick={() => handleOpenEdit(u)}
                        title="Edit User"
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      <Modal isOpen={!!viewingUser} onClose={() => setViewingUser(null)} title="Passenger Details">
        {viewingUser && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--purple-light)', color: 'var(--purple)', fontSize: '1.5rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              {viewingUser.name.charAt(0)}
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>{viewingUser.name}</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{viewingUser.email}</p>

            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', margin: '20px 0', textAlign: 'left', fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>User ID:</span>
                <strong style={{ fontFamily: 'monospace' }}>{viewingUser.id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Phone:</span>
                <strong>{viewingUser.phone}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Bookings:</span>
                <strong>{viewingUser.totalRides || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                <strong style={{ color: 'var(--primary)' }}>{viewingUser.status}</strong>
              </div>
            </div>

            <button className="btn btn-secondary btn-block" onClick={() => setViewingUser(null)}>
              Close
            </button>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editingUser} onClose={() => setEditingUser(null)} title={`Edit User (${editingUser?.id})`}>
        {editingUser && (
          <form onSubmit={handleSaveEdit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
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
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register New Passenger">
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

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create User
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
