'use client';

import React from 'react';

export default function DashboardCard({ title, value, subtitle, icon: Icon, color = 'emerald' }) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        {Icon && <Icon size={20} style={{ color: `var(--${color === 'emerald' ? 'primary' : color})` }} />}
      </div>
      <div className="stat-card-value">{value}</div>
      {subtitle && <div className="stat-card-footer">{subtitle}</div>}
    </div>
  );
}
