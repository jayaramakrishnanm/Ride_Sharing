'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getUsers, 
  getDrivers, 
  getRides, 
  getPayments, 
  initializeStorage 
} from '@/lib/storage';
import { formatCurrency } from '@/lib/fareCalculator';
import DashboardCard from '@/components/DashboardCard';
import RideTable from '@/components/RideTable';
import { DailyRidesChart, CompletionDonutChart, VehicleFleetChart } from '@/components/Charts';
import { useToast } from '@/components/Toast';
import { 
  Users, 
  ShieldCheck, 
  Car, 
  Bike, 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  ArrowRight 
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [rides, setRides] = useState([]);
  const [payments, setPayments] = useState([]);

  const loadData = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success && data.users) {
        setUsers(data.users.filter((u) => u.role === 'user' || u.role === 'passenger'));
        setDrivers(data.users.filter((u) => u.role === 'driver'));
      } else {
        setUsers(getUsers());
        setDrivers(getDrivers());
      }
    } catch (e) {
      setUsers(getUsers());
      setDrivers(getDrivers());
    }
    setRides(getRides());
    setPayments(getPayments());
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

  const totalRevenue = rides
    .filter((r) => r.status === 'Completed')
    .reduce((sum, r) => sum + r.fare, 0);

  const activeRidesCount = rides.filter(
    (r) => r.status === 'Pending' || r.status === 'Accepted' || r.status === 'Driver Arriving' || r.status === 'Ride Started'
  ).length;

  const completedRidesCount = rides.filter((r) => r.status === 'Completed').length;
  const cancelledRidesCount = rides.filter((r) => r.status === 'Cancelled').length;

  const carDriversCount = drivers.filter((d) => d.vehicleType === 'Car').length;
  const bikeDriversCount = drivers.filter((d) => d.vehicleType === 'Bike').length;

  const handleResetDatabase = () => {
    if (window.confirm('Reset database back to default sample state?')) {
      initializeStorage(true);
      showToast('Database reset to default state successfully!', 'success');
      loadData();
    }
  };

  return (
    <div>
      {/* Admin Hero Header */}
      <div className="admin-hero-banner">
        <div>
          <div className="hero-tag">
            <ShieldCheck size={14} />
            <span>Administrator Control Hub</span>
          </div>
          <h1 className="hero-title">Platform Master Overview</h1>
          <p className="hero-desc">
            Monitor real-time dispatch, fleet availability, user accounts, and financial volume.
          </p>
        </div>

        <button
          className="btn btn-secondary btn-lg"
          onClick={handleResetDatabase}
          style={{ backgroundColor: '#ffffff', color: 'var(--purple-text)', fontWeight: 800 }}
        >
          <RotateCcw size={16} />
          <span>Reset Sample Data</span>
        </button>
      </div>

      {/* 6 Executive KPI Stat Cards */}
      <div className="stats-grid stats-grid-6">
        <DashboardCard
          title="Total Users"
          value={users.length}
          subtitle="Registered accounts"
          icon={Users}
          color="purple"
        />
        <DashboardCard
          title="Total Drivers"
          value={drivers.length}
          subtitle={`${drivers.filter((d) => d.available).length} Online`}
          icon={ShieldCheck}
          color="sky"
        />
        <DashboardCard
          title="Active Rides"
          value={activeRidesCount}
          subtitle="Live on dispatch"
          icon={Car}
          color="amber"
        />
        <DashboardCard
          title="Completed"
          value={completedRidesCount}
          subtitle="Fulfilled trips"
          icon={CheckCircle2}
          color="emerald"
        />
        <DashboardCard
          title="Cancelled"
          value={cancelledRidesCount}
          subtitle="Aborted requests"
          icon={XCircle}
          color="rose"
        />
        <DashboardCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          subtitle="Gross booking volume"
          icon={DollarSign}
          color="emerald"
        />
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="charts-grid">
        <DailyRidesChart rides={rides} />
        <CompletionDonutChart completed={completedRidesCount} cancelled={cancelledRidesCount} />
        <VehicleFleetChart carCount={carDriversCount} bikeCount={bikeDriversCount} />
      </div>

      {/* Recent Rides Table Section */}
      <div style={{ marginTop: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 className="section-title">Live Dispatch Feed</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Real-time monitor of recent platform rides across all vehicle categories
            </p>
          </div>

          <Link href="/admin/rides" className="btn btn-secondary btn-sm">
            <span>Manage All Rides</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <RideTable
          rides={rides.slice(0, 6)}
          role="admin"
        />
      </div>
    </div>
  );
}
