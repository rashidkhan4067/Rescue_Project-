import React from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterCaseModal from '../../components/dashboard/RegisterCaseModal';

function CreateCasePage() {
  const navigate = useNavigate();

  // Use the same modal component but open it as a full page view
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
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

export default CreateCasePage;
