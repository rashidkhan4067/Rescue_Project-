import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PortalCard from '../../components/dashboard/PortalCard';

const FAQ_ITEMS = [
  {
    category: 'How it Works',
    questions: [
      {
        q: 'How does the AI Face Matcher search for missing persons?',
        a: 'When you upload a photo in the AI Face Matcher, our system scans facial landmarks and compares them against our secure database of reported cases. If it finds matches with high similarity scores, it alerts our administrators and the reporter to review the result immediately.'
      },
      {
        q: 'Who can see the missing bulletin posters?',
        a: 'The Bulletin Posters are public. Anyone who visits the site can view and download them so that they can print them, share them on social media, or look out for the individuals in their local neighborhoods.'
      },
      {
        q: 'How does the Tactical Search Map work?',
        a: 'Our search map shows active cases and volunteer grids. Depending on the city (like Islamabad sectors or Multan bypasses), the system shows search overlays, active search zones, and volunteer locations in real-time, helping coordinators direct efforts effectively.'
      }
    ]
  },
  {
    category: 'Privacy & Safety',
    questions: [
      {
        q: 'Is my personal information and contact details safe?',
        a: 'Yes, absolutely. We prioritize safety and security. Contact information and precise coordinates are only accessible to verified volunteers and rescue administrators. Your phone number is not displayed publicly unless you explicitly add it to the public description.'
      },
      {
        q: 'What happens to the images I upload?',
        a: 'Images uploaded for case files are stored securely on our servers and are only used for creating bulletin posters and matching against search files. You can delete your case file at any time, which permanently removes the images from our systems.'
      }
    ]
  },
  {
    category: 'Volunteering',
    questions: [
      {
        q: 'How do I join the Volunteer Rescue Grid?',
        a: 'You can register as a volunteer on our Volunteers page. Once you sign up, you will be added to our rescue directory. In times of emergency, search coordinators can broadcast alerts to you based on your city (such as Islamabad or Multan).'
      },
      {
        q: 'What is expected of a registered volunteer?',
        a: 'Volunteers are expected to keep their contact details active, stay alert to bulletins in their area, and help spread the word. If you join a physical search party, you will always be coordinated by emergency professionals or portal admins for safety.'
      }
    ]
  },
  {
    category: 'Reporting & Verification',
    questions: [
      {
        q: 'Is there a fee to report a missing person on this portal?',
        a: 'No. The portal is completely free to use for everyone. It is built as a public service welfare tool to support families and coordinate rescue efforts across Pakistan.'
      },
      {
        q: 'How are reported cases marked as "Resolved"?',
        a: 'Once a missing person is successfully reunited with their family or found safe, the reporter or a system admin can change the case status from "Active" to "Resolved" on the Case Details page. This updates the public bulletin posters and clears them from active search grids.'
      }
    ]
  }
];

function FaqPage() {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState({}); // Key format: 'category-index'

  const toggleAccordion = (category, index) => {
    const key = `${category}-${index}`;
    setOpenIndex(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Filter FAQs based on search
  const filteredFaqs = FAQ_ITEMS.map(cat => {
    const filteredQuestions = cat.questions.filter(item => 
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return {
      ...cat,
      questions: filteredQuestions
    };
  }).filter(cat => cat.questions.length > 0);

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="portal-main-container dashboard-main-container" style={{ maxWidth: '960px', margin: '0 auto' }}>
        
        {/* Header */}
        <header className="portal-header-bar dashboard-header-bar" style={{ marginBottom: '28px', flexDirection: 'column', alignItems: 'flex-start', gap: '16px' }}>
          <div>
            <h1 className="portal-welcome-title dashboard-welcome-title">Help & FAQ</h1>
            <p className="portal-welcome-sub dashboard-welcome-sub">
              Frequently asked questions about our AI search engine, volunteer networks, and reporting safety.
            </p>
          </div>

          {/* Search bar */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '480px' }}>
            <span className="material-symbols-rounded" style={{
              position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-light)', fontSize: '20px'
            }}>search</span>
            <input 
              type="text"
              placeholder="Search help articles (e.g. 'AI', 'volunteer', 'resolved')..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                height: '46px',
                padding: '0 16px 0 44px',
                borderRadius: '23px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-color)',
                fontSize: '13px',
                outline: 'none',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
                transition: 'border-color 0.15s, box-shadow 0.15s'
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--primary-color)'; e.target.style.boxShadow = '0 0 0 3px rgba(26,115,232,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
        </header>

        {/* FAQs List */}
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((cat) => (
            <div key={cat.category} style={{ marginBottom: '32px' }}>
              {/* Category Subtitle */}
              <h2 style={{ 
                fontSize: '14px', fontWeight: '700', color: 'var(--text-light)', 
                textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>
                  {cat.category === 'How it Works' ? 'auto_stories' :
                   cat.category === 'Privacy & Safety' ? 'security' :
                   cat.category === 'Volunteering' ? 'volunteer_activism' : 'verified'}
                </span>
                {cat.category}
              </h2>

              {/* Accordion Questions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {cat.questions.map((item, index) => {
                  const key = `${cat.category}-${index}`;
                  const isOpen = !!openIndex[key];
                  return (
                    <div 
                      key={item.q}
                      style={{
                        backgroundColor: 'var(--card-bg)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        transition: 'box-shadow 0.15s'
                      }}
                    >
                      {/* Accordion Header */}
                      <button 
                        onClick={() => toggleAccordion(cat.category, index)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '16px 20px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          color: 'var(--text-color)',
                          transition: 'background-color 0.1s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--light-color)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <span style={{ fontSize: '13px', fontWeight: '600', paddingRight: '12px', lineHeight: '1.4' }}>
                          {item.q}
                        </span>
                        <span className="material-symbols-rounded" style={{ 
                          color: isOpen ? 'var(--primary-color)' : 'var(--text-light)',
                          transform: isOpen ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s',
                          fontSize: '20px',
                          flexShrink: 0
                        }}>
                          expand_more
                        </span>
                      </button>

                      {/* Accordion Body */}
                      <div style={{
                        maxHeight: isOpen ? '500px' : '0',
                        overflow: 'hidden',
                        transition: 'max-height 0.25s cubic-bezier(0, 1, 0, 1)',
                        borderTop: isOpen ? '1px solid var(--border-color)' : '0 solid transparent',
                        backgroundColor: 'var(--light-color)'
                      }}>
                        <div style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-light)', lineHeight: '1.6' }}>
                          {item.a}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          /* Empty Search State */
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px'
          }}>
            <span className="material-symbols-rounded" style={{ fontSize: '48px', color: 'var(--text-light)', marginBottom: '12px' }}>search_off</span>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-color)', margin: '0 0 6px 0' }}>No results found</h3>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-light)' }}>
              We couldn't find any questions matching "{searchQuery}". Try searching with simple keywords like "AI" or "police".
            </p>
          </div>
        )}

        {/* Contact Support Footer Card */}
        <div style={{ marginTop: '40px' }}>
          <PortalCard>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                backgroundColor: 'rgba(26,115,232,0.08)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0
              }}>
                <span className="material-symbols-rounded" style={{ color: 'var(--primary-color)', fontSize: '24px' }}>mail</span>
              </div>
              <div style={{ flex: 1, minWidth: '240px' }}>
                <strong style={{ fontSize: '14px', color: 'var(--text-color)', display: 'block', marginBottom: '4px' }}>
                  Still have questions? We are here to support.
                </strong>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-light)', lineHeight: '1.5' }}>
                  If you need additional assistance or are experiencing issues with files, drop our coordinator team an email.
                </p>
              </div>
              <div>
                <a href="mailto:support@rescueportal.pk" style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: 'var(--primary-color)', color: 'white', textDecoration: 'none',
                  fontSize: '12px', fontWeight: '600', height: '36px', padding: '0 18px',
                  borderRadius: '18px', boxShadow: '0 2px 4px rgba(26,115,232,0.2)',
                  transition: 'background-color 0.15s'
                }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--primary-dark)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--primary-color)'}
                >
                  Email Support Team
                </a>
              </div>
            </div>
          </PortalCard>
        </div>

      </div>
    </DashboardLayout>
  );
}

export default FaqPage;
