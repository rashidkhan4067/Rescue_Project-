import React from 'react';
import PortalCard from './PortalCard';

function DashboardMetrics({ totalCases, activeCases, resolvedCount, broadcastActive }) {
  const successRate = totalCases > 0 ? Math.round((resolvedCount / totalCases) * 100) : 0;

  return (
    <section className="portal-metrics-grid">
      <PortalCard
        title="Total Registered Cases"
        icon="folder_open"
        iconColor="var(--primary-color)"
        subtitle="All submitted coordinate logs"
      >
        <div className="portal-metric-value">{totalCases}</div>
      </PortalCard>

      <PortalCard
        title="Active Search Grids"
        icon="radar"
        iconColor="var(--accent-color)"
        subtitle="Currently monitored regions"
      >
        <div className="portal-metric-value" style={{ color: 'var(--accent-color)' }}>
          {activeCases}
        </div>
      </PortalCard>

      <PortalCard
        title="Success Reunion Index"
        icon="handshake"
        iconColor="var(--secondary-color)"
        subtitle={`${resolvedCount} reunites completed`}
      >
        <div className="portal-metric-value" style={{ color: 'var(--secondary-color)' }}>
          {successRate}%
        </div>
      </PortalCard>

      <PortalCard
        title="Emergency Beacons"
        icon="campaign"
        iconColor="var(--warning-color)"
        accentColor="var(--warning-color)"
        subtitle="Geofenced broadcast channel"
      >
        <div className="portal-metric-value" style={{ color: 'var(--warning-color)' }}>
          {broadcastActive ? '1 Active' : '0 Standby'}
        </div>
      </PortalCard>
    </section>
  );
}

export default DashboardMetrics;
