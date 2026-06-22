import React from 'react';

function AiScannerModal({ isOpen, onClose, scanStage, matchScore, triggerScan }) {
  if (!isOpen) return null;

  return (
    <div className="portal-modal-overlay">
      <div className="portal-modal-card">
        <div className="portal-modal-header">
          <span className="material-symbols-rounded" style={{color: 'var(--primary-color)', fontSize: '24px'}}>radar</span>
          <h3 className="portal-modal-title">AI Neural Face Scanner</h3>
        </div>
        
        <div className="portal-modal-content">
          {scanStage === 'scanning' && (
            <div className="portal-scan-wrapper">
              <div className="portal-pulse-scanner"></div>
              <p className="portal-modal-desc" style={{marginTop: '20px', textAlign: 'center'}}>
                Cross-referencing landmark coordinates and visual metadata...
              </p>
            </div>
          )}

          {scanStage === 'complete' && (
            <div style={{textAlign: 'center', padding: '8px 0'}}>
              <span className="material-symbols-rounded" style={{color: 'var(--secondary-color)', fontSize: '56px'}}>check_circle</span>
              <h4 className="portal-modal-title" style={{margin: '12px 0 6px 0', textAlign: 'center', width: '100%'}}>Scan Diagnostics Complete</h4>
              <p className="portal-modal-desc" style={{textAlign: 'center', marginBottom: '20px'}}>
                Target database matches synced successfully.
              </p>
              
              <div className="portal-modal-highlight-box" style={{
                backgroundColor: 'rgba(30,142,62,0.1)',
                border: '1px solid rgba(30,142,62,0.2)'
              }}>
                <strong style={{fontSize: '13px', color: 'var(--secondary-color)', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
                  Neural Match Probability
                </strong>
                <div style={{fontSize: '36px', fontWeight: 'bold', color: 'var(--secondary-color)', margin: '8px 0'}}>
                  {matchScore}% Match
                </div>
                <span className="portal-modal-desc" style={{fontSize: '12px', margin: 0}}>
                  Confidence score calculated across 4 active neural landmark layers.
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="portal-modal-actions">
          <button 
            onClick={triggerScan} 
            disabled={scanStage === 'scanning'}
            className="portal-modal-btn-secondary portal-btn-secondary-outline"
          >
            Scan Again
          </button>
          <button onClick={onClose} className="portal-modal-btn-primary portal-btn-primary">
            Close Console
          </button>
        </div>
      </div>
    </div>
  );
}

export default AiScannerModal;
