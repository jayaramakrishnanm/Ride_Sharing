'use client';

import React, { useState, useEffect } from 'react';
import { getUsers, saveUser, updateUser, deleteUser } from '@/lib/storage';
import { User } from '@/lib/types';
import { useToast } from '@/components/Toast';
import { 
  Users as UsersIcon, 
  Search, 
  Plus, 
  Eye, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  Phone, 
  Mail, 
  Calendar, 
  Star, 
  ShieldCheck, 
  Car,
  CheckCircle2
} from 'lucide-react';

export default function AdminUsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals state
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');

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

  const handleOpenEdit = (u: User) => {
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

  const handleSaveEdit = (e: React.FormEvent) => {
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

  const handleSaveAdd = (e: React.FormEvent) => {
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
      totalRides: 0,
      joinedDate: new Date().toISOString().split('T')[0]
    });

    showToast(`New passenger user added!`, 'success');
    setIsAddOpen(false);
    loadData();
  };

  const handleDelete = (id: string, name: string) => {
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <UsersIcon className="w-3.5 h-3.5" /> User Accounts
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Passenger User Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            View, edit, deactivate, and register passenger accounts
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-3 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-purple-600/20 self-start sm:self-center transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New User</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, name, email, or phone..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm outline-none w-full sm:w-auto"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Accounts</option>
            <option value="Inactive">Inactive Accounts</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">User ID</th>
                <th className="p-4">Name & Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4">Total Rides</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                      {u.id}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                      <div className="text-slate-400 text-[11px]">{u.email}</div>
                    </td>
                    <td className="p-4 font-mono font-medium">
                      {u.phone}
                    </td>
                    <td className="p-4 text-slate-500">
                      {u.joinedDate || '2025-01-15'}
                    </td>
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                      {u.totalRides || 0} rides
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${
                        u.status === 'Active'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1.5">
                      <button
                        onClick={() => setViewingUser(u)}
                        className="p-2 text-slate-500 hover:text-purple-600 bg-slate-100 dark:bg-slate-800 rounded-xl"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="p-2 text-slate-500 hover:text-sky-600 bg-slate-100 dark:bg-slate-800 rounded-xl"
                        title="Edit User"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(u.id, u.name)}
                        className="p-2 text-slate-500 hover:text-rose-600 bg-slate-100 dark:bg-slate-800 rounded-xl"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View User Modal */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Passenger Details</h3>
              <button onClick={() => setViewingUser(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-purple-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-purple-500/20">
                {viewingUser.name.charAt(0)}
              </div>
              <h4 className="font-bold text-lg text-slate-900 dark:text-white">{viewingUser.name}</h4>
              <p className="text-xs text-slate-500">{viewingUser.email}</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-xs space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-400">User ID:</span>
                <span className="font-mono font-bold">{viewingUser.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phone:</span>
                <span className="font-mono font-semibold">{viewingUser.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Bookings:</span>
                <span className="font-bold">{viewingUser.totalRides || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Average Rating:</span>
                <span className="font-bold text-amber-500 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> {viewingUser.rating || 5.0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold text-emerald-600">{viewingUser.status}</span>
              </div>
            </div>

            <button
              onClick={() => setViewingUser(null)}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Edit User ({editingUser.id})</h3>
              <button onClick={() => setEditingUser(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Phone Number</label>
                <input
                  type="tel"
                  maxLength={10}
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Account Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs"
                >
                  Save Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Register New Passenger</h3>
              <button onClick={() => setIsAddOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Suresh Kumar"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Phone Number (10 Digits) *</label>
                <input
                  type="tel"
                  maxLength={10}
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
