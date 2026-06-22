import React from 'react';
import { useNavigate } from 'react-router-dom';
import PortalCard from './PortalCard';

function CaseList({ filteredReports, onRegisterNewCase }) {
  const navigate = useNavigate();

  return (
    <section className="portal-section-container">
      <div className="portal-section-header">
        <h2 className="portal-section-title">Tracked Case Logs</h2>
        <span className="portal-section-counter">{filteredReports.length} matches</span>
      </div>

      {filteredReports.length === 0 ? (
        <div className="portal-empty-state">
          <span className="material-symbols-rounded portal-empty-icon">folder_off</span>
          <p className="portal-empty-text">No registered case logs match your search filters.</p>
          <button 
            onClick={onRegisterNewCase} 
            className="portal-empty-btn portal-btn-secondary-outline"
            style={{ cursor: 'pointer', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '10px 16px', background: 'none' }}
          >
            Register New Case Report
          </button>
        </div>
      ) : (
        <div className="portal-card-grid">
          {filteredReports.map(report => (
            <PortalCard 
              key={report.id} 
              hoverable
              onClick={() => navigate(`/case/${report.id}`)}
              className="portal-case-card-item"
            >
              <div className="portal-card-header">
                <div className="portal-card-avatar">
                  {report.name.substring(0, 1).toUpperCase()}
                </div>
                <div>
                  <h3 className="portal-card-name">{report.name}</h3>
                  <span className="portal-card-meta">Last seen: {report.area}</span>
                </div>
              </div>

              <div className="portal-card-divider"></div>

              <div className="portal-card-details">
                <div className="portal-card-detail-item">
                  <span className="portal-card-detail-label">Telemetry Area</span>
                  <span className="portal-card-detail-value">{report.area}</span>
                </div>
                <div className="portal-card-detail-item">
                  <span className="portal-card-detail-label">Verification Status</span>
                  <span className="portal-card-status-tag" style={{
                    backgroundColor: report.status === 'active' ? 'rgba(217,48,37,0.1)' : 'rgba(30,142,62,0.1)',
                    color: report.status === 'active' ? 'var(--accent-color)' : 'var(--secondary-color)'
                  }}>
                    {report.status}
                  </span>
                </div>
              </div>

              <div className="portal-card-action-row">
                <span className="portal-card-date">
                  Uploaded: {report.created_at ? new Date(report.created_at).toLocaleDateString() : 'Just now'}
                </span>
                <span className="material-symbols-rounded portal-card-arrow">chevron_right</span>
              </div>
            </PortalCard>
          ))}
        </div>
      )}
    </section>
  );
}

export default CaseList;
