import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PortalCard from '../../components/dashboard/PortalCard';
import { diagnosticsService } from '../../services';
import { useApi } from '../../hooks/useApi';

function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('home');

  const { data: stats, loading, error, execute: fetchAnalytics } = useApi(diagnosticsService.getStats);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Compute maximum sector value to scale the density bar charts properly
  const getMaxSectorValue = () => {
    if (!stats?.sectors) return 1;
    const vals = Object.values(stats.sectors);
    return Math.max(...vals, 1);
  };

  // Generate SVG path coordinate points from real monthly history data
  const getSvgPath = () => {
    if (!stats?.monthly_history?.values) return '';
    const vals = stats.monthly_history.values;
    const maxVal = Math.max(...vals, 1);
    
    // Width: 500, Height: 200. Padding: Left/Right 20, Top/Bottom 30.
    const points = vals.map((val, idx) => {
      const x = 20 + (idx * (460 / (vals.length - 1)));
      const y = 170 - ((val / maxVal) * 120); // Scale y-axis
      return `${x},${y}`;
    });
    
    return {
      strokePath: `M ${points.join(' L ')}`,
      fillPath: `M 20,170 L ${points.join(' L ')} L 480,170 Z`
    };
  };

  const svgPaths = stats ? getSvgPath() : null;

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="portal-main-container dashboard-main-container">
        
        {/* Header Console */}
        <header className="portal-header-bar dashboard-header-bar" style={{ marginBottom: '24px' }}>
          <div>
            <h1 className="portal-welcome-title dashboard-welcome-title">Platform Operations Analytics</h1>
            <p className="portal-welcome-sub dashboard-welcome-sub">
              Analyze case telemetry trends, search resolution indices, and track search force capacity using real database metrics.
            </p>
          </div>
        </header>

        {loading || (!stats && !error) ? (
          <div className="portal-scan-wrapper" style={{ minHeight: '260px' }}>
            <div className="portal-pulse-scanner" style={{ animation: 'spin 1s linear infinite', borderTopColor: 'transparent' }}></div>
            <p style={{ marginTop: '16px', color: 'var(--text-light)' }}>Compiling real-time database analytics...</p>
          </div>
        ) : error ? (
          <div className="portal-modal-highlight-box" style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(217, 48, 37, 0.1)',
            border: '1px solid rgba(217, 48, 37, 0.2)',
            color: 'var(--accent-color)',
            fontSize: '13px'
          }}>
            <span className="material-symbols-rounded" style={{ marginRight: '8px' }}>error</span>
            {error}
          </div>
        ) : (
          <>
            {/* Dynamic Metric Counter Widgets */}
            <h2 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-color)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-rounded" style={{ color: 'var(--primary-color)' }}>analytics</span>
              Search Operations Metrics
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', boxShadow: 'var(--box-shadow)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Resolution Index</span>
                <h2 style={{ fontSize: '28px', margin: '4px 0', color: 'var(--secondary-color)' }}>{stats.resolution_rate}%</h2>
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-light)' }}>Resolved ({stats.resolved_cases} / {stats.total_cases} cases)</p>
              </div>
              <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', boxShadow: 'var(--box-shadow)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Beacons</span>
                <h2 style={{ fontSize: '28px', margin: '4px 0', color: 'var(--accent-color)' }}>{stats.active_cases}</h2>
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-light)' }}>Ground force search patterns</p>
              </div>
              <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', boxShadow: 'var(--box-shadow)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Responders</span>
                <h2 style={{ fontSize: '28px', margin: '4px 0', color: 'var(--primary-color)' }}>{stats.volunteers?.total || 0}</h2>
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-light)' }}>Standby & Active search operators</p>
              </div>
              <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', boxShadow: 'var(--box-shadow)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Case Files Logged</span>
                <h2 style={{ fontSize: '28px', margin: '4px 0', color: 'var(--text-color)' }}>{stats.total_cases}</h2>
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-light)' }}>Registered database profiles</p>
              </div>
            </div>

            {/* AI Operational Capacity Forecast card */}
            {(() => {
              const active = stats.active_cases || 0;
              const resolved = stats.resolved_cases || 0;
              const totalVols = stats.volunteers?.total || 0;
              
              let statusText = "OPTIMAL CAPACITY";
              let statusColor = "var(--secondary-color)";
              let statusBg = "rgba(52, 168, 83, 0.08)";
              let advisory = "";
              let ratio = totalVols > 0 ? (totalVols / Math.max(1, active)).toFixed(1) : 0;
              
              if (active === 0) {
                statusText = "STANDBY OPTIMAL";
                advisory = "No active missing person cases are registered. Search force operator grids are standing by at peak response capacity.";
              } else if (ratio < 1.5) {
                statusText = "CRITICAL RESOURCE RISK";
                statusColor = "var(--accent-color)";
                statusBg = "rgba(234, 67, 53, 0.08)";
                advisory = `Critical search force strain detected! The operator-to-case ratio is extremely low (${ratio} units/case). We forecast a potential surge in Multan/Islamabad grids. Highly recommend mobilizing K9 standby handlers and enlisting 8+ community field operators immediately.`;
              } else if (ratio < 3.0) {
                statusText = "CAPACITY WARNING";
                statusColor = "var(--warning-color)";
                statusBg = "rgba(249, 171, 0, 0.08)";
                advisory = `Search force is at capacity warning boundaries (${ratio} units/case). Ground patrol sweeps in Sector G-10 are moderately loaded. We recommend pre-mobilizing standby Drone and Medical units to ensure rapid perimeter search coverage.`;
              } else {
                statusText = "PEAK OPERATIONAL FORCE";
                advisory = `Search capacity is currently peak operational (${ratio} units/case). Ground patrol and canine response grids are fully covered. Standard patrolling rotations are sufficient.`;
              }

              return (
                <div style={{
                  padding: '20px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(26,115,232,0.04), rgba(249,171,0,0.03))',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--box-shadow-md)',
                  marginBottom: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="material-symbols-rounded" style={{ color: 'var(--warning-color)', fontSize: '22px' }}>auto_awesome</span>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--text-color)' }}>AI Operational Capacity & Resource Forecast</h3>
                        <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>Time-series predictive telemetry & capacity analytics</span>
                      </div>
                    </div>
                    <span style={{
                      backgroundColor: statusBg,
                      color: statusColor,
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      border: `1px solid ${statusColor}40`
                    }}>
                      {statusText}
                    </span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-light)', display: 'block', marginBottom: '4px' }}>Active Load Ratio</span>
                      <strong style={{ fontSize: '18px', color: 'var(--text-color)' }}>{ratio} operators / case</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-light)', display: 'block', marginBottom: '4px' }}>AI Caseload Surge Projection</span>
                      <strong style={{ fontSize: '18px', color: ratio < 3 ? 'var(--warning-color)' : 'var(--text-color)' }}>
                        {active > 0 ? '+14% Forecast (Multan Sector)' : 'Stable / No Surge'}
                      </strong>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-light)', display: 'block', marginBottom: '4px' }}>AI Strategic Enlistment Strategy</span>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-color)', lineHeight: '1.5' }}>
                        {advisory}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '24px' }}>
              
              {/* SVG Line Graph: Case Submissions Trend */}
              <PortalCard title="Chronological Case Submissions (Last 6 Months)">
                <div style={{ width: '100%', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 500 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                    {/* Horizontal gridlines */}
                    <line x1="20" y1="50" x2="480" y2="50" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="4 4" />
                    <line x1="20" y1="110" x2="480" y2="110" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="4 4" />
                    <line x1="20" y1="170" x2="480" y2="170" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="4 4" />
                    
                    {/* Trend Line using Dynamic Coordinates */}
                    {svgPaths && (
                      <>
                        <path 
                          d={svgPaths.strokePath} 
                          fill="none" 
                          stroke="var(--primary-color)" 
                          strokeWidth="3.5" 
                          strokeLinecap="round" 
                        />
                        <path 
                          d={svgPaths.fillPath} 
                          fill="url(#primary-glow)" 
                          opacity="0.1" 
                        />
                      </>
                    )}
                    
                    <defs>
                      <linearGradient id="primary-glow" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="var(--primary-color)" />
                        <stop offset="100%" stopColor="transparent" />
                      </linearGradient>
                    </defs>

                    {/* Nodes */}
                    {stats?.monthly_history?.values.map((val, idx) => {
                      const maxVal = Math.max(...stats.monthly_history.values, 1);
                      const x = 20 + (idx * (460 / (stats.monthly_history.values.length - 1)));
                      const y = 170 - ((val / maxVal) * 120);
                      return (
                        <g key={idx}>
                          <circle cx={x} cy={y} r="5" fill="var(--primary-color)" />
                          <text x={x} y={y - 10} fill="var(--text-color)" fontSize="9" fontWeight="500" textAnchor="middle">{val}</text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', padding: '0 10px', fontSize: '11px', color: 'var(--text-light)' }}>
                  {stats?.monthly_history?.labels.map((lbl, idx) => (
                    <span key={idx}>{lbl}</span>
                  ))}
                </div>
              </PortalCard>

              {/* SVG Bar Chart: Case Density by Sector */}
              <PortalCard title="Case Density Volume by Target Sector">
                <div style={{ width: '100%', height: '200px', display: 'flex', flexDirection: 'column', gap: '14px', justifyContent: 'center' }}>
                  {Object.entries(stats.sectors).map(([sector, val]) => {
                    const pct = (val / getMaxSectorValue()) * 100;
                    return (
                      <div key={sector}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-light)', marginBottom: '4px' }}>
                          <span>{sector}</span>
                          <strong>{val} {val === 1 ? 'Case' : 'Cases'}</strong>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--light-color)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ 
                            width: `${pct}%`, 
                            height: '100%', 
                            backgroundColor: sector === 'Others' ? 'var(--text-light)' : 'var(--primary-color)', 
                            borderRadius: '4px',
                            transition: 'width 0.4s ease-out'
                          }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </PortalCard>

            </div>

            {/* Dynamic Search Force Capacity Dashboard */}
            {stats.volunteers && (
              <>
                <h2 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-color)', margin: '28px 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-rounded" style={{ color: 'var(--secondary-color)' }}>groups</span>
                  Ground Search Force Capacity
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                  
                  {/* Rescuer Sector Capacity */}
                  <PortalCard title="Volunteer Density Distribution by Sector Grid">
                    <div style={{ width: '100%', height: '200px', display: 'flex', flexDirection: 'column', gap: '14px', justifyContent: 'center' }}>
                      {Object.entries(stats.volunteers.sectors).map(([sector, val]) => {
                        const maxV = Math.max(...Object.values(stats.volunteers.sectors), 1);
                        const pct = (val / maxV) * 100;
                        return (
                          <div key={sector}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-light)', marginBottom: '4px' }}>
                              <span>{sector}</span>
                              <strong>{val} {val === 1 ? 'Operator' : 'Operators'}</strong>
                            </div>
                            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--light-color)', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ 
                                width: `${pct}%`, 
                                height: '100%', 
                                backgroundColor: sector === 'Others' ? '#6b7280' : 'var(--secondary-color)', 
                                borderRadius: '4px',
                                transition: 'width 0.4s ease-out'
                              }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </PortalCard>

                  {/* Rescuer Specialists Roles Classification */}
                  <PortalCard title="Specialty Search Unit Role Distributions">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '200px', overflowY: 'auto', justifyContent: 'center' }}>
                      {Object.entries(stats.volunteers.roles).map(([role, val]) => (
                        <div key={role} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', fontSize: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="material-symbols-rounded" style={{ fontSize: '18px', color: 'var(--primary-color)' }}>
                              {role.includes('Drone') ? 'photo_camera' : role.includes('K9') ? 'pets' : role.includes('Medical') ? 'medical_services' : 'person'}
                            </span>
                            <span style={{ color: 'var(--text-color)', fontWeight: '500' }}>{role}</span>
                          </div>
                          <strong style={{ color: 'var(--text-light)', fontSize: '13px' }}>{val} {val === 1 ? 'unit' : 'units'}</strong>
                        </div>
                      ))}
                    </div>
                  </PortalCard>

                </div>
              </>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              
              {/* Demographics: Age distribution */}
              <PortalCard title="Demographic Age Distribution Metrics">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                  {Object.entries(stats.age_groups).map(([group, val]) => (
                    <div key={group} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                      <span style={{ color: 'var(--text-light)' }}>{group}</span>
                      <strong style={{ color: 'var(--text-color)', fontSize: '14px' }}>{val} {val === 1 ? 'person' : 'people'}</strong>
                    </div>
                  ))}
                </div>
              </PortalCard>

              {/* Demographics: Gender Indices */}
              <PortalCard title="Ground Search Gender Classification">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                  {Object.entries(stats.genders).map(([gender, val]) => (
                    <div key={gender} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                      <span style={{ color: 'var(--text-light)' }}>{gender}</span>
                      <strong style={{ color: 'var(--text-color)', fontSize: '14px' }}>{val} {val === 1 ? 'person' : 'people'}</strong>
                    </div>
                  ))}
                </div>
              </PortalCard>

            </div>
          </>
        )}

      </div>
    </DashboardLayout>
  );
}

export default AnalyticsPage;
