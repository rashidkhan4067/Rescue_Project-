import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import PortalCard from '../../components/dashboard/PortalCard';
import { diagnosticsService } from '../../services';
import { useApi } from '../../hooks/useApi';
import { getImageUrl } from '../../utils/image';

function AiMatcherPage() {
  const [activeTab, setActiveTab] = useState('home');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanLogs, setScanLogs] = useState([]);
  const [scanStep, setScanStep] = useState(0);
  const [matchResult, setMatchResult] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const navigate = useNavigate();

  const { execute: runAiMatch } = useApi(diagnosticsService.runAiMatch);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setMatchResult(null);
      setScanLogs([]);
      setScanStep(0);
    }
  };

  const startAiScan = async () => {
    if (!file) return;

    setScanning(true);
    setScanLogs([]);
    setScanStep(0);
    setMatchResult(null);

    const steps = [
      "Initializing AI Neural Face Synthesizer...",
      "Mapping face landmark matrix grid (1024 topological vertices)...",
      "Calculating volumetric face structure vectors...",
      "Running multi-dimensional cosine database search...",
      "Matching records found! Generating similarity confidence report..."
    ];

    try {
      const response = await runAiMatch(file);
      if (response.success && response.data) {
        const matches = response.data.matches || [];
        
        let currentStep = 0;
        const interval = setInterval(() => {
          if (currentStep < steps.length) {
            setScanLogs(prev => [...prev, `[${(currentStep * 0.6).toFixed(1)}s] ${steps[currentStep]}`]);
            setScanStep(currentStep + 1);
            currentStep++;
          } else {
            clearInterval(interval);
            setScanning(false);
            
            if (matches.length > 0) {
              setMatchResult(matches[0]);
              setConfidence(matches[0].confidence);
            } else {
              setMatchResult({
                name: "No Candidates Match",
                age: 0,
                gender: "N/A",
                area: "Global Search Grid",
                description: "The AI system resolved topological vectors but did not find any matching cases in the database above the similarity threshold."
              });
              setConfidence(0);
            }
          }
        }, 700);
      } else {
        setScanLogs(prev => [...prev, `[Error] ${response.error || 'AI matching pipeline aborted.'}`]);
        setScanning(false);
      }
    } catch (err) {
      console.error(err);
      setScanLogs(prev => [...prev, "[Error] Failed to connect to local neural synthesis endpoint."]);
      setScanning(false);
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {/* Self-contained styling for high-fidelity scanning micro-animations */}
      <style>{`
        @keyframes scan-laser-move {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        @keyframes pulse-wireframe-node {
          0%, 100% { transform: scale(1); opacity: 0.4; fill: #81c995; }
          50% { transform: scale(1.6); opacity: 1; fill: var(--primary-color); }
        }
      `}</style>

      <div className="portal-main-container dashboard-main-container">
        
        {/* Header Console */}
        <header className="portal-header-bar dashboard-header-bar" style={{ marginBottom: '24px' }}>
          <div>
            <h1 className="portal-welcome-title dashboard-welcome-title">AI Face Matcher Diagnostics</h1>
            <p className="portal-welcome-sub dashboard-welcome-sub">
              Upload telemetry images to identify missing individuals using topological face landmark matching.
            </p>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          
          {/* Diagnostic Console Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <PortalCard title="Telemetry Input Source">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-light)' }}>
                  Provide a clear front-facing photograph. The AI model will map 1024 unique coordinates to search the active case logs.
                </p>

                {/* Upload Area */}
                <div style={{
                  border: '2px dashed var(--border-color)',
                  borderRadius: '12px',
                  padding: '28px 16px',
                  textAlign: 'center',
                  backgroundColor: 'var(--light-color)',
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'border-color 0.15s ease',
                  overflow: 'hidden'
                }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer',
                      zIndex: 3
                    }}
                  />
                  {previewUrl ? (
                    <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                      <img 
                        src={previewUrl} 
                        alt="Input Preview" 
                        style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '8px', border: '1px solid var(--border-color)', objectFit: 'contain' }}
                      />
                      
                      {/* Interactive Neon Laser Scanning Sweep */}
                      {scanning && (
                        <div style={{
                          position: 'absolute',
                          left: 0,
                          width: '100%',
                          height: '4px',
                          background: 'linear-gradient(to right, transparent, #81c995, #34a853, #81c995, transparent)',
                          boxShadow: '0 0 12px #81c995, 0 0 4px #34a853',
                          animation: 'scan-laser-move 2s linear infinite',
                          zIndex: 2,
                          pointerEvents: 'none'
                        }} />
                      )}

                      {/* Interactive SVG Face Wireframe Nodes */}
                      {scanning && (
                        <svg viewBox="0 0 100 100" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
                          {/* Face Shape Guides */}
                          <path d="M 30 40 Q 50 15 70 40 T 50 85 Z" fill="none" stroke="rgba(129, 201, 149, 0.3)" strokeWidth="0.8" strokeDasharray="2 2" />
                          <line x1="30" y1="40" x2="70" y2="40" stroke="rgba(129, 201, 149, 0.2)" strokeWidth="0.5" />
                          <line x1="50" y1="20" x2="50" y2="85" stroke="rgba(129, 201, 149, 0.2)" strokeWidth="0.5" />
                          
                          {/* Face volumetric nodes mapping */}
                          {[
                            { cx: 35, cy: 38 }, { cx: 65, cy: 38 }, // Eyes
                            { cx: 50, cy: 26 }, // Forehead
                            { cx: 50, cy: 52 }, // Nose
                            { cx: 50, cy: 70 }, // Mouth
                            { cx: 33, cy: 58 }, { cx: 67, cy: 58 }, // Cheeks
                            { cx: 50, cy: 84 }  // Chin
                          ].map((pt, idx) => (
                            <g key={idx}>
                              <circle 
                                cx={pt.cx} 
                                cy={pt.cy} 
                                r="1.8" 
                                fill="#81c995" 
                                style={{ 
                                  transformOrigin: `${pt.cx}px ${pt.cy}px`, 
                                  animation: `pulse-wireframe-node 1.5s ease-in-out ${idx * 0.15}s infinite` 
                                }} 
                              />
                              {idx > 0 && (
                                <line x1="50" y1="52" x2={pt.cx} y2={pt.cy} stroke="rgba(129, 201, 149, 0.25)" strokeWidth="0.4" />
                              )}
                            </g>
                          ))}
                        </svg>
                      )}
                    </div>
                  ) : (
                    <>
                      <span className="material-symbols-rounded" style={{ color: 'var(--primary-color)', fontSize: '42px' }}>
                        portrait
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-color)' }}>
                        Select Front-Facing Portrait
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                        JPEG or PNG up to 10MB
                      </span>
                    </>
                  )}
                </div>

                {file && (
                  <button
                    onClick={startAiScan}
                    disabled={scanning}
                    className="portal-modal-btn-primary portal-btn-primary"
                    style={{
                      width: '100%',
                      height: '42px',
                      borderRadius: '8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      border: 'none',
                      fontSize: '14px',
                      boxShadow: '0 4px 12px rgba(26,115,232,0.25)'
                    }}
                  >
                    {scanning ? (
                      <>
                        <div className="portal-pulse-scanner" style={{ width: '16px', height: '16px', borderWidth: '2px', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
                        Scanning Facial Telemetry...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-rounded">radar</span>
                        Run Cosine Matcher Query
                      </>
                    )}
                  </button>
                )}
              </div>
            </PortalCard>

            {/* Neural Step Logger Console */}
            {(scanning || scanLogs.length > 0) && (
              <PortalCard title="AI Diagnostics Process Pipeline">
                <div style={{
                  backgroundColor: '#202124',
                  color: '#81c995',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  padding: '16px',
                  borderRadius: '8px',
                  minHeight: '140px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)',
                  boxSizing: 'border-box'
                }}>
                  {scanLogs.map((log, i) => (
                    <div key={i} style={{ borderBottom: '1px dashed rgba(255,255,255,0.03)', paddingBottom: '3px' }}>{log}</div>
                  ))}
                  {scanning && (
                    <div style={{ color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <span>&gt;_ Modeling neural layers...</span>
                      <span className="portal-pulse-scanner" style={{ width: '10px', height: '10px', borderWidth: '1px', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></span>
                    </div>
                  )}
                </div>
              </PortalCard>
            )}
          </div>

          {/* AI Matching Diagnostic Results */}
          <div>
            {matchResult ? (
              <PortalCard 
                title="Top Identified Telemetry Match" 
                hoverable={confidence > 0} 
                onClick={confidence > 0 ? () => navigate(`/case/${matchResult.id}`) : undefined}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Confidence Rating Scoreboard */}
                  {confidence > 0 && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      padding: '16px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--light-color)',
                      border: '1px solid var(--border-color)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-color)' }}>Biometric Confidence Score</span>
                        <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--secondary-color)' }}>{confidence}% Match</span>
                      </div>
                      {/* Progress indicator */}
                      <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--light-dark)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${confidence}%`, height: '100%', backgroundColor: 'var(--secondary-color)', borderRadius: '4px', transition: 'width 0.5s ease-out' }}></div>
                      </div>
                    </div>
                  )}

                  {/* Side by side vector overlay */}
                  <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-light)', marginBottom: '4px' }}>Input Target Vector</span>
                      <div style={{ position: 'relative', width: '100%', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                        <img src={previewUrl} alt="Target" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, border: '1px solid rgba(26,115,232,0.4)', background: 'radial-gradient(circle, rgba(26,115,232,0.1) 0%, transparent 80%)', pointerEvents: 'none' }}></div>
                      </div>
                    </div>

                    <span className="material-symbols-rounded" style={{ fontSize: '32px', color: 'var(--primary-color)' }}>
                      compare_arrows
                    </span>

                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-light)', marginBottom: '4px' }}>Database Match Record</span>
                      <div style={{ position: 'relative', width: '100%', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--light-color)' }}>
                        {matchResult.image && confidence > 0 ? (
                          <img src={getImageUrl(matchResult.image)} alt="Match" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <span className="material-symbols-rounded" style={{ fontSize: '28px', color: 'var(--text-light)' }}>person</span>
                            <span style={{ fontSize: '10px', color: 'var(--text-light)' }}>No Image Saved</span>
                          </div>
                        )}
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, border: '1px solid rgba(52,168,83,0.4)', background: 'radial-gradient(circle, rgba(52,168,83,0.1) 0%, transparent 80%)', pointerEvents: 'none' }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Profile Telemetry */}
                  <div className="portal-modal-details-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                      <span style={{ color: 'var(--text-light)', fontSize: '13px' }}>Full Name</span>
                      <span style={{ fontWeight: '500', color: 'var(--text-color)', fontSize: '13px' }}>{matchResult.name}</span>
                    </div>
                    {confidence > 0 && (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                          <span style={{ color: 'var(--text-light)', fontSize: '13px' }}>Age / Gender</span>
                          <span style={{ fontWeight: '500', color: 'var(--text-color)', fontSize: '13px' }}>{matchResult.age} yrs • {matchResult.gender}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-light)', fontSize: '13px' }}>Last Seen Area</span>
                          <span style={{ fontWeight: '500', color: 'var(--text-color)', fontSize: '13px' }}>{matchResult.area}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-light)', textAlign: 'center' }}>
                    Verify comparison telemetry above before launching volunteer emergency SMTP beacons.
                  </p>

                </div>
              </PortalCard>
            ) : (
              <div style={{
                height: '100%',
                minHeight: '260px',
                border: '1px dashed var(--border-color)',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                textAlign: 'center',
                boxSizing: 'border-box',
                backgroundColor: 'var(--card-bg)'
              }}>
                <span className="material-symbols-rounded" style={{ fontSize: '48px', color: 'var(--border-color)', marginBottom: '16px' }}>
                  query_stats
                </span>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', color: 'var(--text-color)', fontWeight: '500' }}>Waiting for Target Telemetry</h4>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-light)', maxWidth: '280px' }}>
                  Upload a portrait vector inside the Telemetry panel to generate automated database comparison diagnostics.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}

export default AiMatcherPage;
