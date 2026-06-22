import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function DashboardSidebar({ 
  activeTab, 
  setActiveTab, 
  user, 
  onLogout, 
  onOpenBroadcast,
  isOpen,
  onClose
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (tab, path) => {
    if (setActiveTab) {
      setActiveTab(tab);
    }
    navigate(path);
    if (onClose) onClose();
  };

  const isHomeActive = location.pathname === '/dashboard' && activeTab === 'home';
  const isReportsActive = location.pathname === '/dashboard' && activeTab === 'reports';
  const isAiActive = location.pathname === '/ai-matcher';
  const isVolunteersActive = location.pathname === '/volunteers';
  const isAnalyticsActive = location.pathname === '/analytics';
  const isMapActive = location.pathname === '/map';
  const isBulletinActive = location.pathname === '/bulletin';
  const isContactsActive = location.pathname === '/contacts';
  const isGuideActive = location.pathname === '/guide';
  const isFaqActive = location.pathname === '/faq';
  const isUpdatesActive = location.pathname === '/updates';

  return (
    <>
      {/* 1. Dark Backdrop Overlay on Mobile */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="portal-sidebar-mobile-backdrop sidebar-backdrop"
        />
      )}

      {/* 2. Slide Drawer Sidebar Container */}
      <aside 
        className={`portal-sidebar dashboard-sidebar-drawer ${isOpen ? 'sidebar-drawer-open' : ''}`}
      >
        <div className="portal-sidebar-nav-scroll-wrapper">
          {/* Category: Admin Overview Console */}
          <div className="portal-sidebar-nav-group">
            <div className="portal-sidebar-group-label">Administration Console</div>
            
            <button 
              onClick={() => handleNavClick('home', '/dashboard')} 
              className={`portal-sidebar-nav-item nav-item-hover ${isHomeActive ? 'portal-sidebar-nav-item-active' : ''}`}
            >
              <span className="material-symbols-rounded">dashboard</span>
              Overview Console
            </button>

            {user?.is_admin && (
              <button 
                onClick={() => handleNavClick('users', '/dashboard')} 
                className={`portal-sidebar-nav-item nav-item-hover ${location.pathname === '/dashboard' && activeTab === 'users' ? 'portal-sidebar-nav-item-active' : ''}`}
              >
                <span className="material-symbols-rounded" style={{color: 'var(--primary-color)'}}>manage_accounts</span>
                Manage Users
              </button>
            )}
          </div>

          {/* Category: Case Files Registry */}
          <div className="portal-sidebar-nav-group">
            <div className="portal-sidebar-group-label">Case Files Registry</div>
            
            <button 
              onClick={() => handleNavClick('reports', '/dashboard')} 
              className={`portal-sidebar-nav-item nav-item-hover ${isReportsActive ? 'portal-sidebar-nav-item-active' : ''}`}
            >
              <span className="material-symbols-rounded">description</span>
              My Case Files
            </button>

            <button 
              onClick={() => handleNavClick('bulletin', '/bulletin')} 
              className={`portal-sidebar-nav-item nav-item-hover ${isBulletinActive ? 'portal-sidebar-nav-item-active' : ''}`}
            >
              <span className="material-symbols-rounded" style={{color: 'var(--accent-color)'}}>picture_in_picture</span>
              Missing Bulletin Posters
            </button>
          </div>

          {/* Category: Ground Mobilization */}
          <div className="portal-sidebar-nav-group">
            <div className="portal-sidebar-group-label">Ground Mobilization</div>
            
            <button 
              onClick={() => handleNavClick('map', '/map')} 
              className={`portal-sidebar-nav-item nav-item-hover ${isMapActive ? 'portal-sidebar-nav-item-active' : ''}`}
            >
              <span className="material-symbols-rounded" style={{color: 'var(--primary-color)'}}>travel_explore</span>
              Tactical Search Map
            </button>

            <button 
              onClick={() => handleNavClick('volunteers', '/volunteers')} 
              className={`portal-sidebar-nav-item nav-item-hover ${isVolunteersActive ? 'portal-sidebar-nav-item-active' : ''}`}
            >
              <span className="material-symbols-rounded" style={{color: 'var(--secondary-color)'}}>groups</span>
              Volunteer Rescue Grid
            </button>
          </div>

          {/* Category: Operational Diagnostics */}
          <div className="portal-sidebar-nav-group">
            <div className="portal-sidebar-group-label">Operational Diagnostics</div>
            
            <button 
              onClick={() => handleNavClick('analytics', '/analytics')} 
              className={`portal-sidebar-nav-item nav-item-hover ${isAnalyticsActive ? 'portal-sidebar-nav-item-active' : ''}`}
            >
              <span className="material-symbols-rounded" style={{color: 'var(--primary-color)'}}>monitoring</span>
              Operations Analytics
            </button>

            <button 
              onClick={() => handleNavClick('ai', '/ai-matcher')} 
              className={`portal-sidebar-nav-item nav-item-hover ${isAiActive ? 'portal-sidebar-nav-item-active' : ''}`}
            >
              <span className="material-symbols-rounded" style={{color: 'var(--primary-color)'}}>radar</span>
              AI Face Matcher
            </button>

            <button 
              onClick={() => { onOpenBroadcast(); if (onClose) onClose(); }} 
              className="portal-sidebar-nav-item nav-item-hover"
            >
              <span className="material-symbols-rounded" style={{color: 'var(--warning-color)'}}>campaign</span>
              Emergency Beacon
            </button>
          </div>

          {/* Category: Information & Support */}
          <div className="portal-sidebar-nav-group">
            <div className="portal-sidebar-group-label">Information & Support</div>
            
            <button 
              onClick={() => handleNavClick('contacts', '/contacts')} 
              className={`portal-sidebar-nav-item nav-item-hover ${isContactsActive ? 'portal-sidebar-nav-item-active' : ''}`}
            >
              <span className="material-symbols-rounded" style={{color: 'var(--accent-color)'}}>contact_phone</span>
              Emergency Helplines
            </button>

            <button 
              onClick={() => handleNavClick('guide', '/guide')} 
              className={`portal-sidebar-nav-item nav-item-hover ${isGuideActive ? 'portal-sidebar-nav-item-active' : ''}`}
            >
              <span className="material-symbols-rounded" style={{color: 'var(--primary-color)'}}>menu_book</span>
              How to Report
            </button>

            <button 
              onClick={() => handleNavClick('faq', '/faq')} 
              className={`portal-sidebar-nav-item nav-item-hover ${isFaqActive ? 'portal-sidebar-nav-item-active' : ''}`}
            >
              <span className="material-symbols-rounded" style={{color: 'var(--primary-color)'}}>help</span>
              Help & FAQ
            </button>

            <button 
              onClick={() => handleNavClick('updates', '/updates')} 
              className={`portal-sidebar-nav-item nav-item-hover ${isUpdatesActive ? 'portal-sidebar-nav-item-active' : ''}`}
            >
              <span className="material-symbols-rounded" style={{color: 'var(--warning-color)'}}>newspaper</span>
              Recent Updates
            </button>
          </div>
        </div>


        {/* Sidebar Footer User Details */}
        <div className="portal-sidebar-footer">
          <div className="portal-sidebar-user-info">
            <div className="portal-sidebar-user-avatar">
              {user?.username?.substring(0, 2).toUpperCase() || 'AD'}
            </div>
            <div className="portal-sidebar-user-details">
              <div className="portal-sidebar-user-name">
                {user?.username} {user?.is_admin && <span style={{ fontSize: '9px', padding: '1px 4px', borderRadius: '4px', backgroundColor: 'var(--accent-color)', color: 'var(--bg-color)' }}>ADMIN</span>}
              </div>
              <div className="portal-sidebar-user-email">{user?.email}</div>
            </div>
          </div>
          <button onClick={onLogout} className="portal-sidebar-logout-btn portal-btn-logout">
            <span className="material-symbols-rounded" style={{marginRight: '8px', fontSize: '18px'}}>logout</span>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

export default DashboardSidebar;
