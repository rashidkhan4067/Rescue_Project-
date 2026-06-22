import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

export default function VerifyMagicLink() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [errorMessage, setErrorMessage] = useState(null);
  const { verifyMagicLink } = useAuthStore();
  const navigate = useNavigate();
  const verifyAttempted = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Verification token is missing from secure link.');
      return;
    }

    if (verifyAttempted.current) return;
    verifyAttempted.current = true;

    const verifyToken = async () => {
      // Small timeout for nice visual spinner duration
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const result = await verifyMagicLink(token);
      if (result.success) {
        setStatus('success');
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        setStatus('error');
        setErrorMessage(result.error || 'This link has expired, is invalid, or was already used.');
      }
    };

    verifyToken();
  }, [token, verifyMagicLink, navigate]);

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.cardContainer}>
        {/* Core Google Sign-In Card wrapper */}
        <div style={styles.card}>
          {/* Logo brand & standard header */}
          <div style={styles.header}>
            <div style={styles.logoRow}>
              <span className="material-symbols-rounded" style={styles.logoIcon}>health_and_safety</span>
              <span style={styles.logoText}>Rescue</span>
            </div>
            
            <h1 style={styles.mainTitle}>
              {status === 'verifying' && 'Verifying secure session'}
              {status === 'success' && 'Welcome back!'}
              {status === 'error' && 'Verification failed'}
            </h1>
            
            <p style={styles.subTitle}>
              {status === 'verifying' && 'Please wait while we secure your authentication coordinates...'}
              {status === 'success' && 'Authentication successful. Synchronizing dashboard...'}
              {status === 'error' && errorMessage}
            </p>
          </div>

          {/* Graphical status indicators */}
          <div style={styles.statusBox}>
            {status === 'verifying' && (
              <div style={styles.spinnerContainer}>
                <div style={styles.spinner}></div>
                <div style={styles.loadingPulse}></div>
              </div>
            )}
            
            {status === 'success' && (
              <div style={styles.successWrapper}>
                <span className="material-symbols-rounded" style={styles.successIcon}>verified_user</span>
                <span style={styles.successPulse}></span>
              </div>
            )}
            
            {status === 'error' && (
              <div style={styles.errorWrapper}>
                <span className="material-symbols-rounded" style={styles.errorIcon}>gpp_bad</span>
              </div>
            )}
          </div>

          {/* Action button inside card */}
          {status === 'error' && (
            <div style={styles.actions}>
              <Link to="/login" style={styles.btnPrimary}>
                Return to Sign in
              </Link>
            </div>
          )}
        </div>

        {/* Global Google Accounts-style Footer */}
        <div style={styles.footer}>
          <div style={styles.langSelector}>
            English (United States)
            <span className="material-symbols-rounded" style={{fontSize: '16px', marginLeft: '6px'}}>arrow_drop_down</span>
          </div>
          <div style={styles.footerLinks}>
            <a href="#help" style={styles.footerLink}>Help</a>
            <a href="#privacy" style={styles.footerLink}>Privacy</a>
            <a href="#terms" style={styles.footerLink}>Terms</a>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#ffffff',
    fontFamily: "'Google Sans', Roboto, sans-serif",
    padding: '24px 16px',
    boxSizing: 'border-box'
  },
  cardContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: '450px'
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #dadce0',
    borderRadius: '8px',
    padding: '40px',
    width: '100%',
    boxSizing: 'border-box',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch'
  },
  header: {
    marginBottom: '32px',
    textAlign: 'left'
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px'
  },
  logoIcon: {
    color: '#1a73e8',
    fontSize: '28px',
    marginRight: '8px'
  },
  logoText: {
    fontSize: '22px',
    fontWeight: '500',
    color: '#202124',
    letterSpacing: '-0.3px'
  },
  mainTitle: {
    fontSize: '24px',
    fontWeight: '400',
    color: '#202124',
    margin: '0 0 8px 0',
    lineHeight: '1.25'
  },
  subTitle: {
    fontSize: '15px',
    color: '#5f6368',
    margin: 0,
    lineHeight: '1.5'
  },
  statusBox: {
    minHeight: '160px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '20px',
    position: 'relative'
  },
  spinnerContainer: {
    position: 'relative',
    width: '64px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #1a73e8',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    position: 'absolute'
  },
  loadingPulse: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: 'rgba(26,115,232,0.06)',
    animation: 'pulse 1.8s ease-in-out infinite'
  },
  successWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '72px',
    height: '72px'
  },
  successIcon: {
    fontSize: '56px',
    color: '#1e8e3e',
    zIndex: 2
  },
  successPulse: {
    position: 'absolute',
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    backgroundColor: '#e6f4ea',
    animation: 'pulse 1.5s ease-in-out infinite',
    zIndex: 1
  },
  errorWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    backgroundColor: '#fce8e6'
  },
  errorIcon: {
    fontSize: '44px',
    color: '#d93025'
  },
  actions: {
    marginTop: '16px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  btnPrimary: {
    backgroundColor: '#1a73e8',
    color: '#ffffff',
    height: '40px',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    transition: 'background-color 0.15s, box-shadow 0.15s',
    boxShadow: 'none',
    width: '100%'
  },
  footer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '16px',
    padding: '0 4px',
    boxSizing: 'border-box'
  },
  langSelector: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '12px',
    color: '#5f6368',
    cursor: 'pointer'
  },
  footerLinks: {
    display: 'flex',
    gap: '16px'
  },
  footerLink: {
    fontSize: '12px',
    color: '#5f6368',
    textDecoration: 'none',
    transition: 'color 0.15s'
  }
};

// Global keyframe styles for spinning and pulsing animations
const injectVerifyGlobalAnimation = () => {
  if (typeof window === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes pulse {
      0% { transform: scale(0.9); opacity: 0.2; }
      50% { transform: scale(1.1); opacity: 0.4; }
      100% { transform: scale(0.9); opacity: 0.2; }
    }
    
    a[style*="btnPrimary"]:hover {
      background-color: #1557b0 !important;
      box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15) !important;
    }
    a[style*="footerLink"]:hover {
      color: #202124 !important;
    }
    
    @media (max-width: 480px) {
      div[style*="card"] {
        border: none !important;
        padding: 24px 16px !important;
      }
      div[style*="pageWrapper"] {
        padding: 0 !important;
        align-items: flex-start !important;
      }
      div[style*="footer"] {
        padding: 0 16px 24px 16px !important;
      }
    }
  `;
  document.head.appendChild(style);
};

injectVerifyGlobalAnimation();
