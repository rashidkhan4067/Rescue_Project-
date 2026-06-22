import React from 'react';
import { getImageUrl } from '../../utils/image';

function PrintableFlyer({
  name,
  age,
  gender,
  area,
  dateSeen,
  timeSeen,
  description,
  height,
  weight,
  hair,
  eyes,
  clothing,
  marks,
  rewardEnabled,
  rewardAmount,
  contactAgency,
  contactPhone,
  contactEmail,
  showCoordinates,
  showQrCode,
  qrUrl,
  headerType,
  customHeader,
  themeColor,
  borderStyle,
  badgeType,
  photoUpload,
  selectedCase
}) {
  
  const getHazardBg = () => {
    if (borderStyle === 'Hazard') {
      return `repeating-linear-gradient(-45deg, #f9ab00, #f9ab00 12px, #1a1a1a 12px, #1a1a1a 24px)`;
    }
    if (borderStyle === 'HazardRedWhite') {
      return `repeating-linear-gradient(-45deg, ${themeColor}, ${themeColor} 12px, #ffffff 12px, #ffffff 24px)`;
    }
    return 'transparent';
  };

  const getCardBorderStyle = () => {
    if (borderStyle === 'Double') {
      return `6px double ${themeColor}`;
    }
    if (borderStyle === 'Solid') {
      return `10px solid ${themeColor}`;
    }
    if (borderStyle === 'Minimal') {
      return `1px solid #e2e8f0`;
    }
    return `2px solid #1a1a1a`;
  };

  return (
    <div 
      className="printable-flyer-card"
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#ffffff',
        backgroundImage: borderStyle.startsWith('Hazard') ? getHazardBg() : 'none',
        padding: borderStyle.startsWith('Hazard') ? '12px' : '0px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <div
        style={{
          background: '#ffffff',
          color: '#1a1a1a',
          border: getCardBorderStyle(),
          borderRadius: '4px',
          padding: '20px 18px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          position: 'relative'
        }}
      >
        
        {/* Official Stamp badge (Floating) */}
        {badgeType !== 'none' && (
          <div style={{ position: 'absolute', top: '64px', right: '24px', zIndex: 10 }}>
            {badgeType === 'rescue' && (
              <svg viewBox="0 0 100 100" style={{ width: '54px', height: '54px' }}>
                <circle cx="50" cy="50" r="45" fill="none" stroke={themeColor} strokeWidth="3" />
                <circle cx="50" cy="50" r="40" fill="none" stroke={themeColor} strokeWidth="1" strokeDasharray="3 2" />
                <path d="M 50 20 L 58 40 L 80 40 L 62 52 L 68 74 L 50 60 L 32 74 L 38 52 L 20 40 L 42 40 Z" fill={themeColor} opacity="0.12" />
                <polygon points="50,23 54,48 50,53" fill={themeColor} />
                <polygon points="50,77 54,48 50,53" fill="#94a3b8" />
                <path id="circlePath" d="M 15 50 A 35 35 0 0 1 85 50" fill="none" />
                <text fontSize="6.5" fontWeight="900" fill={themeColor}>
                  <textPath href="#circlePath" startOffset="50%" textAnchor="middle">
                    SEARCH & RESCUE
                  </textPath>
                </text>
              </svg>
            )}
            {badgeType === 'police' && (
              <svg viewBox="0 0 100 100" style={{ width: '54px', height: '54px' }}>
                <path d="M 50 10 Q 80 15 80 45 Q 80 75 50 90 Q 20 75 20 45 Q 20 15 50 10 Z" fill="none" stroke={themeColor} strokeWidth="3.5" />
                <path d="M 50 15 Q 75 19 75 45 Q 75 70 50 84 Q 25 70 25 45 Q 25 19 50 15 Z" fill={themeColor} opacity="0.08" />
                <polygon points="50,22 55,38 72,38 59,47 63,63 50,54 37,63 41,47 28,38 45,38" fill={themeColor} />
                <text x="50" y="78" fontSize="7.5" fontWeight="900" fill={themeColor} textAnchor="middle">OFFICIAL</text>
              </svg>
            )}
            {badgeType === 'amber' && (
              <svg viewBox="0 0 100 100" style={{ width: '54px', height: '54px' }}>
                <polygon points="50,12 92,82 8,82" fill="none" stroke={themeColor} strokeWidth="4.5" strokeLinejoin="round" />
                <polygon points="50,20 86,78 14,78" fill={themeColor} opacity="0.1" />
                <text x="50" y="55" fontSize="13" fontWeight="900" fill={themeColor} textAnchor="middle">AMBER</text>
                <text x="50" y="71" fontSize="11" fontWeight="900" fill={themeColor} textAnchor="middle">ALERT</text>
              </svg>
            )}
          </div>
        )}

        {/* Alert Banner Block */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '4px' }}>
          <h1 style={{
            backgroundColor: headerType === 'URGENT' ? '#1a1a1a' : headerType === 'WANTED' ? '#1a1a1a' : themeColor,
            color: headerType === 'WANTED' ? '#f9ab00' : '#ffffff',
            margin: '0',
            padding: '10px 16px',
            fontSize: '28px',
            fontWeight: '900',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            width: '100%',
            textAlign: 'center',
            borderRadius: '4px',
            border: headerType === 'URGENT' ? `2px solid ${themeColor}` : 'none',
            boxSizing: 'border-box',
            lineHeight: '1'
          }}>
            {headerType === 'CUSTOM' ? customHeader : headerType === 'MISSING' ? 'MISSING PERSON' : headerType === 'URGENT' ? 'URGENT SEARCH ALERT' : headerType === 'AMBER' ? 'AMBER ALERT' : 'WANTED'}
          </h1>
          <p style={{
            margin: '0',
            fontSize: '10px',
            fontWeight: '800',
            color: themeColor,
            letterSpacing: '2px',
            textTransform: 'uppercase'
          }}>
            {headerType === 'WANTED' ? 'IF YOU HAVE SIGHTINGS, REPORT TO AUTHORITIES' : 'PLEASE DISTRIBUTE & HELP LOCAL SEARCH TEAMS'}
          </p>
        </div>

        {/* Photograph Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          <div style={{
            width: '210px',
            height: '210px',
            position: 'relative',
            border: '4px solid #1a1a1a',
            backgroundColor: '#f8f9fa',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '12px', height: '12px', borderTop: '4px solid #1a1a1a', borderLeft: '4px solid #1a1a1a' }} />
            <div style={{ position: 'absolute', top: 0, right: 0, width: '12px', height: '12px', borderTop: '4px solid #1a1a1a', borderRight: '4px solid #1a1a1a' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '12px', height: '12px', borderBottom: '4px solid #1a1a1a', borderLeft: '4px solid #1a1a1a' }} />
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', borderBottom: '4px solid #1a1a1a', borderRight: '4px solid #1a1a1a' }} />
            
            {photoUpload ? (
              <img src={photoUpload} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : selectedCase?.image ? (
              <img src={getImageUrl(selectedCase.image)} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b', gap: '8px' }}>
                <span className="material-symbols-rounded" style={{ fontSize: '64px' }}>portrait</span>
                <span style={{ fontSize: '9px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>No Photo Provided</span>
              </div>
            )}
          </div>
          <div style={{
            backgroundColor: '#1a1a1a',
            color: '#ffffff',
            fontSize: '8px',
            fontWeight: '900',
            letterSpacing: '1px',
            padding: '4px 14px',
            borderRadius: '0 0 4px 4px',
            border: '2px solid #1a1a1a',
            borderTop: 'none',
            textTransform: 'uppercase'
          }}>
            Last Known Photograph
          </div>
        </div>

        {/* Name Block */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <h2 style={{
            fontSize: '26px',
            fontWeight: '900',
            color: '#111827',
            margin: '0',
            letterSpacing: '-0.5px',
            textTransform: 'uppercase',
            lineHeight: '1.1'
          }}>
            {name || 'Unknown Subject'}
          </h2>
          <div style={{
            height: '3px',
            width: '60px',
            backgroundColor: themeColor,
            borderRadius: '2px',
            marginTop: '2px'
          }} />
        </div>

        {/* Physical Details Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '6px',
          width: '100%'
        }}>
          {[
            { label: 'Age', val: age ? `${age} Yrs` : 'N/A' },
            { label: 'Gender', val: gender || 'N/A' },
            { label: 'Height', val: height || 'N/A' },
            { label: 'Weight', val: weight || 'N/A' },
            { label: 'Hair', val: hair || 'N/A' },
            { label: 'Eyes', val: eyes || 'N/A' }
          ].map((item, idx) => (
            <div 
              key={idx} 
              style={{ 
                background: '#f8fafc', 
                border: '1px solid #e2e8f0', 
                padding: '6px 4px', 
                borderRadius: '6px', 
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                minHeight: '38px'
              }}
            >
              <span style={{ fontSize: '8px', color: '#64748b', fontWeight: 'bold', display: 'block', textTransform: 'uppercase', marginBottom: '1px' }}>{item.label}</span>
              <span style={{ fontSize: '11px', color: '#0f172a', fontWeight: '850', textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.val}>{item.val}</span>
            </div>
          ))}
        </div>

        {/* Dynamic Lower Section: Two-Column split to preserve vertical aspect ratio */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: '14px',
          width: '100%',
          textAlign: 'left'
        }}>
          
          {/* Left Column: Last Seen and Characteristics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'space-between' }}>
            
            {/* Last Seen Info Box */}
            <div style={{
              border: `2px solid ${themeColor}`,
              borderRadius: '8px',
              backgroundColor: `${themeColor}02`,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              <div style={{
                backgroundColor: themeColor,
                color: '#ffffff',
                padding: '5px 10px',
                fontSize: '10px',
                fontWeight: '900',
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>location_on</span>
                LAST SEEN DETAILS
              </div>
              
              <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div>
                  <span style={{ fontSize: '8px', color: '#64748b', fontWeight: 'bold', display: 'block', textTransform: 'uppercase' }}>Location</span>
                  <strong style={{ fontSize: '12px', color: '#0f172a', lineHeight: '1.2', display: 'block' }}>
                    {showCoordinates ? area : area.split(' (')[0]}
                  </strong>
                </div>
                
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div>
                    <span style={{ fontSize: '8px', color: '#64748b', fontWeight: 'bold', display: 'block', textTransform: 'uppercase' }}>Date</span>
                    <span style={{ fontSize: '11px', color: '#0f172a', fontWeight: '800' }}>
                      {dateSeen ? new Date(dateSeen).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Unknown'}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: '8px', color: '#64748b', fontWeight: 'bold', display: 'block', textTransform: 'uppercase' }}>Time</span>
                    <span style={{ fontSize: '11px', color: '#0f172a', fontWeight: '800' }}>
                      {timeSeen ? timeSeen.substring(0, 5) : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Clothing & Marks Description */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ borderBottom: '1.5px solid #e2e8f0', paddingBottom: '2px' }}>
                <span style={{ fontSize: '8px', color: '#0f172a', fontWeight: '900', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  CLOTHING & MARKS
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '10.5px', color: '#334155', lineHeight: '1.3' }}>
                {clothing && (
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={clothing}>
                    <strong style={{ color: '#0f172a' }}>Clothing: </strong>{clothing}
                  </div>
                )}
                {marks && (
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={marks}>
                    <strong style={{ color: '#0f172a' }}>Marks: </strong>{marks}
                  </div>
                )}
                {description && (
                  <div style={{ marginTop: '2px', paddingLeft: '5px', borderLeft: `2px solid ${themeColor}`, fontStyle: 'italic', color: '#475569', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    "{description}"
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Reward and QR Code */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'space-between' }}>
            
            {/* Reward Banner */}
            {rewardEnabled && (
              <div style={{
                background: `repeating-linear-gradient(45deg, ${themeColor}12, ${themeColor}12 8px, #ffffff 8px, #ffffff 16px)`,
                border: `2px dashed ${themeColor}`,
                borderRadius: '8px',
                padding: '8px 10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                flexGrow: 1
              }}>
                <span style={{ fontSize: '9px', fontWeight: '900', color: themeColor, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  CASH REWARD
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: '950', color: themeColor, margin: '2px 0' }}>
                  {rewardAmount}
                </h3>
                <span style={{ fontSize: '8px', color: '#475569', lineHeight: '1.1' }}>
                  For verified sightings.
                </span>
              </div>
            )}

            {/* QR Code */}
            {showQrCode && qrUrl && (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: '4px',
                padding: '8px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                backgroundColor: '#f8fafc'
              }}>
                <div style={{
                  padding: '4px',
                  background: '#ffffff',
                  border: '1.5px solid #0f172a',
                  borderRadius: '4px',
                  width: '76px',
                  height: '76px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=76x76&data=${encodeURIComponent(qrUrl)}`} 
                    alt="Incident portal link" 
                    style={{ width: '100%', height: '100%', display: 'block' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentNode.innerHTML = `
                        <svg viewBox="0 0 100 100" style="width: 100%; height: 100%;" fill="#1a1a1a">
                          <rect width="100" height="100" fill="none"/>
                          <rect x="0" y="0" width="30" height="30" fill="none" stroke="#1a1a1a" stroke-width="6"/>
                          <rect x="8" y="8" width="14" height="14"/>
                          <rect x="70" y="0" width="30" height="30" fill="none" stroke="#1a1a1a" stroke-width="6"/>
                          <rect x="78" y="8" width="14" height="14"/>
                          <rect x="0" y="70" width="30" height="30" fill="none" stroke="#1a1a1a" stroke-width="6"/>
                          <rect x="8" y="78" width="14" height="14"/>
                          <rect x="40" y="40" width="20" height="20"/>
                        </svg>
                      `;
                    }}
                  />
                </div>
                <span style={{ fontSize: '8px', fontWeight: '800', color: '#64748b', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                  SCAN FOR CASE INFO
                </span>
              </div>
            )}

          </div>

        </div>

        {/* Footer Contact bar */}
        <div style={{
          backgroundColor: headerType === 'URGENT' ? '#1a1a1a' : headerType === 'WANTED' ? '#1a1a1a' : themeColor,
          color: headerType === 'WANTED' ? '#f9ab00' : '#ffffff',
          margin: '0 -18px -20px -18px',
          padding: '12px 16px',
          borderRadius: '0 0 4px 4px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          borderTop: '2px solid #1a1a1a'
        }}>
          <span style={{ fontSize: '8px', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.9 }}>
            IF SEEN OR IF YOU HAVE ANY DETAILS, CONTACT IMMEDIATELY:
          </span>
          <h3 style={{ fontSize: '20px', fontWeight: '900', margin: '0', letterSpacing: '0.5px' }}>
            {contactPhone}
          </h3>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            fontSize: '10px',
            opacity: 0.9,
            fontWeight: '800',
            textTransform: 'uppercase',
            marginTop: '2px',
            flexWrap: 'wrap'
          }}>
            <span>{contactAgency}</span>
            <span>•</span>
            <span>{contactEmail}</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default PrintableFlyer;
