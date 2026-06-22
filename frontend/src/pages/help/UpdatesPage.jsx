import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PortalCard from '../../components/dashboard/PortalCard';

const RECENT_UPDATES = [
  {
    id: 1,
    title: '8-Year-Old Ahmed Reunited with Family in Islamabad',
    category: 'Success Story',
    date: 'May 23, 2026',
    time: '4:30 PM',
    description: 'Ahmed, who was reported missing in G-11 Islamabad two days ago, was identified by a registered volunteer near a local metro terminal. After matching details on the portal, police verified the case and reunited him with his grateful parents. Thank you to everyone who shared the bulletin poster!',
    icon: 'emoji_events',
    color: '#34a853',
    bg: 'rgba(52,168,83,0.08)'
  },
  {
    id: 2,
    title: 'AI Face Matcher Engine Upgraded to Version 2.1',
    category: 'System Alert',
    date: 'May 22, 2026',
    time: '11:00 AM',
    description: 'Our technical team has deployed an optimized neural network layout for the Face Matcher engine. Facial recognition matching accuracy has increased by 18%, and response times have been reduced to under 1.5 seconds. The feature is active for all new and existing case photos.',
    icon: 'radar',
    color: '#1a73e8',
    bg: 'rgba(26,115,232,0.08)'
  },
  {
    id: 3,
    title: 'Over 150+ Volunteers Registered in Multan Bypass Regions',
    category: 'Community News',
    date: 'May 19, 2026',
    time: '9:15 AM',
    description: 'A massive wave of local residents from Multan, Cantonment, and Mumtazabad has registered in our volunteer database. Search coordinates can now cover up to 10 kilometers around the Shah Rukn-e-Alam bypass, giving families a stronger safety net in these sectors.',
    icon: 'groups',
    color: '#f9ab00',
    bg: 'rgba(249,171,0,0.08)'
  },
  {
    id: 4,
    title: 'Safeguarding Children in Public Parks: Summer Guidelines',
    category: 'Public Safety',
    date: 'May 15, 2026',
    time: '3:00 PM',
    description: 'With summer vacations starting, local municipal departments advise parents to teach children critical phone numbers (like 1122 or 15) and keep recent portrait photos saved. Ensure children know who to approach (e.g. uniformed park staff) if they get separated.',
    icon: 'safety_check',
    color: '#ea4335',
    bg: 'rgba(234,67,53,0.08)'
  },
  {
    id: 5,
    title: 'Missing Girl Zainab Safely Located in Rawalpindi',
    category: 'Success Story',
    date: 'May 12, 2026',
    time: '6:45 PM',
    description: '14-year-old Zainab has been found and returned home safely after being missing for 24 hours. The local community broadcast and coordinate alert system helped volunteers pinpoint her location at a shelter home. The case has been marked as resolved.',
    icon: 'emoji_events',
    color: '#34a853',
    bg: 'rgba(52,168,83,0.08)'
  }
];

const CATEGORIES = ['All', 'Success Story', 'System Alert', 'Community News', 'Public Safety'];

function UpdatesPage() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredUpdates = selectedCategory === 'All' 
    ? RECENT_UPDATES 
    : RECENT_UPDATES.filter(item => item.category === selectedCategory);

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="portal-main-container dashboard-main-container" style={{ maxWidth: '840px', margin: '0 auto' }}>
        
        {/* Header */}
        <header className="portal-header-bar dashboard-header-bar" style={{ marginBottom: '28px' }}>
          <div>
            <h1 className="portal-welcome-title dashboard-welcome-title">Recent Updates</h1>
            <p className="portal-welcome-sub dashboard-welcome-sub">
              Stay informed with our latest success stories, announcements, and portal changes.
            </p>
          </div>
        </header>

        {/* Category Filters */}
        <div style={{ 
          display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '20px',
          borderBottom: '1px solid var(--border-color)', scrollbarWidth: 'none'
        }} className="category-scroll-bar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                height: '34px',
                padding: '0 16px',
                borderRadius: '17px',
                border: '1px solid',
                borderColor: selectedCategory === cat ? 'var(--primary-color)' : 'var(--border-color)',
                backgroundColor: selectedCategory === cat ? 'var(--primary-color)' : 'var(--card-bg)',
                color: selectedCategory === cat ? 'white' : 'var(--text-color)',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Updates Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredUpdates.length > 0 ? (
            filteredUpdates.map(item => (
              <div 
                key={item.id}
                style={{
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: 'var(--box-shadow)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Visual Category Stripe Accent */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px',
                  backgroundColor: item.color
                }} />

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  {/* Category Rounded Icon */}
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '10px',
                    backgroundColor: item.bg, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0
                  }}>
                    <span className="material-symbols-rounded" style={{ color: item.color, fontSize: '22px' }}>{item.icon}</span>
                  </div>

                  <div style={{ flex: 1 }}>
                    {/* Meta info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      <span style={{
                        fontSize: '10px', fontWeight: '700', textTransform: 'uppercase',
                        color: item.color, backgroundColor: item.bg, padding: '2px 8px',
                        borderRadius: '10px'
                      }}>{item.category}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                        {item.date} at {item.time}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-color)', margin: '0 0 10px 0', lineHeight: '1.4' }}>
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-light)', lineHeight: '1.6' }}>
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            /* Empty Category State */
            <div style={{
              textAlign: 'center', padding: '50px 20px',
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px'
            }}>
              <span className="material-symbols-rounded" style={{ fontSize: '40px', color: 'var(--text-light)', marginBottom: '10px' }}>feed</span>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-color)', margin: '0 0 4px 0' }}>No updates in this category</h3>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-light)' }}>
                We haven't posted any updates under "{selectedCategory}" recently. Check back later or view all updates.
              </p>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}

export default UpdatesPage;
