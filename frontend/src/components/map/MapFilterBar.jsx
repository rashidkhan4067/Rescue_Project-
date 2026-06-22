import React from 'react';

function MapFilterBar({
  filterSector,
  setFilterSector,
  filterStatus,
  setFilterStatus,
  showCases,
  setShowCases,
  showPatrols,
  setShowPatrols,
  filteredCasesCount,
  filteredVolunteersCount,
  onResetSelections
}) {
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '16px',
      padding: '16px',
      borderRadius: '10px',
      backgroundColor: 'var(--card-bg)',
      border: '1px solid var(--border-color)',
      marginBottom: '24px',
      alignItems: 'center'
    }}>
      
      {/* Section: Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span className="material-symbols-rounded" style={{ color: 'var(--text-light)', fontSize: '20px' }}>filter_alt</span>
        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-color)' }}>Filters:</span>
      </div>

      {/* Area Filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <label style={{ fontSize: '10px', color: 'var(--text-light)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Area / Sector</label>
        <select
          value={filterSector}
          onChange={(e) => { setFilterSector(e.target.value); onResetSelections(); }}
          style={{
            height: '36px',
            padding: '0 12px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--light-color)',
            color: 'var(--text-color)',
            fontSize: '12px',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="All">All Areas</option>
          <option value="Sector G-10">Sector G-10</option>
          <option value="Sector F-11">Sector F-11</option>
          <option value="Sector F-7">Sector F-7</option>
          <option value="Sector H-9">Sector H-9</option>
        </select>
      </div>

      {/* Status Filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <label style={{ fontSize: '10px', color: 'var(--text-light)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Case/Rescuer Status</label>
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); onResetSelections(); }}
          style={{
            height: '36px',
            padding: '0 12px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--light-color)',
            color: 'var(--text-color)',
            fontSize: '12px',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="All">All Entities</option>
          <option value="active">Still Missing / Enroute (Active)</option>
          <option value="Standby">Standby (Operators)</option>
          <option value="resolved">Found / Resolved</option>
        </select>
      </div>

      <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--border-color)', margin: '0 8px' }}></div>

      {/* Section: Layer Toggles */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span className="material-symbols-rounded" style={{ color: 'var(--text-light)', fontSize: '20px' }}>layers</span>
        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-color)' }}>Show Layers:</span>
      </div>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', color: 'var(--text-color)' }}>
          <input type="checkbox" checked={showCases} onChange={(e) => { setShowCases(e.target.checked); onResetSelections(); }} style={{ accentColor: '#ea4335', cursor: 'pointer' }} />
          🔴 Missing Cases
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', color: 'var(--text-color)' }}>
          <input type="checkbox" checked={showPatrols} onChange={(e) => { setShowPatrols(e.target.checked); onResetSelections(); }} style={{ accentColor: 'var(--primary-color)', cursor: 'pointer' }} />
          🔵 Active Patrols
        </label>
      </div>

      {/* Counts */}
      <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
        <span style={{
          backgroundColor: 'rgba(234,67,53,0.1)',
          color: '#ea4335',
          padding: '4px 10px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: '700'
        }}>
          {filteredCasesCount} Cases
        </span>
        <span style={{
          backgroundColor: 'rgba(26,115,232,0.1)',
          color: 'var(--primary-color)',
          padding: '4px 10px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: '700'
        }}>
          {filteredVolunteersCount} Patrols
        </span>
      </div>
    </div>
  );
}

export default MapFilterBar;
