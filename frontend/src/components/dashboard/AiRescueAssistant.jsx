import React, { useState, useEffect, useRef } from 'react';
import api from '../../api';

const QUICK_SUGGESTIONS = [
  { label: 'Active Cases', query: 'Show active missing person cases' },
  { label: 'Volunteer Grid Status', query: 'Analyze standby rescue capacity' },
  { label: 'G-10 Telemetry Scan', query: 'G-10 sector details' },
  { label: 'How to Report Incident', query: 'Tell me the steps to report a missing person' }
];

const INITIAL_MESSAGE = {
  id: 'welcome',
  sender: 'ai',
  text: `👋 **Hello! I am your AI Rescue Command Assistant.**

I have direct access to your local SQLite registry. I can analyze case telemetry, track search volunteer capacities, or explain emergency reporting guidelines.

Try asking me one of the quick queries below!`
};

function AiRescueAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // Voice Recording Telemetry States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [processingVoice, setProcessingVoice] = useState(false);

  const [activeSpeakingId, setActiveSpeakingId] = useState(null);
  const [voices, setVoices] = useState([]);
  const [liveConversation, setLiveConversation] = useState(false);
  const liveComfortTimeoutRef = useRef(null);

  // Load and refresh browser voices asynchronously
  useEffect(() => {
    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // Auto-scroll message history to bottom on updates
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend.trim();
    if (!query) return;

    // Add User Message to History
    const userMsg = { id: `user-${Date.now()}`, sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      // Connect directly to the Flask backend endpoint
      const response = await api.post('/utils/ai-assistant/chat', { message: query });
      
      // Add AI Response to History
      const aiReplyId = `ai-${Date.now()}`;
      const aiReply = { 
        id: aiReplyId, 
        sender: 'ai', 
        text: response.data.response || "I established contact but received degraded telemetry signal logic." 
      };
      setMessages(prev => [...prev, aiReply]);
      
      // Auto-vocalize if Live Continuous Voice Loop is active!
      if (liveConversation) {
        speakMessage(aiReply.text, aiReplyId);
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || "Failed to establish a neural connection pipeline.";
      const errorMsg = { 
        id: `err-${Date.now()}`, 
        sender: 'ai', 
        text: `⚠️ **Connection Error:** ${errMsg}` 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Reset/Cleanup recording systems when chat is toggled
  useEffect(() => {
    if (!isOpen) {
      setIsRecording(false);
      setRecordingTime(0);
      setProcessingVoice(false);
      setLiveConversation(false); // Disable continuous mode on collapse
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (liveComfortTimeoutRef.current) {
        clearTimeout(liveComfortTimeoutRef.current);
        liveComfortTimeoutRef.current = null;
      }
      // Cancel active speech playbacks on collapse
      window.speechSynthesis.cancel();
      setActiveSpeakingId(null);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (liveComfortTimeoutRef.current) {
        clearTimeout(liveComfortTimeoutRef.current);
      }
      window.speechSynthesis.cancel();
    };
  }, [isOpen]);

  // Strip markdown styling characters for verbal TTS reads
  const stripMarkdown = (text) => {
    if (!text) return "";
    return text
      .replace(/\*\*([^*]+)\*\*/g, '$1') // bold
      .replace(/\*([^*]+)\*/g, '$1')     // italics
      .replace(/`([^`]+)`/g, '$1')       // inline code
      .replace(/^[*-]\s+/gm, '')         // bullets
      .replace(/^\d+\.\s+/gm, '')        // lists
      .replace(/[#🚨⚠️👋🤖🛡️📋📡*]/g, '') // icons & hashes
      .trim();
  };

  // Capture synthesis and play voice query via browser Web Speech API
  const speakMessage = (msgText, msgId) => {
    if (activeSpeakingId === msgId) {
      window.speechSynthesis.cancel();
      setActiveSpeakingId(null);
      return;
    }

    // Unblock browser synthesis queues
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();
    setActiveSpeakingId(null);

    const cleanText = stripMarkdown(msgText);
    if (!cleanText) return;

    // Small delay (50ms) to bypass browser tick race conditions
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      // Select premium Google or Natural system voice from loaded list
      const premiumVoice = voices.find(v => 
        v.lang.startsWith('en') && 
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Neural'))
      ) || voices.find(v => v.lang.startsWith('en')) || window.speechSynthesis.getVoices().find(v => v.lang.startsWith('en'));

      if (premiumVoice) {
        utterance.voice = premiumVoice;
      }
      
      utterance.rate = 1.05; // Natural pacing
      utterance.pitch = 1.0;

      utterance.onend = () => {
        setActiveSpeakingId(null);
        // Automatically start recording the next user query after comfort delay!
        if (liveConversation) {
          liveComfortTimeoutRef.current = setTimeout(() => {
            startRecording();
          }, 600);
        }
      };

      utterance.onerror = (e) => {
        console.error("Vocal Synthesizer error:", e);
        setActiveSpeakingId(null);
      };

      setActiveSpeakingId(msgId);
      window.speechSynthesis.speak(utterance);
    }, 50);
  };

  // Start Voice Query Recording
  const startRecording = async () => {
    audioChunksRef.current = [];
    setRecordingTime(0);
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Microphone access is not supported by your browser environment.");
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = { mimeType: 'audio/webm' };
      
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
        stream.getTracks().forEach(track => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size > 0) {
          await handleVoiceChat(audioBlob);
        }
      };
      
      recorder.start(250); // Tick chunks
      setIsRecording(true);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error("Microphone hardware access denied:", err);
      alert("Microphone access denied. Please verify browser security permissions.");
    }
  };

  // Stop Voice Query Recording
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

  // Dispatch Audio Recording to Flask Chat Endpoint
  const handleVoiceChat = async (audioBlob) => {
    setProcessingVoice(true);
    setLoading(true);
    
    const data = new FormData();
    data.append('audio', audioBlob, 'chat_memo.webm');
    
    // Add visual placeholder speech query to history immediately
    const voiceUserMsgId = `user-voice-${Date.now()}`;
    const userVoicePlaceholder = { 
      id: voiceUserMsgId, 
      sender: 'user', 
      text: "🎤 *[Processing voice query...]*" 
    };
    setMessages(prev => [...prev, userVoicePlaceholder]);
    
    try {
      const response = await api.post('/utils/ai-assistant/chat', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const { response: aiReplyText, user_transcript } = response.data;
      
      // Upgrade placeholder user bubble to actual transcribed words
      setMessages(prev => prev.map(msg => {
        if (msg.id === voiceUserMsgId) {
          return { ...msg, text: user_transcript ? `🎤 *${user_transcript}*` : "🎤 *[Voice query processed]*" };
        }
        return msg;
      }));
      
      // Append AI Response
      const aiReplyId = `ai-${Date.now()}`;
      const aiReply = { 
        id: aiReplyId, 
        sender: 'ai', 
        text: aiReplyText || "Telemetry contact completed." 
      };
      setMessages(prev => [...prev, aiReply]);
      
      // Auto-vocalize if Live Continuous Voice Loop is active!
      if (liveConversation) {
        speakMessage(aiReply.text, aiReplyId);
      }
      
    } catch (err) {
      console.error("AI Voice chat failed:", err);
      const errMsg = err.response?.data?.error || err.message || "Failed to process chat audio.";
      
      // Update placeholder query to error visual
      setMessages(prev => prev.map(msg => {
        if (msg.id === voiceUserMsgId) {
          return { ...msg, text: `🎤 ⚠️ *[Voice transcription failed]*` };
        }
        return msg;
      }));
      
      const errorMsg = { 
        id: `err-${Date.now()}`, 
        sender: 'ai', 
        text: `⚠️ **Voice Error:** ${errMsg}` 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setProcessingVoice(false);
      setLoading(false);
    }
  };


  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(inputMessage);
  };

  // Safe formatting function to convert markdown-like tags to standard HTML elements
  const renderMessageContent = (text) => {
    return text.split('\n\n').map((para, paraIdx) => {
      // 1. Bullet list checks
      if (para.startsWith('* ') || para.startsWith('*   ')) {
        const listItems = para.split('\n').map((item, itemIdx) => {
          const content = item.replace(/^\*\s+/, '').replace(/^\*\s+/, '');
          return <li key={itemIdx}>{parseInlineStyles(content)}</li>;
        });
        return <ul key={paraIdx}>{listItems}</ul>;
      }
      
      // 2. Numbered list checks
      if (/^\d+\.\s+/.test(para)) {
        const listItems = para.split('\n').map((item, itemIdx) => {
          const content = item.replace(/^\d+\.\s+/, '');
          return <li key={itemIdx}>{parseInlineStyles(content)}</li>;
        });
        return <ol key={paraIdx}>{listItems}</ol>;
      }

      // Default paragraph
      return <p key={paraIdx}>{parseInlineStyles(para)}</p>;
    });
  };

  // Inline formatting helper for bolding and code blocks
  const parseInlineStyles = (text) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={idx}>{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={idx} style={{ backgroundColor: 'var(--light-color)', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace' }}>{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return (
    <>
      {/* Collapsible Action Floating Pulse Trigger */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`portal-ai-assistant-trigger ${isOpen ? 'portal-ai-assistant-trigger-active' : ''}`}
        title="AI Rescue Assistant Console"
      >
        <span className="material-symbols-rounded" style={{ fontSize: '26px' }}>
          {isOpen ? 'close' : 'smart_toy'}
        </span>
      </button>

      {/* Collapsible Chatbot Console Dashboard Panel */}
      {isOpen && (
        <div className="portal-ai-assistant-panel">
          
          {/* Header */}
          <div className="portal-ai-assistant-header">
            <div className="portal-ai-assistant-header-title">
              <span className="material-symbols-rounded" style={{ color: 'var(--primary-color)' }}>smart_toy</span>
              <span>AI Command Assistant</span>
              <span className="portal-ai-assistant-header-status"></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setLiveConversation(!liveConversation)}
                style={{
                  background: liveConversation ? 'rgba(0, 230, 118, 0.12)' : 'none',
                  border: liveConversation ? '1px solid #00E676' : '1px solid var(--border-color)',
                  borderRadius: '16px',
                  color: liveConversation ? '#00E676' : 'var(--text-light)',
                  padding: '4px 10px',
                  fontSize: '10px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px'
                }}
                title={liveConversation ? "Disable Continuous Live Voice Loop" : "Enable Continuous Live Voice Loop"}
              >
                <span className="material-symbols-rounded" style={{ fontSize: '13px', animation: liveConversation ? 'breathGlow 1.5s infinite' : 'none' }}>
                  {liveConversation ? 'settings_voice' : 'keyboard_voice'}
                </span>
                <span>{liveConversation ? 'Live' : 'Speak'}</span>
              </button>
              
              <button 
                onClick={() => setIsOpen(false)}
                className="portal-ai-assistant-header-close"
              >
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>
          </div>

          {/* Messages Scroller */}
          <div className="portal-ai-assistant-messages">
            {messages.map(msg => (
              <div 
                key={msg.id}
                className={`portal-ai-assistant-message ${
                  msg.sender === 'user' ? 'portal-ai-assistant-message-user' : 'portal-ai-assistant-message-ai'
                }`}
                style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '4px' }}
              >
                <div>
                  {renderMessageContent(msg.text)}
                </div>
                
                {msg.sender === 'ai' && msg.id !== 'welcome' && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px', borderTop: '1px dashed rgba(26, 115, 232, 0.1)', paddingTop: '4px' }}>
                    <button
                      type="button"
                      onClick={() => speakMessage(msg.text, msg.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: activeSpeakingId === msg.id ? '#00E676' : 'var(--text-light)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        fontSize: '10px',
                        fontWeight: '600',
                        transition: 'all 0.2s ease',
                        outline: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = activeSpeakingId === msg.id ? '#00C853' : 'var(--primary-color)';
                        e.currentTarget.style.backgroundColor = 'rgba(26, 115, 232, 0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = activeSpeakingId === msg.id ? '#00E676' : 'var(--text-light)';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      title={activeSpeakingId === msg.id ? "Stop Vocal Readout" : "Listen (AI Voice)"}
                    >
                      {activeSpeakingId === msg.id ? (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#00E676' }}>
                            <div className="portal-tts-equaliser-bar" style={{ animationDelay: '0.1s' }}></div>
                            <div className="portal-tts-equaliser-bar" style={{ animationDelay: '0.3s', height: '10px' }}></div>
                            <div className="portal-tts-equaliser-bar" style={{ animationDelay: '0.2s', height: '8px' }}></div>
                          </div>
                          <span>Speaking Aegis-9...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>volume_up</span>
                          <span>Listen (AI Voice)</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            {/* Loading Typing Indicator Bubble */}
            {loading && (
              <div className="portal-ai-assistant-message portal-ai-assistant-message-ai" style={{ width: '70px', padding: '10px 14px' }}>
                <div className="portal-ai-assistant-typing">
                  <span className="portal-ai-assistant-typing-dot"></span>
                  <span className="portal-ai-assistant-typing-dot"></span>
                  <span className="portal-ai-assistant-typing-dot"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions pills */}
          {!loading && (
            <div className="portal-ai-assistant-suggestions">
              <span className="portal-ai-assistant-suggestion-label">Quick Queries</span>
              <div className="portal-ai-assistant-suggestion-pills">
                {QUICK_SUGGESTIONS.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(s.query)}
                    className="portal-ai-assistant-suggestion-pill"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input text form */}
          <form onSubmit={handleFormSubmit} className="portal-ai-assistant-input-form">
            <style>{`
              @keyframes pulseRedChat {
                0% { transform: scale(1); opacity: 0.6; }
                50% { transform: scale(1.15); opacity: 1; }
                100% { transform: scale(1); opacity: 0.6; }
              }
              .portal-ai-assistant-mic-btn {
                background: none;
                border: none;
                cursor: pointer;
                color: var(--text-light);
                padding: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                border-radius: 50%;
                margin-right: 6px;
                flex-shrink: 0;
              }
              .portal-ai-assistant-mic-btn:hover {
                background-color: var(--light-color);
                color: var(--primary-color);
              }
              .portal-ai-assistant-mic-btn-active {
                color: #EA4335 !important;
                background-color: rgba(234, 67, 53, 0.08) !important;
              }
              @keyframes ttsEqualise {
                0% { height: 4px; }
                50% { height: 12px; }
                100% { height: 4px; }
              }
              .portal-tts-equaliser-bar {
                width: 2px;
                height: 6px;
                background-color: currentColor;
                border-radius: 1px;
                animation: ttsEqualise 0.8s ease-in-out infinite;
                display: inline-block;
              }
            `}</style>
            
            <div className="portal-ai-assistant-input-container" style={{ display: 'flex', alignItems: 'center' }}>
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={loading && !isRecording}
                className={`portal-ai-assistant-mic-btn ${isRecording ? 'portal-ai-assistant-mic-btn-active' : ''}`}
                title={isRecording ? `Stop Recording (${recordingTime}s)` : "Record Voice Query"}
              >
                <span className="material-symbols-rounded" style={{ fontSize: '20px', animation: isRecording ? 'pulseRedChat 1.5s infinite' : 'none' }}>
                  {isRecording ? 'stop' : 'mic'}
                </span>
              </button>
              
              <input
                type="text"
                value={isRecording ? `Recording memo... [${recordingTime}s]` : inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                placeholder={isRecording ? "Listening... speak now." : "Ask AI Rescue coordinates..."}
                className="portal-ai-assistant-input"
                disabled={loading || isRecording}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !inputMessage.trim() || isRecording}
              className="portal-ai-assistant-send-btn"
            >
              <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>send</span>
            </button>
          </form>

        </div>
      )}
    </>
  );
}

export default AiRescueAssistant;
