import React, { useState, useEffect } from 'react';

// --- Interactive Simulation Widgets ---

const FacialGeometryWidget = () => {
  const [dots, setDots] = useState([]);
  
  useEffect(() => {
    // Generate some random simulated face vector landmark coordinates
    const interval = setInterval(() => {
      const newDots = Array.from({ length: 6 }, () => ({
        x: Math.floor(Math.random() * 80) + 10,
        y: Math.floor(Math.random() * 60) + 10,
      }));
      setDots(newDots);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mini-widget-box" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div className="mini-scanning-container">
        <div className="mini-scanning-face">
          <span className="material-symbols-rounded" style={{ fontSize: '40px', color: 'var(--primary-color)' }}>
            face
          </span>
          <div className="mini-scanning-line" />
          
          {/* Simulated Landmark Dot Vectors */}
          {dots.map((dot, i) => (
            <div 
              key={i} 
              style={{
                position: 'absolute',
                left: `${dot.x}%`,
                top: `${dot.y}%`,
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                backgroundColor: '#34a853',
                boxShadow: '0 0 4px #34a853',
                transition: 'all 0.5s ease-in-out'
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ fontSize: '11px', color: 'var(--text-light)', fontFamily: 'monospace', textAlign: 'center' }}>
        Landmarks: {dots.length > 0 ? dots.map(d => `[${d.x},${d.y}]`).slice(0, 2).join(' ') + '...' : 'Processing...'}
        <div style={{ color: '#34a853', fontWeight: 600, marginTop: '4px' }}>AI VECTORS: STABLE</div>
      </div>
    </div>
  );
};

const DataCustodyWidget = () => {
  return (
    <div className="mini-widget-box" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-rounded" style={{ color: '#34a853', fontSize: '20px' }}>lock</span>
          <span style={{ fontSize: '11.5px', fontWeight: 700 }}>Security Vault</span>
        </div>
        <span style={{ fontSize: '9px', backgroundColor: 'rgba(52, 168, 83, 0.1)', color: '#34a853', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
          ACTIVE
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-light)' }}>Encryption Mode:</span>
          <strong style={{ fontFamily: 'monospace' }}>AES-256 GCM</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-light)' }}>Compliance standard:</span>
          <strong>GDPR & HIPAA</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-light)' }}>Access logs:</span>
          <strong style={{ color: '#34a853' }}>Audit Secure</strong>
        </div>
      </div>
    </div>
  );
};

const AreaBroadcastWidget = () => {
  return (
    <div className="mini-widget-box" style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
        <span style={{ fontSize: '12px', fontWeight: 600 }}>Emergency Broadcaster</span>
        <span className="landing-pulse-dot-green" />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1, margin: '6px 0' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: 'rgba(234, 67, 53, 0.1)',
          color: '#ea4335',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'scanPulse 1.5s infinite'
        }}>
          <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>podcasts</span>
        </div>
        <div>
          <div style={{ fontSize: '11.5px', fontWeight: 600 }}>Region: Lahore Cantonment</div>
          <div style={{ fontSize: '10px', color: 'var(--text-light)' }}>Geofence Broadcast: Enabled (5km)</div>
        </div>
      </div>

      <div style={{
        backgroundColor: 'rgba(26, 115, 232, 0.06)',
        padding: '6px 10px',
        borderRadius: '6px',
        fontSize: '10px',
        fontWeight: 500,
        color: 'var(--primary-dark)',
        textAlign: 'center',
        zIndex: 1
      }}>
        SMS Alerts delivered to 482 nearby agents
      </div>
    </div>
  );
};

const SmartNotificationsWidget = () => {
  return (
    <div className="mini-widget-box" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {/* Simulated notification overlays */}
        <div style={{
          padding: '6px 10px',
          borderRadius: '6px',
          backgroundColor: 'var(--bg-color)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <span className="material-symbols-rounded" style={{ color: '#ea4335', fontSize: '16px' }}>sms</span>
          <div style={{ fontSize: '9.5px', lineHeight: 1.2 }}>
            <strong>SMS Alert:</strong> Visual match sighted in Sector F-6.
          </div>
        </div>
        <div style={{
          padding: '6px 10px',
          borderRadius: '6px',
          backgroundColor: 'var(--bg-color)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <span className="material-symbols-rounded" style={{ color: '#f9ab00', fontSize: '16px' }}>notifications_active</span>
          <div style={{ fontSize: '9.5px', lineHeight: 1.2 }}>
            <strong>App Alert:</strong> Coord verified sightings route ready.
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Features Section ---

function FeaturesSection() {
  const [activeTab, setActiveTab] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Hook to track responsive viewport state without libraries
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize(); // trigger initially
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const features = [
    {
      icon: 'manage_search',
      title: 'Facial Geometry Matching',
      subtitle: 'Neural landmark analysis models',
      description: 'Our neural models translate facial photos into distinct vector mappings, indexing features regardless of light changes, aging, or posture.',
      color: '#1a73e8',
      bgColor: 'rgba(26,115,232,0.1)'
    },
    {
      icon: 'shield_lock',
      title: 'Secure Data Custody',
      subtitle: 'GDPR & HIPAA encryption standards',
      description: 'Enterprise-grade encryption protecting family records. Fully compliant with international GDPR and privacy regulations so safety remains private.',
      color: '#34a853',
      bgColor: 'rgba(52,168,83,0.1)'
    },
    {
      icon: 'public',
      title: 'Emergency Area Broadcast',
      subtitle: 'Geofenced coordinate alerts',
      description: 'Instantly map target locations to deploy alerts to local hospitals, volunteers, and security portals within the critical first hour.',
      color: '#ea4335',
      bgColor: 'rgba(234,67,53,0.1)'
    },
    {
      icon: 'notifications_active',
      title: 'Smart Notifications',
      subtitle: 'Instant dispatch channel alerts',
      description: 'Immediate SMS, email, and app pushes notify rescue networks. Maintain open lines for coordinates, sightings, and secure anonymous feedback.',
      color: '#f9ab00',
      bgColor: 'rgba(249,171,0,0.1)'
    }
  ];

  const renderWidget = (index) => {
    switch (index) {
      case 0:
        return <FacialGeometryWidget />;
      case 1:
        return <DataCustodyWidget />;
      case 2:
        return <AreaBroadcastWidget />;
      case 3:
        return <SmartNotificationsWidget />;
      default:
        return null;
    }
  };

  return (
    <section className="landing-features-section" id="features" style={{ scrollMarginTop: '80px' }}>
      {/* Header */}
      <div className="landing-features-header">
        <h2 className="landing-section-title">Engineered to bring them home</h2>
        <p className="landing-section-subtitle">
          Combining deep learning computer vision, high-speed regional broadcasting networks, 
          and secure infrastructure to deliver reliable, instant search responses.
        </p>
      </div>

      {isMobile ? (
        // --- Mobile Layout: Collapsible Accordion Stack ---
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {features.map((feature, idx) => {
            const isOpen = activeTab === idx;
            return (
              <div 
                key={idx} 
                className={`landing-accordion-item ${isOpen ? 'active' : ''}`}
                onClick={() => setActiveTab(isOpen ? -1 : idx)}
              >
                {/* Header Row */}
                <div className="landing-accordion-header">
                  <div 
                    className="landing-accordion-icon-box"
                    style={{
                      backgroundColor: isOpen ? feature.bgColor : undefined,
                      color: isOpen ? feature.color : undefined
                    }}
                  >
                    <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>
                      {feature.icon}
                    </span>
                  </div>
                  <h3 className="landing-accordion-title">{feature.title}</h3>
                  <span className="material-symbols-rounded landing-accordion-arrow" style={{ fontSize: '20px' }}>
                    expand_more
                  </span>
                </div>

                {/* Content Panel */}
                <div 
                  className="landing-accordion-content"
                  style={{
                    maxHeight: isOpen ? '400px' : '0',
                    opacity: isOpen ? '1' : '0'
                  }}
                >
                  <div className="landing-accordion-body" onClick={(e) => e.stopPropagation()}>
                    <p className="landing-accordion-text">{feature.description}</p>
                    {renderWidget(idx)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // --- Desktop Layout: Tab split view with side panel mockup ---
        <div style={{ display: 'grid', gridTemplateColumns: '40fr 60fr', gap: '40px', alignItems: 'stretch' }}>
          
          {/* Left Column: Interactive tabs list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {features.map((feature, idx) => {
              const isActive = activeTab === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  style={{
                    padding: '20px',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    position: 'relative',
                    backgroundColor: isActive ? 'var(--light-color)' : 'transparent',
                    border: isActive ? '1px solid var(--border-color)' : '1px solid transparent',
                    boxShadow: isActive ? '0 8px 24px rgba(0,0,0,0.02)' : 'none',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'flex-start'
                  }}
                >
                  {/* Left Active border bar indicator */}
                  {isActive && (
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: '25%',
                      height: '50%',
                      width: '4px',
                      borderRadius: '0 4px 4px 0',
                      backgroundColor: feature.color
                    }} />
                  )}

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: isActive ? feature.bgColor : 'var(--light-color)',
                    color: isActive ? feature.color : 'var(--text-light)',
                    transition: 'all 0.3s ease',
                    flexShrink: 0
                  }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>
                      {feature.icon}
                    </span>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-color)', margin: '0 0 4px 0' }}>
                      {feature.title}
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-light)', margin: 0, lineHeight: 1.4 }}>
                      {feature.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Simulated Workstation widget view */}
          <div style={{ display: 'flex' }}>
            <div style={{
              width: '100%',
              borderRadius: '24px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--card-bg)',
              boxShadow: '0 20px 45px rgba(0,0,0,0.03)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Fake Window OS Header */}
              <div style={{
                padding: '12px 24px',
                backgroundColor: 'var(--light-color)',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ea4335', opacity: 0.8 }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f9ab00', opacity: 0.8 }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#34a853', opacity: 0.8 }} />
                </div>
                <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-light)', letterSpacing: '0.5px' }}>
                  RESCUE SUITE CORE WORKSTATION
                </span>
                <div style={{ width: '38px' }} />
              </div>

              {/* Panel body */}
              <div style={{ padding: '32px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-color)', marginBottom: '8px' }}>
                    {features[activeTab].title}
                  </h3>
                  <p style={{ fontSize: '13.5px', color: 'var(--text-light)', lineHeight: 1.5, margin: 0 }}>
                    {features[activeTab].description}
                  </p>
                </div>

                {renderWidget(activeTab)}
              </div>
            </div>
          </div>

        </div>
      )}
    </section>
  );
}

export default FeaturesSection;
