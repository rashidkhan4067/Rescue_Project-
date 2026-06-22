import React, { useState } from 'react';

// Outlined Input with Floating Label
function MaterialInput({ label, type, value, onChange, required }) {
  const [isFocused, setIsFocused] = useState(false);
  const isFilled = value !== undefined && value !== null && value.toString().length > 0;

  return (
    <div className="material-input-wrapper" style={{ margin: '0 0 16px 0' }}>
      <div className={`material-input-container ${isFocused ? 'focused' : ''} ${isFilled ? 'filled' : ''}`}>
        <label className="material-input-label">
          {label} {required && <span style={{ color: 'var(--accent-color)' }}>*</span>}
        </label>
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="material-input"
          required={required}
        />
      </div>
    </div>
  );
}

// Outlined Dropdown Select
function MaterialSelect({ label, value, onChange, options, required }) {
  const [isFocused, setIsFocused] = useState(false);
  const isFilled = value !== undefined && value !== null && value.toString().length > 0;

  return (
    <div className="material-input-wrapper" style={{ margin: '0 0 16px 0' }}>
      <div className={`material-input-container ${isFocused ? 'focused' : ''} ${isFilled ? 'filled' : ''}`}>
        <label className="material-input-label">
          {label} {required && <span style={{ color: 'var(--accent-color)' }}>*</span>}
        </label>
        <select
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="material-select"
          required={required}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function BroadcastModal({ isOpen, onClose, broadcastArea, setBroadcastArea, onLaunchBroadcast }) {
  const [localArea, setLocalArea] = useState('Sector G-10, Islamabad');
  const [priority, setPriority] = useState('Tier 1 - Critical Severity');
  const [radius, setRadius] = useState('1000 meters');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!localArea) return;
    
    // Package all telemetry choices into the parent state string cleanly
    setBroadcastArea(`${localArea} [Severity: ${priority}, Range: ${radius}]`);
    
    // Defer to layout launcher
    setTimeout(() => {
      onLaunchBroadcast(e);
    }, 100);
  };

  const getPriorityColor = () => {
    if (priority.includes('Tier 1')) return 'var(--accent-color)';
    if (priority.includes('Tier 2')) return 'var(--warning-color)';
    return 'var(--primary-color)';
  };

  return (
    <div className="portal-modal-overlay" onClick={onClose}>
      
      {/* Self-contained circular radar animations */}
      <style>{`
        @keyframes ping-radar-wave {
          0% { r: 5px; opacity: 1; stroke-width: 1.5; }
          100% { r: 46px; opacity: 0; stroke-width: 0.5; }
        }
      `}</style>

      <div className="portal-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        
        {/* Animated Radar Beacon Header logo */}
        <div style={{ textAlign: 'center', paddingTop: '12px' }}>
          <svg viewBox="0 0 100 100" style={{ width: '64px', height: '64px', margin: '0 auto', display: 'block', overflow: 'visible' }}>
            {/* Range sweep grid */}
            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(249,171,0,0.15)" strokeWidth="1" />
            <circle cx="50" cy="50" r="25" fill="none" stroke="rgba(249,171,0,0.1)" strokeWidth="1" />
            <circle cx="50" cy="50" r="10" fill="none" stroke="rgba(249,171,0,0.06)" strokeWidth="0.8" />
            
            {/* Concentric pulsing radar waves */}
            <circle cx="50" cy="50" r="40" fill="none" stroke={getPriorityColor()} opacity="0.8" style={{ transformOrigin: '50px 50px', animation: 'ping-radar-wave 3s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
            <circle cx="50" cy="50" r="40" fill="none" stroke={getPriorityColor()} opacity="0.8" style={{ transformOrigin: '50px 50px', animation: 'ping-radar-wave 3s cubic-bezier(0, 0, 0.2, 1) 1.5s infinite' }} />
            
            {/* Sweeping line */}
            <line x1="50" y1="50" x2="50" y2="10" stroke={getPriorityColor()} strokeWidth="1.5" style={{ transformOrigin: '50px 50px', animation: 'spin 5s linear infinite' }} strokeLinecap="round" />
            
            {/* Center target node */}
            <circle cx="50" cy="50" r="4" fill={getPriorityColor()} />
          </svg>
        </div>

        {/* Modal Title */}
        <div className="portal-modal-header" style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-color)', justifyContent: 'center', textAlign: 'center' }}>
          <div>
            <h3 className="portal-modal-title" style={{ margin: 0, fontSize: '18px', fontWeight: '500' }}>Deploy Emergency Broadcast Beacon</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-light)' }}>
              Broadcast warning telemetry packets to all standby field operators.
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="portal-modal-content" style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* Outlined Region Input */}
            <MaterialInput 
              label="Target Landmark / Region Coordinates"
              type="text"
              value={localArea}
              onChange={(e) => setLocalArea(e.target.value)}
              required
            />

            <div style={{ display: 'flex', gap: '16px' }}>
              
              {/* Priority Severity Tiers */}
              <div style={{ flex: 1 }}>
                <MaterialSelect
                  label="Severity Priority Tier"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  options={[
                    { value: 'Tier 1 - Critical Severity', label: 'Tier 1 - Critical (Red)' },
                    { value: 'Tier 2 - Urgent Warning', label: 'Tier 2 - Urgent (Orange)' },
                    { value: 'Tier 3 - Advisory Beacon', label: 'Tier 3 - Advisory (Cyan)' }
                  ]}
                  required
                />
              </div>

              {/* Geofence Sweep Radius */}
              <div style={{ flex: 1 }}>
                <MaterialSelect
                  label="Geofence Signal Radius"
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                  options={[
                    { value: '250 meters', label: '250m Grid' },
                    { value: '500 meters', label: '500m Sector' },
                    { value: '1000 meters', label: '1000m District' },
                    { value: '2000 meters', label: '2000m Wideband' }
                  ]}
                  required
                />
              </div>

            </div>

            <div style={{
              backgroundColor: 'rgba(249,171,0,0.05)',
              border: '1px solid rgba(249,171,0,0.15)',
              borderRadius: '8px',
              padding: '12px 14px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
              marginTop: '4px'
            }}>
              <span className="material-symbols-rounded" style={{ color: 'var(--warning-color)', fontSize: '20px', flexShrink: 0, marginTop: '1px' }}>warning</span>
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-light)', lineHeight: '1.5' }}>
                <strong>CRITICAL NOTICE:</strong> Dispatched geofenced packets will trigger instant high-fidelity audio warnings and override standby operator terminals inside target sweeps.
              </p>
            </div>

          </div>
          
          {/* Action buttons */}
          <div className="portal-modal-actions" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <button 
              type="button" 
              onClick={onClose} 
              className="portal-modal-btn-secondary portal-btn-secondary-outline"
              style={{ height: '36px', padding: '0 20px', borderRadius: '4px', fontSize: '13px' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="portal-modal-btn-primary" 
              style={{
                height: '36px',
                padding: '0 24px',
                borderRadius: '4px',
                fontSize: '13px',
                backgroundColor: getPriorityColor(),
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                fontWeight: '600',
                boxShadow: `0 4px 12px ${getPriorityColor()}40`,
                transition: 'background-color 0.2s'
              }}
            >
              Launch Broadcast
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BroadcastModal;
