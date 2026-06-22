import React, { useState, useEffect } from 'react';

// A simple count-up animation component that doesn't require third-party libraries
const StatCounter = ({ value }) => {
  const [displayVal, setDisplayVal] = useState('0');

  useEffect(() => {
    // Extract numbers, decimal points, and any suffix (like %, +, /7)
    const match = value.match(/^([\d,.]+)(.*)$/);
    if (!match) {
      setDisplayVal(value);
      return;
    }

    const numStr = match[1];
    const suffix = match[2];
    const hasComma = numStr.includes(',');
    const cleanNumStr = numStr.replace(/,/g, '');
    const numericValue = parseFloat(cleanNumStr);
    const isDecimal = numStr.includes('.');
    const decimalPlaces = isDecimal ? numStr.split('.')[1].length : 0;

    let start = 0;
    const duration = 1500; // 1.5 seconds animation
    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const progressPercentage = Math.min(progress / duration, 1);
      
      // Easing out quadratic
      const easeOutQuad = progressPercentage * (2 - progressPercentage);
      const currentVal = easeOutQuad * numericValue;

      let formatted = '';
      if (isDecimal) {
        formatted = currentVal.toFixed(decimalPlaces);
      } else {
        formatted = Math.floor(currentVal).toString();
      }

      if (hasComma) {
        formatted = parseFloat(formatted).toLocaleString('en-US');
      }

      setDisplayVal(formatted + suffix);

      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        setDisplayVal(value);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <span>{displayVal}</span>;
};

function MetricsSection() {
  const metrics = [
    { value: '18,492', label: 'Reunited Successfully' },
    { value: '99.4%', label: 'AI Precision Rate' },
    { value: '24/7', label: 'Real-time Alerting' },
    { value: '120+', label: 'Connected Countries' }
  ];

  return (
    <section className="landing-metrics-section">
      {metrics.map((metric, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <div className="landing-metric-divider" />}
          <div className="landing-metric-item">
            <span className="landing-metric-number">
              <StatCounter value={metric.value} />
            </span>
            <span className="landing-metric-label">{metric.label}</span>
          </div>
        </React.Fragment>
      ))}
    </section>
  );
}

export default MetricsSection;
