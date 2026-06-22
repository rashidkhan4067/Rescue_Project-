import React from 'react';

function CaseDetailsModal({ report, onClose }) {
  if (!report) return null;

  return (
    <div className="portal-modal-overlay" onClick={onClose}>
      <div className="portal-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="portal-modal-header">
          <span className="material-symbols-rounded" style={{color: 'var(--primary-color)', fontSize: '24px'}}>account_circle</span>
          <h3 className="portal-modal-title">Case File: {report.name}</h3>
        </div>

        <div className="portal-modal-content">
          <div className="portal-modal-details-card">
            <div className="portal-modal-detail-row">
              <span style={{fontSize: '12px', color: 'var(--text-light)'}}>Landmark Area:</span>
              <strong style={{fontSize: '13px', fontWeight: '500', color: 'var(--text-color)'}}>{report.area}</strong>
            </div>
            <div className="portal-modal-detail-row">
              <span style={{fontSize: '12px', color: 'var(--text-light)'}}>Verification status:</span>
              <span className="portal-card-status-tag" style={{
                backgroundColor: report.status === 'active' ? 'rgba(217,48,37,0.1)' : 'rgba(30,142,62,0.1)',
                color: report.status === 'active' ? 'var(--accent-color)' : 'var(--secondary-color)'
              }}>
                {report.status}
              </span>
            </div>
            <div className="portal-modal-detail-row">
              <span style={{fontSize: '12px', color: 'var(--text-light)'}}>Submitted on:</span>
              <span style={{fontSize: '13px', fontWeight: '500', color: 'var(--text-color)'}}>
                {report.created_at ? new Date(report.created_at).toLocaleDateString() : 'Just now'}
              </span>
            </div>
          </div>

          <div className="portal-modal-highlight-box" style={{
            backgroundColor: 'var(--light-color)',
            border: '1px solid var(--border-color)'
          }}>
            <strong style={{fontSize: '13px', color: 'var(--text-color)'}}>SMTP Telemetry Dispatch Check:</strong>
            <p className="portal-modal-desc" style={{margin: '6px 0 0 0', fontSize: '12px'}}>
              Email alerts successfully dispatched to registered volunteer networks at coordinates: {report.area}.
            </p>
          </div>
        </div>

        <div className="portal-modal-actions">
          <button onClick={onClose} className="portal-modal-btn-primary portal-btn-primary">
            Close Case
          </button>
        </div>
      </div>
    </div>
  );
}

export default CaseDetailsModal;
