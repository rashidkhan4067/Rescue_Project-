import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationCenter from './NotificationCenter';
import ThemeToggleButton from './ThemeToggleButton';
import ProfileMenu from './ProfileMenu';

function DashboardTopbar({ user, searchQuery, setSearchQuery, onToggleSidebar }) {
  const navigate = useNavigate();
  const [localQuery, setLocalQuery] = useState(searchQuery || '');

  // Sync local input value if parent search query state changes
  useEffect(() => {
    if (searchQuery !== undefined) {
      setLocalQuery(searchQuery);
    }
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = localQuery.trim();
    if (trimmed) {
      if (setSearchQuery) {
        setSearchQuery(trimmed);
      }
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <header className="portal-topbar">
      {/* Brand alignment & Responsive toggle button */}
      <div className="portal-topbar-brand-group">
        <button onClick={onToggleSidebar} className="portal-topbar-menu-toggle icon-btn-hover">
          <span className="material-symbols-rounded" style={{fontSize: '22px'}}>menu</span>
        </button>
        <div className="portal-topbar-brand">
          <span className="material-symbols-rounded portal-topbar-brand-icon">health_and_safety</span>
          <span className="portal-topbar-brand-text">
            Rescue <span className="portal-topbar-admin-badge">Admin</span>
          </span>
        </div>
      </div>

      {/* Global Administrative Search bar (Responsive scaling) */}
      <form onSubmit={handleSearchSubmit} className="portal-topbar-search-container topbar-search-container topbar-search-focus" style={{ margin: 0, padding: 0 }}>
        <span className="material-symbols-rounded portal-topbar-search-icon">search</span>
        <input 
          type="text" 
          placeholder="Search portal coordinates..." 
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          className="portal-topbar-search-input"
          style={{ width: '100%' }}
        />
      </form>

      {/* Action controls */}
      <div className="portal-topbar-actions">
        
        {/* Active SMTP Health Indicator (condensed on mobile) */}
        <div className="portal-topbar-smtp-status topbar-smtp-status" title="SMTP Status: Active">
          <span className="portal-topbar-smtp-pulse"></span>
          <span className="material-symbols-rounded" style={{color: 'var(--secondary-color)', fontSize: '18px'}}>mail</span>
          <span className="portal-topbar-smtp-text topbar-smtp-text">SMTP</span>
        </div>

        {/* Theme toggle icon */}
        <ThemeToggleButton />

        {/* Modular Decoupled Sub-Components */}
        <NotificationCenter />
        <ProfileMenu user={user} />

      </div>
    </header>
  );
}

export default DashboardTopbar;
