import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { volunteerService } from '../../services';
import { useApi } from '../../hooks/useApi';

// Subcomponents imports
import MapFilterBar from '../../components/map/MapFilterBar';
import SearchGridMap from '../../components/map/SearchGridMap';
import MapDetailSidebar from '../../components/map/MapDetailSidebar';

function LiveMapPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  
  // Filters state
  const [filterSector, setFilterSector] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Selected Pin states
  const [selectedPin, setSelectedPin] = useState(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);

  // Live weather telemetry shared state (Phase 8 AI Geofencing)
  const [weatherData, setWeatherData] = useState(null);

  // Toggle Overlays
  const [showCases, setShowCases] = useState(true);
  const [showPatrols, setShowPatrols] = useState(true);

  const { data, loading, execute: fetchRadarData } = useApi(volunteerService.getRadarCoordinates);

  useEffect(() => {
    fetchRadarData();
  }, []);

  const cases = data?.coordinates || [];
  const volunteers = data?.volunteers || [];

  // Filter cases based on selected options
  const filteredCases = cases.filter(item => {
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
    const matchesSector = filterSector === 'All' || item.area.toLowerCase().includes(filterSector.toLowerCase());
    return matchesStatus && matchesSector;
  });

  // Filter volunteers based on selected options
  const filteredVolunteers = volunteers.filter(item => {
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
    const matchesSector = filterSector === 'All' || item.sector.toLowerCase().includes(filterSector.toLowerCase());
    return matchesStatus && matchesSector;
  });

  const handleSelectCase = (item) => {
    setSelectedPin(item);
    setSelectedVolunteer(null);
  };

  const handleSelectVolunteer = (item) => {
    setSelectedVolunteer(item);
    setSelectedPin(null);
  };

  const handleRefresh = () => {
    fetchRadarData();
    setSelectedPin(null);
    setSelectedVolunteer(null);
    setWeatherData(null);
  };

  const handleResetSelections = () => {
    setSelectedPin(null);
    setSelectedVolunteer(null);
    setWeatherData(null);
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="portal-main-container dashboard-main-container">
        
        {/* Page Header */}
        <header className="portal-header-bar dashboard-header-bar" style={{ marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-rounded" style={{ color: 'var(--primary-color)', fontSize: '28px' }}>travel_explore</span>
              <h1 className="portal-welcome-title dashboard-welcome-title">Live Search Map</h1>
            </div>
            <p className="portal-welcome-sub dashboard-welcome-sub">
              See where missing persons were last spotted and track active search volunteer patrols in real time. Click any pin to see operational coordinates.
            </p>
          </div>
          <button
            onClick={handleRefresh}
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
            <span className="material-symbols-rounded">refresh</span>
            Refresh Map
          </button>
        </header>

        {/* Filters and Layers Overlay Bar */}
        <MapFilterBar 
          filterSector={filterSector}
          setFilterSector={setFilterSector}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          showCases={showCases}
          setShowCases={setShowCases}
          showPatrols={showPatrols}
          setShowPatrols={setShowPatrols}
          filteredCasesCount={filteredCases.length}
          filteredVolunteersCount={filteredVolunteers.length}
          onResetSelections={handleResetSelections}
        />

        {loading ? (
          <div className="portal-scan-wrapper" style={{ minHeight: '300px' }}>
            <div className="portal-pulse-scanner" style={{ animation: 'spin 1s linear infinite', borderTopColor: 'transparent' }}></div>
            <p style={{ marginTop: '16px', color: 'var(--text-light)' }}>Loading geofenced tactical telemetry...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'stretch' }}>
            
            {/* Map View */}
            <div style={{ flex: '2 1 60%', minWidth: '340px' }}>
              <SearchGridMap 
                showCases={showCases}
                filteredCases={filteredCases}
                showPatrols={showPatrols}
                filteredVolunteers={filteredVolunteers}
                selectedPin={selectedPin}
                selectedVolunteer={selectedVolunteer}
                onSelectCase={handleSelectCase}
                onSelectVolunteer={handleSelectVolunteer}
                weatherData={weatherData}
              />
            </div>
 
            {/* Case Detail Panel / Volunteer Detail Panel */}
            <div style={{ flex: '1 1 30%', minWidth: '280px' }}>
              <MapDetailSidebar 
                selectedPin={selectedPin}
                setSelectedPin={setSelectedPin}
                selectedVolunteer={selectedVolunteer}
                setSelectedVolunteer={setSelectedVolunteer}
                onNavigateToCase={(id) => navigate(`/case/${id}`)}
                onWeatherLoaded={setWeatherData}
              />
            </div>

          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

export default LiveMapPage;
