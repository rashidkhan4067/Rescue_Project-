import React from 'react';

function ContactPanel({
  contactAgency,
  setContactAgency,
  contactPhone,
  setContactPhone,
  contactEmail,
  setContactEmail,
  rewardEnabled,
  setRewardEnabled,
  rewardAmount,
  setRewardAmount,
  showQrCode,
  setShowQrCode,
  qrUrl,
  setQrUrl
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      
      <div className="form-group-custom">
        <label>Investigating Agency</label>
        <input 
          type="text" 
          className="form-input-custom"
          value={contactAgency} 
          onChange={(e) => setContactAgency(e.target.value)} 
        />
      </div>

      <div className="form-group-custom">
        <label>Emergency Hotline Phone</label>
        <input 
          type="text" 
          className="form-input-custom"
          value={contactPhone} 
          onChange={(e) => setContactPhone(e.target.value)} 
        />
      </div>

      <div className="form-group-custom">
        <label>Agency Contact Email</label>
        <input 
          type="email" 
          className="form-input-custom"
          value={contactEmail} 
          onChange={(e) => setContactEmail(e.target.value)} 
        />
      </div>

      {/* Reward Toggle */}
      <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: 'var(--light-color)' }}>
        <div className="form-group-custom" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ cursor: 'pointer', fontWeight: 'bold' }} htmlFor="reward-toggle">Offer Sighting Reward</label>
          <input 
            type="checkbox" 
            id="reward-toggle"
            checked={rewardEnabled}
            onChange={(e) => setRewardEnabled(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
        </div>
        
        {rewardEnabled && (
          <div className="form-group-custom">
            <label>Reward Cash Amount</label>
            <input 
              type="text" 
              className="form-input-custom"
              value={rewardAmount} 
              onChange={(e) => setRewardAmount(e.target.value)} 
            />
          </div>
        )}
      </div>

      {/* QR Code link details */}
      <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: 'var(--light-color)' }}>
        <div className="form-group-custom" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ cursor: 'pointer', fontWeight: 'bold' }} htmlFor="qr-toggle">Print Scanner QR Link</label>
          <input 
            type="checkbox" 
            id="qr-toggle"
            checked={showQrCode}
            onChange={(e) => setShowQrCode(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
        </div>
        
        {showQrCode && (
          <div className="form-group-custom">
            <label>Scan Destination URL</label>
            <input 
              type="text" 
              className="form-input-custom"
              value={qrUrl} 
              onChange={(e) => setQrUrl(e.target.value)} 
              placeholder="https://..."
            />
          </div>
        )}
      </div>

    </div>
  );
}

export default ContactPanel;
