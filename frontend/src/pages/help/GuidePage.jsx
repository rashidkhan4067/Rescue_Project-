import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PortalCard from '../../components/dashboard/PortalCard';

const GUIDE_PHASES = [
  {
    title: 'Phase 1: Search & Verify (Immediate Action)',
    description: 'Before raising a public alarm, perform these essential check-ins quietly but quickly.',
    icon: 'search',
    color: '#1a73e8',
    bg: 'rgba(26,115,232,0.08)',
    steps: [
      { id: 'p1_s1', text: 'Search the immediate vicinity thoroughly, including rooms, closets, backyard, and neighboring areas.' },
      { id: 'p1_s2', text: 'Call close friends, family members, classmates, or coworkers to see if they have heard from them.' },
      { id: 'p1_s3', text: 'Check the last known location they visited or their route home if they are late.' },
      { id: 'p1_s4', text: 'Verify if they left a note, sent a text, or left any other clue about their plans.' }
    ]
  },
  {
    title: 'Phase 2: Official Reporting (Critical Steps)',
    description: 'Do not wait 24 hours. In Pakistan, missing children and emergency reports should be registered immediately.',
    icon: 'gavel',
    color: '#ea4335',
    bg: 'rgba(234,67,53,0.08)',
    steps: [
      { id: 'p2_s1', text: 'Call Police Helpline 15 or Rescue 1122 to report the situation and get emergency guidance.' },
      { id: 'p2_s2', text: 'Go to your nearest Police Station to file a formal Missing Person Report (First Information Report - FIR).' },
      { id: 'p2_s3', text: 'Register the case on this Rescue Portal with accurate details, photos, and clothing information.' },
      { id: 'p2_s4', text: 'Contact the Child Protection & Welfare Bureau helpline (1121) if the missing person is a child.' }
    ]
  },
  {
    title: 'Phase 3: Community Search & Support',
    description: 'Mobilize the power of the community to expand the search grid and raise awareness.',
    icon: 'share',
    color: '#34a853',
    bg: 'rgba(52,168,83,0.08)',
    steps: [
      { id: 'p3_s1', text: 'Download and print the "Missing Bulletin Poster" directly from this portal to distribute in local areas.' },
      { id: 'p3_s2', text: 'Share the portal link on WhatsApp groups, Facebook, and Instagram to notify local residents.' },
      { id: 'p3_s3', text: 'Activate the Volunteer Rescue Grid on our portal to ask nearby registered volunteers to stay alert.' },
      { id: 'p3_s4', text: 'Keep your phone line free and designate a single point of contact for any received tips or sights.' }
    ]
  }
];

const GATHER_CHECKLIST = [
  { label: 'Recent clear photo', detail: 'A high-quality close-up face photo showing recent appearance.' },
  { label: 'Physical dimensions', detail: 'Approximate height, weight, build, eye color, and hair style.' },
  { label: 'Last seen clothing', detail: 'Color and style of shirt, pants, footwear, glasses, or accessories.' },
  { label: 'Distinguishing features', detail: 'Scars, birthmarks, tattoos, dental braces, or unique walking habits.' },
  { label: 'Medical conditions', detail: 'Critical details like regular medications required, allergy alerts, or mental health status.' },
  { label: 'Belongings carried', detail: 'Did they carry a mobile phone, bag, ID card, keys, or pocket money?' }
];

function GuidePage() {
  const [activeTab, setActiveTab] = useState('home');
  const [completedSteps, setCompletedSteps] = useState({});
  const [completedGather, setCompletedGather] = useState({});

  const toggleStep = (stepId) => {
    setCompletedSteps(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  const toggleGather = (index) => {
    setCompletedGather(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const calculateProgress = () => {
    const totalSteps = GUIDE_PHASES.reduce((sum, phase) => sum + phase.steps.length, 0);
    const completedCount = Object.values(completedSteps).filter(Boolean).length;
    return Math.round((completedCount / totalSteps) * 100);
  };

  const progress = calculateProgress();

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="portal-main-container dashboard-main-container">
        
        {/* Header */}
        <header className="portal-header-bar dashboard-header-bar" style={{ marginBottom: '28px' }}>
          <div>
            <h1 className="portal-welcome-title dashboard-welcome-title">How to Report Guide</h1>
            <p className="portal-welcome-sub dashboard-welcome-sub">
              Clear, step-by-step instructions on what to do when someone goes missing. Keep calm and follow these steps.
            </p>
          </div>
          
          {/* Progress Tracker Widget */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '6px',
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px', padding: '12px 20px', minWidth: '220px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: '600' }}>YOUR PROGRESS</span>
              <span style={{ fontSize: '14px', color: 'var(--primary-color)', fontWeight: '700' }}>{progress}% Done</span>
            </div>
            <div style={{ width: '100%', height: '8px', borderRadius: '4px', backgroundColor: 'var(--light-dark)', overflow: 'hidden' }}>
              <div style={{ 
                width: `${progress}%`, height: '100%', 
                backgroundColor: 'var(--primary-color)', 
                transition: 'width 0.4s ease-out',
                borderRadius: '4px'
              }} />
            </div>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '28px', alignItems: 'flex-start' }} className="guide-responsive-grid">
          
          {/* Main Chronological Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {GUIDE_PHASES.map((phase, phaseIndex) => (
              <div key={phase.title} style={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: 'var(--box-shadow)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '8px',
                    backgroundColor: phase.bg, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0
                  }}>
                    <span className="material-symbols-rounded" style={{ color: phase.color, fontSize: '20px' }}>{phase.icon}</span>
                  </div>
                  <div>
                    <h2 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-color)', margin: 0 }}>
                      {phase.title}
                    </h2>
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-light)', margin: '0 0 20px 0', lineHeight: '1.5' }}>
                  {phase.description}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {phase.steps.map((step) => {
                    const isDone = !!completedSteps[step.id];
                    return (
                      <div 
                        key={step.id} 
                        onClick={() => toggleStep(step.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          padding: '12px 16px',
                          backgroundColor: isDone ? 'rgba(52, 168, 83, 0.04)' : 'var(--light-color)',
                          border: `1px solid ${isDone ? 'rgba(52, 168, 83, 0.2)' : 'var(--border-color)'}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        <span 
                          className="material-symbols-rounded" 
                          style={{ 
                            color: isDone ? '#34a853' : 'var(--text-light)', 
                            fontSize: '20px',
                            userSelect: 'none',
                            marginTop: '1px'
                          }}
                        >
                          {isDone ? 'check_box' : 'check_box_outline_blank'}
                        </span>
                        <span style={{ 
                          fontSize: '13px', 
                          color: isDone ? 'var(--text-light)' : 'var(--text-color)',
                          textDecoration: isDone ? 'line-through' : 'none',
                          lineHeight: '1.6',
                          transition: 'all 0.15s'
                        }}>
                          {step.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Detail: Critical Information to Gather */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div style={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: 'var(--box-shadow)'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-color)', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-rounded" style={{ color: 'var(--warning-color)', fontSize: '20px' }}>assignment_late</span>
                Details to Prepare
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-light)', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                Collect these details immediately. Having them ready makes it easier for help centers and volunteers to support you.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {GATHER_CHECKLIST.map((item, index) => {
                  const isChecked = !!completedGather[index];
                  return (
                    <div 
                      key={item.label}
                      onClick={() => toggleGather(index)}
                      style={{
                        padding: '12px',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        backgroundColor: isChecked ? 'rgba(52,168,83,0.02)' : 'transparent',
                        borderColor: isChecked ? 'rgba(52,168,83,0.2)' : 'var(--border-color)',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span className="material-symbols-rounded" style={{ 
                          fontSize: '18px', 
                          color: isChecked ? '#34a853' : 'var(--text-light)',
                        }}>
                          {isChecked ? 'task_alt' : 'radio_button_unchecked'}
                        </span>
                        <strong style={{ 
                          fontSize: '12px', 
                          color: isChecked ? 'var(--text-light)' : 'var(--text-color)',
                          textDecoration: isChecked ? 'line-through' : 'none',
                        }}>
                          {item.label}
                        </strong>
                      </div>
                      <p style={{ 
                        margin: 0, 
                        fontSize: '11px', 
                        color: 'var(--text-light)', 
                        paddingLeft: '26px',
                        lineHeight: '1.4' 
                      }}>
                        {item.detail}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Warning Card */}
            <PortalCard>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span className="material-symbols-rounded" style={{ color: 'var(--accent-color)', fontSize: '20px', flexShrink: 0, marginTop: '2px' }}>report_problem</span>
                <div>
                  <strong style={{ fontSize: '13px', color: 'var(--text-color)', display: 'block', marginBottom: '4px' }}>Do Not Wait</strong>
                  <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-light)', lineHeight: '1.5' }}>
                    It is a common myth that you must wait 24 hours to report a missing person. Time is of the essence. Report immediately to local authorities and here on our platform.
                  </p>
                </div>
              </div>
            </PortalCard>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}

export default GuidePage;
