import React, { useState } from 'react';

function FaqSection() {
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    {
      q: "How does the facial recognition system work?",
      a: "Our advanced neural networks translate uploaded photographs into distinct facial landmark vectors. These vectors are mapped against database records in real-time, allowing the engine to recognize individuals across changing lights, aging, or video frames with a high precision match rate."
    },
    {
      q: "Is my personal data safe and private?",
      a: "Absolutely. We employ bank-grade end-to-end encryption for all user records and case files. Data is stored strictly following global privacy standards (including GDPR compliance) and is only accessible by authorized local search teams and case managers."
    },
    {
      q: "Can I submit anonymous reports or sights?",
      a: "Yes. Our search engine and submission forms support complete anonymity. We prioritize security and do not track IP addresses or personal identities of anonymous reporters to ensure citizen safety."
    },
    {
      q: "How can I join the global rescue network?",
      a: "Simply sign up as a Volunteer or NGO. You will get immediate access to regional alerts, map coordinates of local reports, and updates on high-priority searches in your community."
    }
  ];

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <section className="landing-faq-section">
      <div className="landing-section-header-centered">
        <h2 className="landing-section-title">Frequently Asked Questions</h2>
        <p className="landing-section-subtitle">Everything you need to know about the Rescue search engine and data protection.</p>
      </div>

      <div className="landing-faq-list">
        {faqs.map((faq, index) => (
          <div key={index} className="landing-faq-item-card faq-item" onClick={() => toggleFaq(index)}>
            <div className="landing-faq-question-row">
              <h4 className="landing-faq-question">{faq.q}</h4>
              <span className="material-symbols-rounded landing-faq-arrow" style={{
                transform: activeFaq === index ? 'rotate(180deg)' : 'rotate(0)'
              }}>
                expand_more
              </span>
            </div>
            <div className="landing-faq-answer-container" style={{
              maxHeight: activeFaq === index ? '200px' : '0',
              opacity: activeFaq === index ? '1' : '0'
            }}>
              <p className="landing-faq-answer">{faq.a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FaqSection;
