import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { register } = useAuthStore();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Call user register API
    const result = await register({ username, email, password });
    setLoading(false);
    
    if (result.success) {
      navigate('/login');
    } else {
      setError(result.error || 'Registration failed. Try choosing a unique username.');
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.cardContainer}>
        {/* Core Google Sign-Up Card wrapper */}
        <div style={styles.card}>
          {/* Logo brand & standard header */}
          <div style={styles.header}>
            <div style={styles.logoRow}>
              <span className="material-symbols-rounded" style={styles.logoIcon}>health_and_safety</span>
              <span style={styles.logoText}>Rescue</span>
            </div>
            <h1 style={styles.mainTitle}>Create your Account</h1>
            <p style={styles.subTitle}>Join the Rescue global search network</p>
          </div>
          
          {error && (
            <div style={styles.errorAlert}>
              <span className="material-symbols-rounded" style={{fontSize: '18px', marginRight: '8px'}}>error</span>
              {error}
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleRegister} style={styles.form}>
            <GoogleOutlinedInput 
              id="regUsername"
              label="Username" 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
            />
            
            <GoogleOutlinedInput 
              id="regEmail"
              label="Email Address" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
            
            <GoogleOutlinedInput 
              id="regPassword"
              label="Choose a password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
            
            <p style={styles.disclaimerText}>
              By clicking "Create Account", you agree to follow the platform guidelines and safeguard case privacy coordinates.
            </p>
            
            <div style={styles.actions}>
              <Link to="/login" style={styles.link}>Sign in instead</Link>
              <button 
                type="submit" 
                disabled={loading}
                style={{
                  ...styles.btnPrimary,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
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
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  disclaimerText: {
    fontSize: '12px',
    lineHeight: '1.5',
    color: '#5f6368',
    margin: '4px 0 20px 0',
    textAlign: 'left'
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '8px',
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

// Global DOM selector triggers for hover feedback
const injectRegisterGlobalHover = () => {
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
    a[style*="footerLink"]:hover {
      color: #202124 !important;
    }
    a[style*="link"]:hover {
      color: #1557b0 !important;
      text-decoration: underline !important;
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

injectRegisterGlobalHover();

export default Register;
