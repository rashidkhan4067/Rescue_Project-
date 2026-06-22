import React, { useState } from 'react';

// Outlined Input with Floating Label matching Google Material Design specifications
export function MaterialInput({ label, type = 'text', name, value, onChange, required, textarea }) {
  const [isFocused, setIsFocused] = useState(false);
  const isFilled = value !== undefined && value !== null && value.toString().length > 0;

  return (
    <div className="material-input-wrapper" style={{ margin: '0 0 16px 0' }}>
      <div className={`material-input-container ${isFocused ? 'focused' : ''} ${isFilled ? 'filled' : ''}`}>
        <label className="material-input-label">
          {label} {required && <span style={{ color: 'var(--accent-color)' }}>*</span>}
        </label>
        {textarea ? (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="material-textarea"
            required={required}
            rows={3}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="material-input"
            required={required}
          />
        )}
      </div>
    </div>
  );
}

// Outlined Select Dropdown with Floating Label matching Google Material Design specifications
export function MaterialSelect({ label, name, value, onChange, options = [], required }) {
  const [isFocused, setIsFocused] = useState(false);
  const isFilled = value !== undefined && value !== null && value.toString().length > 0;

  return (
    <div className="material-input-wrapper" style={{ margin: '0 0 16px 0' }}>
      <div className={`material-input-container ${isFocused ? 'focused' : ''} ${isFilled ? 'filled' : ''}`}>
        <label className="material-input-label">
          {label} {required && <span style={{ color: 'var(--accent-color)' }}>*</span>}
        </label>
        <select
          name={name}
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
