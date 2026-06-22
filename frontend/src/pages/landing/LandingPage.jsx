import React from 'react';
import HeroSection from '../../components/landing/HeroSection';
import MetricsSection from '../../components/landing/MetricsSection';
import FeaturesSection from '../../components/landing/FeaturesSection';
import WorkflowSection from '../../components/landing/WorkflowSection';
import TestimonialsSection from '../../components/landing/TestimonialsSection';
import FaqSection from '../../components/landing/FaqSection';
import CtaSection from '../../components/landing/CtaSection';

function LandingPage() {
  return (
    <div className="landing-container">
      {/* Decorative Background Glows */}
      <div className="landing-glow-bg-1" />
      <div className="landing-glow-bg-2" />

      {/* Modular Landing Grid sections */}
      <div className="landing-content-wrapper">
        <HeroSection />
        <MetricsSection />
        <FeaturesSection />
        <WorkflowSection />
        <TestimonialsSection />
        <FaqSection />
        <CtaSection />
      </div>
    </div>
  );
}

export default LandingPage;
