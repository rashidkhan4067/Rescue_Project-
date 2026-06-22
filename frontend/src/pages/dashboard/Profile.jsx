import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { adminService } from '../../services';
import { useApi } from '../../hooks/useApi';

function Profile() {
  const { user, setUser } = useAuthStore();
  const [formData, setFormData] = useState({
    username: '', email: '', twitter: '', facebook: '', linkedin: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { execute: updateProfile } = useApi(adminService.updateProfile);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        twitter: user.twitter || '',
        facebook: user.facebook || '',
        linkedin: user.linkedin || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    const res = await updateProfile(formData);
    if (res.success) {
      setMessage('Profile updated successfully.');
      setUser({ ...user, ...formData });
    } else {
      setError(res.error || 'Failed to update profile.');
    }
  };

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Account Settings</h2>
        
        {message && <div style={styles.success}>{message}</div>}
        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div>
            <label style={styles.label}>Username</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} style={styles.input} />
          </div>
          
          <h3 style={{marginTop: '20px', fontSize: '16px'}}>Social Links (Optional)</h3>
          
          <div>
            <label style={styles.label}>Twitter URL</label>
            <input type="text" name="twitter" value={formData.twitter} onChange={handleChange} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Facebook URL</label>
            <input type="text" name="facebook" value={formData.facebook} onChange={handleChange} style={styles.input} />
          </div>
          
          <button type="submit" className="btn-google-primary" style={{marginTop: '20px'}}>Save Changes</button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', padding: '3rem 1rem' },
  card: { background: 'white', padding: '2.5rem', borderRadius: '8px', boxShadow: 'var(--box-shadow)', width: '100%', maxWidth: '600px', border: '1px solid var(--border-color)' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' },
  label: { display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '5px', color: 'var(--text-light)' },
  input: { width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '15px' },
  success: { background: '#e6f4ea', color: '#137333', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px' },
  error: { background: '#fce8e6', color: '#c5221f', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px' }
};

export default Profile;
