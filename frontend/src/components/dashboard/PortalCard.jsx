import React from 'react';

function PortalCard({ 
  children, 
  title, 
  subtitle, 
  icon, 
  iconColor, 
  hoverable = false, 
  onClick, 
  accentColor, 
  className = '', 
  style = {} 
}) {
  const isClickable = typeof onClick === 'function';
  
  const cardStyle = {
    ...style,
    ...(accentColor ? { borderLeft: `4px solid ${accentColor}` } : {}),
    ...(isClickable ? { cursor: 'pointer' } : {})
  };

  const cardClasses = [
    'portal-metric-card',
    hoverable ? 'portal-case-card' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={cardClasses} 
      style={cardStyle}
      onClick={onClick}
    >
      {/* Header section (displays title & icon if present) */}
      {(title || icon) && (
        <div className="portal-metric-header" style={{ marginBottom: children ? '12px' : '0' }}>
          {title && <span className="portal-metric-label">{title}</span>}
          {icon && (
            <span 
              className="material-symbols-rounded" 
              style={{ color: iconColor || 'var(--text-light)', fontSize: '22px' }}
            >
              {icon}
            </span>
          )}
        </div>
      )}

      {/* Main Content Area */}
      {children}

      {/* Subtitle / Telemetry Details Area */}
      {subtitle && <div className="portal-metric-sub" style={{ marginTop: '6px' }}>{subtitle}</div>}
    </div>
  );
}

export default PortalCard;
