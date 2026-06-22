import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

// Helper function to format relative time beautifully
function getRelativeTime(isoString) {
  if (!isoString) return 'Just now';
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    return `${diffDay}d ago`;
  } catch (e) {
    return 'Recently';
  }
}

function NotificationCenter() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Load and sync notifications from backend alerts
  const syncAlerts = async (isFirstLoad = false) => {
    if (isFirstLoad) setLoading(true);
    try {
      const response = await api.get('/alert');
      const backendAlerts = response.data.alerts || [];
      
      // Get previously read notification IDs from local storage
      const readIdsString = localStorage.getItem('rescue_read_alert_ids') || '[]';
      let readIds = [];
      try {
        readIds = JSON.parse(readIdsString);
      } catch (err) {
        readIds = [];
      }

      // Map raw database alerts to professional structured notifications
      const mapped = backendAlerts.map(alert => {
        const sev = (alert.severity || '').toLowerCase();
        let prefix = '🔍 [SEARCH]';
        let styleColor = 'var(--text-color)';
        
        if (sev.includes('critical') || sev.includes('amber')) {
          prefix = '🚨 [CRITICAL AMBER ALERT]';
          styleColor = 'var(--accent-color)';
        } else if (sev.includes('advisory')) {
          prefix = 'ℹ️ [ADVISORY]';
          styleColor = 'var(--primary-color)';
        }

        const isUnread = !readIds.includes(alert.id);

        return {
          id: alert.id,
          text: `${prefix} ${alert.name} was reported missing in ${alert.area.split(' (')[0]}`,
          time: getRelativeTime(alert.created_at),
          unread: isUnread,
          color: styleColor,
          rawSeverity: alert.severity
        };
      });

      setNotifications(mapped);
    } catch (err) {
      console.error("Failed to synchronize active telemetry alerts:", err);
    } finally {
      if (isFirstLoad) setLoading(false);
    }
  };

  // Sync initially and configure real-time background polling every 10 seconds
  useEffect(() => {
    syncAlerts(true);
    const interval = setInterval(() => {
      syncAlerts(false);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mark all active items as read locally
  const handleMarkAllRead = () => {
    const allIds = notifications.map(n => n.id);
    localStorage.setItem('rescue_read_alert_ids', JSON.stringify(allIds));
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  // Handle specific notification item click: mark read and navigate
  const handleItemClick = (notification) => {
    // Add item ID to read IDs list in localStorage
    const readIdsString = localStorage.getItem('rescue_read_alert_ids') || '[]';
    let readIds = [];
    try {
      readIds = JSON.parse(readIdsString);
    } catch (err) {}
    
    if (!readIds.includes(notification.id)) {
      readIds.push(notification.id);
      localStorage.setItem('rescue_read_alert_ids', JSON.stringify(readIds));
    }

    // Toggle unread state locally
    setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, unread: false } : n));
    setShowDropdown(false);

    // Dynamic routing to the specific case details page
    navigate(`/case/${notification.id}`);
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className="portal-topbar-icon-button icon-btn-hover"
        aria-label="System Alerts"
        title="Realtime System Alerts"
      >
        <span className="material-symbols-rounded" style={{ animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none' }}>
          notifications
        </span>
        {unreadCount > 0 && <span className="portal-topbar-badge">{unreadCount}</span>}
      </button>

      {showDropdown && (
        <div className="portal-topbar-notifications-dropdown" style={{ width: '360px' }}>
          
          <div className="portal-notifications-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Realtime System Alerts</span>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary-color)',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(26,115,232,0.08)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="portal-notifications-list" style={{ maxHeight: '340px' }}>
            {loading ? (
              <div className="portal-notifications-loading" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-light)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div className="portal-pulse-scanner" style={{ width: '20px', height: '20px', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
                <span style={{ fontSize: '12px' }}>Connecting to coordinate registry...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-light)' }}>
                <span className="material-symbols-rounded" style={{ fontSize: '32px', marginBottom: '8px', color: 'var(--border-color)', display: 'block' }}>notifications_off</span>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: '500' }}>No active search beacons monitored.</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '10px' }}>All sectors are currently secure.</p>
              </div>
            ) : (
              notifications.map(n => (
                <div 
                  key={n.id} 
                  className={`portal-notification-item ${n.unread ? 'portal-notification-item-unread' : ''}`}
                  onClick={() => handleItemClick(n)}
                  style={{ borderLeft: n.unread ? `3px solid ${n.color}` : '3px solid transparent', cursor: 'pointer' }}
                >
                  <p className="portal-notification-text" style={{ color: n.unread ? 'var(--text-color)' : 'var(--text-light)', margin: 0, fontSize: '12px', lineHeight: '1.4' }}>
                    {n.text}
                  </p>
                  <span className="portal-notification-time" style={{ marginTop: '4px', fontSize: '10px' }}>{n.time}</span>
                </div>
              ))
            )}
          </div>
          
        </div>
      )}
    </div>
  );
}

export default NotificationCenter;
