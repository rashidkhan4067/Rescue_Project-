import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';

function ThemeToggleButton() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="icon-btn-hover"
      style={{
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        padding: '4px',
        marginRight: '8px',
        color: 'var(--text-color)'
      }}
      aria-label="Toggle theme"
    >
      <span className="material-symbols-rounded" style={{ fontSize: '22px' }}>
        {isDark ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
}

export default ThemeToggleButton;
