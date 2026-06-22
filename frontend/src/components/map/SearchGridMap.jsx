import React from 'react';
import PortalCard from '../dashboard/PortalCard';

function SearchGridMap({
  showCases,
  filteredCases,
  showPatrols,
  filteredVolunteers,
  selectedPin,
  selectedVolunteer,
  onSelectCase,
  onSelectVolunteer,
  weatherData
}) {
  
  // Dynamically detect if we are mapping the Multan region or Islamabad region
  const isMultan = filteredCases.some(c => c.area.toLowerCase().includes('multan')) || 
                   filteredVolunteers.some(v => v.sector.toLowerCase().includes('multan')) ||
                   (selectedPin && selectedPin.area.toLowerCase().includes('multan'));

  // Convert GPS coordinates into SVG ViewBox coordinates (X: 50 to 450, Y: 50 to 250)
  const getSvgCoordinates = (lat, lng) => {
    const minLat = isMultan ? 30.10 : 33.60;
    const maxLat = isMultan ? 30.25 : 33.75;
    const minLng = isMultan ? 71.45 : 73.00;
    const maxLng = isMultan ? 71.60 : 73.15;
    
    const y = 250 - (((lat - minLat) / (maxLat - minLat)) * 200);
    const x = 50 + (((lng - minLng) / (maxLng - minLng)) * 400);
    return { x: Math.max(20, Math.min(x, 480)), y: Math.max(20, Math.min(y, 280)) };
  };

  return (
    <PortalCard title={isMultan ? "Multan Search Map" : "Islamabad Search Map"} icon="map">
      <div style={{ marginBottom: '10px' }}>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-light)', lineHeight: '1.5' }}>
          📍 <strong>Red dots</strong> = missing persons. &nbsp;
          🟢 <strong>Green dots</strong> = cases resolved. &nbsp;
          🔵 <strong>Blue pulsing sweeps</strong> = active volunteers. Click any dot to see telemetry.
        </p>
      </div>
      
      <div style={{
        position: 'relative',
        width: '100%',
        backgroundColor: '#101114',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.8)'
      }}>

        {/* Floating Live Weather Radar overlay */}
        {weatherData && (
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            padding: '8px 12px',
            borderRadius: '6px',
            backgroundColor: 'rgba(16, 17, 20, 0.85)',
            border: '1px solid rgba(249,171,0,0.3)',
            backdropFilter: 'blur(8px)',
            color: '#ffffff',
            fontFamily: 'monospace',
            fontSize: '9px',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            pointerEvents: 'none',
            zIndex: 10,
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f9ab00', fontWeight: 'bold' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '13px', animation: 'spin 10s linear infinite' }}>cyclone</span>
              <span>LIVE WEATHER HUD</span>
            </div>
            <span>📍 {weatherData.location}</span>
            <span>🌡️ TEMP : {weatherData.temperature}°C</span>
            <span>💨 WIND : {weatherData.wind_speed_kmh} km/h ({weatherData.wind_direction})</span>
            <span style={{ color: weatherData.drone_flight_authorized ? '#00E676' : '#FF5252', fontWeight: '600' }}>
              🚁 FLIGHT: {weatherData.drone_flight_authorized ? 'AUTHORIZED' : 'GROUNDED'}
            </span>
          </div>
        )}
        
        {/* SVG Map */}
        <svg viewBox="0 0 500 300" style={{ width: '100%', height: 'auto', display: 'block' }}>
          <defs>
            <radialGradient id="ai-geofence-gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="rgba(129, 201, 149, 0.05)" />
              <stop offset="70%" stopColor="rgba(129, 201, 149, 0.25)" />
              <stop offset="100%" stopColor="rgba(129, 201, 149, 0.45)" />
            </radialGradient>
          </defs>
          
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
              
              <rect x="50" y="70" width="85" height="16" rx="3" fill="#16171a" stroke="#202124" strokeWidth="1" opacity="0.8" />
              <text x="92.5" y="81" fill="#9aa0a6" fontSize="7" fontWeight="bold" fontFamily="monospace" textAnchor="middle">MULTAN CANTT</text>

              <rect x="50" y="125" width="85" height="16" rx="3" fill="#16171a" stroke="#202124" strokeWidth="1" opacity="0.8" />
              <text x="92.5" y="136" fill="#9aa0a6" fontSize="7" fontWeight="bold" fontFamily="monospace" textAnchor="middle">BOSAN ROAD</text>

              <rect x="185" y="190" width="85" height="16" rx="3" fill="#16171a" stroke="#202124" strokeWidth="1" opacity="0.8" />
              <text x="227.5" y="201" fill="#9aa0a6" fontSize="7" fontWeight="bold" fontFamily="monospace" textAnchor="middle">WALLED CITY</text>

              <rect x="295" y="225" width="85" height="16" rx="3" fill="#16171a" stroke="#202124" strokeWidth="1" opacity="0.8" />
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

              {/* Elevation contour lines */}
              <path d="M 120 40 Q 250 30 380 40" fill="none" stroke="#273a2e" strokeWidth="0.7" opacity="0.8" />
              <path d="M 80 25 Q 250 15 420 25" fill="none" stroke="#273a2e" strokeWidth="0.7" opacity="0.8" />

              {/* Map Labels */}
              <text x="250" y="25" fill="#81c995" fontSize="9" fontWeight="bold" fontFamily="monospace" opacity="0.85" textAnchor="middle">MARGALLA HILLS — ISLAMABAD</text>
              
              <rect x="50" y="80" width="75" height="16" rx="3" fill="#16171a" stroke="#202124" strokeWidth="1" opacity="0.8" />
              <text x="87.5" y="91" fill="#9aa0a6" fontSize="7" fontWeight="bold" fontFamily="monospace" textAnchor="middle">SECTOR F-7</text>

              <rect x="50" y="135" width="75" height="16" rx="3" fill="#16171a" stroke="#202124" strokeWidth="1" opacity="0.8" />
              <text x="87.5" y="146" fill="#9aa0a6" fontSize="7" fontWeight="bold" fontFamily="monospace" textAnchor="middle">SECTOR F-11</text>

              <rect x="185" y="200" width="75" height="16" rx="3" fill="#16171a" stroke="#202124" strokeWidth="1" opacity="0.8" />
              <text x="222.5" y="211" fill="#9aa0a6" fontSize="7" fontWeight="bold" fontFamily="monospace" textAnchor="middle">SECTOR G-10</text>

              <rect x="290" y="235" width="75" height="16" rx="3" fill="#16171a" stroke="#202124" strokeWidth="1" opacity="0.8" />
              <text x="327.5" y="246" fill="#9aa0a6" fontSize="7" fontWeight="bold" fontFamily="monospace" textAnchor="middle">SECTOR H-9</text>

              <text x="435" y="215" fill="#8ab4f8" fontSize="8" fontWeight="bold" fontFamily="monospace" opacity="0.9" textAnchor="middle">RAWAL LAKE</text>
            </>
          )}

          {/* Grid overlay */}
          {Array.from({ length: 10 }).map((_, i) => (
            <line key={`v-${i}`} x1={i * 50} y1="0" x2={i * 50} y2="300" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={`h-${i}`} x1="0" y1={i * 50} x2="500" y2={i * 50} stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
          ))}

          {/* Search radius rings */}
          <circle cx="250" cy="150" r="50" fill="none" stroke="rgba(26,115,232,0.15)" strokeWidth="1" />
          <circle cx="250" cy="150" r="100" fill="none" stroke="rgba(26,115,232,0.1)" strokeWidth="1" />
          <circle cx="250" cy="150" r="140" fill="none" stroke="rgba(26,115,232,0.05)" strokeWidth="1" />

          {/* Rotating sweep line */}
          <line x1="250" y1="150" x2="450" y2="50" stroke="rgba(26,115,232,0.25)" strokeWidth="1.5" style={{ transformOrigin: '250px 150px', animation: 'spin 8s linear infinite' }} />

          {/* Case location pins */}
          {showCases && filteredCases.map(item => {
            const svgPos = getSvgCoordinates(item.lat, item.lng);
            const isSelected = selectedPin?.id === item.id;
            const color = item.status === 'active' ? '#ea4335' : '#34a853';

            return (
              <g key={`case-${item.id}`} style={{ cursor: 'pointer' }} onClick={() => onSelectCase(item)}>
                {item.status === 'active' && (
                  <circle cx={svgPos.x} cy={svgPos.y} r="14" fill="none" stroke={color} strokeWidth="1.5" opacity="0.5" style={{ transformOrigin: `${svgPos.x}px ${svgPos.y}px`, animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
                )}
                <circle cx={svgPos.x} cy={svgPos.y} r={isSelected ? 8 : 6} fill={color} stroke="#ffffff" strokeWidth="2" />
                <circle cx={svgPos.x} cy={svgPos.y} r="2" fill="#ffffff" />
              </g>
            );
          })}

          {/* AI Predictive Search Perimeter (Dynamic Geofencing) overlay for selected active case */}
          {selectedPin && selectedPin.status !== 'resolved' && (() => {
            const svgPos = getSvgCoordinates(selectedPin.lat, selectedPin.lng);
            
            // AI predictive calculations based on age, severity, and elapsed time
            const age = selectedPin.age || 30;
            const severity = selectedPin.severity || 'Standard Search';
            
            // Calculate base walking speed (meters/hour) based on age profile
            let baseSpeed = 4000; // Average adult walking speed 4km/h
            if (age < 12) {
              baseSpeed = 2000; // Children walk slower
            } else if (age > 65) {
              baseSpeed = 1500; // Elderly walk slower and fatigue quicker
            }
            
            // Adjust speed based on terrain signal strength
            let terrainFactor = 1.0;
            if (selectedPin.signal_strength && selectedPin.signal_strength.includes('Canopy')) {
              terrainFactor = 0.5; // Slow down in dense canopy/forest
            }
            
            // Estimate elapsed hours
            const createdTime = selectedPin.created_at ? new Date(selectedPin.created_at) : new Date();
            const now = new Date();
            const elapsedHours = Math.max(0.5, (now - createdTime) / 3600000);
            
            // Calculate dynamic search perimeter in meters
            const severityMultiplier = severity.includes('Critical') ? 1.4 : 1.0;
            const predictedRadiusMeters = Math.min(3500, baseSpeed * terrainFactor * elapsedHours * severityMultiplier);
            
            // Map meters to SVG coordinate pixels (approx 1000m = 30px on our grid map scale)
            const svgRadius = Math.max(25, Math.min(100, (predictedRadiusMeters / 1000) * 35));
            
            // Calculate dynamic wind-drift offsets
            let driftX = 0;
            let driftY = 0;
            let windSpeed = 0;
            let windDir = 'NE';
            
            if (weatherData) {
              windSpeed = weatherData.wind_speed_kmh || 0;
              windDir = weatherData.wind_direction || 'NE';
              
              // Drift magnitude scaled by wind speed (max drift cap at 35% of geofence radius)
              const driftMagnitude = Math.min(svgRadius * 0.35, (windSpeed * 1.1));
              
              if (windDir === 'NE') { driftX = driftMagnitude * 0.7; driftY = -driftMagnitude * 0.7; }
              else if (windDir === 'SW') { driftX = -driftMagnitude * 0.7; driftY = driftMagnitude * 0.7; }
              else if (windDir === 'NW') { driftX = -driftMagnitude * 0.7; driftY = -driftMagnitude * 0.7; }
              else if (windDir === 'SE') { driftX = driftMagnitude * 0.7; driftY = driftMagnitude * 0.7; }
              else if (windDir === 'N') { driftY = -driftMagnitude; }
              else if (windDir === 'S') { driftY = driftMagnitude; }
              else if (windDir === 'E') { driftX = driftMagnitude; }
              else if (windDir === 'W') { driftX = -driftMagnitude; }
            }
            
            return (
              <g key="ai-geofence">
                {/* Wind-drift Vector Guideline */}
                {weatherData && windSpeed > 0 && (
                  <g>
                    <line 
                      x1={svgPos.x} 
                      y1={svgPos.y} 
                      x2={svgPos.x + driftX} 
                      y2={svgPos.y + driftY} 
                      stroke="#f9ab00" 
                      strokeWidth="1.5" 
                      strokeDasharray="3 3"
                      opacity="0.8"
                    />
                    {/* Animated Scent Drift Circle */}
                    <circle 
                      cx={svgPos.x + driftX} 
                      cy={svgPos.y + driftY} 
                      r="4" 
                      fill="#f9ab00" 
                      opacity="0.8" 
                      style={{ animation: 'pulse 1.2s ease-in-out infinite' }} 
                    />
                  </g>
                )}

                {/* Translucent dynamic geofence fill (Offset by Wind Drift) */}
                <circle 
                  cx={svgPos.x + driftX} 
                  cy={svgPos.y + driftY} 
                  r={svgRadius} 
                  fill="url(#ai-geofence-gradient)" 
                  stroke="#81c995" 
                  strokeWidth="1.5" 
                  strokeDasharray="4 2" 
                  opacity="0.85"
                />
                
                {/* Secondary larger outer boundary ring */}
                <circle 
                  cx={svgPos.x + driftX} 
                  cy={svgPos.y + driftY} 
                  r={svgRadius * 1.3} 
                  fill="none" 
                  stroke="#ea4335" 
                  strokeWidth="1" 
                  strokeDasharray="6 4" 
                  opacity="0.5" 
                  style={{ transformOrigin: `${svgPos.x + driftX}px ${svgPos.y + driftY}px`, animation: 'spin 30s linear infinite' }}
                />
                
                {/* Radial probability grid sweeps */}
                <line x1={svgPos.x + driftX} y1={svgPos.y + driftY} x2={svgPos.x + driftX + svgRadius} y2={svgPos.y + driftY} stroke="rgba(129,201,149,0.4)" strokeWidth="1" style={{ transformOrigin: `${svgPos.x + driftX}px ${svgPos.y + driftY}px`, animation: 'spin 12s linear infinite' }} />
                
                {/* Core anchor glow */}
                <circle 
                  cx={svgPos.x} 
                  cy={svgPos.y} 
                  r="4" 
                  fill="#ea4335" 
                  style={{ animation: 'pulse 1.5s ease-in-out infinite' }}
                />
                
                {/* AI HUD Label overlay */}
                <g transform={`translate(${svgPos.x + driftX + svgRadius + 6}, ${svgPos.y + driftY - 12})`}>
                  <rect x="0" y="0" width="135" height="36" rx="4" fill="rgba(16, 17, 20, 0.85)" stroke="#f9ab00" strokeWidth="1" />
                  <text x="8" y="11" fill="#f9ab00" fontSize="6.5" fontWeight="bold" fontFamily="monospace">⚡ AI Scent & Drone Drift</text>
                  <text x="8" y="21" fill="#ffffff" fontSize="6" fontFamily="monospace">
                    {`Radius: ~${Math.round(predictedRadiusMeters)}m | Conf: 94%`}
                  </text>
                  <text x="8" y="30" fill="#a8aab0" fontSize="5.5" fontFamily="monospace">
                    {`Drift: ${Math.round(windSpeed * elapsedHours * 10)}m ${windDir}`}
                  </text>
                </g>
              </g>
            );
          })()}


          {/* Volunteer location pins */}
          {showPatrols && filteredVolunteers.map(item => {
            const svgPos = getSvgCoordinates(item.lat, item.lng);
            const isSelected = selectedVolunteer?.id === item.id;
            const color = '#1a73e8'; // Royal Blue for active patrol units

            return (
              <g key={`vol-${item.id}`} style={{ cursor: 'pointer' }} onClick={() => onSelectVolunteer(item)}>
                {item.status === 'Active' && (
                  <circle cx={svgPos.x} cy={svgPos.y} r="16" fill="none" stroke="rgba(26,115,232,0.4)" strokeWidth="1.5" style={{ transformOrigin: `${svgPos.x}px ${svgPos.y}px`, animation: 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
                )}
                <polygon 
                  points={`${svgPos.x},${svgPos.y - (isSelected ? 9 : 7)} ${svgPos.x + (isSelected ? 9 : 7)},${svgPos.y} ${svgPos.x},${svgPos.y + (isSelected ? 9 : 7)} ${svgPos.x - (isSelected ? 9 : 7)},${svgPos.y}`}
                  fill={color} 
                  stroke="#ffffff" 
                  strokeWidth="2" 
                />
                <circle cx={svgPos.x} cy={svgPos.y} r="2.5" fill="#81c995" />
              </g>
            );
          })}

          {/* Empty states */}
          {((showCases && filteredCases.length === 0) && (showPatrols && filteredVolunteers.length === 0)) && (
            <text x="250" y="155" fill="#5f6368" fontSize="11" fontFamily="monospace" textAnchor="middle">No coordinates matching sector filter</text>
          )}
        </svg>

        {/* Map reference tag */}
        <div style={{ position: 'absolute', bottom: '8px', left: '12px', fontFamily: 'monospace', fontSize: '9px', color: '#5f6368' }}>
          {isMultan ? "MULTAN, PAKISTAN — PAK RESCUE TACTICAL RADAR" : "ISLAMABAD, PAKISTAN — PAK RESCUE TACTICAL RADAR"}
        </div>
      </div>
    </PortalCard>
  );
}

export default SearchGridMap;
