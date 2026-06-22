import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../../store/useAuthStore';

// Outlined Input with Floating Label to match Google Material Design
function GoogleOutlinedInput({ label, type, value, onChange, id }) {
  const [isFocused, setIsFocused] = useState(false);
  const isFilled = value && value.length > 0;

  return (
    <div style={inputStyles.wrapper}>
      <div style={{
        ...inputStyles.container,
        borderColor: isFocused ? '#1a73e8' : '#dadce0',
        borderWidth: isFocused ? '2px' : '1px',
        padding: isFocused ? '12px 14px' : '13px 15px',
      }}>
        <label 
          htmlFor={id}
          style={{
            ...inputStyles.label,
            transform: (isFocused || isFilled) ? 'translate(-4px, -24px) scale(0.75)' : 'translate(0, 0) scale(1)',
            color: isFocused ? '#1a73e8' : '#5f6368',
            fontWeight: (isFocused || isFilled) ? '500' : '400',
          }}
        >
          {label}
        </label>
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={inputStyles.input}
          required
        />
      </div>
    </div>
  );
}

const inputStyles = {
  wrapper: {
    position: 'relative',
    marginBottom: '20px',
    width: '100%',
    textAlign: 'left'
  },
  container: {
    border: '1px solid #dadce0',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#ffffff',
    transition: 'border-color 0.15s ease, border-width 0.15s ease, padding 0.15s ease',
    height: '56px',
    boxSizing: 'border-box'
  },
  label: {
    position: 'absolute',
    left: '16px',
    fontSize: '16px',
    color: '#5f6368',
    backgroundColor: '#ffffff',
    padding: '0 6px',
    transition: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), color 0.15s ease',
    pointerEvents: 'none',
    transformOrigin: 'top left',
    zIndex: 1
  },
  input: {
    width: '100%',
    border: 'none',
    outline: 'none',
    fontSize: '16px',
    color: '#202124',
    fontFamily: 'Roboto, sans-serif',
    backgroundColor: 'transparent',
    zIndex: 2,
    boxSizing: 'border-box',
    height: '100%'
  }
};

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [magicLinkMode, setMagicLinkMode] = useState(false);
  const [magicEmail, setMagicEmail] = useState('');
  const [magicToken, setMagicToken] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login, googleLogin, requestMagicLink } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await login({ username, password });
    setLoading(false);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleGoogleAuth = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError('');
      setLoading(true);
      const result = await googleLogin(tokenResponse.access_token);
      setLoading(false);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Google SSO alignment failed.');
      }
    },
    onError: () => setError('Google Authentication Interrupted')
  });

  const handleMagicLinkRequest = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    if (!magicEmail) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    const result = await requestMagicLink(magicEmail);
    setLoading(false);
    if (result.success) {
      setSuccess('Magic link sent! (Demo token simulated below)');
      setMagicToken(result.token);
    } else {
      setError(result.error || 'Unable to deploy magic link request.');
    }
  };

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
            <h1 style={styles.mainTitle}>{magicLinkMode ? 'Sign in with Magic Link' : 'Sign in'}</h1>
            <p style={styles.subTitle}>to continue to your Rescue Portal</p>
          </div>
          
          {error && (
            <div style={styles.errorAlert}>
              <span className="material-symbols-rounded" style={{fontSize: '18px', marginRight: '8px'}}>error</span>
              {error}
            </div>
          )}
          
          {success && (
            <div style={styles.successAlert}>
              <span className="material-symbols-rounded" style={{fontSize: '18px', marginRight: '8px'}}>check_circle</span>
              {success}
            </div>
          )}

          {/* Login Form States */}
          {!magicLinkMode ? (
            <form onSubmit={handleLogin} style={styles.form}>
              <GoogleOutlinedInput 
                id="username"
                label="Username or email" 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
              />
              
              <GoogleOutlinedInput 
                id="password"
                label="Enter your password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
              
              <div style={styles.actions}>
                <Link to="/register" style={styles.link}>Create account</Link>
                <button 
                  type="submit" 
                  disabled={loading}
                  style={{
                    ...styles.btnPrimary,
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Signing in...' : 'Next'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleMagicLinkRequest} style={styles.form}>
              <GoogleOutlinedInput 
                id="magicEmail"
                label="Email address" 
                type="email" 
                value={magicEmail} 
                onChange={(e) => setMagicEmail(e.target.value)} 
              />
              
              <div style={styles.actions}>
                <button 
                  type="button" 
                  onClick={() => {
                    setMagicLinkMode(false);
                    setError('');
                    setSuccess('');
                  }} 
                  style={styles.linkBtn}
                >
                  Use password instead
                </button>
                
                <button 
                  type="submit" 
                  disabled={loading}
                  style={{
                    ...styles.btnPrimary,
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Sending...' : 'Send Link'}
                </button>
              </div>
              
              {magicToken && (
                <div style={styles.demoCard}>
                  <div style={styles.demoHeader}>
                    <span className="material-symbols-rounded" style={{fontSize: '16px', color: '#1a73e8'}}>info</span>
                    <strong>Demo Simulation Box</strong>
                  </div>
                  <p style={{fontSize: '12px', margin: '4px 0 10px 0', color: '#5f6368'}}>
                    Magic links usually arrive via email. Click the secure portal simulator below:
                  </p>
                  <Link to={`/verify-magic-link?token=${magicToken}`} style={styles.demoBtn}>
                    Verify Magic Link Session
                  </Link>
                </div>
              )}
            </form>
          )}

          {/* Social Sign-In Separator */}
          <div style={styles.divider}>
            <div style={styles.line}></div>
            <span style={styles.orText}>or</span>
            <div style={styles.line}></div>
          </div>

          {/* Custom Google SSO and alternative options */}
          <div style={styles.ssoContainer}>
            <button type="button" onClick={() => handleGoogleAuth()} style={styles.googleButton}>
              <svg width="20" height="20" viewBox="0 0 20 20" style={{marginRight: '12px'}}>
                <path d="M19.6 10.22c0-.7-.06-1.38-.18-2.04H10v3.86h5.38c-.23 1.23-.93 2.29-1.98 2.99v2.48h3.2c1.88-1.73 2.97-4.29 2.97-7.29z" fill="#4285F4" />
                <path d="M10 20c2.7 0 4.96-.9 6.62-2.45l-3.2-2.48c-.89.6-2.02.95-3.42.95-2.63 0-4.85-1.78-5.64-4.17H1.1v2.55C2.75 17.25 6.13 20 10 20z" fill="#34A853" />
                <path d="M4.36 11.85A5.95 5.95 0 0 1 4 10c0-.65.11-1.28.32-1.85V5.6H1.1A9.97 9.97 0 0 0 0 10c0 1.6.38 3.12 1.1 4.4l3.26-2.55z" fill="#FBBC05" />
                <path d="M10 3.98c1.47 0 2.78.5 3.82 1.5l2.87-2.87C14.95 1.01 12.7 0 10 0 6.13 0 2.75 2.75 1.1 6.25l3.26 2.55c.79-2.39 3.01-4.82 5.64-4.82z" fill="#EA4335" />
              </svg>
              Sign in with Google
            </button>

            {!magicLinkMode && (
              <button type="button" onClick={() => {
                setMagicLinkMode(true);
                setError('');
                setSuccess('');
              }} style={styles.magicButton}>
                <span className="material-symbols-rounded" style={{fontSize: '20px', marginRight: '10px', color: '#1a73e8'}}>magic_button</span>
                Sign in with Magic Link
              </button>
            )}
          </div>
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
    flexDirection: 'column'
  },
  header: {
    marginBottom: '28px',
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
    fontSize: '16px',
    color: '#202124',
    margin: 0
  },
  errorAlert: {
    backgroundColor: '#fce8e6',
    border: '1px solid #fad2cf',
    borderRadius: '4px',
    color: '#c5221f',
    padding: '12px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px'
  },
  successAlert: {
    backgroundColor: '#e6f4ea',
    border: '1px solid #ceead6',
    borderRadius: '4px',
    color: '#137333',
    padding: '12px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px'
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '16px',
    width: '100%'
  },
  link: {
    color: '#1a73e8',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'color 0.15s',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0
  },
  linkBtn: {
    color: '#1a73e8',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'color 0.15s',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0
  },
  btnPrimary: {
    backgroundColor: '#1a73e8',
    color: '#ffffff',
    height: '36px',
    padding: '0 24px',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.15s, box-shadow 0.15s',
    boxShadow: 'none'
  },
  demoCard: {
    marginTop: '20px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #dadce0',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'left'
  },
  demoHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#202124'
  },
  demoBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(26,115,232,0.06)',
    border: '1px solid rgba(26,115,232,0.15)',
    borderRadius: '4px',
    color: '#1a73e8',
    fontSize: '13px',
    fontWeight: '500',
    textDecoration: 'none',
    width: '100%',
    padding: '8px',
    boxSizing: 'border-box',
    transition: 'background 0.15s'
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '24px 0',
    width: '100%'
  },
  line: {
    flexGrow: 1,
    height: '1px',
    backgroundColor: '#dadce0'
  },
  orText: {
    padding: '0 16px',
    color: '#5f6368',
    fontSize: '14px'
  },
  ssoContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%'
  },
  googleButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '40px',
    border: '1px solid #dadce0',
    borderRadius: '4px',
    backgroundColor: '#ffffff',
    color: '#3c4043',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.15s, border-color 0.15s',
    boxSizing: 'border-box'
  },
  magicButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '40px',
    border: '1px solid #dadce0',
    borderRadius: '4px',
    backgroundColor: '#ffffff',
    color: '#3c4043',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.15s, border-color 0.15s',
    boxSizing: 'border-box'
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

// Global DOM selector triggers for hover feedback (Next/Sign-in buttons)
const injectLoginGlobalHover = () => {
  if (typeof window === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = `
    button[style*="btnPrimary"]:hover {
      background-color: #1557b0 !important;
      box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15) !important;
    }
    button[style*="btnPrimary"]:focus {
      background-color: #1557b0 !important;
      outline: 2px solid #1a73e8 !important;
      outline-offset: 2px !important;
    }
    button[style*="googleButton"]:hover {
      background-color: #f8f9fa !important;
      border-color: #d2e3fc !important;
    }
    button[style*="magicButton"]:hover {
      background-color: #f8f9fa !important;
      border-color: #dadce0 !important;
    }
    a[style*="footerLink"]:hover {
      color: #202124 !important;
    }
    a[style*="link"]:hover {
      color: #1557b0 !important;
      text-decoration: underline !important;
    }
    button[style*="linkBtn"]:hover {
      color: #1557b0 !important;
      text-decoration: underline !important;
    }
    a[style*="demoBtn"]:hover {
      background-color: rgba(26,115,232,0.12) !important;
    }
    
    /* Outlined Inputs Google styling override */
    input:-webkit-autofill,
    input:-webkit-autofill:hover, 
    input:-webkit-autofill:focus {
      -webkit-box-shadow: 0 0 0px 1000px #ffffff inset !important;
      transition: background-color 5000s ease-in-out 0s;
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

injectLoginGlobalHover();

export default Login;
