import React from 'react';

function PosterPresets({
  headerType,
  setHeaderType,
  customHeader,
  setCustomHeader,
  themeColor,
  setThemeColor,
  borderStyle,
  setBorderStyle,
  badgeType,
  setBadgeType,
  paperSize,
  setPaperSize,
  onOptimize,
  copywriting,
  copywriteSuccess,
  copywriteError
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      
      {/* ⚡ AI Bulletin Copywriter & Optimizer */}
      <div style={{
        padding: '14px',
        borderRadius: '10px',
        background: 'linear-gradient(135deg, rgba(26,115,232,0.08) 0%, rgba(197,34,31,0.08) 100%)',
        border: '1px solid rgba(26,115,232,0.2)',
        boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        textAlign: 'left'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-rounded" style={{ 
            color: 'var(--primary-color)', 
            fontSize: '20px',
            animation: copywriting ? 'spin 1.5s linear infinite' : 'pulse 2s ease-in-out infinite' 
          }}>
            {copywriting ? 'progress_activity' : 'psychology'}
          </span>
          <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-color)', letterSpacing: '0.5px' }}>
            AI FLYER COPYWRITER
          </span>
        </div>
        
        <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-light)', lineHeight: '1.4' }}>
          Rewrites raw incident circumstances into high-impact, bilingual copy optimized for localized search patrols.
        </p>

        <button
          type="button"
          onClick={onOptimize}
          disabled={copywriting}
          style={{
            width: '100%',
            height: '38px',
            borderRadius: '6px',
            background: 'linear-gradient(90deg, #1a73e8 0%, #c5221f 100%)',
            border: 'none',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: '700',
            cursor: copywriting ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 10px rgba(26,115,232,0.25)',
            transition: 'all 0.25s ease',
            opacity: copywriting ? 0.8 : 1
          }}
          onMouseEnter={(e) => {
            if (!copywriting) {
              e.currentTarget.style.boxShadow = '0 6px 14px rgba(26,115,232,0.4)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            if (!copywriting) {
              e.currentTarget.style.boxShadow = '0 4px 10px rgba(26,115,232,0.25)';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          {copywriting ? (
            <>
              <div className="portal-pulse-scanner" style={{ width: '12px', height: '12px', borderWidth: '2px', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
              <span>Optimizing Copy...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>bolt</span>
              <span>Optimize Flyer Copy (AI)</span>
            </>
          )}
        </button>

        {copywriteSuccess && (
          <div style={{
            fontSize: '10.5px',
            color: '#1e8e3e',
            backgroundColor: 'rgba(30,142,62,0.08)',
            border: '1px solid rgba(30,142,62,0.2)',
            borderRadius: '4px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>check_circle</span>
            <span>{copywriteSuccess}</span>
          </div>
        )}

        {copywriteError && (
          <div style={{
            fontSize: '10.5px',
            color: '#ea4335',
            backgroundColor: 'rgba(234,67,53,0.08)',
            border: '1px solid rgba(234,67,53,0.2)',
            borderRadius: '4px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>error</span>
            <span>{copywriteError}</span>
          </div>
        )}
      </div>

      
      {/* Header Type */}
      <div className="form-group-custom">
        <label>Alert Header Type</label>
        <select 
          className="form-input-custom"
          value={headerType}
          onChange={(e) => setHeaderType(e.target.value)}
          style={{ width: '100%' }}
        >
          <option value="MISSING">MISSING PERSON (Crimson Red)</option>
          <option value="URGENT">URGENT SEARCH ALERT (Charcoal Black)</option>
          <option value="AMBER">AMBER ALERT (Orange/Amber)</option>
          <option value="WANTED">WANTED BULLETIN (Dark Hazard)</option>
          <option value="CUSTOM">CUSTOM MESSAGE BANNER</option>
        </select>
      </div>

      {headerType === 'CUSTOM' && (
        <div className="form-group-custom">
          <label>Custom Header Text</label>
          <input 
            type="text"
            className="form-input-custom"
            value={customHeader}
            onChange={(e) => setCustomHeader(e.target.value)}
            placeholder="e.g. HAVE YOU SEEN ME?"
          />
        </div>
      )}

      {/* Theme Color Picker */}
      <div className="form-group-custom">
        <label>Alert Highlight Color</label>
        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
          {[
            { val: '#c5221f', label: 'Emergency Crimson' },
            { val: '#e65100', label: 'Safety Orange' },
            { val: '#0d47a1', label: 'Police Blue' },
            { val: '#f9ab00', label: 'Caution Gold' },
            { val: '#202124', label: 'Matte Black' }
          ].map(c => (
            <div 
              key={c.val}
              onClick={() => setThemeColor(c.val)}
              className={`preset-color-btn ${themeColor === c.val ? 'active' : ''}`}
              style={{ backgroundColor: c.val }}
              title={c.label}
            />
          ))}
        </div>
      </div>

      {/* Border Style */}
      <div className="form-group-custom">
        <label>Poster Border Frame</label>
        <select 
          className="form-input-custom"
          value={borderStyle}
          onChange={(e) => setBorderStyle(e.target.value)}
        >
          <option value="Hazard">Hazard Stripes (Theme / Black)</option>
          <option value="HazardRedWhite">Hazard Stripes (Theme / White)</option>
          <option value="Solid">Solid Block Border</option>
          <option value="Double">Vintage Double Frame</option>
          <option value="Minimal">Modern Grid Edge</option>
        </select>
      </div>

      {/* Agency Badges / Seals */}
      <div className="form-group-custom">
        <label>Official Agency Badge</label>
        <select 
          className="form-input-custom"
          value={badgeType}
          onChange={(e) => setBadgeType(e.target.value)}
        >
          <option value="none">No official seal</option>
          <option value="rescue">Search & Rescue locator compass</option>
          <option value="police">State Police assistance star</option>
          <option value="amber">Amber Alert warning triangle</option>
        </select>
      </div>

      {/* Paper Sizing */}
      <div className="form-group-custom">
        <label>Paper Size Ratio (Print Output)</label>
        <select 
          className="form-input-custom"
          value={paperSize}
          onChange={(e) => setPaperSize(e.target.value)}
        >
          <option value="A4">A4 Portrait (International Standard)</option>
          <option value="Letter">US Letter Portrait (8.5" x 11")</option>
        </select>
      </div>

    </div>
  );
}

export default PosterPresets;
