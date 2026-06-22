import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PortalCard from '../../components/dashboard/PortalCard';
import { MaterialInput, MaterialSelect } from '../../components/common/MaterialFormElements';
import { volunteerService } from '../../services';
import { useApi } from '../../hooks/useApi';
import { useAuthStore } from '../../store/useAuthStore';

function VolunteersPage() {
  const [activeTab, setActiveTab] = useState('home');
  const { user } = useAuthStore();
  
  // Registration Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState(null); // If null, enlisting, otherwise editing
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    sector: 'Sector G-10',
    role: 'Search Team Leader',
    status: 'Standby'
  });
  const [localFormError, setLocalFormError] = useState('');

  // Dispatch States
  const [selectedSector, setSelectedSector] = useState('Sector G-10');
  const [log, setLog] = useState([]);
  const [casesFound, setCasesFound] = useState([]);
  const [mobilizedCount, setMobilizedCount] = useState(0);

  const { data, loading, execute: fetchVolunteers } = useApi(volunteerService.getAll);
  const volunteers = data || [];
  const { loading: submitting, error: postError, execute: registerVolunteer } = useApi(volunteerService.register);
  const { loading: dispatching, execute: mobilizeSector } = useApi(volunteerService.mobilize);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOpenEdit = (vol) => {
    setEditingVolunteer(vol);
    setFormData({
      name: vol.name || '',
      email: vol.email || '',
      phone: vol.phone || '',
      sector: vol.sector || 'Sector G-10',
      role: vol.role || 'Search Team Leader',
      status: vol.status || 'Standby'
    });
    setIsModalOpen(true);
  };

  const handleOpenRegister = () => {
    setEditingVolunteer(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      sector: 'Sector G-10',
      role: 'Search Team Leader',
      status: 'Standby'
    });
    setIsModalOpen(true);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLocalFormError('');
    
    if (editingVolunteer) {
      // Update
      const res = await volunteerService.update(editingVolunteer.id, formData);
      if (res.success) {
        setIsModalOpen(false);
        setEditingVolunteer(null);
        setFormData({
          name: '', email: '', phone: '', sector: 'Sector G-10', role: 'Search Team Leader', status: 'Standby'
        });
        fetchVolunteers();
      } else {
        setLocalFormError(res.error || 'Failed to update responder details.');
      }
    } else {
      // Create
      const res = await registerVolunteer(formData);
      if (res.success) {
        setIsModalOpen(false);
        setFormData({
          name: '', email: '', phone: '', sector: 'Sector G-10', role: 'Search Team Leader', status: 'Standby'
        });
        fetchVolunteers();
      }
    }
  };

  const handleDeleteVolunteer = async (vId, vName) => {
    if (!window.confirm(`Are you absolutely sure you want to permanently decommission ground responder "${vName}"?`)) {
      return;
    }
    const res = await volunteerService.delete(vId);
    if (res.success) {
      fetchVolunteers();
    } else {
      alert(res.error || 'Failed to decommission responder.');
    }
  };

  const handleDispatch = async () => {
    setLog([]);
    setCasesFound([]);
    setMobilizedCount(0);

    const steps = [
      `Initializing geofenced dispatch protocols for ${selectedSector}...`,
      `Scanning database for active search volunteers registered in grid...`,
      `Connecting to emergency SMTP mail delivery subsystem...`,
      `Synthesizing missing person coordinates and landmark telemetry...`
    ];

    let currentStep = 0;
    const playLogs = () => {
      return new Promise((resolve) => {
        const interval = setInterval(() => {
          if (currentStep < steps.length) {
            setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${steps[currentStep]}`]);
            currentStep++;
          } else {
            clearInterval(interval);
            resolve();
          }
        }, 500);
      });
    };

    await playLogs();

    const response = await mobilizeSector(selectedSector);
    if (response.success && response.data) {
      const { dispatched_count, cases_found, responders_mobilized, volunteers: dispatchedResponders } = response.data;
      const dispatchedNames = dispatchedResponders?.map(v => v.name).join(', ') || 'Available Sector Units';

      setLog(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] 📬 Outbound SMTP Alert sent successfully to ${dispatched_count} active addresses.`,
        `[${new Date().toLocaleTimeString()}] 🔍 Detected ${cases_found.length} active missing person profile(s) inside sector borders.`,
        `[${new Date().toLocaleTimeString()}] 🛡️ Dispatched: [${dispatchedNames}]`,
        `[${new Date().toLocaleTimeString()}] ✅ Dispatch operation completed. ${responders_mobilized} volunteers mobilized to the coordinate path.`
      ]);

      setCasesFound(cases_found);
      setMobilizedCount(responders_mobilized);
      fetchVolunteers();
    } else {
      setLog(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ⚠️ SMTP broadcast alert failed. Emergency system returned degraded signal logic.`
      ]);
    }
  };

  const formError = postError || localFormError;

  const statusColor = {
    'Active': { bg: 'rgba(30,142,62,0.1)', text: '#1e8e3e' },
    'Standby': { bg: 'rgba(249,171,0,0.1)', text: '#f9ab00' },
    'Offline': { bg: 'rgba(128,128,128,0.1)', text: '#6b7280' }
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="portal-main-container dashboard-main-container">
        
        {/* Page Header */}
        <header className="portal-header-bar dashboard-header-bar" style={{ marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-rounded" style={{ color: 'var(--secondary-color)', fontSize: '28px' }}>groups</span>
              <h1 className="portal-welcome-title dashboard-welcome-title">Volunteer Rescue Teams</h1>
            </div>
            <p className="portal-welcome-sub dashboard-welcome-sub">
              Register search volunteers, organize local patrols, and coordinate geofenced emergency broadcasts inside Islamabad search sectors.
            </p>
          </div>
          <button
            onClick={handleOpenRegister}
            className="portal-modal-btn-primary portal-btn-primary"
            style={{
              height: '42px',
              borderRadius: '24px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              border: 'none',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(26,115,232,0.3)'
            }}
          >
            <span className="material-symbols-rounded">person_add</span>
            Join the Rescue Grid
          </button>
        </header>

        {/* Quick Stats Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {[
            { label: 'Total Responders', value: loading ? '...' : volunteers.length, icon: 'person', color: 'var(--primary-color)' },
            { label: 'Currently Active', value: loading ? '...' : volunteers.filter(v => v.status === 'Active').length, icon: 'check_circle', color: '#1e8e3e' },
            { label: 'On Standby', value: loading ? '...' : volunteers.filter(v => v.status === 'Standby').length, icon: 'schedule', color: '#f9ab00' },
            { label: 'Offline / Enroute', value: loading ? '...' : volunteers.filter(v => v.status === 'Offline').length, icon: 'block', color: '#6b7280' },
          ].map((stat, i) => (
            <div key={i} style={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span className="material-symbols-rounded" style={{ fontSize: '24px', color: stat.color }}>{stat.icon}</span>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-color)' }}>{stat.value}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: '500' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          
          {/* Send Alert Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <PortalCard title="Send Area Alert" icon="share_location">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div style={{
                  backgroundColor: 'rgba(26,115,232,0.05)',
                  border: '1px solid rgba(26,115,232,0.15)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'flex-start'
                }}>
                  <span className="material-symbols-rounded" style={{ color: 'var(--primary-color)', fontSize: '20px', flexShrink: 0, marginTop: '1px' }}>info</span>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-light)', lineHeight: '1.6' }}>
                    Choose an area below and click <strong>"Send Alert"</strong>. All active volunteers inside that database sector will be notified by email with coordinate search maps.
                  </p>
                </div>

                {/* Area Selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Select Search Area
                  </label>
                  <select
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                    style={{
                      height: '42px',
                      padding: '0 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--text-color)',
                      fontSize: '14px',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="Sector G-10">Sector G-10, Islamabad</option>
                    <option value="Sector F-11">Sector F-11, Islamabad</option>
                    <option value="Sector F-7">Sector F-7, Islamabad</option>
                    <option value="Sector H-9">Sector H-9, Islamabad</option>
                  </select>
                </div>

                <button
                  onClick={handleDispatch}
                  disabled={dispatching}
                  className="portal-modal-btn-primary portal-btn-primary"
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: dispatching ? 'not-allowed' : 'pointer',
                    opacity: dispatching ? 0.8 : 1
                  }}
                >
                  <span className="material-symbols-rounded">{dispatching ? 'hourglass_top' : 'campaign'}</span>
                  {dispatching ? 'Sending Alerts...' : `Send Alert to ${selectedSector}`}
                </button>

                {/* Result summary after dispatch */}
                {mobilizedCount > 0 && (
                  <div style={{
                    backgroundColor: 'rgba(30,142,62,0.08)',
                    border: '1px solid rgba(30,142,62,0.2)',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center'
                  }}>
                    <span className="material-symbols-rounded" style={{ color: '#1e8e3e', fontSize: '22px' }}>check_circle</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e8e3e' }}>Alert Sent Successfully!</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>{mobilizedCount} registered volunteer units have been dispatched inside the grid.</div>
                    </div>
                  </div>
                )}
              </div>
            </PortalCard>

            {/* Alert Activity Log */}
            {(dispatching || log.length > 0) && (
              <PortalCard title="Alert Activity Log" icon="terminal">
                <div style={{
                  backgroundColor: '#202124',
                  color: '#81c995',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  padding: '14px 16px',
                  borderRadius: '8px',
                  minHeight: '130px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)',
                  wordBreak: 'break-all'
                }}>
                  {log.map((entry, idx) => (
                    <div key={idx} style={{ borderBottom: '1px dashed rgba(255,255,255,0.03)', paddingBottom: '3px' }}>{entry}</div>
                  ))}
                  {dispatching && (
                    <div style={{ color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <span>&gt;_ Dispatching packets...</span>
                      <div className="portal-pulse-scanner" style={{ width: '8px', height: '8px', borderWidth: '1px', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
                    </div>
                  )}
                </div>
              </PortalCard>
            )}
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Cases found in area after dispatch */}
            {casesFound.length > 0 && (
              <PortalCard title={`Active Search Targets — ${selectedSector}`} icon="person_search">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {casesFound.map(c => (
                    <div key={c.id} style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(217, 48, 37, 0.04)',
                      border: '1px solid rgba(217, 48, 37, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <span className="material-symbols-rounded" style={{ fontSize: '22px', color: '#ea4335', flexShrink: 0 }}>person_alert</span>
                      <div>
                        <strong style={{ fontSize: '13px', color: 'var(--text-color)', display: 'block' }}>{c.name}</strong>
                        <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>Last seen area: {c.area}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </PortalCard>
            )}

            {/* Volunteer Directory */}
            <PortalCard title="Registered Search Grid Operators" icon="badge">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-light)', lineHeight: '1.5' }}>
                  These are the trained rescue volunteers loaded dynamically from the SQLite coordinate database. Click the dial icon to contact them.
                </p>
                
                {loading ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-light)' }}>
                    <div className="portal-pulse-scanner" style={{ margin: '0 auto 12px auto', width: '24px', height: '24px', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
                    Loading operators...
                  </div>
                ) : volunteers.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-light)', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                    No rescue operators currently registered. Use "Join the Rescue Grid" to enlist.
                  </div>
                ) : (
                  volunteers.map(vol => (
                    <div key={vol.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--light-color)',
                      border: '1px solid var(--border-color)',
                      transition: 'background-color 0.15s'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* Avatar */}
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--primary-color)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '13px',
                          fontWeight: '700',
                          flexShrink: 0
                        }}>
                          {vol.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <strong style={{ display: 'block', fontSize: '13px', color: 'var(--text-color)' }}>{vol.name}</strong>
                          <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>{vol.role} — {vol.sector}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                        <span style={{
                          backgroundColor: statusColor[vol.status]?.bg || 'rgba(128,128,128,0.1)',
                          color: statusColor[vol.status]?.text || 'var(--text-light)',
                          fontSize: '10px',
                          fontWeight: '700',
                          padding: '3px 10px',
                          borderRadius: '10px'
                        }}>
                          {vol.status}
                        </span>
                        <a
                          href={`tel:${vol.phone}`}
                          title={`Call ${vol.name}`}
                          style={{
                            color: 'var(--primary-color)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(26,115,232,0.1)',
                            transition: 'background-color 0.15s'
                          }}
                        >
                          <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>call</span>
                        </a>

                        {user?.is_admin && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(vol)}
                              className="portal-btn-secondary-outline"
                              style={{
                                color: 'var(--text-color)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--card-bg)',
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                              }}
                              title={`Edit ${vol.name}`}
                            >
                              <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteVolunteer(vol.id, vol.name)}
                              className="portal-btn-secondary-outline"
                              style={{
                                color: 'var(--error-color)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                border: '1px solid var(--error-color)',
                                backgroundColor: 'transparent',
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(217, 48, 37, 0.1)'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              title={`Decommission ${vol.name}`}
                            >
                              <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>delete</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </PortalCard>

          </div>
        </div>

      </div>

      {/* Modern Materials Outline Enlistment Modal */}
      {isModalOpen && (
        <div className="portal-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="portal-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            
            {/* Modal Header */}
            <div className="portal-modal-header" style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="material-symbols-rounded" style={{ color: 'var(--primary-color)', fontSize: '28px' }}>
                  assignment_ind
                </span>
                <div>
                  <h3 className="portal-modal-title" style={{ margin: 0, fontSize: '18px', fontWeight: '500' }}>{editingVolunteer ? 'Modify Search Responder Details' : 'Join Volunteer Rescue Grid'}</h3>
                  <p className="portal-modal-desc" style={{ margin: '2px 0 0 0', fontSize: '12px' }}>
                    {editingVolunteer ? 'Update active sectors, classification role, or status.' : 'Enlist inside search grids to receive emergency alerts.'}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="icon-btn-hover" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <span className="material-symbols-rounded" style={{ color: 'var(--text-light)', fontSize: '22px' }}>close</span>
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit}>
              <div className="portal-modal-content" style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                {formError && (
                  <div className="portal-modal-highlight-box" style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'rgba(234, 67, 53, 0.1)',
                    border: '1px solid rgba(234, 67, 53, 0.2)',
                    color: 'var(--accent-color)',
                    fontSize: '13px',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    marginBottom: '8px'
                  }}>
                    <span className="material-symbols-rounded" style={{ marginRight: '8px', fontSize: '18px' }}>error</span>
                    {formError}
                  </div>
                )}

                <MaterialInput
                  label="Full Name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />

                <MaterialInput
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />

                <MaterialInput
                  label="Contact Phone"
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <MaterialSelect
                      label="Search Area Grid"
                      name="sector"
                      value={formData.sector}
                      onChange={handleInputChange}
                      options={[
                        { value: 'Sector G-10', label: 'Sector G-10' },
                        { value: 'Sector F-11', label: 'Sector F-11' },
                        { value: 'Sector F-7', label: 'Sector F-7' },
                        { value: 'Sector H-9', label: 'Sector H-9' }
                      ]}
                      required
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <MaterialSelect
                      label="Rescue Role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      options={[
                        { value: 'Search Team Leader', label: 'Search Team Leader' },
                        { value: 'Field Navigator', label: 'Field Navigator' },
                        { value: 'K9 Dog Handler', label: 'K9 Dog Handler' },
                        { value: 'Drone Pilot (UAV)', label: 'Drone Pilot (UAV)' },
                        { value: 'Medical First Responder', label: 'Medical First Responder' },
                        { value: 'Field Rescuer', label: 'Field Rescuer' }
                      ]}
                      required
                    />
                  </div>
                </div>

                <MaterialSelect
                  label="Initial Operational Status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  options={[
                    { value: 'Standby', label: 'Standby (Operational)' },
                    { value: 'Active', label: 'Active (On Patrol)' },
                    { value: 'Offline', label: 'Offline' }
                  ]}
                  required
                />

              </div>

              {/* Action Buttons */}
              <div className="portal-modal-actions" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="portal-modal-btn-secondary portal-btn-secondary-outline"
                  style={{ height: '36px', padding: '0 20px', borderRadius: '4px', fontSize: '13px' }}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="portal-modal-btn-primary portal-btn-primary"
                  style={{ 
                    height: '36px', 
                    padding: '0 24px', 
                    borderRadius: '4px', 
                    fontSize: '13px', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '8px' 
                  }}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="portal-pulse-scanner" style={{ width: '14px', height: '14px', borderWidth: '2px', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
                      {editingVolunteer ? 'Saving...' : 'Enlisting...'}
                    </>
                  ) : (
                    editingVolunteer ? 'Save Changes' : 'Enlist Responder'
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default VolunteersPage;
