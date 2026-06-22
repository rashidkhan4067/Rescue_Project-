import React, { useState } from 'react';

// --- Stepper Sub-Widgets ---

const StepSubmitIllustration = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ fontSize: '11px', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
        <span>Secure Upload Form</span>
        <span style={{ color: 'var(--primary-color)', fontFamily: 'monospace' }}>CASE_NEW</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '10.5px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-light)' }}>Name:</span>
          <strong>Ameer Hamza</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-light)' }}>Last Seen:</span>
          <strong>Lahore Cantt</strong>
        </div>
        <div style={{
          padding: '6px',
          borderRadius: '4px',
          backgroundColor: 'rgba(52, 168, 83, 0.1)',
          color: '#34a853',
          fontWeight: 600,
          textAlign: 'center',
          marginTop: '4px'
        }}>
          ✓ Face Landmark Vectors Generated
        </div>
      </div>
    </div>
  );
};

const StepSynthesisIllustration = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ fontSize: '11px', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
        <span>Database Vector Cross-Match</span>
        <span style={{ color: '#f9ab00', fontWeight: 700 }}>SYNTHESIZING</span>
      </div>
      
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-light)', marginBottom: '4px' }}>
          <span>Scanning 48,000+ Profiles</span>
          <span>100% Done</span>
        </div>
        <div style={{ height: '5px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: '100%', backgroundColor: '#f9ab00', transition: 'width 1s' }} />
        </div>
      </div>

      <div style={{
        padding: '6px 10px',
        borderRadius: '6px',
        backgroundColor: 'rgba(26, 115, 232, 0.05)',
        borderLeft: '3px solid var(--primary-color)',
        fontSize: '10px',
        fontWeight: 500
      }}>
        Match identified in Sector G-11, Islamabad (99.4%)
      </div>
    </div>
  );
};

const StepDispatchIllustration = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ fontSize: '11px', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
        <span>Geofenced Broadcasting</span>
        <span style={{ color: '#ea4335', fontWeight: 700 }}>DISPATCHING</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '4px 0' }}>
        <div style={{
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          backgroundColor: 'rgba(234, 67, 53, 0.1)',
          color: '#ea4335',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'scanPulse 1.2s infinite'
        }}>
          <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>rss_feed</span>
        </div>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 600 }}>Radius Target: 5 Kilometers</div>
          <div style={{ fontSize: '9.5px', color: 'var(--text-light)' }}>Dispatching to local search hubs</div>
        </div>
      </div>

      <div style={{
        padding: '6px',
        textAlign: 'center',
        backgroundColor: 'rgba(52, 168, 83, 0.1)',
        fontSize: '10px',
        color: '#34a853',
        fontWeight: 600,
        borderRadius: '4px'
      }}>
        ✓ SMS & App push alerts sent to 480 agents
      </div>
    </div>
  );
};

const StepReconnectionIllustration = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: 'rgba(52, 168, 83, 0.15)',
        color: '#34a853',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '4px',
        boxShadow: '0 0 10px rgba(52, 168, 83, 0.2)'
      }}>
        <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>task_alt</span>
      </div>
      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-color)' }}>
        Reunion Verified
      </span>
      <span style={{ fontSize: '10px', color: '#34a853', fontWeight: 600, backgroundColor: 'rgba(52, 168, 83, 0.1)', padding: '2px 8px', borderRadius: '10px' }}>
        CASE RESOLVED
      </span>
    </div>
  );
};

// --- Main Workflow Section ---

function WorkflowSection() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      number: '01',
      navLabel: 'Submit Case',
      title: 'Submit a Secure Case',
      description: 'Create a profile with essential descriptions, target location coordinates, and clear photographs. AI extracts facial landmark vectors on upload.',
      icon: 'rate_review'
    },
    {
      number: '02',
      navLabel: 'AI Synthesis',
      title: 'AI Coordinate Synthesis',
      description: 'Our backend vectors process landmarks, cross-referencing global databases in real-time to flag potential visual matches with high confidence.',
      icon: 'hub'
    },
    {
      number: '03',
      navLabel: 'Alert Dispatch',
      title: 'Localized Alert Dispatch',
      description: 'A geofenced broadcast goes live, dispatching urgent notifications, photos, and coordinates to community volunteers within the critical first hour.',
      icon: 'podcasts'
    },
    {
      number: '04',
      navLabel: 'Reconnection',
      title: 'Secure Reconnection',
      description: 'Anonymous sightings are routed to local coordinators, verified securely, and lead to safe, rapid reunions with families.',
      icon: 'handshake'
    }
  ];

  const renderIllustration = (index) => {
    switch (index) {
      case 0:
        return <StepSubmitIllustration />;
      case 1:
        return <StepSynthesisIllustration />;
      case 2:
        return <StepDispatchIllustration />;
      case 3:
        return <StepReconnectionIllustration />;
      default:
        return null;
    }
  };

  return (
    <section className="landing-workflow-section" id="how-it-works" style={{ scrollMarginTop: '80px' }}>
      {/* Section Header */}
      <div className="landing-section-header-centered">
        <h2 className="landing-section-title">How Rescue Works</h2>
        <p className="landing-section-subtitle">
          Our coordinate response network connects reports, AI computing power, and boots-on-the-ground volunteers instantly.
        </p>
      </div>

      {/* Stepper Pills Navigation Bar */}
      <div className="landing-stepper-pills">
        {steps.map((step, idx) => {
          const isActive = activeStep === idx;
          return (
            <button
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`landing-stepper-pill ${isActive ? 'active' : ''}`}
            >
              <div className="landing-stepper-pill-num">{step.number}</div>
              <span>{step.navLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Stepper Content Card Showcase */}
      <div style={{
        borderRadius: '20px',
        border: '1px solid var(--border-color)',
        backgroundColor: 'var(--card-bg)',
        boxShadow: '0 12px 35px rgba(0, 0, 0, 0.03)',
        padding: '24px',
        transition: 'all 0.3s'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'center' }}>
          {/* Left Text */}
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(26, 115, 232, 0.08)',
              color: 'var(--primary-color)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: '12px'
            }}>
              <span className="material-symbols-rounded" style={{ fontSize: '13px' }}>{steps[activeStep].icon}</span>
              PHASE {steps[activeStep].number}
            </div>
            
            <h4 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-color)', marginBottom: '10px' }}>
              {steps[activeStep].title}
            </h4>
            
            <p style={{ fontSize: '13.5px', lineHeight: 1.5, color: 'var(--text-light)', margin: 0 }}>
              {steps[activeStep].description}
            </p>
          </div>

          {/* Right Visual Widget */}
          <div style={{
            padding: '20px',
            borderRadius: '14px',
            backgroundColor: 'var(--light-color)',
            border: '1px solid var(--border-color)',
            minHeight: '140px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            {renderIllustration(activeStep)}
          </div>
        </div>
      </div>
    </section>
  );
}

export default WorkflowSection;
