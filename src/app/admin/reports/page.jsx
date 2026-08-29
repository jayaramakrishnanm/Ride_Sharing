'use client';

import React, { useState, useEffect } from 'react';
import { 
  getUsers, 
  getDrivers, 
  getRides, 
  getPayments 
} from '@/lib/storage';
import { formatCurrency } from '@/lib/fareCalculator';
import { formatLastLogin, formatJoinedDate } from '@/lib/dateUtils';
import { useToast } from '@/components/Toast';
import { 
  FileText, 
  Download, 
  DollarSign, 
  Car, 
  Bike, 
  Star, 
  Users, 
  ShieldCheck,
  CreditCard,
  Printer,
  Calendar,
  Layers
} from 'lucide-react';

export default function AdminReportsPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [rides, setRides] = useState([]);
  const [payments, setPayments] = useState([]);

  const loadData = async () => {
    try {
      const uRes = await fetch('/api/users');
      const uData = await uRes.json();
      if (uData.success && uData.users) {
        setUsers(uData.users.filter((u) => u.role === 'user' || u.role === 'passenger'));
        setDrivers(uData.users.filter((u) => u.role === 'driver'));
      } else {
        setUsers(getUsers().filter((u) => u.role !== 'admin'));
        setDrivers(getDrivers());
      }
    } catch (e) {
      setUsers(getUsers().filter((u) => u.role !== 'admin'));
      setDrivers(getDrivers());
    }

    try {
      const rRes = await fetch('/api/rides');
      const rData = await rRes.json();
      if (rData.success && rData.rides) {
        setRides(rData.rides);
      } else {
        setRides(getRides());
      }
    } catch (e) {
      setRides(getRides());
    }

    try {
      const pRes = await fetch('/api/payments');
      const pData = await pRes.json();
      if (pData.success && pData.payments) {
        setPayments(pData.payments);
      } else {
        setPayments(getPayments());
      }
    } catch (e) {
      setPayments(getPayments());
    }
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

  const downloadFile = (content, filename, type = 'text/csv;charset=utf-8;') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`${filename} downloaded successfully!`, 'success');
  };

  // 1. Export All Users Report
  const handleExportUsers = () => {
    const headers = ['User ID', 'Name', 'Email', 'Phone', 'Password', 'Role', 'Status', 'Total Rides', 'Joined Date', 'Last Login', 'Emergency Contact'];
    const rows = users.map((u) => [
      u.id,
      `"${u.name}"`,
      u.email,
      u.phone,
      `"${u.password || 'password123'}"`,
      u.role,
      u.status,
      u.totalRides || 0,
      `"${formatJoinedDate(u.joinedDate)}"`,
      `"${formatLastLogin(u.lastLogin)}"`,
      `"${u.emergencyContact || 'Not Set'}"`
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadFile(csv, `RideShare_Users_Report_${new Date().toISOString().split('T')[0]}.csv`);
  };

  // 2. Export All Drivers Report
  const handleExportDrivers = () => {
    const headers = ['Driver ID', 'Name', 'Email', 'Phone', 'Password', 'Vehicle Type', 'Model', 'Color', 'Plate Number', 'License', 'Experience (Yrs)', 'Location', 'Rating', 'Total Completed Trips', 'Lifetime Earnings (INR)', 'Joined Date', 'Last Login', 'Online Status', 'Emergency Contact', 'Account Status'];
    const rows = drivers.map((d) => [
      d.id,
      `"${d.name}"`,
      d.email,
      d.phone,
      `"${d.password || 'password123'}"`,
      d.vehicleType,
      `"${d.vehicleModel}"`,
      `"${d.vehicleColor || 'Standard'}"`,
      d.vehicleNumber,
      d.licenseNumber,
      d.drivingExperience || 1,
      `"${d.currentLocation || 'Chennai Central'}"`,
      d.rating,
      d.totalRides || 0,
      d.totalEarnings || 0,
      `"${formatJoinedDate(d.joinedDate)}"`,
      `"${formatLastLogin(d.lastLogin)}"`,
      d.available ? 'ONLINE' : 'OFFLINE',
      `"${d.emergencyContact || 'Not Set'}"`,
      d.status
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadFile(csv, `RideShare_Drivers_Report_${new Date().toISOString().split('T')[0]}.csv`);
  };

  // 3. Export All Rides Report
  const handleExportRides = () => {
    const headers = ['Ride ID', 'Passenger Name', 'Passenger Phone', 'Driver Name', 'Vehicle Number', 'Vehicle Type', 'Pickup', 'Drop', 'Distance (km)', 'Fare (INR)', 'Status', 'Rating', 'Feedback', 'Date', 'Time', 'OTP'];
    const rows = rides.map((r) => [
      r.id,
      `"${r.userName}"`,
      r.userPhone,
      `"${r.driverName || 'Unassigned'}"`,
      `"${r.vehicleNumber || 'Unassigned'}"`,
      r.vehicleType,
      `"${r.pickup}"`,
      `"${r.drop}"`,
      r.distanceKm,
      r.fare,
      r.status,
      r.rating || 'Unrated',
      `"${r.feedback || ''}"`,
      r.date,
      r.time,
      r.otp
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadFile(csv, `RideShare_Rides_Master_Report_${new Date().toISOString().split('T')[0]}.csv`);
  };

  // 4. Export Payments & Financial Report
  const handleExportPayments = () => {
    const headers = ['Payment ID', 'Ride ID', 'Passenger', 'Driver', 'Amount (INR)', 'Payment Method', 'Transaction ID', 'Status', 'Date', 'Time'];
    const rows = payments.map((p) => [
      p.id,
      p.rideId,
      `"${p.userName}"`,
      `"${p.driverName || 'N/A'}"`,
      p.amount,
      p.method,
      p.transactionId,
      p.status,
      p.date,
      p.time
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadFile(csv, `RideShare_Financial_Payments_Report_${new Date().toISOString().split('T')[0]}.csv`);
  };

  // 5. Complete JSON Database Backup Snapshot
  const handleExportFullJsonSnapshot = () => {
    const fullSnapshot = {
      exportTimestamp: new Date().toISOString(),
      summary: {
        totalUsers: users.length,
        totalDrivers: drivers.length,
        totalRides: rides.length,
        totalPayments: payments.length,
        totalRevenue: totalCompletedFare
      },
      users,
      drivers,
      rides,
      payments
    };
    downloadFile(
      JSON.stringify(fullSnapshot, null, 2),
      `RideShare_Full_Database_Snapshot_${new Date().toISOString().split('T')[0]}.json`,
      'application/json'
    );
  };

  const topDrivers = [...drivers].sort((a, b) => (b.totalRides || 0) - (a.totalRides || 0)).slice(0, 5);

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">Reports & Business Intelligence</h1>
          <p className="page-subtitle">Export master database CSV / JSON reports and analyze platform performance</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => window.print()}>
            <Printer size={16} />
            <span>Print Report View</span>
          </button>
          <button className="btn btn-primary" onClick={handleExportFullJsonSnapshot}>
            <Download size={16} />
            <span>Export Full JSON DB</span>
          </button>
        </div>
      </div>

      {/* 4 Report Export Cards Grid */}
      <div className="exports-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        {/* Users CSV */}
        <div className="export-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Passenger Accounts</span>
            <div className="export-icon-wrap"><Users size={20} /></div>
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Users Directory Report</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {users.length} passenger accounts with joined dates, last logins, and ride totals.
            </p>
          </div>
          <button className="btn btn-primary btn-block btn-sm" onClick={handleExportUsers}>
            <Download size={14} /> Download Users CSV
          </button>
        </div>

        {/* Drivers CSV */}
        <div className="export-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Fleet Partner Accounts</span>
            <div className="export-icon-wrap" style={{ backgroundColor: 'var(--sky-light)', color: 'var(--sky)' }}><Car size={20} /></div>
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Drivers Fleet Report</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {drivers.length} car and bike partners with license, earnings, and vehicle specs.
            </p>
          </div>
          <button className="btn btn-secondary btn-block btn-sm" onClick={handleExportDrivers}>
            <Download size={14} /> Download Drivers CSV
          </button>
        </div>

        {/* Rides CSV */}
        <div className="export-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Master Dispatch Log</span>
            <div className="export-icon-wrap" style={{ backgroundColor: 'var(--purple-light)', color: 'var(--purple)' }}><FileText size={20} /></div>
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Rides History Report</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {rides.length} trips with route distance, fares, ratings, OTP, and driver assignments.
            </p>
          </div>
          <button className="btn btn-primary btn-block btn-sm" onClick={handleExportRides} style={{ backgroundColor: 'var(--purple)' }}>
            <Download size={14} /> Download Rides CSV
          </button>
        </div>

        {/* Payments CSV */}
        <div className="export-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Financial Transactions</span>
            <div className="export-icon-wrap" style={{ backgroundColor: 'var(--emerald-light)', color: 'var(--emerald)' }}><CreditCard size={20} /></div>
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Payments & Revenue Report</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {payments.length} transactions with UPI / Card / Cash settlement IDs.
            </p>
          </div>
          <button className="btn btn-secondary btn-block btn-sm" onClick={handleExportPayments}>
            <Download size={14} /> Download Payments CSV
          </button>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', margin: '32px 0' }}>
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
