import React, { useState, useEffect } from 'react';
import { caseService } from '../../services';
import { useApi } from '../../hooks/useApi';

function Alerts() {
  const { data, loading, execute: fetchAlerts } = useApi(caseService.getAlerts);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const alerts = data?.alerts || [];

  return (
    <div style={styles.container}>
      <h2 style={{marginBottom: '20px', color: 'var(--error-color)'}}>
        <span className="material-symbols-rounded" style={{verticalAlign: 'middle', marginRight: '10px'}}>emergency</span>
        Recent Urgent Alerts
      </h2>
      
      {loading ? (
        <p>Loading alerts...</p>
      ) : alerts.length === 0 ? (
        <div style={styles.empty}>No recent alerts in your network.</div>
      ) : (
        <div style={styles.list}>
          {alerts.map(alert => (
            <div key={alert.id} style={styles.alertCard}>
              <div style={styles.alertHeader}>
                <h3>{alert.name}</h3>
                <span style={styles.time}>{new Date(alert.created_at).toLocaleString()}</span>
              </div>
              <p><strong>Last seen location:</strong> {alert.area}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '800px', margin: '0 auto', padding: '3rem 1rem' },
  empty: { padding: '3rem', textAlign: 'center', background: 'var(--light-color)', borderRadius: '8px', border: '1px dashed var(--border-color)' },
  list: { display: 'flex', flexDirection: 'column', gap: '15px' },
  alertCard: { padding: '20px', borderLeft: '4px solid var(--error-color)', background: 'var(--card-bg)', borderRadius: '4px', boxShadow: 'var(--box-shadow)', borderRight: '1px solid var(--border-color)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' },
  alertHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  time: { fontSize: '12px', color: 'var(--text-light)', background: 'var(--light-color)', padding: '4px 8px', borderRadius: '12px' }
};

export default Alerts;
