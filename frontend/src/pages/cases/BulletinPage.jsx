import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PortalCard from '../../components/dashboard/PortalCard';
import { caseService, aiService } from '../../services';
import { useApi } from '../../hooks/useApi';
import { getImageUrl } from '../../utils/image';

// Subcomponents imports
import PosterPresets from '../../components/bulletin/PosterPresets';
import IdentityPanel from '../../components/bulletin/IdentityPanel';
import LocationPanel from '../../components/bulletin/LocationPanel';
import ContactPanel from '../../components/bulletin/ContactPanel';
import DraftingBoard from '../../components/bulletin/DraftingBoard';

// Professional Default Demo Case in case registry is empty or to offer as preview template
const DEMO_CASE = {
  id: 'demo-beacon-01',
  name: 'Sarah Connor',
  age: 29,
  gender: 'Female',
  area: 'Sector F-10, Islamabad (33.6924° N, 73.0118° E)',
  last_seen_date: '2026-05-18',
  last_seen_time: '22:15:00',
  description: 'Last seen wearing a dark green utility jacket, blue jeans, and brown leather combat boots. She has a visible scar on her left shoulder and carries a black backpack. Speak with a mild Eastern European accent.',
  image: null,
  height: "5'6\" (168 cm)",
  weight: "135 lbs (61 kg)",
  hair: "Light Brown, Wavy",
  eyes: "Green",
  clothing: "Dark green utility jacket, blue jeans, brown combat boots",
  marks: "Surgical scar on left shoulder",
  status: "active"
};

function BulletinPage() {
  const [activeTab, setActiveTab] = useState('bulletin');
  const [controlTab, setControlTab] = useState('styling'); // styling, identity, location, contact
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);

  // --- Dynamic Poster Customization States ---
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [area, setArea] = useState('');
  const [dateSeen, setDateSeen] = useState('');
  const [timeSeen, setTimeSeen] = useState('');
  const [description, setDescription] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [hair, setHair] = useState('');
  const [eyes, setEyes] = useState('');
  const [clothing, setClothing] = useState('');
  const [marks, setMarks] = useState('');
  
  // Custom contact / Reward settings
  const [rewardEnabled, setRewardEnabled] = useState(true);
  const [rewardAmount, setRewardAmount] = useState('Rs. 500,000');
  const [contactAgency, setContactAgency] = useState('RESCUE EMERGENCY COMMAND');
  const [contactPhone, setContactPhone] = useState('+92-51-111-92-92');
  const [contactEmail, setContactEmail] = useState('alerts@pakrescue.org.pk');
  
  // Layout toggles
  const [showCoordinates, setShowCoordinates] = useState(true);
  const [showQrCode, setShowQrCode] = useState(true);
  const [qrUrl, setQrUrl] = useState('');
  
  // Styling settings
  const [headerType, setHeaderType] = useState('MISSING'); // MISSING, URGENT, AMBER, WANTED, CUSTOM
  const [customHeader, setCustomHeader] = useState('HAVE YOU SEEN THIS PERSON?');
  const [themeColor, setThemeColor] = useState('#c5221f'); // crimson red preset
  const [borderStyle, setBorderStyle] = useState('HazardRedWhite'); // Solid, Hazard, HazardRedWhite, Double, Minimal
  const [badgeType, setBadgeType] = useState('rescue'); // none, rescue, police, amber
  const [paperSize, setPaperSize] = useState('A4'); // A4, Letter
  
  // --- AI Bulletin Copywriting States & Methods ---
  const [copywriting, setCopywriting] = useState(false);
  const [copywriteSuccess, setCopywriteSuccess] = useState('');
  const [copywriteError, setCopywriteError] = useState('');

  const handleAiCopywrite = async () => {
    setCopywriting(true);
    setCopywriteSuccess('');
    setCopywriteError('');
    
    try {
      const payload = {
        name,
        age,
        gender,
        clothing,
        marks,
        area,
        description: selectedCase?.description || description,
        reward: rewardEnabled ? rewardAmount : ''
      };
      
      const res = await aiService.bulletinCopy(payload);
      
      if (res) {
        if (res.custom_header) {
          setCustomHeader(res.custom_header);
          setHeaderType('CUSTOM');
        }
        
        let newDesc = '';
        if (res.polished_description) {
          newDesc += res.polished_description;
        }
        
        if (res.urdu_description) {
          if (newDesc) newDesc += '\n\n';
          newDesc += `Roman Urdu:\n${res.urdu_description}`;
        }
        
        if (res.call_to_action) {
          if (newDesc) newDesc += '\n\n';
          newDesc += res.call_to_action;
        }
        
        setDescription(newDesc || description);
        setCopywriteSuccess('AI Copywriting completed! Content enhanced for print readability.');
      } else {
        setCopywriteError('AI Copywriter returned an empty response.');
      }
    } catch (err) {
      console.error('Error during AI Copywriting:', err);
      setCopywriteError(err.response?.data?.error || err.message || 'Failed to communicate with AI copywriting service.');
    } finally {
      setCopywriting(false);
    }
  };

  // Photo upload state
  const [photoUpload, setPhotoUpload] = useState(null);

  // Zoom canvas factor
  const [zoomScale, setZoomScale] = useState(0.65);

  const { data, loading, execute: fetchDashboard } = useApi(caseService.getDashboard);

  const fetchCases = async () => {
    const res = await fetchDashboard();
    if (res.success && res.data) {
      const activeList = (res.data.reports || []).filter(c => c.status === 'active');
      const fullList = [...activeList, DEMO_CASE];
      setCases(fullList);
      
      if (activeList.length > 0) {
        setSelectedCase(activeList[0]);
      } else {
        setSelectedCase(DEMO_CASE);
      }
    } else {
      setCases([DEMO_CASE]);
      setSelectedCase(DEMO_CASE);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  // Update states whenever case changes
  useEffect(() => {
    if (selectedCase) {
      setName(selectedCase.name || '');
      setAge(selectedCase.age || '');
      setGender(selectedCase.gender || '');
      setArea(selectedCase.area || '');
      setDateSeen(selectedCase.last_seen_date || '');
      setTimeSeen(selectedCase.last_seen_time || '');
      setDescription(selectedCase.description || '');
      setHeight(selectedCase.height || "5ft 7in (170cm)");
      setWeight(selectedCase.weight || "140 lbs (64kg)");
      setHair(selectedCase.hair || "Dark Brown");
      setEyes(selectedCase.eyes || "Brown");
      setClothing(selectedCase.clothing || "Unknown clothing");
      setMarks(selectedCase.marks || "None reported");
      setPhotoUpload(null);

      if (selectedCase.id === 'demo-beacon-01') {
        setQrUrl('https://pakrescue.org.pk/cases/demo-beacon-01');
      } else {
        setQrUrl(`${window.location.origin}/case/${selectedCase.id}`);
      }
    }
  }, [selectedCase]);

  // Adjust theme details based on alert type choice
  useEffect(() => {
    if (headerType === 'AMBER') {
      setThemeColor('#e65100');
      setBorderStyle('Hazard');
      setBadgeType('amber');
    } else if (headerType === 'WANTED') {
      setThemeColor('#202124');
      setBorderStyle('Hazard');
      setBadgeType('police');
    } else if (headerType === 'MISSING') {
      setThemeColor('#c5221f');
      setBorderStyle('HazardRedWhite');
      setBadgeType('rescue');
    }
  }, [headerType]);

  const handlePrint = () => {
    window.print();
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUpload(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Base card configuration matching paper aspect ratios
  const baseWidth = 640;
  const baseHeight = paperSize === 'Letter' ? 828 : 905;

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="portal-main-container dashboard-main-container print-container-override">
        
        <style>
          {`
            .bulletin-workspace-layout {
              display: grid;
              grid-template-columns: 380px 1fr;
              gap: 28px;
              align-items: start;
            }
            @media (max-width: 1100px) {
              .bulletin-workspace-layout {
                grid-template-columns: 1fr;
              }
            }
            
            /* Tabs styling */
            .control-tabs-header {
              display: flex;
              background-color: var(--light-dark);
              border-radius: 8px;
              padding: 4px;
              margin-bottom: 20px;
              gap: 4px;
            }
            .control-tab-btn {
              flex: 1;
              background: transparent;
              border: none;
              padding: 8px 4px;
              border-radius: 6px;
              font-size: 11px;
              font-weight: 600;
              color: var(--text-light);
              cursor: pointer;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 4px;
              transition: all 0.15s ease;
            }
            .control-tab-btn:hover {
              background-color: rgba(255, 255, 255, 0.4);
              color: var(--text-color);
            }
            .control-tab-btn.active {
              background-color: var(--card-bg);
              color: var(--primary-color);
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .control-tab-btn .material-symbols-rounded {
              font-size: 18px;
            }
            
            /* Presets & inputs */
            .control-section-card {
              background-color: var(--card-bg);
              border: 1px solid var(--border-color);
              border-radius: 12px;
              padding: 20px;
              display: flex;
              flex-direction: column;
              gap: 16px;
            }
            .control-grid-2 {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
            }
            .form-group-custom {
              display: flex;
              flex-direction: column;
              gap: 4px;
              text-align: left;
            }
            .form-group-custom label {
              font-size: 11px;
              font-weight: 600;
              color: var(--text-light);
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .form-input-custom {
              height: 38px;
              border-radius: 6px;
              border: 1px solid var(--border-color);
              background-color: var(--light-color);
              padding: 0 10px;
              font-size: 13px;
              color: var(--text-color);
              outline: none;
              transition: border-color 0.15s;
            }
            .form-input-custom:focus {
              border-color: var(--primary-color);
            }
            .form-textarea-custom {
              border-radius: 6px;
              border: 1px solid var(--border-color);
              background-color: var(--light-color);
              padding: 8px 10px;
              font-size: 13px;
              color: var(--text-color);
              outline: none;
              resize: vertical;
              min-height: 70px;
              transition: border-color 0.15s;
            }
            .form-textarea-custom:focus {
              border-color: var(--primary-color);
            }
            
            /* Presets color swatches */
            .preset-color-btn {
              width: 32px;
              height: 32px;
              border-radius: 50%;
              cursor: pointer;
              border: 3px solid transparent;
              transition: transform 0.2s;
              position: relative;
            }
            .preset-color-btn:hover {
              transform: scale(1.1);
            }
            .preset-color-btn.active {
              border-color: var(--text-color);
              box-shadow: 0 0 0 2px var(--card-bg);
            }
            
            /* Drafting Board Table */
            .drafting-board-container {
              background-color: #0f172a;
              background-image: 
                radial-gradient(#334155 1.5px, transparent 1.5px),
                radial-gradient(#334155 1.5px, transparent 1.5px);
              background-size: 28px 28px;
              background-position: 0 0, 14px 14px;
              border-radius: 16px;
              padding: 60px 20px;
              display: flex;
              justify-content: center;
              align-items: flex-start;
              min-height: 650px;
              position: relative;
              border: 1px solid #1e293b;
              overflow: auto;
              box-shadow: inset 0 8px 32px rgba(0,0,0,0.4);
            }
            .floating-draft-bar {
              position: absolute;
              top: 20px;
              right: 20px;
              background-color: rgba(15, 23, 42, 0.9);
              backdrop-filter: blur(8px);
              border: 1px solid #334155;
              border-radius: 20px;
              padding: 4px 12px;
              display: flex;
              align-items: center;
              gap: 8px;
              z-index: 100;
            }
            .draft-action-btn {
              background: transparent;
              border: none;
              color: #94a3b8;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              transition: all 0.2s;
            }
            .draft-action-btn:hover {
              background-color: #334155;
              color: #f1f5f9;
            }
            
            /* File upload dropzone */
            .photo-upload-dropzone {
              border: 2px dashed var(--border-color);
              border-radius: 8px;
              padding: 14px;
              text-align: center;
              cursor: pointer;
              background-color: var(--light-color);
              transition: border-color 0.15s, background-color 0.15s;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 6px;
            }
            .photo-upload-dropzone:hover {
              border-color: var(--primary-color);
              background-color: rgba(26,115,232,0.02);
            }
            
            /* Print Pipeline styles overrides */             @media print {
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }

              body, html {
                background: #ffffff !important;
                color: #000000 !important;
                margin: 0 !important;
                padding: 0 !important;
                height: 100% !important;
                overflow: hidden !important;
              }
              
              @page {
                size: ${paperSize === 'Letter' ? 'letter portrait' : 'A4 portrait'};
                margin: 0;
              }
              
              /* Hide all page layout items except the poster */
              .no-print, 
              .portal-sidebar, 
              .portal-topbar, 
              .portal-header-bar,
              .floating-draft-bar,
              .portal-ai-assistant-trigger,
              .portal-ai-assistant-panel,
              .portal-sidebar-mobile-backdrop,
              .sidebar-backdrop,
              header, 
              nav, 
              aside,
              button {
                display: none !important;
              }
              
              .portal-layout-container,
              .portal-workspace,
              .portal-content-panel,
              .portal-main-container,
              .print-container-override,
              .bulletin-workspace-layout,
              .drafting-board-container,
              .flyer-card-scale-outer-container,
              .flyer-card-scale-wrapper {
                display: block !important;
                padding: 0 !important;
                margin: 0 !important;
                border: none !important;
                width: 100% !important;
                height: 100% !important;
                background: none !important;
                box-shadow: none !important;
                border-radius: 0 !important;
                overflow: visible !important;
                position: static !important;
                transform: none !important;
              } }
              
              .printable-flyer-card {
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 100% !important;
                max-width: none !important;
                border-radius: 0 !important;
                box-shadow: none !important;
                margin: 0 !important;
                transform: none !important;
                padding: 24px !important;
                box-sizing: border-box !important;
                z-index: 99999999 !important;
                background-color: #ffffff !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                page-break-inside: avoid !important;
              }
            }
          `}
        </style>

        {/* Header Title Bar (Hidden on print) */}
        <header className="portal-header-bar dashboard-header-bar no-print" style={{ marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-rounded" style={{ color: 'var(--accent-color)', fontSize: '28px' }}>picture_in_picture</span>
              <h1 className="portal-welcome-title dashboard-welcome-title">Missing Bulletin Poster Generator</h1>
            </div>
            <p className="portal-welcome-sub dashboard-welcome-sub">
              Generate and print high-contrast, geolocated missing person flyers for localized ground distribution.
            </p>
          </div>
          
          <button 
            onClick={handlePrint}
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
              cursor: 'pointer'
            }}
          >
            <span className="material-symbols-rounded">print</span>
            Print / Save as PDF
          </button>
        </header>

        {loading ? (
          <div className="portal-scan-wrapper" style={{ minHeight: '260px' }}>
            <div className="portal-pulse-scanner" style={{ animation: 'spin 1.5s linear infinite', borderTopColor: 'transparent' }}></div>
            <p style={{ marginTop: '16px', color: 'var(--text-light)' }}>Syncing active search records...</p>
          </div>
        ) : (
          <div className="bulletin-workspace-layout">
            
            {/* Left: Control Panel (Hidden on print) */}
            <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Select Case Target */}
              <PortalCard title="1. Select Active Target File" icon="group">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto', paddingRight: '4px' }}>
                  {cases.map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => setSelectedCase(item)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: selectedCase?.id === item.id ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                        backgroundColor: selectedCase?.id === item.id ? 'rgba(26,115,232,0.06)' : 'var(--light-color)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'transform 0.15s ease'
                      }}
                    >
                      <div style={{ width: '36px', height: '36px', borderRadius: '4px', overflow: 'hidden', backgroundColor: 'var(--border-color)', flexShrink: 0 }}>
                        {item.image ? (
                          <img src={getImageUrl(item.image)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e2e8f0' }}>
                            <span className="material-symbols-rounded" style={{ fontSize: '18px', color: '#475569' }}>portrait</span>
                          </div>
                        )}
                      </div>
                      <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', textAlign: 'left' }}>
                        <strong style={{ fontSize: '12px', color: 'var(--text-color)', display: 'block' }}>
                          {item.name} {item.id === 'demo-beacon-01' && <span style={{ fontSize: '9px', backgroundColor: 'var(--warning-color)', color: '#000', padding: '1px 4px', borderRadius: '3px', marginLeft: '4px' }}>DEMO</span>}
                        </strong>
                        <span style={{ fontSize: '10px', color: 'var(--text-light)' }}>Age {item.age} • {item.area.split(' (')[0]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </PortalCard>

              {/* Settings Accordion Control panel */}
              <div className="control-section-card">
                
                {/* Control categories navigation tabs */}
                <div className="control-tabs-header">
                  <button 
                    onClick={() => setControlTab('styling')} 
                    className={`control-tab-btn ${controlTab === 'styling' ? 'active' : ''}`}
                  >
                    <span className="material-symbols-rounded">palette</span>
                    Styles
                  </button>
                  <button 
                    onClick={() => setControlTab('identity')} 
                    className={`control-tab-btn ${controlTab === 'identity' ? 'active' : ''}`}
                  >
                    <span className="material-symbols-rounded">face</span>
                    Identity
                  </button>
                  <button 
                    onClick={() => setControlTab('location')} 
                    className={`control-tab-btn ${controlTab === 'location' ? 'active' : ''}`}
                  >
                    <span className="material-symbols-rounded">location_on</span>
                    Incident
                  </button>
                  <button 
                    onClick={() => setControlTab('contact')} 
                    className={`control-tab-btn ${controlTab === 'contact' ? 'active' : ''}`}
                  >
                    <span className="material-symbols-rounded">campaign</span>
                    Contacts
                  </button>
                </div>

                {/* TAB 1: STYLING PRESETS */}
                {controlTab === 'styling' && (
                  <PosterPresets 
                    headerType={headerType}
                    setHeaderType={setHeaderType}
                    customHeader={customHeader}
                    setCustomHeader={setCustomHeader}
                    themeColor={themeColor}
                    setThemeColor={setThemeColor}
                    borderStyle={borderStyle}
                    setBorderStyle={setBorderStyle}
                    badgeType={badgeType}
                    setBadgeType={setBadgeType}
                    paperSize={paperSize}
                    setPaperSize={setPaperSize}
                    onOptimize={handleAiCopywrite}
                    copywriting={copywriting}
                    copywriteSuccess={copywriteSuccess}
                    copywriteError={copywriteError}
                  />
                )}

                {/* TAB 2: IDENTITY DATA OVERRIDES */}
                {controlTab === 'identity' && (
                  <IdentityPanel 
                    name={name}
                    setName={setName}
                    age={age}
                    setAge={setAge}
                    gender={gender}
                    setGender={setGender}
                    height={height}
                    setHeight={setHeight}
                    weight={weight}
                    setWeight={setWeight}
                    hair={hair}
                    setHair={setHair}
                    eyes={eyes}
                    setEyes={setEyes}
                    handlePhotoChange={handlePhotoChange}
                  />
                )}

                {/* TAB 3: LOCATION & TELEMETRY */}
                {controlTab === 'location' && (
                  <LocationPanel 
                    area={area}
                    setArea={setArea}
                    dateSeen={dateSeen}
                    setDateSeen={setDateSeen}
                    timeSeen={timeSeen}
                    setTimeSeen={setTimeSeen}
                    showCoordinates={showCoordinates}
                    setShowCoordinates={setShowCoordinates}
                    clothing={clothing}
                    setClothing={setClothing}
                    marks={marks}
                    setMarks={setMarks}
                    description={description}
                    setDescription={setDescription}
                  />
                )}

                {/* TAB 4: CONTACT & EMERGENCY REWARD */}
                {controlTab === 'contact' && (
                  <ContactPanel 
                    contactAgency={contactAgency}
                    setContactAgency={setContactAgency}
                    contactPhone={contactPhone}
                    setContactPhone={setContactPhone}
                    contactEmail={contactEmail}
                    setContactEmail={setContactEmail}
                    rewardEnabled={rewardEnabled}
                    setRewardEnabled={setRewardEnabled}
                    rewardAmount={rewardAmount}
                    setRewardAmount={setRewardAmount}
                    showQrCode={showQrCode}
                    setShowQrCode={setShowQrCode}
                    qrUrl={qrUrl}
                    setQrUrl={setQrUrl}
                  />
                )}

              </div>
            </div>

            {/* Right: Tactical Staging Board Canvas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
              
              <DraftingBoard 
                zoomScale={zoomScale}
                setZoomScale={setZoomScale}
                baseWidth={baseWidth}
                baseHeight={baseHeight}
                paperSize={paperSize}
                handlePrint={handlePrint}
                
                // PrintableFlyer props
                name={name}
                age={age}
                gender={gender}
                area={area}
                dateSeen={dateSeen}
                timeSeen={timeSeen}
                description={description}
                height={height}
                weight={weight}
                hair={hair}
                eyes={eyes}
                clothing={clothing}
                marks={marks}
                rewardEnabled={rewardEnabled}
                rewardAmount={rewardAmount}
                contactAgency={contactAgency}
                contactPhone={contactPhone}
                contactEmail={contactEmail}
                showCoordinates={showCoordinates}
                showQrCode={showQrCode}
                qrUrl={qrUrl}
                headerType={headerType}
                customHeader={customHeader}
                themeColor={themeColor}
                borderStyle={borderStyle}
                badgeType={badgeType}
                photoUpload={photoUpload}
                selectedCase={selectedCase}
              />
              
              {/* Notice beneath preview (hidden on print) */}
              <div className="no-print" style={{ color: 'var(--text-light)', fontSize: '12px', textAlign: 'center', marginTop: '10px' }}>
                <span className="material-symbols-rounded" style={{ fontSize: '14px', verticalAlign: 'middle', marginRight: '4px', color: 'var(--warning-color)' }}>info</span>
                Tip: Press <strong>Ctrl + P</strong> (Windows) or <strong>Cmd + P</strong> (Mac) to export to PDF or print directly. The layout auto-compresses to 1 single sheet.
              </div>

            </div>

          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

export default BulletinPage;
