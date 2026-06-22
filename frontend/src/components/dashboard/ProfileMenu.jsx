import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import PortalCard from './PortalCard';

function ProfileMenu({ user }) {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setShowDropdown(false);
    await logout();
    navigate('/');
  };

  const getAvatarLetter = () => {
    if (user?.username) return user.username.substring(0, 1).toUpperCase();
    if (user?.email) return user.email.substring(0, 1).toUpperCase();
    return 'A';
  };

  const getAvatarBg = () => {
    const colors = [
      '#1a73e8', // Blue
      '#34a853', // Green
      '#ea4335', // Red
      '#f9ab00', // Yellow
      '#681da8', // Purple
      '#007b83', // Cyan
      '#b06000', // Orange
      '#c26401'  // Amber
    ];
    const letter = getAvatarLetter();
    const index = letter.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Interactive Avatar Card Trigger Button */}
      <button 
        onClick={() => setShowDropdown(!showDropdown)} 
        className="portal-topbar-avatar"
        style={{
          border: 'none',
          cursor: 'pointer',
          outline: 'none',
          transition: 'transform 0.15s, border-radius 0.15s',
          backgroundColor: getAvatarBg(),
          borderRadius: '8px' // Card-like UI instead of 50% circle
        }}
        title={user?.username || user?.email}
      >
        {getAvatarLetter()}
      </button>

      {/* Google-Style Dropdown Menu wrapped in standard Card UI */}
      {showDropdown && (
        <div style={{
          position: 'absolute',
          top: '48px',
          right: 0,
          zIndex: 2000,
          width: '320px',
          animation: 'heroFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) both'
        }}>
          <PortalCard 
            title={user?.email || 'admin@rescueportal.org'}
            style={{ padding: '20px 16px' }}
          >
            <div className="portal-profile-card-user-info" style={{ padding: '8px 0 16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Card-like squircle avatar */}
              <div 
                className="portal-profile-card-avatar-large"
                style={{
                  backgroundColor: getAvatarBg(),
                  width: '72px',
                  height: '72px',
                  borderRadius: '16px', // Squircle card UI shape
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  fontWeight: '500',
                  marginBottom: '12px',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                  border: '4px solid var(--light-color)'
                }}
              >
                {getAvatarLetter()}
              </div>
              <h2 className="portal-profile-card-name" style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-color)', margin: '0 0 2px 0' }}>{user?.username || 'Rescue Agent'}</h2>
              <span className="portal-profile-card-email" style={{ fontSize: '12px', color: 'var(--text-light)', margin: '0 0 16px 0' }}>System Administrator</span>
              
              <button 
                onClick={() => setShowDropdown(false)}
                className="portal-profile-card-manage-btn"
              >
                Manage your Rescue Account
              </button>
            </div>

            <div className="portal-profile-card-divider" />

            <div className="portal-profile-card-actions" style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
              <button 
                onClick={handleLogout}
                className="portal-profile-card-signout-btn"
              >
                <span className="material-symbols-rounded">logout</span>
                Sign out of this session
              </button>
            </div>
          </PortalCard>
        </div>
      )}
    </div>
  );
}

export default ProfileMenu;
