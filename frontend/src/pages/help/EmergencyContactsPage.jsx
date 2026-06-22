import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PortalCard from '../../components/dashboard/PortalCard';

const EMERGENCY_CONTACTS = [
  {
    category: 'Emergency Services',
    color: '#ea4335',
    bg: 'rgba(234,67,53,0.08)',
    contacts: [
      { name: 'Rescue 1122', number: '1122', description: 'Emergency rescue and medical services across Punjab', available: '24/7', icon: 'emergency' },
      { name: 'Police Emergency', number: '15', description: 'Police emergency helpline for immediate assistance', available: '24/7', icon: 'local_police' },
      { name: 'Edhi Foundation', number: '115', description: 'Nationwide ambulance and rescue service', available: '24/7', icon: 'ambulance' },
    ]
  },
  {
    category: 'Missing Person Helplines',
    color: '#1a73e8',
    bg: 'rgba(26,115,232,0.08)',
    contacts: [
      { name: 'Child Protection Bureau', number: '1121', description: 'Specialized helpline for missing children cases', available: '24/7', icon: 'child_care' },
      { name: 'Pakistan Citizen Portal', number: '3939', description: 'Government portal for filing missing person complaints', available: '24/7', icon: 'phone_in_talk' },
      { name: 'Umang Helpline', number: '0317-4288665', description: 'NGO helpline focused on missing and exploited children', available: 'Mon–Sat 9am–6pm', icon: 'support_agent' },
    ]
  },
  {
    category: 'Medical & Hospital',
    color: '#34a853',
    bg: 'rgba(52,168,83,0.08)',
    contacts: [
      { name: 'Jinnah Hospital (Lahore)', number: '042-99203000', description: 'Major public hospital with emergency services', available: '24/7', icon: 'local_hospital' },
      { name: 'PIMS Hospital (Islamabad)', number: '051-9261170', description: 'Pakistan Institute of Medical Sciences emergency unit', available: '24/7', icon: 'local_hospital' },
      { name: 'Civil Hospital (Multan)', number: '061-9210064', description: 'City civil hospital emergency department', available: '24/7', icon: 'local_hospital' },
    ]
  },
  {
    category: 'Other Support',
    color: '#f9ab00',
    bg: 'rgba(249,171,0,0.08)',
    contacts: [
      { name: 'Chhipa Welfare', number: '1020', description: 'Free ambulance and social welfare services', available: '24/7', icon: 'volunteer_activism' },
      { name: 'Shahid Foundation', number: '0300-8431122', description: 'Rescue operations and relief work assistance', available: 'Business hours', icon: 'handshake' },
      { name: 'Sahara Welfare', number: '042-35761999', description: 'Social welfare and missing persons support', available: 'Mon–Fri 9am–5pm', icon: 'groups' },
    ]
  }
];

function EmergencyContactsPage() {
  const [activeTab, setActiveTab] = useState('contacts');
  const [copied, setCopied] = useState('');

  const handleCopy = (number) => {
    navigator.clipboard.writeText(number);
    setCopied(number);
    setTimeout(() => setCopied(''), 2000);
  };

  // Separate contacts into primary (main grid) and secondary (sidebar)
  const primaryGroups = EMERGENCY_CONTACTS.filter(g => g.category !== 'Other Support');
  const secondaryGroup = EMERGENCY_CONTACTS.find(g => g.category === 'Other Support');

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="portal-main-container dashboard-main-container">

        {/* Header */}
        <header className="portal-header-bar dashboard-header-bar" style={{ marginBottom: '28px' }}>
          <div>
            <h1 className="portal-welcome-title dashboard-welcome-title">Emergency Contacts</h1>
            <p className="portal-welcome-sub dashboard-welcome-sub">
              Important helpline numbers for rescue, police, and missing person support services in Pakistan.
            </p>
          </div>
        </header>

        {/* Responsive Dual-Column Grid Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '28px', alignItems: 'flex-start' }} className="guide-responsive-grid">
          
          {/* Left Column: Primary Critical Helplines */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {primaryGroups.map((group) => (
              <div key={group.category}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ width: '4px', height: '18px', borderRadius: '2px', backgroundColor: group.color }} />
                  <h2 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-color)', margin: 0 }}>{group.category}</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  {group.contacts.map((contact) => (
                    <div key={contact.name} style={{
                      backgroundColor: 'var(--card-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      padding: '20px',
                      transition: 'box-shadow 0.15s, transform 0.15s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                        {/* Icon */}
                        <div style={{
                          width: '44px', height: '44px', borderRadius: '10px',
                          backgroundColor: group.bg, display: 'flex', alignItems: 'center',
                          justifyContent: 'center', flexShrink: 0
                        }}>
                          <span className="material-symbols-rounded" style={{ color: group.color, fontSize: '22px' }}>{contact.icon}</span>
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <strong style={{ fontSize: '14px', color: 'var(--text-color)' }}>{contact.name}</strong>
                            <span style={{
                              fontSize: '10px', padding: '2px 8px', borderRadius: '10px',
                              backgroundColor: contact.available === '24/7' ? 'rgba(52,168,83,0.1)' : 'rgba(249,171,0,0.1)',
                              color: contact.available === '24/7' ? '#34a853' : '#f9ab00',
                              fontWeight: '600'
                            }}>{contact.available}</span>
                          </div>
                          <p style={{ fontSize: '12px', color: 'var(--text-light)', margin: '0 0 12px 0', lineHeight: '1.5' }}>
                            {contact.description}
                          </p>

                          {/* Number + Copy button */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <a href={`tel:${contact.number}`} style={{
                              fontSize: '18px', fontWeight: '700', color: group.color,
                              textDecoration: 'none', letterSpacing: '0.5px'
                            }}>
                              {contact.number}
                            </a>
                            <button
                              onClick={() => handleCopy(contact.number)}
                              title="Copy number"
                              style={{
                                background: 'none', border: '1px solid var(--border-color)',
                                borderRadius: '6px', cursor: 'pointer', padding: '3px 8px',
                                display: 'flex', alignItems: 'center', gap: '4px',
                                color: copied === contact.number ? '#34a853' : 'var(--text-light)',
                                fontSize: '11px', transition: 'all 0.15s'
                              }}
                            >
                              <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>
                                {copied === contact.number ? 'check' : 'content_copy'}
                              </span>
                              {copied === contact.number ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Page Sidebar (Alert notices, Secondary support, and tips) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Urgent danger banner */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              backgroundColor: 'rgba(234,67,53,0.06)',
              border: '1px solid rgba(234,67,53,0.2)',
              borderRadius: '12px', padding: '16px'
            }}>
              <span className="material-symbols-rounded" style={{ color: '#ea4335', fontSize: '24px', flexShrink: 0 }}>emergency</span>
              <div>
                <strong style={{ fontSize: '13px', color: '#ea4335', display: 'block', marginBottom: '2px' }}>In Immediate Danger?</strong>
                <span style={{ fontSize: '12px', color: '#ea4335', fontWeight: '500' }}>Call 15 or 1122 now</span>
              </div>
            </div>

            {/* Sidebar Category: Other Support */}
            {secondaryGroup && (
              <div style={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: 'var(--box-shadow)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <div style={{ width: '4px', height: '18px', borderRadius: '2px', backgroundColor: secondaryGroup.color }} />
                  <h2 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-color)', margin: 0 }}>{secondaryGroup.category}</h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {secondaryGroup.contacts.map((contact) => (
                    <div key={contact.name} style={{
                      borderBottom: '1px solid var(--border-color)',
                      paddingBottom: '14px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <strong style={{ fontSize: '13px', color: 'var(--text-color)' }}>{contact.name}</strong>
                        <span style={{
                          fontSize: '9px', padding: '2px 6px', borderRadius: '10px',
                          backgroundColor: 'rgba(249,171,0,0.1)',
                          color: '#f9ab00',
                          fontWeight: '600'
                        }}>{contact.available}</span>
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--text-light)', margin: '0 0 8px 0', lineHeight: '1.4' }}>
                        {contact.description}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <a href={`tel:${contact.number}`} style={{
                          fontSize: '15px', fontWeight: '700', color: secondaryGroup.color,
                          textDecoration: 'none'
                        }}>
                          {contact.number}
                        </a>
                        <button
                          onClick={() => handleCopy(contact.number)}
                          style={{
                            background: 'none', border: '1px solid var(--border-color)',
                            borderRadius: '4px', cursor: 'pointer', padding: '2px 6px',
                            display: 'flex', alignItems: 'center', gap: '2px',
                            color: copied === contact.number ? '#34a853' : 'var(--text-light)',
                            fontSize: '10px'
                          }}
                        >
                          <span className="material-symbols-rounded" style={{ fontSize: '12px' }}>
                            {copied === contact.number ? 'check' : 'content_copy'}
                          </span>
                          {copied === contact.number ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom tip card */}
            <PortalCard>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span className="material-symbols-rounded" style={{ color: '#1a73e8', fontSize: '22px', flexShrink: 0, marginTop: '2px' }}>info</span>
                <div>
                  <strong style={{ fontSize: '13px', color: 'var(--text-color)', display: 'block', marginBottom: '4px' }}>
                    What to tell the helpline
                  </strong>
                  <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-light)', lineHeight: '1.5' }}>
                    When you call, have the following ready: <strong>full name</strong>, <strong>age</strong>, <strong>gender</strong>, <strong>last location</strong> seen, <strong>clothing</strong> worn, and any <strong>distinguishing features</strong>.
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

export default EmergencyContactsPage;
