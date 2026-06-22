import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import ProfileMenu from './dashboard/ProfileMenu';

function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  // Render a Google-style rounded avatar letter
  const getAvatarLetter = () => {
    if (user && user.username) return user.username.charAt(0).toUpperCase();
    if (user && user.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  const getAvatarBg = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const colors = [
      '#1a73e8', '#34a853', '#ea4335', '#f9ab00',
      '#681da8', '#007b83', '#b06000', '#c26401'
    ];
    const letter = getAvatarLetter();
    const index = letters.indexOf(letter) % colors.length;
    return colors[index] || '#1a73e8';
  };

  return (
    <nav style={styles.navContainer}>
      <div style={styles.navBody}>
        {/* Brand Logo */}
        <div style={styles.logoContainer}>
          <Link to="/" style={styles.logoLink} onClick={() => setMobileMenuOpen(false)}>
            <span className="material-symbols-rounded" style={styles.logoIcon}>
              health_and_safety
            </span>
            <span style={styles.logoText}>
              <span style={{ color: '#4285F4' }}>R</span>
              <span style={{ color: '#EA4335' }}>e</span>
              <span style={{ color: '#FBBC05' }}>s</span>
              <span style={{ color: '#4285F4' }}>c</span>
              <span style={{ color: '#34A853' }}>u</span>
              <span style={{ color: '#EA4335' }}>e</span>
            </span>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div style={styles.desktopLinks}>
          {isAuthenticated && (
            <div style={styles.navGroup}>
              <Link
                to="/dashboard"
                style={{
                  ...styles.navLink,
                  ...(isActive('/dashboard') ? styles.activeNavLink : {})
                }}
              >
                Dashboard
                {isActive('/dashboard') && <span style={styles.activeIndicator} />}
              </Link>
              <Link
                to="/search"
                style={{
                  ...styles.navLink,
                  ...(isActive('/search') ? styles.activeNavLink : {})
                }}
              >
                Search
                {isActive('/search') && <span style={styles.activeIndicator} />}
              </Link>
              <Link
                to="/report"
                style={{
                  ...styles.navLink,
                  ...(isActive('/report') ? styles.activeNavLink : {})
                }}
              >
                Report Case
                {isActive('/report') && <span style={styles.activeIndicator} />}
              </Link>
              <Link
                to="/alerts"
                style={{
                  ...styles.navLink,
                  ...(isActive('/alerts') ? styles.activeNavLink : {})
                }}
              >
                Alerts
                {isActive('/alerts') && <span style={styles.activeIndicator} />}
              </Link>
            </div>
          )}
        </div>

        {/* Right Side Controls */}
        <div style={styles.rightSide}>
          {isAuthenticated ? (
            <ProfileMenu user={user} />
          ) : (
            <div style={styles.authGroup}>
              <Link to="/login" style={styles.signInBtn}>Sign In</Link>
              <Link to="/register" style={styles.signUpBtn}>Get Started</Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          {isAuthenticated && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={styles.mobileMenuBtn}
            >
              <span className="material-symbols-rounded">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && isAuthenticated && (
        <div style={styles.mobileDrawer}>
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              ...styles.mobileDrawerLink,
              ...(isActive('/dashboard') ? styles.activeMobileDrawerLink : {})
            }}
          >
            <span className="material-symbols-rounded" style={{ marginRight: '12px' }}>dashboard</span>
            Dashboard
          </Link>
          <Link
            to="/search"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              ...styles.mobileDrawerLink,
              ...(isActive('/search') ? styles.activeMobileDrawerLink : {})
            }}
          >
            <span className="material-symbols-rounded" style={{ marginRight: '12px' }}>search</span>
            Search
          </Link>
          <Link
            to="/report"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              ...styles.mobileDrawerLink,
              ...(isActive('/report') ? styles.activeMobileDrawerLink : {})
            }}
          >
            <span className="material-symbols-rounded" style={{ marginRight: '12px' }}>campaign</span>
            Report Case
          </Link>
          <Link
            to="/alerts"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              ...styles.mobileDrawerLink,
              ...(isActive('/alerts') ? styles.activeMobileDrawerLink : {})
            }}
          >
            <span className="material-symbols-rounded" style={{ marginRight: '12px' }}>notifications</span>
            Alerts
          </Link>
        </div>
      )}
    </nav>
  );
}

const styles = {
  navContainer: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #dadce0',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    width: '100%'
  },
  navBody: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '64px',
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 24px',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  logoLink: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    gap: '8px'
  },
  logoIcon: {
    fontSize: '28px',
    color: '#1a73e8',
    background: 'none',
    padding: 0
  },
  logoText: {
    fontFamily: "'Google Sans', Roboto, Arial, sans-serif",
    fontSize: '22px',
    fontWeight: '500',
    letterSpacing: '-0.2px'
  },
  desktopLinks: {
    display: 'flex',
    alignItems: 'center',
    height: '100%'
  },
  navGroup: {
    display: 'flex',
    gap: '8px',
    height: '100%',
    alignItems: 'center'
  },
  navLink: {
    color: '#5f6368',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '14px',
    padding: '8px 16px',
    borderRadius: '4px',
    transition: 'all 0.2s',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '64px'
  },
  activeNavLink: {
    color: '#1a73e8',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '16px',
    right: '16px',
    height: '3px',
    backgroundColor: '#1a73e8',
    borderTopLeftRadius: '3px',
    borderTopRightRadius: '3px'
  },
  rightSide: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  profileWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  avatarBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    color: '#ffffff',
    border: 'none',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 1px 2px rgba(60,64,67,0.3)',
    outline: 'none',
    transition: 'transform 0.15s'
  },
  dropdownMenu: {
    position: 'absolute',
    top: '48px',
    right: 0,
    backgroundColor: '#ffffff',
    border: '1px solid #dadce0',
    borderRadius: '8px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
    width: '300px',
    padding: '16px 0',
    animation: 'fadeIn 0.2s ease-out'
  },
  dropdownHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px 16px 16px 16px',
    textAlign: 'center'
  },
  largeAvatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    color: '#ffffff',
    fontSize: '28px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
    boxShadow: '0 2px 4px rgba(60,64,67,0.2)'
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  userName: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#202124'
  },
  userEmail: {
    fontSize: '13px',
    color: '#5f6368'
  },
  dropdownDivider: {
    height: '1px',
    backgroundColor: '#dadce0',
    margin: '8px 0'
  },
  dropdownLinks: {
    display: 'flex',
    flexDirection: 'column'
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 20px',
    color: '#3c4043',
    textDecoration: 'none',
    fontSize: '14px',
    border: 'none',
    background: 'none',
    width: '100%',
    textAlign: 'left',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background-color 0.15s'
  },
  dropdownIcon: {
    marginRight: '12px',
    fontSize: '20px',
    color: '#5f6368'
  },
  logoutBtn: {
    color: '#d93025'
  },
  authGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  signInBtn: {
    color: '#1a73e8',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '14px',
    padding: '8px 16px',
    borderRadius: '4px',
    transition: 'background-color 0.15s'
  },
  signUpBtn: {
    backgroundColor: '#1a73e8',
    color: '#ffffff',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '14px',
    padding: '10px 20px',
    borderRadius: '24px',
    boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3)',
    transition: 'background-color 0.2s, box-shadow 0.2s'
  },
  mobileMenuBtn: {
    display: 'none',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#5f6368',
    padding: '8px'
  },
  mobileDrawer: {
    display: 'none',
    position: 'absolute',
    top: '64px',
    left: 0,
    width: '100%',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #dadce0',
    padding: '16px',
    flexDirection: 'column',
    gap: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
  },
  mobileDrawerLink: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    color: '#3c4043',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '500',
    borderRadius: '8px',
    transition: 'background-color 0.15s'
  },
  activeMobileDrawerLink: {
    backgroundColor: 'rgba(26, 115, 232, 0.08)',
    color: '#1a73e8'
  }
};

// CSS media query overrides
const addMediaStyles = () => {
  const styleTag = document.createElement('style');
  styleTag.textContent = `
    @media (max-width: 820px) {
      #logo-group { font-size: 18px !important; }
      div[style*="desktopLinks"] { display: none !important; }
      button[style*="mobileMenuBtn"] { display: block !important; }
      div[style*="mobileDrawer"] { display: flex !important; }
    }
    .btn-google-primary:hover {
      box-shadow: 0 2px 6px rgba(60,64,67,0.35) !important;
    }
  `;
  document.head.appendChild(styleTag);
};

if (typeof window !== 'undefined') {
  addMediaStyles();
}

export default Navbar;
