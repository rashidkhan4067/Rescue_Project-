import React from 'react';
import PrintableFlyer from './PrintableFlyer';

function DraftingBoard({
  zoomScale,
  setZoomScale,
  baseWidth,
  baseHeight,
  paperSize,
  handlePrint,
  ...flyerProps
}) {
  return (
    <div className="drafting-board-container">
      
      {/* Floating drafting scale toolbox bar (Hidden on print) */}
      <div className="floating-draft-bar no-print">
        <div className="drafting-status-tag">
          <span className="material-symbols-rounded" style={{ fontSize: '13px' }}>verified</span>
          Staged: {paperSize}
        </div>
        
        <div style={{ width: '1px', height: '18px', backgroundColor: '#334155' }} />
        
        <button 
          onClick={() => setZoomScale(Math.max(0.4, zoomScale - 0.05))}
          className="draft-action-btn"
          title="Zoom Out Preview"
        >
          <span className="material-symbols-rounded">zoom_out</span>
        </button>
        
        <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', width: '32px', textAlign: 'center' }}>
          {Math.round(zoomScale * 100)}%
        </span>
        
        <button 
          onClick={() => setZoomScale(Math.min(1.0, zoomScale + 0.05))}
          className="draft-action-btn"
          title="Zoom In Preview"
        >
          <span className="material-symbols-rounded">zoom_in</span>
        </button>
        
        <button 
          onClick={() => setZoomScale(0.65)}
          className="draft-action-btn"
          title="Reset fit"
        >
          <span className="material-symbols-rounded">fullscreen_exit</span>
        </button>

        <div style={{ width: '1px', height: '18px', backgroundColor: '#334155' }} />

        <button 
          onClick={handlePrint}
          className="draft-action-btn"
          style={{ color: 'var(--primary-light)' }}
          title="Execute Print Pipeline"
        >
          <span className="material-symbols-rounded">print</span>
        </button>
      </div>

      {/* Visual Scale Wrapper: Prevents layout overflow leakage on screen */}
      <div 
        className="flyer-card-scale-outer-container"
        style={{
          width: `${baseWidth * zoomScale}px`,
          height: `${baseHeight * zoomScale}px`,
          overflow: 'hidden',
          position: 'relative',
          borderRadius: `${8 * zoomScale}px`,
          boxShadow: '0 15px 50px rgba(0,0,0,0.4)',
          margin: '0 auto',
          transition: 'all 0.15s ease'
        }}
      >
        <div 
          className="flyer-card-scale-wrapper"
          style={{
            width: `${baseWidth}px`,
            height: `${baseHeight}px`,
            transform: `scale(${zoomScale})`,
            transformOrigin: 'top left',
            position: 'absolute',
            top: 0,
            left: 0
          }}
        >
          <PrintableFlyer 
            paperSize={paperSize}
            {...flyerProps}
          />
        </div>
      </div>

    </div>
  );
}

export default DraftingBoard;
