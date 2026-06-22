import React from 'react';
import { Link } from 'react-router-dom';

function CtaSection() {
  return (
    <section className="landing-cta-section">
      <div className="landing-cta-card-item cta-card">
        <h2 className="landing-cta-title cta-title">Ready to bring them home?</h2>
        <p className="landing-cta-text cta-text">
          Whether you are a search volunteer, a local law enforcement agency, or a family seeking help—join Rescue today and become part of our active global network.
        </p>
        <div className="landing-cta-actions cta-actions">
          <Link to="/register" className="landing-cta-btn-primary cta-btn-primary">Join as Volunteer</Link>
          <Link to="/login" className="landing-cta-btn-secondary cta-btn-secondary">Access Dashboard</Link>
        </div>
      </div>
    </section>
  );
}

export default CtaSection;
