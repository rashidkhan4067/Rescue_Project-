import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { caseService, adminService } from '../../services';
import { useApi } from '../../hooks/useApi';

// Import decoupled, reusable dashboard architecture
import DashboardLayout from '../../layouts/DashboardLayout';
import DashboardMetrics from '../../components/dashboard/DashboardMetrics';
import CaseList from '../../components/dashboard/CaseList';
import CaseDetailsModal from '../../components/dashboard/CaseDetailsModal';

function Dashboard() {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('home'); // home, reports, users

  // Shared broadcast state
  const [broadcastActive, setBroadcastActive] = useState(false);

  // Selected report details modal states
  const [selectedReport, setSelectedReport] = useState(null);

  // Admin User CRUD state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);
  
  const [showUserModal, setShowUserModal] = useState(false);
  const [userModalMode, setUserModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    password: '',
    is_admin: false,
    twitter: '',
    facebook: '',
    linkedin: ''
  });
  
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');

  const navigate = useNavigate();

  const { data, loading, error, execute: fetchDashboard } = useApi(caseService.getDashboard);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const res = await adminService.getUsers();
      if (res.success && res.data) {
        setUsers(res.data.users || []);
      } else {
        setUsersError('Failed to synchronize operators directory');
      }
    } catch (err) {
      setUsersError(err.message || 'Synchronization exception triggered');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setActionError('');
    setActionMessage('');
    try {
      const res = await adminService.createUser(userForm);
      if (res.success) {
        setActionMessage(`Operator '${userForm.username}' registered successfully.`);
        setShowUserModal(false);
        fetchUsers();
        setTimeout(() => setActionMessage(''), 4000);
      } else {
        setActionError(res.message || 'Onboarding transmission failure.');
      }
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Error occurred during operator enlistment.');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setActionError('');
    setActionMessage('');
    try {
      const res = await adminService.updateUser(selectedUser.id, userForm);
      if (res.success) {
        setActionMessage(`Operator '${userForm.username}' updated successfully.`);
        setShowUserModal(false);
        fetchUsers();
        setTimeout(() => setActionMessage(''), 4000);
      } else {
        setActionError(res.message || 'Update request failed.');
      }
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Error modifying operator parameters.');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setActionError('');
    setActionMessage('');
    try {
      const res = await adminService.deleteUser(selectedUser.id);
      if (res.success) {
        setActionMessage(`Account '${selectedUser.username}' and associated telemetry data permanently purged.`);
        setShowDeleteConfirm(false);
        fetchUsers();
        setTimeout(() => setActionMessage(''), 4000);
      } else {
        setActionError(res.message || 'Purge operation rejected.');
      }
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Database integrity error during deletion.');
    }
  };

  const handleToggleAdmin = async (targetUser) => {
    if (targetUser.id === user.id) {
      setActionError("Cannot change your own administrative privilege status.");
      setTimeout(() => setActionError(''), 4000);
      return;
    }
    setActionError('');
    setActionMessage('');
    try {
      const res = await adminService.toggleAdmin(targetUser.id);
      if (res.success) {
        setActionMessage(`Privilege level for '${targetUser.username}' toggled successfully.`);
        fetchUsers();
        setTimeout(() => setActionMessage(''), 4000);
      } else {
        setActionError(res.message || 'Privilege toggle denied.');
      }
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Error updating access roles.');
    }
  };

  const openCreateModal = () => {
    setUserForm({
      username: '',
      email: '',
      password: '',
      is_admin: false,
      twitter: '',
      facebook: '',
      linkedin: ''
    });
    setUserModalMode('create');
    setActionError('');
    setShowUserModal(true);
  };

  const openEditModal = (targetUser) => {
    setSelectedUser(targetUser);
    setUserForm({
      username: targetUser.username || '',
      email: targetUser.email || '',
      password: '',
      is_admin: targetUser.is_admin || false,
      twitter: targetUser.twitter || '',
      facebook: targetUser.facebook || '',
      linkedin: targetUser.linkedin || ''
    });
    setUserModalMode('edit');
    setActionError('');
    setShowUserModal(true);
  };

  const reports = data?.reports || [];

  // Filter reports for real-time dynamic search based on Topbar queries
  const filteredReports = reports.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resolvedCount = reports.filter(r => r.status === 'resolved').length;
  const activeCount = reports.length - resolvedCount;

  if (loading) {
    return (
      <div className="portal-scan-wrapper" style={{minHeight: '100vh', backgroundColor: 'var(--card-bg)'}}>
        <div className="portal-pulse-scanner" style={{animation: 'spin 1s linear infinite', borderTopColor: 'transparent'}}></div>
        <p style={{marginTop: '16px', color: 'var(--text-light)', fontFamily: "'Google Sans', sans-serif"}}>Synchronizing active search grids...</p>
      </div>
    );
  }

  return (
    <DashboardLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      broadcastActive={broadcastActive}
      setBroadcastActive={setBroadcastActive}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    >
      <div className="portal-main-container dashboard-main-container">
        
        {/* Dynamic Greeting & Fast Actions Row */}
        <header className="portal-header-bar dashboard-header-bar">
          <div>
            <h1 className="portal-welcome-title dashboard-welcome-title">Welcome back, {user?.username || 'Admin'}</h1>
            <p className="portal-welcome-sub dashboard-welcome-sub">Coordinate emergency telemetry, index landmarks & broadcast volunteer alerts</p>
          </div>
          
          <div className="portal-header-actions dashboard-header-actions">
            {activeTab === 'users' ? (
              <button 
                onClick={openCreateModal} 
                className="portal-modal-btn-primary portal-btn-primary" 
                style={{display: 'inline-flex', alignItems: 'center', height: '38px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: 'var(--secondary-color)'}}
              >
                <span className="material-symbols-rounded" style={{marginRight: '6px', fontSize: '20px'}}>add</span>
                Onboard Operator
              </button>
            ) : (
              <button 
                onClick={() => navigate('/create-case')} 
                className="portal-modal-btn-primary portal-btn-primary" 
                style={{display: 'inline-flex', alignItems: 'center', height: '38px', borderRadius: '8px', border: 'none', cursor: 'pointer'}}
              >
                <span className="material-symbols-rounded" style={{marginRight: '6px', fontSize: '20px'}}>add</span>
                Register Case
              </button>
            )}
          </div>
        </header>

        {error && (
          <div className="portal-modal-highlight-box" style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(234, 67, 53, 0.1)',
            border: '1px solid rgba(234, 67, 53, 0.2)',
            color: 'var(--accent-color)',
            fontSize: '14px',
            marginBottom: '24px'
          }}>
            <span className="material-symbols-rounded" style={{marginRight: '8px'}}>error</span>
            {error}
          </div>
        )}

        {/* Global SMTP Health Status Bar (Collapsible on mobile) */}
        <div className="portal-health-bar dashboard-health-bar">
          <div className="portal-health-item">
            <span className="material-symbols-rounded" style={{color: 'var(--secondary-color)', fontSize: '18px'}}>check_circle</span>
            <span>Gmail SMTP Integration Live (alshifaaclinic99@gmail.com)</span>
          </div>
          <div className="portal-health-item">
            <span className="material-symbols-rounded" style={{color: 'var(--secondary-color)', fontSize: '18px'}}>check_circle</span>
            <span>AI Face Matcher Synthesizer Active</span>
          </div>
        </div>

        {activeTab === 'home' && (
          <>
            {/* Decoupled Metrics Highlight Cards */}
            <DashboardMetrics 
              totalCases={reports.length}
              activeCases={activeCount}
              resolvedCount={resolvedCount}
              broadcastActive={broadcastActive}
            />

            {/* Decoupled Tracked Case List Grid */}
            <CaseList 
              filteredReports={filteredReports}
              onSelectReport={(report) => setSelectedReport(report)}
              onRegisterNewCase={() => navigate('/create-case')}
            />
          </>
        )}

        {activeTab === 'reports' && (
          <CaseList 
            filteredReports={filteredReports}
            onSelectReport={(report) => setSelectedReport(report)}
            onRegisterNewCase={() => navigate('/create-case')}
          />
        )}

        {activeTab === 'users' && (
          <div className="portal-metrics-grid" style={{ gridTemplateColumns: '1fr', gap: '24px', display: 'flex', flexDirection: 'column' }}>
            {actionMessage && (
              <div style={{
                padding: '12px 16px',
                backgroundColor: 'rgba(52, 168, 83, 0.1)',
                border: '1px solid rgba(52, 168, 83, 0.2)',
                color: 'var(--secondary-color)',
                borderRadius: '8px',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                animation: 'fadeIn 0.3s ease'
              }}>
                <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>check_circle</span>
                <span>{actionMessage}</span>
              </div>
            )}

            {actionError && (
              <div style={{
                padding: '12px 16px',
                backgroundColor: 'rgba(234, 67, 53, 0.1)',
                border: '1px solid rgba(234, 67, 53, 0.2)',
                color: 'var(--accent-color)',
                borderRadius: '8px',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>error</span>
                <span>{actionError}</span>
              </div>
            )}

            <div style={{
              backgroundColor: 'var(--card-bg)',
              borderRadius: '12px',
              boxShadow: 'var(--box-shadow)',
              border: '1px solid var(--border-color)',
              overflow: 'hidden'
            }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-color)', fontFamily: "'Google Sans', sans-serif" }}>
                  Registered System Operators Directory
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-light)', backgroundColor: 'var(--light-color)', padding: '4px 8px', borderRadius: '12px' }}>
                  {users.length} Account(s) Loaded
                </span>
              </div>

              {usersLoading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-light)' }}>
                  <div className="portal-pulse-scanner" style={{ animation: 'spin 1s linear infinite', borderTopColor: 'transparent', margin: '0 auto 16px auto', width: '32px', height: '32px' }}></div>
                  Synchronizing credentials registry...
                </div>
              ) : usersError ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--accent-color)' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '32px', marginBottom: '8px' }}>cloud_off</span>
                  <p>{usersError}</p>
                  <button onClick={fetchUsers} style={{ marginTop: '12px', height: '32px', padding: '0 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', color: 'var(--text-color)' }}>
                    Try Again
                  </button>
                </div>
              ) : users.length === 0 ? (
                <div style={{ padding: '45px', textAlign: 'center', color: 'var(--text-light)' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: '48px', color: 'var(--border-color)', marginBottom: '12px' }}>no_accounts</span>
                  <p style={{ fontSize: '15px' }}>No system operators registered inside security shards.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--light-color)', borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '12px 20px', fontSize: '12px', fontWeight: '600', color: 'var(--text-light)', textTransform: 'uppercase' }}>Operator Name</th>
                        <th style={{ padding: '12px 20px', fontSize: '12px', fontWeight: '600', color: 'var(--text-light)', textTransform: 'uppercase' }}>Security Role</th>
                        <th style={{ padding: '12px 20px', fontSize: '12px', fontWeight: '600', color: 'var(--text-light)', textTransform: 'uppercase' }}>Social Handles</th>
                        <th style={{ padding: '12px 20px', fontSize: '12px', fontWeight: '600', color: 'var(--text-light)', textTransform: 'uppercase' }}>Registered Date</th>
                        <th style={{ padding: '12px 20px', fontSize: '12px', fontWeight: '600', color: 'var(--text-light)', textTransform: 'uppercase', textAlign: 'right' }}>Admin CRUD Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.15s' }} className="operator-row">
                          <td style={{ padding: '14px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--light-dark)',
                                color: 'var(--primary-color)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '600',
                                marginRight: '12px',
                                fontSize: '13px'
                              }}>
                                {u.username.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: '500', fontSize: '14px', color: 'var(--text-color)' }}>
                                  {u.username} {u.id === user.id && <span style={{ fontSize: '9px', padding: '1px 5px', borderRadius: '4px', backgroundColor: 'var(--light-dark)', color: 'var(--text-light)', marginLeft: '4px' }}>YOU</span>}
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '14px 20px' }}>
                            {u.is_admin ? (
                              <span style={{
                                fontSize: '11px',
                                fontWeight: '600',
                                padding: '4px 8px',
                                borderRadius: '12px',
                                backgroundColor: 'rgba(234, 67, 53, 0.1)',
                                color: 'var(--accent-color)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                <span className="material-symbols-rounded" style={{ fontSize: '12px' }}>shield</span>
                                Administrator
                              </span>
                            ) : (
                              <span style={{
                                fontSize: '11px',
                                fontWeight: '600',
                                padding: '4px 8px',
                                borderRadius: '12px',
                                backgroundColor: 'rgba(26, 115, 232, 0.1)',
                                color: 'var(--primary-color)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                <span className="material-symbols-rounded" style={{ fontSize: '12px' }}>person</span>
                                Standard
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '14px 20px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              {u.twitter && (
                                <a href={`https://twitter.com/${u.twitter}`} target="_blank" rel="noreferrer" title={`Twitter: @${u.twitter}`} style={{ color: 'var(--primary-color)', display: 'inline-flex' }}>
                                  <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>alternate_email</span>
                                </a>
                              )}
                              {u.linkedin && (
                                <a href={`https://linkedin.com/in/${u.linkedin}`} target="_blank" rel="noreferrer" title={`LinkedIn: ${u.linkedin}`} style={{ color: 'var(--primary-color)', display: 'inline-flex' }}>
                                  <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>work</span>
                                </a>
                              )}
                              {u.facebook && (
                                <a href={`https://facebook.com/${u.facebook}`} target="_blank" rel="noreferrer" title={`Facebook: ${u.facebook}`} style={{ color: 'var(--primary-color)', display: 'inline-flex' }}>
                                  <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>public</span>
                                </a>
                              )}
                              {!u.twitter && !u.linkedin && !u.facebook && <span style={{ color: 'var(--text-light)', fontSize: '12px' }}>—</span>}
                            </div>
                          </td>
                          <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-light)' }}>
                            {u.created_at ? new Date(u.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Unknown'}
                          </td>
                          <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                            <button
                              onClick={() => handleToggleAdmin(u)}
                              style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                cursor: u.id === user.id ? 'not-allowed' : 'pointer',
                                color: u.is_admin ? 'var(--secondary-color)' : 'var(--text-light)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                verticalAlign: 'middle',
                                padding: '4px',
                                marginRight: '12px'
                              }}
                              title={u.is_admin ? "Revoke Admin Status" : "Grant Admin Status"}
                              disabled={u.id === user.id}
                            >
                              <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>
                                {u.is_admin ? 'toggle_on' : 'toggle_off'}
                              </span>
                            </button>
                            
                            <button
                              onClick={() => openEditModal(u)}
                              style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--primary-color)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                verticalAlign: 'middle',
                                padding: '4px',
                                marginRight: '12px'
                              }}
                              title="Edit Credentials"
                            >
                              <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>edit</span>
                            </button>

                            <button
                              onClick={() => { setSelectedUser(u); setShowDeleteConfirm(true); }}
                              style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                cursor: u.id === user.id ? 'not-allowed' : 'pointer',
                                color: 'var(--error-color)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                verticalAlign: 'middle',
                                padding: '4px'
                              }}
                              title="Purge User Account"
                              disabled={u.id === user.id}
                            >
                              <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Detailed Case View Modal Overlay */}
        <CaseDetailsModal 
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />

        {/* Overlay User Modal (Create/Edit Form) */}
        {showUserModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(5px)'
          }}>
            <div style={{
              backgroundColor: 'var(--card-bg)',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '520px',
              boxShadow: 'var(--box-shadow-md)',
              border: '1px solid var(--border-color)',
              padding: '24px',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontFamily: "'Google Sans', sans-serif", fontSize: '20px', fontWeight: '500', color: 'var(--text-color)' }}>
                  {userModalMode === 'create' ? 'Register New User Account' : 'Edit System Operator Credentials'}
                </h2>
                <button 
                  onClick={() => setShowUserModal(false)}
                  style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-light)', display: 'inline-flex' }}
                >
                  <span className="material-symbols-rounded">close</span>
                </button>
              </div>

              <form onSubmit={userModalMode === 'create' ? handleCreateUser : handleUpdateUser}>
                {actionError && (
                  <div style={{
                    padding: '12px',
                    backgroundColor: 'rgba(234, 67, 53, 0.1)',
                    border: '1px solid rgba(234, 67, 53, 0.2)',
                    color: 'var(--accent-color)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>error</span>
                    <span>{actionError}</span>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-light)', display: 'block', marginBottom: '6px' }}>Username</label>
                    <input 
                      type="text"
                      required
                      value={userForm.username}
                      onChange={(e) => setUserForm({...userForm, username: e.target.value})}
                      style={{
                        width: '100%',
                        height: '40px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        padding: '0 12px',
                        fontSize: '14px',
                        backgroundColor: 'var(--bg-color)',
                        color: 'var(--text-color)',
                        outline: 'none'
                      }}
                      placeholder="e.g. janesmith"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-light)', display: 'block', marginBottom: '6px' }}>Email Address</label>
                    <input 
                      type="email"
                      required
                      value={userForm.email}
                      onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                      style={{
                        width: '100%',
                        height: '40px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        padding: '0 12px',
                        fontSize: '14px',
                        backgroundColor: 'var(--bg-color)',
                        color: 'var(--text-color)',
                        outline: 'none'
                      }}
                      placeholder="e.g. jane@rescue.org"
                    />
                  </div>

                  {userModalMode === 'create' && (
                    <div>
                      <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-light)', display: 'block', marginBottom: '6px' }}>Password</label>
                      <input 
                        type="password"
                        required
                        value={userForm.password}
                        onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                        style={{
                          width: '100%',
                          height: '40px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)',
                          padding: '0 12px',
                          fontSize: '14px',
                          backgroundColor: 'var(--bg-color)',
                          color: 'var(--text-color)',
                          outline: 'none'
                        }}
                        placeholder="Secure system password"
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
                    <input 
                      type="checkbox"
                      id="is_admin"
                      checked={userForm.is_admin}
                      disabled={userModalMode === 'edit' && selectedUser?.id === user?.id}
                      onChange={(e) => setUserForm({...userForm, is_admin: e.target.checked})}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: (userModalMode === 'edit' && selectedUser?.id === user?.id) ? 'not-allowed' : 'pointer'
                      }}
                    />
                    <label htmlFor="is_admin" style={{ fontSize: '14px', color: 'var(--text-color)', cursor: 'pointer', userSelect: 'none' }}>
                      Grant System Administrator Privileges
                    </label>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '4px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-light)', marginBottom: '12px' }}>Social Profiles (Optional)</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span className="material-symbols-rounded" style={{ color: 'var(--text-light)', fontSize: '20px' }}>alternate_email</span>
                        <input 
                          type="text"
                          value={userForm.twitter || ''}
                          onChange={(e) => setUserForm({...userForm, twitter: e.target.value})}
                          style={{
                            flex: 1,
                            height: '36px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            padding: '0 12px',
                            fontSize: '13px',
                            backgroundColor: 'var(--bg-color)',
                            color: 'var(--text-color)',
                            outline: 'none'
                          }}
                          placeholder="Twitter Handle (e.g. janesmith_ops)"
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span className="material-symbols-rounded" style={{ color: 'var(--text-light)', fontSize: '20px' }}>work</span>
                        <input 
                          type="text"
                          value={userForm.linkedin || ''}
                          onChange={(e) => setUserForm({...userForm, linkedin: e.target.value})}
                          style={{
                            flex: 1,
                            height: '36px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            padding: '0 12px',
                            fontSize: '13px',
                            backgroundColor: 'var(--bg-color)',
                            color: 'var(--text-color)',
                            outline: 'none'
                          }}
                          placeholder="LinkedIn Profile Name"
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span className="material-symbols-rounded" style={{ color: 'var(--text-light)', fontSize: '20px' }}>public</span>
                        <input 
                          type="text"
                          value={userForm.facebook || ''}
                          onChange={(e) => setUserForm({...userForm, facebook: e.target.value})}
                          style={{
                            flex: 1,
                            height: '36px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            padding: '0 12px',
                            fontSize: '13px',
                            backgroundColor: 'var(--bg-color)',
                            color: 'var(--text-color)',
                            outline: 'none'
                          }}
                          placeholder="Facebook Username"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <button 
                    type="button"
                    onClick={() => setShowUserModal(false)}
                    style={{
                      height: '38px',
                      padding: '0 16px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'transparent',
                      color: 'var(--text-color)',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '14px'
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    style={{
                      height: '38px',
                      padding: '0 20px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: 'var(--primary-color)',
                      color: '#ffffff',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '14px'
                    }}
                  >
                    {userModalMode === 'create' ? 'Register Account' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && selectedUser && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(5px)'
          }}>
            <div style={{
              backgroundColor: 'var(--card-bg)',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '440px',
              boxShadow: 'var(--box-shadow-md)',
              border: '1px solid var(--border-color)',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--error-color)', marginBottom: '16px' }}>
                <span className="material-symbols-rounded" style={{ fontSize: '32px' }}>warning</span>
                <h3 style={{ fontFamily: "'Google Sans', sans-serif", fontSize: '18px', fontWeight: '500', color: 'var(--text-color)' }}>
                  Permanently Delete Operator?
                </h3>
              </div>
              
              <p style={{ fontSize: '14px', color: 'var(--text-light)', lineHeight: '1.6', marginBottom: '24px' }}>
                Are you absolutely sure you want to delete the operator account <strong>{selectedUser.username}</strong> ({selectedUser.email})? 
                <br /><br />
                <span style={{ color: 'var(--accent-color)', fontWeight: '500' }}>⚠️ Warning:</span> This action is irreversible. All case reports created by this operator will be deleted to preserve system data integrity.
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    height: '38px',
                    padding: '0 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'transparent',
                    color: 'var(--text-color)',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteUser}
                  style={{
                    height: '38px',
                    padding: '0 16px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: 'var(--error-color)',
                    color: '#ffffff',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
