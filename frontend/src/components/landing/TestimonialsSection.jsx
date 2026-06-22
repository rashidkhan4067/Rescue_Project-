import React, { useState, useEffect } from 'react';

function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Monitor screen resizing for layout choice
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const stories = [
    {
      quote: "Rescue's AI gave us a match within 40 minutes of uploading. Our son is home safely. I cannot express my gratitude enough.",
      author: "Robert & Maria S.",
      role: "Parents of David (Found in 2026)",
      initials: "RM",
      color: "#1a73e8"
    },
    {
      quote: "As an active volunteer search group, this platform has completely streamlined our efforts. The regional broadcast system is incredibly powerful.",
      author: "Chief Insp. Marcus Vance",
      role: "Regional Search Coordinator",
      initials: "MV",
      color: "#34a853"
    },
    {
      quote: "The geofenced alert system mobilized 180 of our local volunteers in minutes. Rescue makes direct community response possible.",
      author: "Ayesha Khan",
      role: "Volunteer NGO Lead",
      initials: "AK",
      color: "#f9ab00"
    }
  ];

  return (
    <section className="landing-testimonials-section" id="testimonials" style={{ scrollMarginTop: '80px' }}>
      {/* Header */}
      <div className="landing-section-header-centered">
        <h2 className="landing-section-title">Stories of Hope</h2>
        <p className="landing-section-subtitle">Real stories of families reunited through our community and AI search platform.</p>
      </div>

      {isMobile ? (
        // --- Mobile Layout: Quote Carousel Slider with dots ---
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div 
            className="landing-story-card-item story-card" 
            style={{ 
              width: '100%', 
              backgroundColor: 'var(--light-color)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.01)',
              transition: 'opacity 0.3s ease-in-out'
            }}
          >
            <span className="material-symbols-rounded" style={{ color: stories[activeIndex].color, fontSize: '32px', marginBottom: '12px' }}>
              format_quote
            </span>
            <p className="landing-story-quote" style={{ fontSize: '13.5px', lineHeight: 1.5, marginBottom: '20px' }}>
              "{stories[activeIndex].quote}"
            </p>
            <div className="landing-story-author-row">
              <div className="landing-story-avatar" style={{ backgroundColor: stories[activeIndex].color, width: '36px', height: '36px', fontSize: '12px' }}>
                {stories[activeIndex].initials}
              </div>
              <div>
                <h5 className="landing-story-author-name" style={{ fontSize: '13.5px' }}>{stories[activeIndex].author}</h5>
                <p className="landing-story-author-role" style={{ fontSize: '11px' }}>{stories[activeIndex].role}</p>
              </div>
            </div>
          </div>

          {/* Slider Pagination Dots */}
          <div className="testimonials-dots-container">
            {stories.map((_, idx) => (
              <div
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`testimonials-dot ${activeIndex === idx ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>
      ) : (
        // --- Desktop Layout: 3-column Grid ---
        <div className="landing-stories-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {stories.map((story, index) => (
            <div key={index} className="landing-story-card-item story-card">
              <span className="material-symbols-rounded" style={{ color: story.color, fontSize: '36px', marginBottom: '16px' }}>
                format_quote
              </span>
              <p className="landing-story-quote">"{story.quote}"</p>
              <div className="landing-story-author-row">
                <div className="landing-story-avatar" style={{ backgroundColor: story.color }}>{story.initials}</div>
                <div>
                  <h5 className="landing-story-author-name">{story.author}</h5>
                  <p className="landing-story-author-role">{story.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default TestimonialsSection;
