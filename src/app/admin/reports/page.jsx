'use client';

import React, { useState, useEffect } from 'react';
import { 
  getUsers, 
  getDrivers, 
  getRides, 
  getPayments 
} from '@/lib/storage';
import { formatCurrency } from '@/lib/fareCalculator';
import { useToast } from '@/components/Toast';
import { 
  FileText, 
  Download, 
  DollarSign, 
  Car, 
  Bike, 
  Star, 
  Users, 
  ShieldCheck 
} from 'lucide-react';

export default function AdminReportsPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [rides, setRides] = useState([]);

  const loadData = () => {
    setUsers(getUsers().filter((u) => u.role !== 'admin'));
    setDrivers(getDrivers());
    setRides(getRides());
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

  const totalCompletedFare = rides
    .filter((r) => r.status === 'Completed')
    .reduce((sum, r) => sum + r.fare, 0);

  const carRevenue = rides
    .filter((r) => r.status === 'Completed' && r.vehicleType === 'Car')
    .reduce((sum, r) => sum + r.fare, 0);

  const bikeRevenue = rides
    .filter((r) => r.status === 'Completed' && r.vehicleType === 'Bike')
    .reduce((sum, r) => sum + r.fare, 0);

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`${filename} downloaded successfully!`, 'success');
  };

  const handleExportUsers = () => {
    const headers = ['User ID', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Total Rides', 'Joined Date'];
    const rows = users.map((u) => [
      u.id,
      `"${u.name}"`,
      u.email,
      u.phone,
      u.role,
      u.status,
      u.totalRides || 0,
      u.joinedDate || ''
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadCSV(csv, `RideShare_Users_Report_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportDrivers = () => {
    const headers = ['Driver ID', 'Name', 'Email', 'Phone', 'Vehicle Type', 'Model', 'Plate Number', 'License', 'Rating', 'Total Earnings', 'Online Status'];
    const rows = drivers.map((d) => [
      d.id,
      `"${d.name}"`,
      d.email,
      d.phone,
      d.vehicleType,
      `"${d.vehicleModel}"`,
      d.vehicleNumber,
      d.licenseNumber,
      d.rating,
      d.totalEarnings || 0,
      d.available ? 'ONLINE' : 'OFFLINE'
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadCSV(csv, `RideShare_Drivers_Report_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportRides = () => {
    const headers = ['Ride ID', 'Passenger', 'Driver', 'Pickup', 'Drop', 'Vehicle Type', 'Distance (km)', 'Fare (INR)', 'Status', 'Date', 'Time'];
    const rows = rides.map((r) => [
      r.id,
      `"${r.userName}"`,
      `"${r.driverName || 'Unassigned'}"`,
      `"${r.pickup}"`,
      `"${r.drop}"`,
      r.vehicleType,
      r.distanceKm,
      r.fare,
      r.status,
      r.date,
      r.time
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadCSV(csv, `RideShare_Rides_Report_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const topDrivers = [...drivers].sort((a, b) => (b.totalRides || 0) - (a.totalRides || 0)).slice(0, 5);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Reports & Business Intelligence</h1>
        <p className="page-subtitle">Export master database CSV files and view fleet revenue breakdowns</p>
      </div>

      {/* Export Cards Grid */}
      <div className="exports-grid">
        <div className="export-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Passenger Records</span>
            <div className="export-icon-wrap"><Users size={20} /></div>
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Users Directory</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {users.length} registered passenger accounts with ride history counts.
            </p>
          </div>
          <button className="btn btn-primary btn-block btn-sm" onClick={handleExportUsers}>
            <Download size={14} /> Download Users CSV
          </button>
        </div>

        <div className="export-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Fleet Records</span>
            <div className="export-icon-wrap" style={{ backgroundColor: 'var(--sky-light)', color: 'var(--sky)' }}><Car size={20} /></div>
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Drivers Directory</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {drivers.length} registered car and bike partners with license details.
            </p>
          </div>
          <button className="btn btn-secondary btn-block btn-sm" onClick={handleExportDrivers}>
            <Download size={14} /> Download Drivers CSV
          </button>
        </div>

        <div className="export-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Master Dispatch Log</span>
            <div className="export-icon-wrap" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}><FileText size={20} /></div>
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Rides History Log</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {rides.length} trips with route, OTP, fare, and payment info.
            </p>
          </div>
          <button className="btn btn-primary btn-block btn-sm" onClick={handleExportRides} style={{ backgroundColor: 'var(--purple)' }}>
            <Download size={14} /> Download Rides CSV
          </button>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '32px' }}>
        <div className="card">
          <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Total Platform Volume</span>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)', margin: '6px 0' }}>
            {formatCurrency(totalCompletedFare)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>All completed journeys</span>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Car Fleet Revenue</span>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--sky)', margin: '6px 0' }}>
            {formatCurrency(carRevenue)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>From sedan & hatchback rides</span>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Bike Fleet Revenue</span>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)', margin: '6px 0' }}>
            {formatCurrency(bikeRevenue)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>From 2-wheeler commute</span>
        </div>
      </div>

      {/* Top Drivers Table */}
      <div className="table-container">
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Star size={18} style={{ color: 'var(--amber)', fill: 'var(--amber)' }} />
          <h2 style={{ fontSize: '1rem', fontWeight: 800 }}>Top Performing Fleet Partners</h2>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Driver Name</th>
              <th>Vehicle</th>
              <th>Plate Number</th>
              <th>Rating</th>
              <th>Total Trips</th>
              <th style={{ textAlign: 'right' }}>Total Earnings</th>
            </tr>
          </thead>
          <tbody>
            {topDrivers.map((d, idx) => (
              <tr key={d.id}>
                <td style={{ fontWeight: 900, color: 'var(--text-muted)' }}>
                  #{idx + 1}
                </td>
                <td style={{ fontWeight: 800 }}>
                  {d.name}
                </td>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                    {d.vehicleType === 'Car' ? <Car size={14} style={{ color: 'var(--sky)' }} /> : <Bike size={14} style={{ color: 'var(--primary)' }} />}
                    {d.vehicleModel}
                  </span>
                </td>
                <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                  {d.vehicleNumber}
                </td>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--amber)', fontWeight: 700 }}>
                    <Star size={12} fill="var(--amber)" /> {d.rating}
                  </span>
                </td>
                <td style={{ fontWeight: 700 }}>
                  {d.totalRides} trips
                </td>
                <td style={{ textAlign: 'right', fontWeight: 900, color: 'var(--primary)' }}>
                  {formatCurrency(d.totalEarnings || 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
