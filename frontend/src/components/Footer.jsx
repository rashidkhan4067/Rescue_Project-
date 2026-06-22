import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer-section" style={styles.footer}>
      <div className="footer-body" style={styles.footerBody}>
        <div className="footer-brand-column" style={styles.footerBrandColumn}>
          <div className="footer-logo" style={styles.footerLogo}>
            <span className="material-symbols-rounded" style={{color: '#1a73e8', fontSize: '24px', marginRight: '8px'}}>health_and_safety</span>
            <span style={{fontFamily: "'Google Sans', sans-serif", fontSize: '20px', fontWeight: '500'}}>Rescue</span>
          </div>
          <p style={styles.footerBrandDesc}>
            Advanced neural match algorithms and coordinate network dispatch dedicated to locating and reuniting missing persons globally.
          </p>
        </div>

        <div className="footer-links-grid" style={styles.footerLinksGrid}>
          <div className="footer-links-col" style={styles.footerLinksCol}>
            <h5 style={styles.footerColTitle}>Product</h5>
            <Link to="/search" style={styles.footerLink}>AI Search Engine</Link>
            <Link to="/report" style={styles.footerLink}>Report Case</Link>
            <Link to="/alerts" style={styles.footerLink}>Alert Feeds</Link>
          </div>
          <div className="footer-links-col" style={styles.footerLinksCol}>
            <h5 style={styles.footerColTitle}>Resources</h5>
            <Link to="/support" style={styles.footerLink}>Help Center</Link>
            <Link to="/faq" style={styles.footerLink}>Safety Center</Link>
            <Link to="/guide" style={styles.footerLink}>User Guidelines</Link>
          </div>
          <div className="footer-links-col" style={styles.footerLinksCol}>
            <h5 style={styles.footerColTitle}>Security</h5>
            <Link to="/privacy" style={styles.footerLink}>Privacy Policy</Link>
            <Link to="/terms" style={styles.footerLink}>Terms of Service</Link>
            <Link to="/gdpr" style={styles.footerLink}>GDPR Compliance</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom" style={styles.footerBottom}>
        <span style={styles.footerCopy}>&copy; 2026 Rescue Project Inc. All rights reserved. Created securely.</span>
        <div style={styles.footerSocials}>
          <span className="material-symbols-rounded" style={styles.socialIcon}>public</span>
          <span className="material-symbols-rounded" style={styles.socialIcon}>shield</span>
          <span className="material-symbols-rounded" style={styles.socialIcon}>security</span>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: '#f8f9fa',
    borderTop: '1px solid #dadce0',
    padding: '64px 24px 32px 24px',
    width: '100%',
    fontFamily: "'Google Sans', Roboto, sans-serif"
  },
  footerBody: {
    maxWidth: '1280px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '48px',
    flexWrap: 'wrap',
    paddingBottom: '48px',
    borderBottom: '1px solid #dadce0'
  },
  footerBrandColumn: {
    flex: '1.5',
    minWidth: '260px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  footerLogo: {
    display: 'flex',
    alignItems: 'center'
  },
  footerBrandDesc: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#5f6368',
    maxWidth: '320px'
  },
  footerLinksGrid: {
    flex: '2.5',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '32px'
  },
  footerLinksCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  footerColTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#202124',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: '4px'
  },
  footerLink: {
    fontSize: '14px',
    color: '#5f6368',
    textDecoration: 'none',
    transition: 'color 0.15s'
  },
  footerBottom: {
    maxWidth: '1280px',
    margin: '32px auto 0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px'
  },
  footerCopy: {
    fontSize: '13px',
    color: '#5f6368'
  },
  footerSocials: {
    display: 'flex',
    gap: '16px'
  },
  socialIcon: {
    fontSize: '20px',
    color: '#5f6368',
    cursor: 'pointer',
    transition: 'color 0.15s'
  }
};

export default Footer;
