import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// --- Hero Sub-Tab 1: FaceMatch Scanner Widget ---
const HeroFaceMatchTab = ({ isScanning, percent, activePerson, setIsScanning }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', justifyContent: 'space-between' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="landing-pulse-dot-green" />
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-color)' }}>
            Rescue AI FaceMatch v3.5
          </span>
        </div>
        <button 
          onClick={() => setIsScanning(!isScanning)} 
          className="landing-control-btn"
          style={{
            backgroundColor: isScanning ? 'rgba(234,67,53,0.1)' : 'rgba(52,168,83,0.1)',
            color: isScanning ? '#ea4335' : '#34a853',
            border: 'none',
            fontSize: '11px',
            padding: '4px 8px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          {isScanning ? 'Pause Scan' : 'Resume Scan'}
        </button>
      </div>

      {/* Scanner Panel */}
      <div className="landing-scanner-panel" style={{ padding: '12px', gap: '12px' }}>
        <div className="landing-face-placeholder" style={{ width: '80px', height: '80px' }}>
          <span className="material-symbols-rounded landing-face-icon" style={{
            color: activePerson.color,
            fontSize: '54px',
            animation: isScanning ? 'scanPulse 1.5s infinite ease-in-out' : 'none'
          }}>
            face
          </span>
          {isScanning && <div className="landing-scanning-line" />}
        </div>

        <div className="landing-match-report" style={{ gap: '4px' }}>
          <div className="landing-match-percent">
            <span className="landing-percent-number" style={{ fontSize: '18px' }}>
              {isScanning ? percent : activePerson.match}%
            </span>
            <span className="landing-percent-label" style={{ fontSize: '10px' }}>
              Neural Match Confidence
            </span>
          </div>
          <div className="landing-match-progress" style={{ height: '4px' }}>
            <div className="landing-match-progress-bar" style={{
              width: `${isScanning ? percent : activePerson.match}%`,
              backgroundColor: activePerson.color
            }} />
          </div>
        </div>
      </div>

      {/* Result Card */}
      <div className="landing-result-card" style={{ padding: '8px 12px', gap: '12px' }}>
        <div className="landing-result-avatar" style={{ backgroundColor: activePerson.color, width: '32px', height: '32px', fontSize: '12px' }}>
          {activePerson.initials}
        </div>
        <div className="landing-result-details" style={{ gap: '2px' }}>
          <div className="landing-result-row">
            <span className="landing-result-name" style={{ fontSize: '13.5px' }}>{activePerson.name}</span>
            <span className="landing-result-badge" style={{
              backgroundColor: activePerson.status === 'Reunited' ? 'rgba(52, 168, 83, 0.12)' : 'rgba(26, 115, 232, 0.12)',
              color: activePerson.status === 'Reunited' ? '#137333' : '#1a73e8',
              padding: '2px 6px',
              fontSize: '10px'
            }}>
              {activePerson.status}
            </span>
          </div>
          <div className="landing-result-meta" style={{ fontSize: '11px' }}>
            <span>Age: {activePerson.age}</span>
            <span className="landing-meta-dot">•</span>
            <span>{activePerson.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Hero Sub-Tab 2: Live Tracking Map logs ---
const HeroMapTab = () => {
  const alerts = [
    { id: '#1842', location: 'Lahore, Sector Y', volunteers: 240, status: 'Active Dispatch', color: '#1a73e8' },
    { id: '#1841', location: 'Islamabad, Sector G-11', volunteers: 185, status: 'Active Dispatch', color: '#1a73e8' },
    { id: '#1839', location: 'Karachi, Clifton', volunteers: 412, status: 'Reunited', color: '#34a853' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', pb: '8px' }}>
        <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-color)' }}>
          Live Regional Dispatch Log
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(52, 168, 83, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
          <div className="landing-pulse-dot-green" />
          <span style={{ fontSize: '10px', color: '#34a853', fontWeight: 700 }}>837 Volunteers Online</span>
        </div>
      </div>

      <div className="landing-map-logs" style={{ gap: '8px' }}>
        {alerts.map((alert, idx) => (
          <div key={idx} className="landing-map-log-item" style={{ padding: '8px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '18px', color: alert.color }}>
                {alert.status === 'Reunited' ? 'handshake' : 'my_location'}
              </span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '12px' }}>Case {alert.id}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-light)' }}>
                  {alert.location} • {alert.volunteers} Dispatched
                </div>
              </div>
            </div>
            <span className="landing-map-log-badge" style={{
              backgroundColor: alert.status === 'Reunited' ? 'rgba(52, 168, 83, 0.12)' : 'rgba(26, 115, 232, 0.12)',
              color: alert.status === 'Reunited' ? '#34a853' : '#1a73e8'
            }}>
              {alert.status}
            </span>
          </div>
        ))}
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 12px',
        borderRadius: '8px',
        backgroundColor: 'rgba(26, 115, 232, 0.05)',
        borderLeft: '4px solid var(--primary-color)'
      }}>
        <span className="material-symbols-rounded" style={{ fontSize: '18px', color: 'var(--primary-color)' }}>info</span>
        <span style={{ fontSize: '10.5px', color: 'var(--primary-dark)', fontWeight: 500, lineHeight: 1.4 }}>
          Coordinates synchronized. Average volunteer arrival at sighting: <strong>14 minutes</strong>.
        </span>
      </div>
    </div>
  );
};

// --- Hero Sub-Tab 3: Analytics stats list ---
const HeroAnalyticsTab = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', height: '100%', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', pb: '8px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--primary-color)' }}>
          National Network Analytics
        </span>
        <span style={{ fontSize: '10px', color: 'var(--text-light)', fontWeight: 500 }}>Real-time</span>
      </div>

      <div className="landing-analytics-grid">
        <div className="landing-analytics-chart-bar" style={{ gap: '10px' }}>
          <div className="landing-chart-bar-row">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600 }}>
              <span>Reunited Rate</span>
              <span>92%</span>
            </div>
            <div className="landing-chart-bar-track">
              <div className="landing-chart-bar-fill" style={{ width: '92%', backgroundColor: '#34a853' }} />
            </div>
          </div>
          <div className="landing-chart-bar-row">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600 }}>
              <span>Search Precision</span>
              <span>99.4%</span>
            </div>
            <div className="landing-chart-bar-track">
              <div className="landing-chart-bar-fill" style={{ width: '99%', backgroundColor: 'var(--primary-color)' }} />
            </div>
          </div>
          <div className="landing-chart-bar-row">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600 }}>
              <span>Broadcast Speed</span>
              <span>&lt; 2 mins</span>
            </div>
            <div className="landing-chart-bar-track">
              <div className="landing-chart-bar-fill" style={{ width: '85%', backgroundColor: '#f9ab00' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: '56px', height: '56px' }}>
            <svg width="56" height="56" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(26,115,232,0.06)" strokeWidth="3.5" />
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--primary-color)" strokeWidth="3.5" strokeDasharray="92, 100" strokeLinecap="round" />
            </svg>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 700
            }}>
              92%
            </div>
          </div>
          <span style={{ fontSize: '9px', fontWeight: 700, marginTop: '6px', textAlign: 'center', textTransform: 'uppercase', color: 'var(--text-light)' }}>
            REUNIONS
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', borderTop: '1px solid var(--border-color)', pt: '8px' }}>
        <span>Active Cases: <strong>240</strong></span>
        <span>Reunited Cities: <strong>48+</strong></span>
      </div>
    </div>
  );
};

// --- Main Hero Section ---
function HeroSection() {
  const [activeTab, setActiveTab] = useState('facematch');
  const [scanIndex, setScanIndex] = useState(0);
  const [percent, setPercent] = useState(78);
  const [isScanning, setIsScanning] = useState(true);

  // Simulated Scanning Database
  const scannedPeople = [
    { name: "Alex Mercer", age: 24, location: "New York, NY", match: 98.4, status: "Located", initials: "AM", color: "#1a73e8" },
    { name: "Sarah Connor", age: 31, location: "Los Angeles, CA", match: 99.2, status: "Reunited", initials: "SC", color: "#34a853" },
    { name: "Marcus Wright", age: 40, location: "Chicago, IL", match: 95.7, status: "Located", initials: "MW", color: "#ea4335" },
    { name: "Elena Gilbert", age: 19, location: "Boston, MA", match: 97.9, status: "Reunited", initials: "EG", color: "#f9ab00" }
  ];

  useEffect(() => {
    let interval;
    if (isScanning && activeTab === 'facematch') {
      interval = setInterval(() => {
        setScanIndex((prev) => (prev + 1) % scannedPeople.length);
        setPercent(Math.floor(Math.random() * 15) + 85);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isScanning, activeTab]);

  const activePerson = scannedPeople[scanIndex];

  return (
    <section className="landing-hero-section">
      {/* Left Column Text */}
      <div className="landing-hero-text">
        <div className="landing-hero-badge">
          <span className="material-symbols-rounded landing-hero-badge-icon" style={{ fontSize: '15px' }}>
            offline_pin
          </span>
          <span>Pakistan's #1 Emergency Reunification Network</span>
        </div>
        
        <h1 className="landing-hero-title">
          Reunite families through the <span className="landing-hero-gradient-text">power of AI</span>
        </h1>
        
        <p className="landing-hero-subtitle">
          Rescue integrates state-of-the-art neural networks, global volunteer networks, 
          and real-time alerts to locate and safely reunite missing persons.
        </p>
        
        <div className="landing-hero-actions">
          <Link to="/register" className="landing-btn-primary btnPrimary">
            Get Started
            <span className="material-symbols-rounded" style={{ marginLeft: '8px', fontSize: '18px' }}>
              arrow_forward
            </span>
          </Link>
          <Link to="/login" className="landing-btn-secondary btnSecondary">
            Sign In
          </Link>
        </div>

        {/* Security Trust Indicators */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', marginTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-light)', fontSize: '12px', fontWeight: 500 }}>
            <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>lock</span>
            Secure Custody
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-light)', fontSize: '12px', fontWeight: 500 }}>
            <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>verified_user</span>
            256-bit Encrypted
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-light)', fontSize: '12px', fontWeight: 500 }}>
            <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>policy</span>
            GDPR Aligned
          </div>
        </div>
      </div>

      {/* Right Column: Workstation Mockup Widget */}
      <div className="landing-hero-widget">
        <div className="landing-mockup-card">
          {/* Sidebar icon column (Desktop/Tablet only) */}
          <div className="landing-mockup-sidebar">
            <div className="landing-mockup-sidebar-logo">
              <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>hub</span>
            </div>
            <div 
              onClick={() => setActiveTab('facematch')}
              className={`landing-mockup-sidebar-icon ${activeTab === 'facematch' ? 'active' : ''}`}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>face</span>
            </div>
            <div 
              onClick={() => setActiveTab('map')}
              className={`landing-mockup-sidebar-icon ${activeTab === 'map' ? 'active' : ''}`}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>map</span>
            </div>
            <div 
              onClick={() => setActiveTab('analytics')}
              className={`landing-mockup-sidebar-icon ${activeTab === 'analytics' ? 'active' : ''}`}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>bar_chart</span>
            </div>
          </div>

          {/* Main content grid */}
          <div className="landing-mockup-main">
            {/* Header tab controller */}
            <div className="landing-mockup-header">
              <div className="landing-mockup-tabs">
                <button 
                  onClick={() => setActiveTab('facematch')}
                  className={`landing-mockup-tab ${activeTab === 'facematch' ? 'active' : ''}`}
                >
                  FaceMatch
                </button>
                <button 
                  onClick={() => setActiveTab('map')}
                  className={`landing-mockup-tab ${activeTab === 'map' ? 'active' : ''}`}
                >
                  Live Map
                </button>
                <button 
                  onClick={() => setActiveTab('analytics')}
                  className={`landing-mockup-tab ${activeTab === 'analytics' ? 'active' : ''}`}
                >
                  Analytics
                </button>
              </div>
              <div className="landing-mockup-header-right">
                <div className="landing-pulse-dot-green" />
                <div className="landing-mockup-avatar">
                  <span>AI</span>
                </div>
              </div>
            </div>

            {/* Sub-tab viewport */}
            <div className="landing-mockup-body">
              {activeTab === 'facematch' && (
                <HeroFaceMatchTab 
                  isScanning={isScanning} 
                  percent={percent} 
                  activePerson={activePerson} 
                  setIsScanning={setIsScanning} 
                />
              )}
              {activeTab === 'map' && <HeroMapTab />}
              {activeTab === 'analytics' && <HeroAnalyticsTab />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
