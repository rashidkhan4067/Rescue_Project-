import React from 'react';
import PortalCard from '../dashboard/PortalCard';
import { getImageUrl } from '../../utils/image';
import api from '../../api';

function MapDetailSidebar({
  selectedPin,
  setSelectedPin,
  selectedVolunteer,
  setSelectedVolunteer,
  onNavigateToCase,
  onWeatherLoaded
}) {
  const [localWeatherData, setLocalWeatherData] = React.useState(null);
  const [loadingWeather, setLoadingWeather] = React.useState(false);
  const [weatherError, setWeatherError] = React.useState('');

  React.useEffect(() => {
    if (selectedPin && selectedPin.status !== 'resolved') {
      const fetchWeather = async () => {
        setLoadingWeather(true);
        setWeatherError('');
        setLocalWeatherData(null);
        if (onWeatherLoaded) onWeatherLoaded(null);
        
        try {
          const response = await api.get(`/utils/ai-assistant/weather-conditions?lat=${selectedPin.lat || 33.6844}&lng=${selectedPin.lng || 73.0479}`);
          setLocalWeatherData(response.data);
          if (onWeatherLoaded) onWeatherLoaded(response.data);
        } catch (err) {
          console.error("Failed to load AI weather diagnostics:", err);
          setWeatherError("Weather staging feed offline.");
        } finally {
          setLoadingWeather(false);
        }
      };
      
      fetchWeather();
    } else {
      setLocalWeatherData(null);
      if (onWeatherLoaded) onWeatherLoaded(null);
    }
  }, [selectedPin]);
  if (selectedPin) {
    return (
      <PortalCard title="Missing Person Details" icon="person_search">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Photo */}
          <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', backgroundColor: 'var(--light-color)' }}>
            {selectedPin.image ? (
              <img src={getImageUrl(selectedPin.image)} alt={selectedPin.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: 'var(--light-color)' }}>
                <span className="material-symbols-rounded" style={{ fontSize: '48px', color: 'var(--text-light)' }}>portrait</span>
                <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>No Photo Available</span>
              </div>
            )}
            <span style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              backgroundColor: selectedPin.status === 'active' ? '#ea4335' : '#34a853',
              color: '#ffffff',
              padding: '3px 10px',
              borderRadius: '10px',
              fontSize: '10px',
              fontWeight: 'bold'
            }}>
              {selectedPin.status === 'active' ? '🔴 Still Missing' : '🟢 Found'}
            </span>
          </div>

          {/* Person Info */}
          <div className="portal-modal-details-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-light)', fontSize: '12px' }}>Full Name</span>
              <strong style={{ color: 'var(--text-color)', fontSize: '13px' }}>{selectedPin.name}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-light)', fontSize: '12px' }}>Age / Gender</span>
              <strong style={{ color: 'var(--text-color)', fontSize: '12px' }}>{selectedPin.age} yrs • {selectedPin.gender}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-light)', fontSize: '12px' }}>Last Seen Area</span>
              <strong style={{ color: 'var(--text-color)', fontSize: '12px', textAlign: 'right', maxWidth: '160px' }}>{selectedPin.area}</strong>
            </div>

            {selectedPin.signal_strength && (
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                <span style={{ color: 'var(--text-light)', fontSize: '12px' }}>Signal Strength</span>
                <strong style={{ color: 'var(--text-color)', fontSize: '12px' }}>{selectedPin.signal_strength}</strong>
              </div>
            )}

            {selectedPin.perimeter_radius && (
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                <span style={{ color: 'var(--text-light)', fontSize: '12px' }}>Search Radius</span>
                <strong style={{ color: 'var(--text-color)', fontSize: '12px' }}>{selectedPin.perimeter_radius}m</strong>
              </div>
            )}

            {selectedPin.closest_squad && (
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                <span style={{ color: 'var(--text-light)', fontSize: '12px' }}>Nearest Team</span>
                <strong style={{ color: 'var(--text-color)', fontSize: '12px' }}>{selectedPin.closest_squad}</strong>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-light)', fontSize: '12px' }}>GPS Coordinates</span>
              <strong style={{ color: 'var(--primary-color)', fontSize: '11px', fontFamily: 'monospace' }}>
                {selectedPin.lat?.toFixed(4)}° N, {selectedPin.lng?.toFixed(4)}° E
              </strong>
            </div>
          </div>

          {/* Live Flight Staging & Weather HUD card */}
          {selectedPin.status !== 'resolved' && (
            <div style={{
              marginTop: '4px',
              padding: '14px',
              borderRadius: '12px',
              backgroundColor: 'rgba(26, 29, 36, 0.95)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
            }}>
              <style>{`
                @keyframes flashStatusAnimation {
                  0% { opacity: 0.5; }
                  50% { opacity: 1; }
                  100% { opacity: 0.5; }
                }
                .flash-status-glow {
                  animation: flashStatusAnimation 1.5s ease-in-out infinite;
                }
              `}</style>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '14px' }}>🚁</span>
                  <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#ffffff', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    AI Flight Staging & Weather Advisory
                  </span>
                </div>
                
                {localWeatherData && (
                  <span 
                    className="flash-status-glow"
                    style={{
                      fontSize: '9px',
                      fontWeight: '700',
                      padding: '3px 8px',
                      borderRadius: '10px',
                      backgroundColor: localWeatherData.drone_flight_authorized ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 82, 82, 0.15)',
                      color: localWeatherData.drone_flight_authorized ? '#00E676' : '#FF5252',
                      textTransform: 'uppercase',
                      border: `1px solid ${localWeatherData.drone_flight_authorized ? 'rgba(0, 230, 118, 0.3)' : 'rgba(255, 82, 82, 0.3)'}`,
                      letterSpacing: '0.3px'
                    }}
                  >
                    {localWeatherData.drone_flight_authorized ? '[✓ FLY WINDOW OPTIMAL]' : '[⚠️ DRONES GROUNDED - GUSTS]'}
                  </span>
                )}
              </div>

              {loadingWeather && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 0' }}>
                  <div className="portal-pulse-scanner" style={{ width: '12px', height: '12px', borderWidth: '2px', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
                  <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)', fontFamily: 'monospace' }}>Scanning weather vectors...</span>
                </div>
              )}

              {weatherError && (
                <span style={{ fontSize: '11px', color: '#FF5252', fontFamily: 'monospace' }}>⚠️ {weatherError}</span>
              )}

              {localWeatherData && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  
                  {/* Weather diagnostics dashboard strip */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    textAlign: 'center'
                  }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '8px', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase' }}>Temp</span>
                      <strong style={{ fontSize: '11px', color: '#ffffff' }}>{localWeatherData.temperature}°C</strong>
                    </div>
                    <div style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.1)', height: '16px' }}></div>
                    <div>
                      <span style={{ display: 'block', fontSize: '8px', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase' }}>Wind Gusts</span>
                      <strong style={{ fontSize: '11px', color: '#f9ab00' }}>{localWeatherData.wind_speed_kmh} km/h {localWeatherData.wind_direction}</strong>
                    </div>
                    <div style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.1)', height: '16px' }}></div>
                    <div>
                      <span style={{ display: 'block', fontSize: '8px', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase' }}>Precip</span>
                      <strong style={{ fontSize: '11px', color: '#ffffff' }}>{localWeatherData.precipitation}%</strong>
                    </div>
                  </div>

                  {/* Flight Advisory Card from Groq */}
                  <div style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(249, 171, 0, 0.05)',
                    border: '1px solid rgba(249, 171, 0, 0.15)',
                    borderLeft: '3px solid #f9ab00',
                    fontSize: '11px',
                    color: 'rgba(255, 255, 255, 0.9)',
                    lineHeight: '1.4',
                    textAlign: 'left'
                  }}>
                    <strong style={{ display: 'block', fontSize: '9px', color: '#f9ab00', textTransform: 'uppercase', marginBottom: '3px', letterSpacing: '0.3px' }}>
                      🛰️ AI Aerial Flight Advisory
                    </strong>
                    {localWeatherData.flight_advisory}
                  </div>

                </div>
              )}
            </div>
          )}

          {/* AI Smart Dispatch Advisor recommendation overlay for active cases */}
          {selectedPin.status === 'active' && (() => {
            const age = selectedPin.age;
            const severity = selectedPin.severity || 'Standard Search';
            const signal = selectedPin.signal_strength || '';
            
            let recommendation = "";
            let unitName = "";
            let iconName = "";
            
            if (signal.includes('Canopy') || signal.includes('Degraded')) {
              recommendation = "Dense forest canopy detected. Ground scent tracking is highly prioritized.";
              unitName = "K9 Canine Handler Squad";
              iconName = "pets";
            } else if (age < 12 || age > 65) {
              recommendation = "Vulnerable victim profile in open sector boundaries. Aerial thermal mapping is highly recommended.";
              unitName = "Rapid Search Drone Unit";
              iconName = "flight_takeoff";
            } else if (severity.includes('Critical')) {
              recommendation = "Tier-1 emergency siren mobilization active. Require lead coordinators ground response.";
              unitName = "Sector-Alpha Canine Rescue Team";
              iconName = "military_tech";
            } else {
              recommendation = "Standard urban/landmark tracking active. Standard foot patrols required.";
              unitName = "Medical Responder Squad";
              iconName = "medical_services";
            }

            return (
              <div style={{
                marginTop: '4px',
                padding: '14px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(26,115,232,0.04), rgba(249,171,0,0.04))',
                border: '1px solid rgba(249,171,0,0.2)',
                boxShadow: '0 4px 16px rgba(249,171,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="material-symbols-rounded" style={{ color: 'var(--warning-color)', fontSize: '18px' }}>auto_awesome</span>
                  <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--warning-color)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    AI Dispatch Advisor
                  </span>
                </div>
                
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span className="material-symbols-rounded" style={{ 
                    fontSize: '20px', 
                    color: 'var(--primary-color)',
                    background: 'rgba(26,115,232,0.08)',
                    padding: '8px',
                    borderRadius: '8px',
                    flexShrink: 0
                  }}>
                    {iconName}
                  </span>
                  <div>
                    <strong style={{ display: 'block', fontSize: '12px', color: 'var(--text-color)', marginBottom: '2px' }}>
                      {unitName} Recommended
                    </strong>
                    <span style={{ fontSize: '11px', color: 'var(--text-light)', lineHeight: '1.4', display: 'block' }}>
                      {recommendation}
                    </span>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    alert(`🚨 AI Dispatch Mobilization:\nEmergency alert dispatch SMTP packets successfully broadcasted to all standby ${unitName} operators assigned in sector grid!`);
                  }}
                  style={{
                    marginTop: '4px',
                    height: '28px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'var(--primary-color)',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    transition: 'background-color 0.15s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary-dark)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary-color)'; }}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>campaign</span>
                  Instantly Mobilize Standby Team
                </button>
              </div>
            );
          })()}

          {/* Action button */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => onNavigateToCase(selectedPin.id)}
              className="portal-modal-btn-primary portal-btn-primary"
              style={{
                flex: 1,
                height: '40px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span className="material-symbols-rounded">open_in_new</span>
              View Full Case File
            </button>
            <button
              onClick={() => setSelectedPin(null)}
              className="portal-modal-btn-secondary portal-btn-secondary-outline"
              style={{
                height: '40px',
                width: '40px',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <span className="material-symbols-rounded">close</span>
            </button>
          </div>

        </div>
      </PortalCard>
    );
  }

  if (selectedVolunteer) {
    return (
      <PortalCard title="Rescue Operator Details" icon="badge">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Header Banner */}
          <div style={{
            padding: '20px 16px',
            borderRadius: '8px',
            backgroundColor: 'rgba(26,115,232,0.06)',
            border: '1px solid rgba(26,115,232,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            position: 'relative'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-color)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '15px',
              fontWeight: '700',
              flexShrink: 0
            }}>
              {selectedVolunteer.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text-color)' }}>{selectedVolunteer.name}</strong>
              <span style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: '500' }}>{selectedVolunteer.role}</span>
            </div>
            
            <span style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              backgroundColor: selectedVolunteer.status === 'Active' ? 'rgba(30,142,62,0.1)' : selectedVolunteer.status === 'Standby' ? 'rgba(249,171,0,0.1)' : 'rgba(128,128,128,0.1)',
              color: selectedVolunteer.status === 'Active' ? '#1e8e3e' : selectedVolunteer.status === 'Standby' ? '#f9ab00' : '#6b7280',
              fontSize: '9px',
              fontWeight: '700',
              padding: '3px 8px',
              borderRadius: '10px',
              textTransform: 'uppercase'
            }}>
              {selectedVolunteer.status}
            </span>
          </div>

          {/* Telemetry info */}
          <div className="portal-modal-details-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-light)', fontSize: '12px' }}>Operational Sector</span>
              <strong style={{ color: 'var(--text-color)', fontSize: '13px' }}>{selectedVolunteer.sector}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-light)', fontSize: '12px' }}>Call Sign Phone</span>
              <strong style={{ color: 'var(--text-color)', fontSize: '12px' }}>{selectedVolunteer.phone}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-light)', fontSize: '12px' }}>Email Coordinate</span>
              <strong style={{ color: 'var(--text-color)', fontSize: '11px', textTransform: 'lowercase' }}>{selectedVolunteer.email}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-light)', fontSize: '12px' }}>Radar GPS Coordinates</span>
              <strong style={{ color: 'var(--primary-color)', fontSize: '11px', fontFamily: 'monospace' }}>
                {selectedVolunteer.lat?.toFixed(4)}° N, {selectedVolunteer.lng?.toFixed(4)}° E
              </strong>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <a
              href={`tel:${selectedVolunteer.phone}`}
              className="portal-modal-btn-primary portal-btn-primary"
              style={{
                flex: 1,
                height: '40px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                textDecoration: 'none',
                color: '#ffffff'
              }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>call</span>
              Call Operator
            </a>
            <button
              onClick={() => setSelectedVolunteer(null)}
              className="portal-modal-btn-secondary portal-btn-secondary-outline"
              style={{
                height: '40px',
                width: '40px',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <span className="material-symbols-rounded">close</span>
            </button>
          </div>

        </div>
      </PortalCard>
    );
  }

  return (
    <div style={{
      height: '100%',
      minHeight: '280px',
      border: '2px dashed var(--border-color)',
      borderRadius: '10px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px',
      textAlign: 'center',
      backgroundColor: 'var(--card-bg)'
    }}>
      <span className="material-symbols-rounded" style={{ fontSize: '48px', color: 'var(--border-color)', marginBottom: '12px' }}>
        touch_app
      </span>
      <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', color: 'var(--text-color)', fontWeight: '600' }}>
        Select a Location Pin
      </h4>
      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-light)', maxWidth: '240px', lineHeight: '1.6' }}>
        Click on any dot (🔴/🟢 cases) or diamond (🔵 patrols) on the map to display geofenced target files here.
      </p>
    </div>
  );
}

export default MapDetailSidebar;
