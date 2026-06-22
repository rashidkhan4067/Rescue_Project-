import React from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterCaseModal from '../../components/dashboard/RegisterCaseModal';

function Report() {
  const navigate = useNavigate();

  return (
    <div className="portal-scan-wrapper" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-color)',
      padding: '24px 16px',
      boxSizing: 'border-box'
    }}>
      <RegisterCaseModal 
        isOpen={true} 
        onClose={() => navigate('/dashboard')}
        onRegisterSuccess={() => navigate('/dashboard')}
      />
    </div>
  );
}

export default Report;
