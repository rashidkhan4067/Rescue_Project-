import React from 'react';

function LocationPanel({
  area,
  setArea,
  dateSeen,
  setDateSeen,
  timeSeen,
  setTimeSeen,
  showCoordinates,
  setShowCoordinates,
  clothing,
  setClothing,
  marks,
  setMarks,
  description,
  setDescription
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      
      <div className="form-group-custom">
        <label>Last Seen Area</label>
        <input 
          type="text" 
          className="form-input-custom"
          value={area} 
          onChange={(e) => setArea(e.target.value)} 
        />
      </div>

      <div className="control-grid-2">
        <div className="form-group-custom">
          <label>Date Disappeared</label>
          <input 
            type="date" 
            className="form-input-custom"
            value={dateSeen} 
            onChange={(e) => setDateSeen(e.target.value)} 
          />
        </div>
        <div className="form-group-custom">
          <label>Time Disappeared</label>
          <input 
            type="time" 
            className="form-input-custom"
            value={timeSeen} 
            onChange={(e) => setTimeSeen(e.target.value)} 
          />
        </div>
      </div>

      <div className="form-group-custom" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
        <label style={{ cursor: 'pointer' }} htmlFor="gps-toggle">Include GPS Coordinates</label>
        <input 
          type="checkbox" 
          id="gps-toggle"
          checked={showCoordinates}
          onChange={(e) => setShowCoordinates(e.target.checked)}
          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
        />
      </div>

      <div className="form-group-custom">
        <label>Clothing Details</label>
        <input 
          type="text" 
          className="form-input-custom"
          value={clothing} 
          placeholder="e.g. Red hoodie, black cap"
          onChange={(e) => setClothing(e.target.value)} 
        />
      </div>

      <div className="form-group-custom">
        <label>Distinguishing Marks</label>
        <input 
          type="text" 
          className="form-input-custom"
          value={marks} 
          placeholder="e.g. Scar on left wrist"
          onChange={(e) => setMarks(e.target.value)} 
        />
      </div>

      <div className="form-group-custom">
        <label>Incident Circumstances</label>
        <textarea 
          className="form-textarea-custom"
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
        />
      </div>

    </div>
  );
}

export default LocationPanel;
