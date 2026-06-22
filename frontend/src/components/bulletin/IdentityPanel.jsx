import React from 'react';

function IdentityPanel({
  name,
  setName,
  age,
  setAge,
  gender,
  setGender,
  height,
  setHeight,
  weight,
  setWeight,
  hair,
  setHair,
  eyes,
  setEyes,
  handlePhotoChange
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      
      <div className="form-group-custom">
        <label>Full Name</label>
        <input 
          type="text" 
          className="form-input-custom"
          value={name} 
          onChange={(e) => setName(e.target.value)} 
        />
      </div>

      <div className="control-grid-2">
        <div className="form-group-custom">
          <label>Age (Years)</label>
          <input 
            type="number" 
            className="form-input-custom"
            value={age} 
            onChange={(e) => setAge(e.target.value)} 
          />
        </div>
        <div className="form-group-custom">
          <label>Gender</label>
          <select 
            className="form-input-custom"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="control-grid-2">
        <div className="form-group-custom">
          <label>Height</label>
          <input 
            type="text" 
            className="form-input-custom"
            value={height} 
            placeholder="e.g. 5ft 8in (173cm)"
            onChange={(e) => setHeight(e.target.value)} 
          />
        </div>
        <div className="form-group-custom">
          <label>Weight</label>
          <input 
            type="text" 
            className="form-input-custom"
            value={weight} 
            placeholder="e.g. 145 lbs (65kg)"
            onChange={(e) => setWeight(e.target.value)} 
          />
        </div>
      </div>

      <div className="control-grid-2">
        <div className="form-group-custom">
          <label>Hair Color</label>
          <input 
            type="text" 
            className="form-input-custom"
            value={hair} 
            onChange={(e) => setHair(e.target.value)} 
          />
        </div>
        <div className="form-group-custom">
          <label>Eye Color</label>
          <input 
            type="text" 
            className="form-input-custom"
            value={eyes} 
            onChange={(e) => setEyes(e.target.value)} 
          />
        </div>
      </div>

      <div className="form-group-custom">
        <label>Photo Attachment</label>
        <div className="upload-btn-wrapper">
          <label className="photo-upload-dropzone">
            <span className="material-symbols-rounded" style={{ color: 'var(--primary-color)' }}>photo_camera</span>
            <span style={{ fontSize: '11px', fontWeight: 'bold' }}>UPLOAD PHOTOGRAPH</span>
            <span style={{ fontSize: '9px', color: 'var(--text-light)' }}>JPG/PNG files</span>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handlePhotoChange} 
              style={{ display: 'none' }} 
            />
          </label>
        </div>
      </div>

    </div>
  );
}

export default IdentityPanel;
