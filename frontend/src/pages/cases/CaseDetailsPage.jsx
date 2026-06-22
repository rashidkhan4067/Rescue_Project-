import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import PortalCard from '../../components/dashboard/PortalCard';
import { caseService, adminService } from '../../services';
import { useApi } from '../../hooks/useApi';
import { getImageUrl } from '../../utils/image';
import { useAuthStore } from '../../store/useAuthStore';

function CaseDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('home');
  const [actionSuccess, setActionSuccess] = useState('');
  const [localError, setLocalError] = useState('');

  // Modals & Form states
  const [showEditModal, setShowEditModal] = useState(false);
  const [caseForm, setCaseForm] = useState({
    name: '', age: '', gender: 'Male', area: '', description: '',
    status: 'active', severity: 'Standard Search',
    height: '', weight: '', hair: '', eyes: '', clothing: '', marks: ''
  });

  const { data: report, loading, error: fetchError, execute: getDetails, setData: setReport } = useApi(caseService.getDetails);
  const { loading: statusUpdating, execute: updateStatus } = useApi(caseService.updateStatus);

  const parseCoordinates = (areaString) => {
    if (!areaString) return { lat: 33.6844, lng: 73.0479 };
    const isMultan = areaString.toLowerCase().includes('multan');
    const regex = /\((-?\d+\.\d+)[°\s]*[NS]?,\s*(-?\d+\.\d+)[°\s]*[EW]?\)/i;
    const match = areaString.match(regex);
    if (match) {
      return {
        lat: parseFloat(match[1]),
        lng: parseFloat(match[2])
      };
    }
    const hash = areaString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    if (isMultan) {
      return {
        lat: 30.15 + ((hash % 30) / 1000),
        lng: 71.52 + ((hash % 50) / 1000)
      };
    }
    return {
      lat: 33.68 + ((hash % 30) / 1000),
      lng: 73.04 + ((hash % 50) / 1000)
    };
  };

  useEffect(() => {
    getDetails(id);
  }, [id]);

  const toggleStatus = async () => {
    if (!report) return;
    setActionSuccess('');
    setLocalError('');
    
    // Safely extract active state
    const caseData = report.data && !report.name ? report.data : report;
    const targetStatus = caseData.status === 'active' ? 'resolved' : 'active';
    
    const res = await updateStatus(id, targetStatus);
    if (res.success && res.data) {
      setReport(prev => {
        if (prev.data && !prev.name) {
          return { ...prev, data: { ...prev.data, status: res.data.status } };
        }
        return { ...prev, status: res.data.status };
      });
      setActionSuccess(`Case status successfully changed to "${targetStatus}".`);
      setTimeout(() => setActionSuccess(''), 4000);
    } else {
      setLocalError('Failed to update case status.');
    }
  };

  // Open edit modal
  const handleOpenEdit = () => {
    const caseData = report.data && !report.name ? report.data : report;
    setCaseForm({
      name: caseData.name || '',
      age: caseData.age || '',
      gender: caseData.gender || 'Male',
      area: caseData.area || '',
      description: caseData.description || '',
      status: caseData.status || 'active',
      severity: caseData.severity || 'Standard Search',
      height: caseData.height || '',
      weight: caseData.weight || '',
      hair: caseData.hair || '',
      eyes: caseData.eyes || '',
      clothing: caseData.clothing || '',
      marks: caseData.marks || ''
    });
    setShowEditModal(true);
  };

  // Submit save
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setActionSuccess('');
    
    const res = await caseService.updateDetails(id, caseForm);
    if (res.success) {
      setReport(prev => {
        if (prev.data && !prev.name) {
          return { ...prev, data: { ...prev.data, ...res.data } };
        }
        return { ...prev, ...res.data };
      });
      setActionSuccess('Incident file details updated successfully.');
      setShowEditModal(false);
      setTimeout(() => setActionSuccess(''), 4000);
    } else {
      setLocalError(res.error || 'Failed to update case file details.');
    }
  };

  // Delete Case
  const handleDeleteCase = async () => {
    const caseData = report.data && !report.name ? report.data : report;
    if (!window.confirm(`Are you absolutely sure you want to permanently erase the case file for "${caseData.name}"? This action is irreversible.`)) {
      return;
    }
    setLocalError('');
    setActionSuccess('');
    const res = await adminService.deleteCase(id);
    if (res.success) {
      alert(`Case file for "${caseData.name}" has been permanently purged.`);
      navigate('/dashboard');
    } else {
      setLocalError(res.error || 'Failed to purge coordinates registry.');
    }
  };

  const error = fetchError || localError;

  if (loading) {
    return (
      <div className="portal-scan-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="portal-pulse-scanner" style={{ width: '40px', height: '40px', borderWidth: '3px', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '16px', color: 'var(--text-light)', fontFamily: "'Google Sans', sans-serif" }}>Loading case details...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-color)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center'
      }}>
        <span className="material-symbols-rounded" style={{ color: 'var(--accent-color)', fontSize: '56px', marginBottom: '16px' }}>error</span>
        <h2 style={{ color: 'var(--text-color)', margin: '0 0 8px 0' }}>Case Not Found</h2>
        <p style={{ color: 'var(--text-light)', maxWidth: '380px', margin: '0 0 24px 0' }}>{error || 'This case does not exist or you do not have permission to view it.'}</p>
        <button onClick={() => navigate('/dashboard')} className="portal-modal-btn-primary portal-btn-primary">
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Safe Case Data extraction (handles both unwrapped data objects and Axios response envelopes)
  const caseData = report.data && !report.name ? report.data : report;

  const getSeverityStyles = (sev) => {
    if (!sev) return { color: '#f9ab00', bg: 'rgba(249,171,0,0.15)', border: '1px solid rgba(249,171,0,0.3)', pulsing: false };
    const lower = sev.toLowerCase();
    if (lower.includes('critical') || lower.includes('amber')) {
      return { color: '#ea4335', bg: 'rgba(234,67,53,0.12)', border: '1px solid rgba(234,67,53,0.25)', pulsing: true };
    }
    if (lower.includes('advisory')) {
      return { color: '#1a73e8', bg: 'rgba(26,115,232,0.12)', border: '1px solid rgba(26,115,232,0.25)', pulsing: false };
    }
    return { color: '#f9ab00', bg: 'rgba(249,171,0,0.12)', border: '1px solid rgba(249,171,0,0.25)', pulsing: false };
  };

  const sevStyle = getSeverityStyles(caseData.severity);
  const isMultan = caseData.area && caseData.area.toLowerCase().includes('multan');

  // Convert GPS coordinates into SVG ViewBox coordinates (X: 50 to 450, Y: 50 to 250)
  const getSvgCoordinates = (lat, lng) => {
    const minLat = isMultan ? 30.10 : 33.60;
    const maxLat = isMultan ? 30.25 : 33.75;
    const minLng = isMultan ? 71.45 : 73.00;
    const maxLng = isMultan ? 71.60 : 73.15;
    
    const y = 250 - (((lat - minLat) / (maxLat - minLat)) * 200);
    const x = 50 + (((lng - minLng) / (maxLng - minLng)) * 400);
    return { x: Math.max(30, Math.min(x, 470)), y: Math.max(30, Math.min(y, 270)) };
  };

  const coords = parseCoordinates(caseData.area);
  const svgPos = getSvgCoordinates(coords.lat, coords.lng);
  const imageUrl = getImageUrl(caseData.image);

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="portal-main-container dashboard-main-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Navigation & Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-light)',
              display: 'inline-flex',
              alignItems: 'center',
              padding: '6px',
              borderRadius: '50%',
              transition: 'background-color 0.15s'
            }}
            title="Back to Dashboard"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--light-color)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <span className="material-symbols-rounded">arrow_back</span>
          </button>
          <span style={{ fontSize: '13px', color: 'var(--text-light)' }}>Cases / Details</span>
        </div>

        {/* Dynamic Title / Actions Row */}
        <header className="portal-header-bar dashboard-header-bar" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <div>
            <h1 className="portal-welcome-title dashboard-welcome-title" style={{ fontSize: '28px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {caseData.name}
              
              {/* Status Badge */}
              <span style={{
                fontSize: '12px',
                fontWeight: 'bold',
                padding: '4px 10px',
                borderRadius: '12px',
                textTransform: 'uppercase',
                backgroundColor: caseData.status === 'active' ? 'rgba(234, 67, 53, 0.12)' : 'rgba(52, 168, 83, 0.12)',
                color: caseData.status === 'active' ? 'var(--accent-color)' : 'var(--secondary-color)',
                border: `1px solid ${caseData.status === 'active' ? 'rgba(234, 67, 53, 0.2)' : 'rgba(52, 168, 83, 0.2)'}`
              }}>
                {caseData.status}
              </span>

              {/* Severity Badge */}
              {caseData.severity && (
                <span style={{
                  fontSize: '12px',
                  fontWeight: 'bold',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  textTransform: 'uppercase',
                  backgroundColor: sevStyle.bg,
                  color: sevStyle.color,
                  border: sevStyle.border
                }}>
                  {caseData.severity}
                </span>
              )}
            </h1>
            <p className="portal-welcome-sub dashboard-welcome-sub" style={{ marginTop: '4px' }}>
              Missing person file registry & rescue coordination dashboard.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button 
              onClick={toggleStatus}
              disabled={statusUpdating}
              className="portal-modal-btn-primary portal-btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                height: '40px',
                padding: '0 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: caseData.status === 'active' ? 'var(--secondary-color)' : 'var(--primary-color)',
                color: '#ffffff',
                fontWeight: '500',
                fontSize: '14px',
                gap: '8px',
                transition: 'background-color 0.2s, transform 0.1s'
              }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>
                {caseData.status === 'active' ? 'check_circle' : 'restart_alt'}
              </span>
              {caseData.status === 'active' ? 'Mark as Resolved' : 'Re-open Case'}
            </button>

            {(user?.is_admin || user?.id === caseData.user_id) && (
              <>
                <button
                  onClick={handleOpenEdit}
                  className="portal-btn-secondary-outline"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '40px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text-color)',
                    transition: 'all 0.2s'
                  }}
                  title="Edit Case Details"
                >
                  <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>edit</span>
                </button>

                {user?.is_admin && (
                  <button
                    onClick={handleDeleteCase}
                    className="portal-btn-secondary-outline"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '40px',
                      padding: '0 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--error-color)',
                      cursor: 'pointer',
                      backgroundColor: 'transparent',
                      color: 'var(--error-color)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(217, 48, 37, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    title="Permanently Delete Case File"
                  >
                    <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>delete</span>
                  </button>
                )}
              </>
            )}
          </div>
        </header>

        {actionSuccess && (
          <div className="portal-modal-highlight-box" style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(52, 168, 83, 0.1)',
            border: '1px solid rgba(52, 168, 83, 0.2)',
            color: 'var(--secondary-color)',
            fontSize: '14px',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <span className="material-symbols-rounded" style={{ marginRight: '8px' }}>check_circle</span>
            {actionSuccess}
          </div>
        )}

        {/* Dashboard Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
          
          {/* Column A: Case Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Case Photo & Basic Info */}
            <PortalCard title="Case Profile">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Photo Display */}
                <div style={{
                  height: '280px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--light-color)',
                  position: 'relative'
                }}>
                  {imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt={caseData.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <span className="material-symbols-rounded" style={{ fontSize: '56px', color: 'var(--text-light)' }}>portrait</span>
                      <span style={{ fontSize: '13px', color: 'var(--text-light)', fontWeight: '500' }}>No Photograph Uploaded</span>
                    </div>
                  )}
                </div>

                {/* Primary Case Metrics */}
                <div className="portal-modal-details-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: 'var(--light-color)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-light)' }}>Full Name</span>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-color)' }}>{caseData.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-light)' }}>Age / Gender</span>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-color)' }}>{caseData.age} years old • {caseData.gender}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-light)' }}>Last Seen Area</span>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-color)' }}>{caseData.area}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-light)' }}>Last Seen Date</span>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-color)' }}>
                      {caseData.last_seen_date ? new Date(caseData.last_seen_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Not specified'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-light)' }}>Last Seen Time</span>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-color)' }}>
                      {caseData.last_seen_time ? caseData.last_seen_time.toString().slice(0, 5) : 'Not specified'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-light)' }}>Date Registered</span>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-color)' }}>
                      {caseData.created_at ? new Date(caseData.created_at).toLocaleString() : 'Just now'}
                    </span>
                  </div>
                </div>
              </div>
            </PortalCard>

            {/* Physical Characteristics Card */}
            <PortalCard title="Physical Characteristics" icon="fingerprint">
              <div className="portal-modal-details-card" style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', backgroundColor: 'var(--light-color)', borderRadius: '8px' }}>
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-light)', display: 'block', fontWeight: '500', textTransform: 'uppercase' }}>Height</span>
                  <strong style={{ fontSize: '13px', color: 'var(--text-color)', fontWeight: '500' }}>{caseData.height || 'Not recorded'}</strong>
                </div>
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-light)', display: 'block', fontWeight: '500', textTransform: 'uppercase' }}>Weight</span>
                  <strong style={{ fontSize: '13px', color: 'var(--text-color)', fontWeight: '500' }}>{caseData.weight || 'Not recorded'}</strong>
                </div>
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-light)', display: 'block', fontWeight: '500', textTransform: 'uppercase' }}>Hair Color</span>
                  <strong style={{ fontSize: '13px', color: 'var(--text-color)', fontWeight: '500' }}>{caseData.hair || 'Not recorded'}</strong>
                </div>
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-light)', display: 'block', fontWeight: '500', textTransform: 'uppercase' }}>Eye Color</span>
                  <strong style={{ fontSize: '13px', color: 'var(--text-color)', fontWeight: '500' }}>{caseData.eyes || 'Not recorded'}</strong>
                </div>
                <div style={{ gridColumn: 'span 2', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-light)', display: 'block', fontWeight: '500', textTransform: 'uppercase' }}>Clothing Description</span>
                  <strong style={{ fontSize: '13px', color: 'var(--text-color)', fontWeight: '500' }}>{caseData.clothing || 'No clothing details recorded'}</strong>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-light)', display: 'block', fontWeight: '500', textTransform: 'uppercase' }}>Distinctive Marks / Scars</span>
                  <strong style={{ fontSize: '13px', color: 'var(--text-color)', fontWeight: '500' }}>{caseData.marks || 'No physical marks recorded'}</strong>
                </div>
              </div>
            </PortalCard>

            {/* Circumstances of Disappearance */}
            <PortalCard title="Circumstances & Description" icon="description">
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-color)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {caseData.description}
              </p>
            </PortalCard>

          </div>

          {/* Column B: Map & Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Map Card */}
            <PortalCard title={isMultan ? "Multan Search Map" : "Islamabad Search Map"} icon="map">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-light)' }}>
                  Visualizing sector search boundary around location: <strong>{caseData.area}</strong>.
                </p>

                {/* SVG Landscape Map */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  backgroundColor: '#101114',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  overflow: 'hidden',
                  boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
                }}>
                  <svg viewBox="0 0 500 300" style={{ width: '100%', height: 'auto', display: 'block' }}>
                    {isMultan ? (
                      <>
                        {/* Chenab River flowing on the west */}
                        <path d="M 0 0 C 120 100, 85 200, 25 300" fill="none" stroke="#132a4a" strokeWidth="24" opacity="0.65" />
                        
                        {/* Bosan Road / Bypass */}
                        <path d="M 0 160 Q 250 155 500 175" fill="none" stroke="#222630" strokeWidth="8" opacity="0.95" strokeLinecap="round" />
                        <path d="M 0 160 Q 250 155 500 175" fill="none" stroke="#f9ab00" strokeWidth="1" strokeDasharray="5 5" opacity="0.7" />

                        {/* Multan Bypass Road */}
                        <path d="M 0 100 Q 250 95 500 115" fill="none" stroke="#222630" strokeWidth="6" opacity="0.8" />
                        <path d="M 0 100 Q 250 95 500 115" fill="none" stroke="#ffffff" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.4" />

                        {/* Grid Sector dividers */}
                        <line x1="160" y1="50" x2="160" y2="280" stroke="#222630" strokeWidth="4" opacity="0.6" />
                        <line x1="330" y1="50" x2="330" y2="280" stroke="#222630" strokeWidth="4" opacity="0.6" />

                        {/* Map Labels */}
                        <text x="250" y="25" fill="#81c995" fontSize="9" fontWeight="bold" fontFamily="monospace" opacity="0.85" textAnchor="middle">CHENAB FLOODPLAIN BOUNDARY — MULTAN</text>
                        <text x="92.5" y="81" fill="#9aa0a6" fontSize="7" fontWeight="bold" fontFamily="monospace" textAnchor="middle">MULTAN CANTT</text>
                        <text x="92.5" y="136" fill="#9aa0a6" fontSize="7" fontWeight="bold" fontFamily="monospace" textAnchor="middle">BOSAN ROAD</text>
                        <text x="227.5" y="201" fill="#9aa0a6" fontSize="7" fontWeight="bold" fontFamily="monospace" textAnchor="middle">WALLED CITY</text>
                        <text x="337.5" y="236" fill="#9aa0a6" fontSize="7" fontWeight="bold" fontFamily="monospace" textAnchor="middle">SHAH RUKN-E-ALAM</text>
                        <text x="40" y="240" fill="#8ab4f8" fontSize="8" fontWeight="bold" fontFamily="monospace" opacity="0.9" textAnchor="middle">CHENAB RIVER</text>
                      </>
                    ) : (
                      <>
                        {/* Margalla Hills background */}
                        <path d="M 0 0 L 500 0 L 500 55 Q 250 80 0 65 Z" fill="#1b2e22" opacity="0.6" />
                        
                        {/* Rawal Lake */}
                        <path d="M 390 190 Q 420 160 480 170 T 460 260 Q 410 250 390 190 Z" fill="#132a4a" opacity="0.75" />

                        {/* Kashmir Highway */}
                        <path d="M 0 170 Q 250 160 500 185" fill="none" stroke="#222630" strokeWidth="8" opacity="0.95" strokeLinecap="round" />
                        <path d="M 0 170 Q 250 160 500 185" fill="none" stroke="#f9ab00" strokeWidth="1" strokeDasharray="5 5" opacity="0.7" />

                        {/* Jinnah Avenue */}
                        <path d="M 0 110 Q 250 100 500 125" fill="none" stroke="#222630" strokeWidth="6" opacity="0.8" />
                        <path d="M 0 110 Q 250 100 500 125" fill="none" stroke="#ffffff" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.4" />

                        {/* Sector dividers */}
                        <line x1="160" y1="60" x2="160" y2="280" stroke="#222630" strokeWidth="4" opacity="0.6" />
                        <line x1="330" y1="60" x2="330" y2="280" stroke="#222630" strokeWidth="4" opacity="0.6" />

                        {/* Map Labels */}
                        <text x="250" y="25" fill="#81c995" fontSize="9" fontWeight="bold" fontFamily="monospace" opacity="0.85" textAnchor="middle">MARGALLA HILLS — ISLAMABAD</text>
                        <text x="87.5" y="91" fill="#9aa0a6" fontSize="7" fontWeight="bold" fontFamily="monospace" textAnchor="middle">SECTOR F-7</text>
                        <text x="87.5" y="146" fill="#9aa0a6" fontSize="7" fontWeight="bold" fontFamily="monospace" textAnchor="middle">SECTOR F-11</text>
                        <text x="222.5" y="211" fill="#9aa0a6" fontSize="7" fontWeight="bold" fontFamily="monospace" textAnchor="middle">SECTOR G-10</text>
                        <text x="327.5" y="246" fill="#9aa0a6" fontSize="7" fontWeight="bold" fontFamily="monospace" textAnchor="middle">SECTOR H-9</text>
                        <text x="435" y="215" fill="#8ab4f8" fontSize="8" fontWeight="bold" fontFamily="monospace" opacity="0.9" textAnchor="middle">RAWAL LAKE</text>
                      </>
                    )}

                    {/* Grid Overlay */}
                    {Array.from({ length: 10 }).map((_, i) => (
                      <line key={`v-${i}`} x1={i * 50} y1="0" x2={i * 50} y2="300" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                    ))}
                    {Array.from({ length: 6 }).map((_, i) => (
                      <line key={`h-${i}`} x1="0" y1={i * 50} x2="500" y2={i * 50} stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                    ))}

                    {/* Active search boundary sweep effect */}
                    {caseData.status === 'active' && (
                      <line x1="250" y1="150" x2="450" y2="50" stroke="rgba(26,115,232,0.2)" strokeWidth="1.5" style={{ transformOrigin: '250px 150px', animation: 'spin 8s linear infinite' }} />
                    )}

                    {/* Target Pin Marker */}
                    <g>
                      {caseData.status === 'active' && (
                        <>
                          <circle cx={svgPos.x} cy={svgPos.y} r="16" fill="none" stroke={caseData.status === 'active' ? '#ea4335' : '#34a853'} strokeWidth="1.5" opacity="0.5" style={{ transformOrigin: `${svgPos.x}px ${svgPos.y}px`, animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
                          <circle cx={svgPos.x} cy={svgPos.y} r="32" fill="none" stroke={caseData.status === 'active' ? '#ea4335' : '#34a853'} strokeWidth="0.8" opacity="0.25" style={{ transformOrigin: `${svgPos.x}px ${svgPos.y}px`, animation: 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
                        </>
                      )}
                      <circle cx={svgPos.x} cy={svgPos.y} r="7" fill={caseData.status === 'active' ? '#ea4335' : '#34a853'} stroke="#ffffff" strokeWidth="2" />
                      <circle cx={svgPos.x} cy={svgPos.y} r="2" fill="#ffffff" />
                    </g>
                  </svg>

                  {/* Readout coordinates bar */}
                  <span style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '12px',
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    color: 'var(--text-light)',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    padding: '3px 8px',
                    borderRadius: '4px'
                  }}>
                    Lat: {coords.lat.toFixed(4)}° N / Lng: {coords.lng.toFixed(4)}° E
                  </span>
                </div>
              </div>
            </PortalCard>

            {/* Operational History / Simple Timeline */}
            <PortalCard title="Case Operational History" icon="history">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '20px' }}>
                
                {/* Vertical Timeline Bar */}
                <div style={{
                  position: 'absolute',
                  left: '6px',
                  top: '4px',
                  bottom: '4px',
                  width: '2px',
                  backgroundColor: 'var(--border-color)'
                }} />

                {/* Timeline Node 1: Created */}
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '-18px',
                    top: '4px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-color)'
                  }} />
                  <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-light)' }}>
                    {caseData.created_at ? new Date(caseData.created_at).toLocaleDateString() : 'Just now'}
                  </span>
                  <strong style={{ display: 'block', fontSize: '13px', color: 'var(--text-color)', fontWeight: '500', margin: '2px 0 1px 0' }}>
                    Report Filed in Registry
                  </strong>
                  <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                    Missing person profile and characteristics cataloged successfully by User #{caseData.user_id}.
                  </span>
                </div>

                {/* Timeline Node 2: Alert Dispatched */}
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '-18px',
                    top: '4px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--secondary-color)'
                  }} />
                  <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-light)' }}>
                    {caseData.created_at ? new Date(caseData.created_at).toLocaleDateString() : 'Just now'}
                  </span>
                  <strong style={{ display: 'block', fontSize: '13px', color: 'var(--text-color)', fontWeight: '500', margin: '2px 0 1px 0' }}>
                    Community Broadcast Sent
                  </strong>
                  <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                    Search alerts broadcasted to the local volunteer network for the {caseData.area} area.
                  </span>
                </div>

                {/* Timeline Node 3: Current Status */}
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '-18px',
                    top: '4px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: caseData.status === 'active' ? 'var(--warning-color)' : 'var(--secondary-color)'
                  }} />
                  <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-light)' }}>
                    Current Action State
                  </span>
                  <strong style={{ display: 'block', fontSize: '13px', color: 'var(--text-color)', fontWeight: '500', margin: '2px 0 1px 0' }}>
                    {caseData.status === 'active' ? 'Active Search Ongoing' : 'Case Marked Resolved'}
                  </strong>
                  <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                    {caseData.status === 'active' 
                      ? 'Local search volunteers and coordinators notified. Coordinates highlighted on active radar map.'
                      : 'The missing person has been successfully located, and the registry search files are closed.'
                    }
                  </span>
                </div>

              </div>
            </PortalCard>

          </div>

        </div>

      </div>

      {/* Case Details Edit Overlay Modal */}
      {showEditModal && (
        <div className="portal-modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 99999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px', animation: 'fadeIn 0.2s ease-out', overflowY: 'auto'
        }}>
          <div className="portal-modal-card" style={{
            backgroundColor: 'var(--card-bg)', borderRadius: '12px',
            width: '100%', maxWidth: '720px', padding: '24px',
            boxShadow: 'var(--box-shadow-md)', maxHeight: '90vh', overflowY: 'auto',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-color)' }}>
                Modify Incident Case File Details
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', color: 'var(--text-light)' }}
              >
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-light)' }}>Victim Full Name *</label>
                  <input
                    type="text" required
                    value={caseForm.name}
                    onChange={(e) => setCaseForm({ ...caseForm, name: e.target.value })}
                    placeholder="e.g. Bobby Smith"
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', backgroundColor: 'transparent', color: 'var(--text-color)' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-light)' }}>Victim Age *</label>
                  <input
                    type="number" required
                    value={caseForm.age}
                    onChange={(e) => setCaseForm({ ...caseForm, age: e.target.value })}
                    placeholder="e.g. 12"
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', backgroundColor: 'transparent', color: 'var(--text-color)' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-light)' }}>Gender *</label>
                  <select
                    value={caseForm.gender}
                    onChange={(e) => setCaseForm({ ...caseForm, gender: e.target.value })}
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-light)' }}>Last Seen Area Grid *</label>
                  <input
                    type="text" required
                    value={caseForm.area}
                    onChange={(e) => setCaseForm({ ...caseForm, area: e.target.value })}
                    placeholder="e.g. Sector G-10, Islamabad"
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', backgroundColor: 'transparent', color: 'var(--text-color)' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-light)' }}>Severity Level</label>
                  <select
                    value={caseForm.severity}
                    onChange={(e) => setCaseForm({ ...caseForm, severity: e.target.value })}
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}
                  >
                    <option value="Advisory">Advisory (Low)</option>
                    <option value="Standard Search">Standard Search</option>
                    <option value="Critical Amber Alert">Critical Amber Alert (High)</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-light)' }}>Search Status</label>
                  <select
                    value={caseForm.status}
                    onChange={(e) => setCaseForm({ ...caseForm, status: e.target.value })}
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}
                  >
                    <option value="active">Active Radar Beacon</option>
                    <option value="pending">Pending Verification</option>
                    <option value="resolved">Resolved (Deactivated)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-light)' }}>Incident Circumstances / Physical Identifiers *</label>
                <textarea
                  required rows={3}
                  value={caseForm.description}
                  onChange={(e) => setCaseForm({ ...caseForm, description: e.target.value })}
                  placeholder="Provide a polished description of physical descriptors, marks, and last seen details..."
                  style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', resize: 'vertical', backgroundColor: 'transparent', color: 'var(--text-color)', fontFamily: 'inherit' }}
                />
              </div>

              {/* Optional Physical Tags */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px', marginTop: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-light)', display: 'block', marginBottom: '12px' }}>Physical Telemetry Registry (Optional Descriptors)</span>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-light)' }}>Height (e.g. 5'3")</label>
                    <input
                      type="text" value={caseForm.height}
                      onChange={(e) => setCaseForm({ ...caseForm, height: e.target.value })}
                      style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '12px', backgroundColor: 'transparent', color: 'var(--text-color)' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-light)' }}>Weight (e.g. 50 kg)</label>
                    <input
                      type="text" value={caseForm.weight}
                      onChange={(e) => setCaseForm({ ...caseForm, weight: e.target.value })}
                      style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '12px', backgroundColor: 'transparent', color: 'var(--text-color)' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-light)' }}>Hair details</label>
                    <input
                      type="text" value={caseForm.hair}
                      onChange={(e) => setCaseForm({ ...caseForm, hair: e.target.value })}
                      placeholder="e.g. Short brown"
                      style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '12px', backgroundColor: 'transparent', color: 'var(--text-color)' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-light)' }}>Eye color</label>
                    <input
                      type="text" value={caseForm.eyes}
                      onChange={(e) => setCaseForm({ ...caseForm, eyes: e.target.value })}
                      placeholder="e.g. Dark brown"
                      style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '12px', backgroundColor: 'transparent', color: 'var(--text-color)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-light)' }}>Clothing Worn</label>
                    <input
                      type="text" value={caseForm.clothing}
                      onChange={(e) => setCaseForm({ ...caseForm, clothing: e.target.value })}
                      placeholder="e.g. Red sweater, blue school uniform pants"
                      style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '12px', backgroundColor: 'transparent', color: 'var(--text-color)' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-light)' }}>Distinctive Marks / Scars</label>
                    <input
                      type="text" value={caseForm.marks}
                      onChange={(e) => setCaseForm({ ...caseForm, marks: e.target.value })}
                      placeholder="e.g. Birthmark on left cheek, dental braces"
                      style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '12px', backgroundColor: 'transparent', color: 'var(--text-color)' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{
                    height: '38px', padding: '0 16px', fontSize: '13px', fontWeight: '500', borderRadius: '20px',
                    cursor: 'pointer', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-light)'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    height: '38px', padding: '0 20px', fontSize: '13px', fontWeight: '500', borderRadius: '20px',
                    cursor: 'pointer', border: 'none', backgroundColor: 'var(--primary-color)', color: 'white',
                    boxShadow: 'var(--box-shadow)'
                  }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default CaseDetailsPage;
