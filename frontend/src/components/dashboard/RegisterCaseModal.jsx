import React, { useState, useEffect, useRef } from 'react';
import api from '../../api';
import { MaterialInput, MaterialSelect } from '../common/MaterialFormElements';


function RegisterCaseModal({ isOpen, onClose, onRegisterSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    area: '',
    description: '',
    height: '',
    weight: '',
    hair: '',
    eyes: '',
    clothing: '',
    marks: '',
    severity: 'Standard Search'
  });
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [error, setError] = useState('');
  const [extractingTags, setExtractingTags] = useState(false);

  // High-fidelity image quality analysis states
  const [scanningImage, setScanningImage] = useState(false);
  const [imageQualityData, setImageQualityData] = useState(null);
  const [imageQualityError, setImageQualityError] = useState('');

  // Voice Recording Telemetry & Profiler states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [processingVoice, setProcessingVoice] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        age: '',
        gender: 'Male',
        area: '',
        description: '',
        height: '',
        weight: '',
        hair: '',
        eyes: '',
        clothing: '',
        marks: '',
        severity: 'Standard Search'
      });
      setFile(null);
      setPreviewUrl('');
      setError('');
      setScanningImage(false);
      setImageQualityData(null);
      setImageQualityError('');
      setIsRecording(false);
      setRecordingTime(0);
      setProcessingVoice(false);
    }

    // Cleanup active timers on unmount/close
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setImageQualityData(null);
    setImageQualityError('');
    
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      
      // Initiate AI Image Quality Diagnostic Sweeper
      setScanningImage(true);
      const data = new FormData();
      data.append('image', selectedFile);
      
      try {
        const response = await api.post('/utils/ai-assistant/analyze-image', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setImageQualityData(response.data);
      } catch (err) {
        console.error("AI Face Image quality analysis failed:", err);
        setImageQualityError(err.response?.data?.error || 'High-fidelity AI photo scan failed.');
      } finally {
        setScanningImage(false);
      }
    } else {
      setPreviewUrl('');
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const coordString = `(${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E)`;
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          if (response.ok) {
            const data = await response.json();
            const displayName = data.display_name || "Detected Area";
            const addressParts = displayName.split(',').slice(0, 3).join(',').trim();
            setFormData(prev => ({
              ...prev,
              area: `${addressParts} ${coordString}`
            }));
          } else {
            setFormData(prev => ({
              ...prev,
              area: `Coordinates ${coordString}`
            }));
          }
        } catch (err) {
          setFormData(prev => ({
            ...prev,
            area: `Coordinates ${coordString}`
          }));
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation failed:", error);
        alert("Failed to access location services. Please enter coordinates manually.");
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleAiExtract = async () => {
    if (!formData.description.trim()) return;
    setExtractingTags(true);
    setError('');
    try {
      const response = await api.post('/utils/ai-assistant/extract-profile', {
        text: formData.description
      });
      
      const tags = response.data;
      
      setFormData(prev => ({
        ...prev,
        name: tags.name || prev.name,
        age: tags.age || prev.age,
        gender: tags.gender || prev.gender,
        height: tags.height || prev.height,
        weight: tags.weight || prev.weight,
        hair: tags.hair || prev.hair,
        eyes: tags.eyes || prev.eyes,
        clothing: tags.clothing || prev.clothing,
        marks: tags.marks || prev.marks,
        area: tags.area || prev.area
      }));
    } catch (err) {
      console.error("AI Tag extraction failed:", err);
      setError(err.response?.data?.error || 'Failed to extract AI descriptors from circumstances description.');
    } finally {
      setExtractingTags(false);
    }
  };

  // Start Browser Audio Recording
  const startRecording = async () => {
    setError('');
    audioChunksRef.current = [];
    setRecordingTime(0);
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Microphone access is not supported by your browser environment.");
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = { mimeType: 'audio/webm' };
      
      // Fallback mimeType check if standard audio/webm is not supported (e.g. on Safari/iOS)
      let recorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch (mimeErr) {
        recorder = new MediaRecorder(stream);
      }
      
      mediaRecorderRef.current = recorder;
      
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      recorder.onstop = async () => {
        // Stop all audio tracks to release the hardware mic
        stream.getTracks().forEach(track => track.stop());
        
        // Combine chunks into a single audio blob
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size > 0) {
          await handleVoiceAnalysis(audioBlob);
        }
      };
      
      recorder.start(250); // Capture data chunks every 250ms
      setIsRecording(true);
      
      // Setup recording timer ticks
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error("Microphone hardware access denied:", err);
      setError("Microphone access denied. Please verify browser security permissions.");
    }
  };

  // Stop Browser Audio Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Dispatch Audio Blob to the unified Flask backend endpoint
  const handleVoiceAnalysis = async (audioBlob) => {
    setProcessingVoice(true);
    setError('');
    
    const data = new FormData();
    data.append('audio', audioBlob, 'incident_memo.webm');
    
    try {
      const response = await api.post('/utils/ai-assistant/voice-profiler', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const { transcript, profile } = response.data;
      
      // Update form description with Whisper transcript and fill in physical metrics
      setFormData(prev => ({
        ...prev,
        description: transcript || prev.description,
        name: profile.name || prev.name,
        age: profile.age || prev.age,
        gender: profile.gender || prev.gender,
        height: profile.height || prev.height,
        weight: profile.weight || prev.weight,
        hair: profile.hair || prev.hair,
        eyes: profile.eyes || prev.eyes,
        clothing: profile.clothing || prev.clothing,
        marks: profile.marks || prev.marks,
        area: profile.area || prev.area
      }));
      
    } catch (err) {
      console.error("AI Voice profiling execution failed:", err);
      setError(err.response?.data?.error || "AI Voice Profiler failed to process telemetry.");
    } finally {
      setProcessingVoice(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (file) data.append('image', file);

    try {
      await api.post('/report', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (onRegisterSuccess) {
        onRegisterSuccess();
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit report. Please verify all entries.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portal-modal-overlay" onClick={onClose}>
      <div className="portal-modal-card register-case-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        
        {/* Google Style Modal Header */}
        <div className="portal-modal-header" style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="material-symbols-rounded" style={{ color: 'var(--primary-color)', fontSize: '28px' }}>
              person_add
            </span>
            <div>
              <h3 className="portal-modal-title" style={{ margin: 0, fontSize: '18px', fontWeight: '500' }}>Register Search Case</h3>
              <p className="portal-modal-desc" style={{ margin: '2px 0 0 0', fontSize: '12px' }}>
                Create a missing person record to initiate network SMTP dispatch & AI matching.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="icon-btn-hover" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
            <span className="material-symbols-rounded" style={{ color: 'var(--text-light)', fontSize: '22px' }}>close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Modal Content Scroll Area */}
          <div className="portal-modal-content" style={{ maxHeight: 'calc(80vh - 150px)', overflowY: 'auto', padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            
            {error && (
              <div className="portal-modal-highlight-box" style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(234, 67, 53, 0.1)',
                border: '1px solid rgba(234, 67, 53, 0.2)',
                color: 'var(--accent-color)',
                fontSize: '14px',
                margin: '0 0 8px 0'
              }}>
                <span className="material-symbols-rounded" style={{ marginRight: '8px', fontSize: '20px' }}>error</span>
                {error}
              </div>
            )}

            {/* Split row for Name and Age */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 2 }}>
                <MaterialInput
                  label="Full Name of Person"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <MaterialInput
                  label="Age"
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Split row for Gender and Area */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <MaterialSelect
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  options={[
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Other', label: 'Other' }
                  ]}
                  required
                />
              </div>
              
              <div style={{ flex: 2, display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <MaterialInput
                    label="Last Seen Area / Landmark"
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={detectingLocation}
                  style={{
                    height: '48px',
                    width: '48px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--light-color)',
                    color: 'var(--primary-color)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.15s, color 0.15s',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--primary-color)';
                    e.currentTarget.style.color = 'var(--bg-color)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--light-color)';
                    e.currentTarget.style.color = 'var(--primary-color)';
                  }}
                  title="Detect GPS Coordinates"
                >
                  {detectingLocation ? (
                    <div className="portal-pulse-scanner" style={{ width: '16px', height: '16px', borderWidth: '2px', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
                  ) : (
                    <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>my_location</span>
                  )}
                </button>
              </div>
            </div>

            {/* Split row for Height and Weight */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <MaterialInput
                  label={"Height (e.g. 5'7\")"}
                  type="text"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                />
              </div>
              <div style={{ flex: 1 }}>
                <MaterialInput
                  label="Weight (e.g. 140 lbs)"
                  type="text"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Split row for Hair and Eyes */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <MaterialInput
                  label="Hair Color"
                  type="text"
                  name="hair"
                  value={formData.hair}
                  onChange={handleChange}
                />
              </div>
              <div style={{ flex: 1 }}>
                <MaterialInput
                  label="Eye Color"
                  type="text"
                  name="eyes"
                  value={formData.eyes}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Split row for Clothing and Marks */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <MaterialInput
                  label="Clothing Worn"
                  type="text"
                  name="clothing"
                  value={formData.clothing}
                  onChange={handleChange}
                />
              </div>
              <div style={{ flex: 1 }}>
                <MaterialInput
                  label="Distinctive Marks / Scars"
                  type="text"
                  name="marks"
                  value={formData.marks}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Alert Severity Urgency Level */}
            <MaterialSelect
              label="Alert Severity / Search Urgency"
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              options={[
                { value: 'Standard Search', label: 'Standard Search (Standard Local Coordinates Sweep)' },
                { value: 'Advisory Search', label: 'Advisory Search (Low-priority Community Enlistment)' },
                { value: 'Critical Amber Alert', label: 'Critical Amber Alert (Tier 1 Priority Siren Mobilization)' }
              ]}
              required
            />

            {/* AI Hands-Free Voice Profiler Recorder */}
            <div style={{ 
              marginBottom: '16px', 
              padding: '16px', 
              borderRadius: '8px', 
              border: '1px solid var(--border-color)', 
              backgroundColor: 'var(--light-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-rounded" style={{ color: isRecording ? '#EA4335' : 'var(--primary-color)', fontSize: '20px' }}>
                    {isRecording ? 'settings_voice' : 'mic'}
                  </span>
                  <div style={{ textAlign: 'left' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-color)', display: 'block' }}>
                      AI Hands-Free Voice Profiler
                    </span>
                    <span style={{ margin: '2px 0 0 0', fontSize: '11px', color: 'var(--text-light)', display: 'block', lineHeight: '1.3' }}>
                      Speak naturally to transcribe and automatically extract all profile tags!
                    </span>
                  </div>
                </div>
                
                {isRecording && (
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#EA4335', letterSpacing: '0.5px' }}>
                    {(() => {
                      const m = Math.floor(recordingTime / 60);
                      const s = recordingTime % 60;
                      return `${m}:${s < 10 ? '0' : ''}${s}`;
                    })()}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {processingVoice ? (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    color: 'var(--primary-color)',
                    background: 'rgba(26, 115, 232, 0.05)',
                    padding: '8px 16px',
                    borderRadius: '24px',
                    border: '1px solid rgba(26, 115, 232, 0.15)',
                    flex: 1
                  }}>
                    <div className="portal-pulse-scanner" style={{ width: '14px', height: '14px', borderWidth: '2px', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
                    <span style={{ animation: 'breathGlow 1.5s ease-in-out infinite' }}>
                      Processing voice telemetry & auto-filling form descriptors...
                    </span>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`portal-voice-record-btn ${isRecording ? 'portal-voice-record-btn-active' : ''}`}
                      style={{ flex: isRecording ? 1 : 'none' }}
                    >
                      <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>
                        {isRecording ? 'stop' : 'mic'}
                      </span>
                      <span>
                        {isRecording ? 'Stop Recording' : 'Record Incident Memo (AI)'}
                      </span>
                    </button>
                    
                    {isRecording && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#EA4335' }}>
                        <div className="portal-voice-wave-dot" style={{ animationDelay: '0.1s' }}></div>
                        <div className="portal-voice-wave-dot" style={{ animationDelay: '0.3s', height: '18px' }}></div>
                        <div className="portal-voice-wave-dot" style={{ animationDelay: '0.5s', height: '14px' }}></div>
                        <div className="portal-voice-wave-dot" style={{ animationDelay: '0.2s', height: '20px' }}></div>
                        <div className="portal-voice-wave-dot" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Textarea for Description */}
            <MaterialInput
              label="Volumetric Landmark & Context Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              textarea
              required
            />

            {/* AI Auto-Fill Tag Generator Action Button */}
            {formData.description.trim().length >= 15 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-8px', marginBottom: '16px' }}>
                <button
                  type="button"
                  onClick={handleAiExtract}
                  disabled={extractingTags}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    border: '1px solid var(--primary-color)',
                    background: 'rgba(26, 115, 232, 0.05)',
                    color: 'var(--primary-color)',
                    boxShadow: '0 2px 8px rgba(26, 115, 232, 0.1)',
                    transition: 'all 0.2s ease',
                    outline: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--primary-color)';
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(26, 115, 232, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(26, 115, 232, 0.05)';
                    e.currentTarget.style.color = 'var(--primary-color)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(26, 115, 232, 0.1)';
                  }}
                >
                  {extractingTags ? (
                    <>
                      <div className="portal-pulse-scanner" style={{ width: '12px', height: '12px', borderWidth: '2px', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
                      <span>Analyzing circumstances...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>auto_awesome</span>
                      <span>AI Auto-Fill Profile Tags</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* File Upload Section with Image Preview & AI Scanner */}
            <div className="material-file-upload-section" style={{ marginTop: '8px' }}>
              <style>{`
                @keyframes scanLineAnimation {
                  0% { top: 0%; opacity: 0; }
                  10% { opacity: 1; }
                  90% { opacity: 1; }
                  100% { top: 100%; opacity: 0; }
                }
                @keyframes pulseGlow {
                  0% { opacity: 0.4; }
                  50% { opacity: 0.8; }
                  100% { opacity: 0.4; }
                }
                .portal-scanner-line {
                  position: absolute;
                  left: 0;
                  width: 100%;
                  height: 4px;
                  background: linear-gradient(90deg, transparent, var(--primary-color), transparent);
                  box-shadow: 0 0 10px var(--primary-color), 0 0 20px var(--primary-color);
                  animation: scanLineAnimation 2.2s linear infinite;
                  z-index: 10;
                  pointer-events: none;
                }
                .portal-scanner-overlay {
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background: rgba(26, 115, 232, 0.15);
                  backdrop-filter: blur(2px);
                  z-index: 5;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  gap: 12px;
                  border-radius: 8px;
                  border: 1px solid var(--primary-color);
                  box-shadow: inset 0 0 30px rgba(26, 115, 232, 0.3);
                }
                .portal-scanner-text {
                  color: #ffffff;
                  font-size: 13px;
                  font-weight: 600;
                  letter-spacing: 0.5px;
                  text-shadow: 0 2px 6px rgba(0,0,0,0.9), 0 0 8px var(--primary-color);
                  animation: pulseGlow 1.8s ease-in-out infinite;
                  display: inline-flex;
                  align-items: center;
                  gap: 8px;
                }
                @keyframes voicePulse {
                  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(234, 67, 53, 0.4); }
                  70% { transform: scale(1.04); box-shadow: 0 0 0 8px rgba(234, 67, 53, 0); }
                  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(234, 67, 53, 0); }
                }
                @keyframes breathGlow {
                  0% { opacity: 0.5; }
                  50% { opacity: 1; }
                  100% { opacity: 0.5; }
                }
                .portal-voice-record-btn {
                  display: inline-flex;
                  align-items: center;
                  gap: 8px;
                  padding: 8px 18px;
                  border-radius: 20px;
                  font-size: 13px;
                  font-weight: 600;
                  cursor: pointer;
                  border: 1px solid var(--primary-color);
                  background: rgba(26, 115, 232, 0.05);
                  color: var(--primary-color);
                  box-shadow: 0 2px 8px rgba(26, 115, 232, 0.1);
                  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                  outline: none;
                }
                .portal-voice-record-btn:hover {
                  background: var(--primary-color);
                  color: #ffffff;
                  box-shadow: 0 4px 12px rgba(26, 115, 232, 0.25);
                }
                .portal-voice-record-btn-active {
                  border-color: #EA4335;
                  background: rgba(234, 67, 53, 0.08);
                  color: #EA4335;
                  animation: voicePulse 1.8s infinite;
                  box-shadow: 0 4px 14px rgba(234, 67, 53, 0.2);
                }
                .portal-voice-record-btn-active:hover {
                  background: #EA4335;
                  color: #ffffff;
                  box-shadow: 0 6px 16px rgba(234, 67, 53, 0.35);
                }
                .portal-voice-wave-dot {
                  width: 3px;
                  height: 12px;
                  background-color: currentColor;
                  border-radius: 2px;
                  animation: breathGlow 1.2s ease-in-out infinite;
                }
              `}</style>

              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '500', color: 'var(--text-color)' }}>
                Case Photograph
              </label>
              
              <div className="material-file-dropzone" style={{
                border: '1px dashed var(--border-color)',
                borderRadius: '8px',
                padding: previewUrl ? '12px' : '24px 16px',
                textAlign: 'center',
                backgroundColor: 'var(--light-color)',
                cursor: 'pointer',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'border-color 0.15s ease'
              }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer',
                    zIndex: 3
                  }}
                  disabled={scanningImage}
                />

                {/* AI Scanning Active Overlay */}
                {scanningImage && (
                  <div className="portal-scanner-overlay">
                    <div className="portal-scanner-line"></div>
                    <div className="portal-pulse-scanner" style={{ width: '28px', height: '28px', borderWidth: '3px', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
                    <span className="portal-scanner-text">
                      <span className="material-symbols-rounded" style={{ fontSize: '18px', animation: 'spin 4s linear infinite' }}>progress_activity</span>
                      AI Face Scanner: Calibrating topology...
                    </span>
                  </div>
                )}

                {previewUrl ? (
                  <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '6px', objectFit: 'contain', border: '1px solid var(--border-color)' }} 
                    />
                    <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                      Click or drag to replace photo
                    </span>
                  </div>
                ) : (
                  <>
                    <span className="material-symbols-rounded" style={{ color: 'var(--primary-color)', fontSize: '32px' }}>
                      add_photo_alternate
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--text-color)', fontWeight: '500' }}>
                      Upload recent photo
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                      Drag and drop files here, or browse local telemetry
                    </span>
                  </>
                )}
              </div>

              {/* Scanning Error */}
              {imageQualityError && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: '8px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(234, 67, 53, 0.08)',
                  border: '1px solid rgba(234, 67, 53, 0.15)',
                  color: 'var(--accent-color)',
                  fontSize: '12px'
                }}>
                  <span className="material-symbols-rounded" style={{ marginRight: '6px', fontSize: '16px' }}>warning</span>
                  {imageQualityError}
                </div>
              )}

              {/* Diagnostic Metrics HUD Card */}
              {imageQualityData && (
                <div style={{
                  marginTop: '12px',
                  padding: '16px',
                  borderRadius: '8px',
                  border: `1px solid ${imageQualityData.fidelity_score >= 75 ? 'rgba(0, 230, 118, 0.2)' : imageQualityData.fidelity_score >= 45 ? 'rgba(255, 145, 0, 0.2)' : 'rgba(255, 82, 82, 0.2)'}`,
                  backgroundColor: imageQualityData.fidelity_score >= 75 ? 'rgba(0, 230, 118, 0.02)' : imageQualityData.fidelity_score >= 45 ? 'rgba(255, 145, 0, 0.02)' : 'rgba(255, 82, 82, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    
                    {/* Visual Circular Gauge */}
                    <div style={{
                      position: 'relative',
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'var(--light-color)',
                      border: `3px solid ${imageQualityData.fidelity_score >= 75 ? '#00E676' : imageQualityData.fidelity_score >= 45 ? '#FF9100' : '#FF5252'}`,
                      boxShadow: `0 0 10px ${imageQualityData.fidelity_score >= 75 ? 'rgba(0, 230, 118, 0.15)' : imageQualityData.fidelity_score >= 45 ? 'rgba(255, 145, 0, 0.15)' : 'rgba(255, 82, 82, 0.15)'}`,
                      flexShrink: 0
                    }}>
                      <span style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: imageQualityData.fidelity_score >= 75 ? '#00E676' : imageQualityData.fidelity_score >= 45 ? '#FF9100' : '#FF5252'
                      }}>
                        {imageQualityData.fidelity_score}%
                      </span>
                      <span style={{ fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.3px', color: 'var(--text-light)', fontWeight: '600', marginTop: '-2px' }}>
                        Fidelity
                      </span>
                    </div>

                    {/* Telemetry Detail Grid */}
                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Dimensions</span>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-color)' }}>{imageQualityData.dimensions}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Clarity Score</span>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: imageQualityData.sharpness_score >= 60 ? 'var(--text-color)' : '#FF9100' }}>
                          {imageQualityData.sharpness_score}% {imageQualityData.sharpness_score < 40 ? '⚠️ Soft' : '✓ Sharp'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Lighting & Exposure</span>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: imageQualityData.brightness_score >= 60 ? 'var(--text-color)' : '#FF9100' }}>
                          {imageQualityData.brightness_score}% {imageQualityData.brightness < 45 ? '⚠️ Dark' : imageQualityData.brightness > 225 ? '⚠️ Overexposed' : '✓ Optimal'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Face Bounding Lock</span>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: imageQualityData.face_detected ? '#00E676' : '#FF5252' }}>
                          {imageQualityData.face_detected ? '✓ Secured' : '⚠️ Lacks Clarity'}
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Warning Strip alerts */}
                  {imageQualityData.warnings && imageQualityData.warnings.length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      backgroundColor: imageQualityData.fidelity_score >= 75 ? 'rgba(0, 230, 118, 0.05)' : imageQualityData.fidelity_score >= 45 ? 'rgba(255, 145, 0, 0.05)' : 'rgba(255, 82, 82, 0.05)',
                      border: `1px dashed ${imageQualityData.fidelity_score >= 75 ? 'rgba(0, 230, 118, 0.2)' : imageQualityData.fidelity_score >= 45 ? 'rgba(255, 145, 0, 0.2)' : 'rgba(255, 82, 82, 0.2)'}`
                    }}>
                      {imageQualityData.warnings.map((warn, index) => (
                        <div key={index} style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '6px',
                          fontSize: '11px',
                          color: imageQualityData.fidelity_score >= 75 ? '#00C853' : imageQualityData.fidelity_score >= 45 ? '#FF8F00' : '#D50000',
                          lineHeight: '1.4'
                        }}>
                          <span className="material-symbols-rounded" style={{ fontSize: '14px', marginTop: '1px', flexShrink: 0 }}>
                            {imageQualityData.fidelity_score >= 75 ? 'info' : imageQualityData.fidelity_score >= 45 ? 'warning' : 'dangerous'}
                          </span>
                          <span>{warn}</span>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}
            </div>

          </div>

          {/* Google Style Actions Footer */}
          <div className="portal-modal-actions" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '16px' }}>
            <button
              type="button"
              onClick={onClose}
              className="portal-modal-btn-secondary portal-btn-secondary-outline"
              style={{ height: '36px', padding: '0 20px', borderRadius: '4px', fontSize: '14px' }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="portal-modal-btn-primary portal-btn-primary"
              style={{ 
                height: '36px', 
                padding: '0 24px', 
                borderRadius: '4px', 
                fontSize: '14px', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '8px' 
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="portal-pulse-scanner" style={{ width: '14px', height: '14px', borderWidth: '2px', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
                  Registering...
                </>
              ) : (
                'Register Case'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default RegisterCaseModal;
