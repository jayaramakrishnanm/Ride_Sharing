'use client';

import React, { useState, useEffect } from 'react';
import { getDrivers, saveDriver, updateDriver, deleteDriver } from '@/lib/storage';
import { Driver, VehicleType } from '@/lib/types';
import { formatCurrency } from '@/lib/fareCalculator';
import { useToast } from '@/components/Toast';
import { 
  Car, 
  Bike, 
  Search, 
  Plus, 
  Eye, 
  Edit2, 
  Trash2, 
  Power, 
  ShieldCheck, 
  Star, 
  X, 
  Check, 
  Phone,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

export default function AdminDriversPage() {
  const { showToast } = useToast();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals state
  const [viewingDriver, setViewingDriver] = useState<Driver | null>(null);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formVehicleType, setFormVehicleType] = useState<VehicleType>('Car');
  const [formVehicleModel, setFormVehicleModel] = useState('');
  const [formVehicleNumber, setFormVehicleNumber] = useState('');
  const [formLicenseNumber, setFormLicenseNumber] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');

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

  const handleToggleActive = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    updateDriver(id, { status: nextStatus });
    showToast(`Driver account marked as ${nextStatus}.`, 'info');
    loadData();
  };

  const handleOpenEdit = (d: Driver) => {
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

  const handleSaveEdit = (e: React.FormEvent) => {
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
      showToast(`Driver ${updated.name} records updated!`, 'success');
      setEditingDriver(null);
      loadData();
    }
  };

  const handleSaveAdd = (e: React.FormEvent) => {
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
      vehicleModel: formVehicleModel.trim() || `${formVehicleType} Model`,
      vehicleNumber: formVehicleNumber.trim().toUpperCase(),
      licenseNumber: formLicenseNumber.trim().toUpperCase() || 'DL-PENDING',
      available: true,
      rating: 5.0,
      totalRides: 0,
      completedToday: 0,
      earningsToday: 0,
      totalEarnings: 0,
      status: formStatus,
      currentLocation: 'Chennai Central'
    });

    showToast('New driver registered successfully!', 'success');
    setIsAddOpen(false);
    loadData();
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to permanently remove driver ${name}?`)) {
      const ok = deleteDriver(id);
      if (ok) {
        showToast(`Driver ${name} removed from fleet.`, 'info');
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
        d.vehicleNumber.toLowerCase().includes(q) ||
        d.vehicleModel.toLowerCase().includes(q)
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
            <ShieldCheck className="w-3.5 h-3.5" /> Fleet Oversight
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Driver Partner Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Verify, edit, activate/deactivate, and inspect registered car and bike drivers
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-3 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-purple-600/20 self-start sm:self-center transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Driver</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by driver ID, name, plate number, or phone..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm outline-none"
            >
              <option value="All">All Vehicle Types</option>
              <option value="Car">Car Drivers</option>
              <option value="Bike">Bike Drivers</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm outline-none"
            >
              <option value="All">All Account Statuses</option>
              <option value="Active">Active Accounts</option>
              <option value="Inactive">Deactivated Accounts</option>
            </select>
          </div>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Driver ID</th>
                <th className="p-4">Name & Contact</th>
                <th className="p-4">Vehicle Specs</th>
                <th className="p-4">Plate & License</th>
                <th className="p-4">Availability</th>
                <th className="p-4">Rating & Earnings</th>
                <th className="p-4">Account</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No drivers matching current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                      {d.id}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white">{d.name}</div>
                      <div className="text-slate-400 font-mono text-[11px]">{d.phone}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                        {d.vehicleType === 'Car' ? <Car className="w-3.5 h-3.5 text-sky-500" /> : <Bike className="w-3.5 h-3.5 text-emerald-500" />}
                        <span>{d.vehicleType}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">{d.vehicleModel}</div>
                    </td>
                    <td className="p-4 font-mono">
                      <div className="font-bold text-slate-900 dark:text-white">{d.vehicleNumber}</div>
                      <div className="text-[10px] text-slate-400">{d.licenseNumber}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${
                        d.available
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {d.available ? '● ONLINE' : '○ OFFLINE'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 font-bold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400" /> {d.rating || 4.9}
                      </div>
                      <div className="text-[11px] text-slate-400 font-bold mt-0.5">
                        {formatCurrency(d.totalEarnings || 0)}
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleActive(d.id, d.status)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                          d.status === 'Active'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 hover:bg-emerald-100'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 hover:bg-rose-100'
                        }`}
                        title="Click to toggle Active / Deactivated"
                      >
                        {d.status}
                      </button>
                    </td>
                    <td className="p-4 text-right space-x-1.5">
                      <button
                        onClick={() => setViewingDriver(d)}
                        className="p-2 text-slate-500 hover:text-purple-600 bg-slate-100 dark:bg-slate-800 rounded-xl"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleOpenEdit(d)}
                        className="p-2 text-slate-500 hover:text-sky-600 bg-slate-100 dark:bg-slate-800 rounded-xl"
                        title="Edit Driver"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(d.id, d.name)}
                        className="p-2 text-slate-500 hover:text-rose-600 bg-slate-100 dark:bg-slate-800 rounded-xl"
                        title="Delete Driver"
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

      {/* View Driver Modal */}
      {viewingDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Driver Partner Profile</h3>
              <button onClick={() => setViewingDriver(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-sky-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-sky-500/20">
                {viewingDriver.name.charAt(0)}
              </div>
              <h4 className="font-bold text-lg text-slate-900 dark:text-white">{viewingDriver.name}</h4>
              <p className="text-xs text-slate-500">{viewingDriver.email}</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Driver ID:</span>
                <span className="font-mono font-bold">{viewingDriver.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phone:</span>
                <span className="font-mono">{viewingDriver.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vehicle:</span>
                <span className="font-bold">{viewingDriver.vehicleType} • {viewingDriver.vehicleModel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Plate Number:</span>
                <span className="font-mono font-bold text-emerald-600">{viewingDriver.vehicleNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Driving License:</span>
                <span className="font-mono">{viewingDriver.licenseNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Lifetime Earnings:</span>
                <span className="font-black text-emerald-600">{formatCurrency(viewingDriver.totalEarnings || 0)}</span>
              </div>
            </div>

            <button
              onClick={() => setViewingDriver(null)}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit Driver Modal */}
      {editingDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Edit Driver ({editingDriver.id})</h3>
              <button onClick={() => setEditingDriver(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Driver Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Vehicle Type</label>
                  <select
                    value={formVehicleType}
                    onChange={(e) => setFormVehicleType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  >
                    <option value="Car">Car</option>
                    <option value="Bike">Bike</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Vehicle Model</label>
                <input
                  type="text"
                  value={formVehicleModel}
                  onChange={(e) => setFormVehicleModel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Registration Plate</label>
                  <input
                    type="text"
                    value={formVehicleNumber}
                    onChange={(e) => setFormVehicleNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl uppercase font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Account Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingDriver(null)}
                  className="py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Driver Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Register New Driver Partner</h3>
              <button onClick={() => setIsAddOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Driver Full Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Mani Kandan"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="driver@gmail.com"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Vehicle Type *</label>
                  <select
                    value={formVehicleType}
                    onChange={(e) => setFormVehicleType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold"
                  >
                    <option value="Car">Car</option>
                    <option value="Bike">Bike</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Vehicle Make / Model</label>
                  <input
                    type="text"
                    value={formVehicleModel}
                    onChange={(e) => setFormVehicleModel(e.target.value)}
                    placeholder="e.g. Honda Activa 6G"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Plate Number *</label>
                  <input
                    type="text"
                    value={formVehicleNumber}
                    onChange={(e) => setFormVehicleNumber(e.target.value)}
                    placeholder="TN09AB1234"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl uppercase font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">License No</label>
                  <input
                    type="text"
                    value={formLicenseNumber}
                    onChange={(e) => setFormLicenseNumber(e.target.value)}
                    placeholder="DL-TN09-2022-001"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl uppercase font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl"
                >
                  Create Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
