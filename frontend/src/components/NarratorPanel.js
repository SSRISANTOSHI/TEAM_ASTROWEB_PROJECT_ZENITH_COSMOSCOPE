import { useState, useEffect, useRef } from 'react';

export default function NarratorPanel({ narrative, csai, csai_breakdown, light_pollution, events, weather, cosmicData }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Initialize chat with the narrative from the backend
  useEffect(() => {
    if (narrative) {
      setMessages([
        {
          id: 1,
          sender: 'ai',
          text: narrative,
          badge: `Observation: ${weather?.cloud_cover < 20 ? 'Clear' : weather?.cloud_cover < 50 ? 'Partly Cloudy' : 'Cloudy'}`,
          badge2: `CSAI: ${csai}/100`
        }
      ]);
    }
  }, [narrative, csai, weather]);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const queryText = inputValue.trim();
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: queryText
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const API = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const response = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: queryText,
          context: cosmicData || {}
        })
      });

      if (!response.ok) {
        throw new Error('Chat API error');
      }

      const resData = await response.json();
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: resData.response || 'No response received.'
      }]);
    } catch (err) {
      console.error(err);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: 'Apologies, connection to the cosmic cognitive layer was interrupted. Please check if the backend is online.'
      }]);
    }
  };

  const formattedEvents = events && events.length > 0 ? events : [
    { type: 'ISS Flyover', detail: 'Visible: 4m 30s · Max Elevation: 68°', icon: '🛸' },
    { type: 'Perseids Meteor Shower', detail: 'Peak activity expected tonight', icon: '☄️' },
    { type: 'Planetary Conjunction', detail: 'Venus & Mars aligned', icon: '🪐' }
  ];

  return (
    <div className="dashboard-content animate-fade-in-up">
      {/* ── HEADER ── */}
      <div className="dashboard-header-bar">
        <div>
          <span className="font-telemetry text-primary-fixed/60 text-xs uppercase tracking-[0.2em]">Telemetry Hub</span>
          <h1 className="node-title font-display uppercase">Cosmic Narrative</h1>
        </div>
        <div className="flex gap-4">
          <div className="glass-panel px-4 py-3 rounded-xl flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary-fixed animate-pulse" style={{ background: 'var(--accent)' }}></div>
            <span className="font-telemetry text-primary-fixed font-bold" style={{ color: 'var(--accent)' }}>CSAI: {csai}</span>
            <span className="font-display text-[10px] text-on-surface-variant/50 uppercase">Nominal</span>
          </div>
        </div>
      </div>

      {/* ── BENTO GRID LAYOUT ── */}
      <div className="dashboard-grid-layout" style={{ gridTemplateColumns: '1fr 340px' }}>
        
        {/* Left Column: Chat Interface */}
        <div className="glass-panel rounded-2xl overflow-hidden relative min-h-[460px] flex flex-col" style={{ background: 'linear-gradient(135deg, rgba(17,19,29,0.5), rgba(25,27,38,0.3))' }}>
          <div className="scanline" style={{ opacity: 0.08 }}></div>
          
          {/* Cognitive Header */}
          <div className="p-4 bg-surface-container-high/40 flex items-center justify-between border-b border-white/5" style={{ background: 'rgba(25, 27, 38, 0.4)' }}>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-fixed" style={{ color: 'var(--accent)' }}>neurology</span>
              <span className="font-telemetry text-xs uppercase tracking-wider" style={{ color: 'var(--accent)' }}>Cognitive Layer L5</span>
            </div>
            <div className="flex gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }}></div>
            </div>
          </div>

          {/* Chat Stream */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto" style={{ maxHeight: '420px' }}>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-4 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-full border border-primary-fixed/40 flex-shrink-0 flex items-center justify-center" style={{ background: 'rgba(0, 255, 200, 0.05)', borderColor: 'rgba(0, 255, 200, 0.3)' }}>
                    <span className="material-symbols-outlined text-md" style={{ color: 'var(--accent)' }}>smart_toy</span>
                  </div>
                )}
                
                <div className="space-y-2 max-w-[80%]">
                  <div 
                    className="p-3.5 rounded-2xl font-body text-sm leading-relaxed"
                    style={{ 
                      background: msg.sender === 'user' ? 'rgba(209, 188, 255, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                      border: msg.sender === 'user' ? '1px solid rgba(209, 188, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: msg.sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                      color: 'var(--text)'
                    }}
                  >
                    {msg.text}
                  </div>

                  {msg.sender === 'ai' && (msg.badge || msg.badge2) && (
                    <div className="flex gap-2">
                      {msg.badge && (
                        <div className="px-2.5 py-0.5 glass-panel rounded-full text-[9px] font-telemetry uppercase tracking-wider" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                          {msg.badge}
                        </div>
                      )}
                      {msg.badge2 && (
                        <div className="px-2.5 py-0.5 glass-panel rounded-full text-[9px] font-telemetry uppercase tracking-wider" style={{ color: 'var(--accent)', borderColor: 'rgba(0, 255, 200, 0.15)' }}>
                          {msg.badge2}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full border border-accent2/40 flex-shrink-0 flex items-center justify-center" style={{ background: 'rgba(209, 188, 255, 0.05)', borderColor: 'rgba(209, 188, 255, 0.3)' }}>
                    <span className="material-symbols-outlined text-md" style={{ color: 'var(--accent2)' }}>person</span>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full border border-primary-fixed/40 flex-shrink-0 flex items-center justify-center" style={{ background: 'rgba(0, 255, 200, 0.05)', borderColor: 'rgba(0, 255, 200, 0.3)' }}>
                  <span className="material-symbols-outlined text-md" style={{ color: 'var(--accent)' }}>smart_toy</span>
                </div>
                <div className="space-y-1">
                  <div className="flex gap-1.5 py-3 px-4 glass-panel rounded-2xl" style={{ borderRadius: '20px 20px 20px 4px' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ background: 'var(--accent)' }}></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:0.2s]" style={{ background: 'var(--accent)' }}></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:0.4s]" style={{ background: 'var(--accent)' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSend} className="p-4 bg-surface-container-lowest/80 backdrop-blur-md border-t border-white/5" style={{ background: 'rgba(12, 14, 24, 0.6)' }}>
            <div className="flex gap-3">
              <input 
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                className="flex-1 bg-surface-container-high/30 border border-white/10 rounded-xl px-4 py-2 font-body text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-accent/50 placeholder:text-on-surface-variant/30" 
                style={{ background: 'rgba(50, 52, 63, 0.15)', color: 'var(--text)' }}
                placeholder="Inquire about celestial bodies..." 
                type="text"
              />
              <button 
                type="submit"
                className="w-10 h-10 rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                style={{ background: 'var(--accent)', color: 'var(--bg)', border: 'none', cursor: 'pointer' }}
              >
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </div>
          </form>

        </div>

        {/* Right Column: Events & Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Upcoming Events Timeline */}
          <div className="glass-panel rounded-2xl p-5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-base">Upcoming Events</h3>
              <span className="material-symbols-outlined text-on-surface-variant/50" style={{ fontSize: '1.25rem' }}>schedule</span>
            </div>
            
            <div className="events-timeline-container" style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Vertical line */}
              <div style={{ position: 'absolute', left: 11, top: 4, bottom: 4, width: 1, background: 'rgba(255,255,255,0.08)' }}></div>
              
              {formattedEvents.map((evt, idx) => (
                <div key={idx} className="timeline-item-relative" style={{ position: 'relative', paddingLeft: 32 }}>
                  <div 
                    className="timeline-item-bullet" 
                    style={{ 
                      position: 'absolute', 
                      left: 0, 
                      top: 2, 
                      width: 23, 
                      height: 23, 
                      borderRadius: '50%', 
                      background: 'var(--bg)', 
                      border: idx === 0 ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <div 
                      style={{ 
                        width: 7, 
                        height: 7, 
                        borderRadius: '50%', 
                        background: idx === 0 ? 'var(--accent)' : 'rgba(255,255,255,0.15)' 
                      }}
                    ></div>
                  </div>
                  <div>
                    <span 
                      className="font-telemetry text-[9px] uppercase tracking-wider"
                      style={{ color: idx === 0 ? 'var(--accent)' : 'var(--muted)' }}
                    >
                      {idx === 0 ? 'In 12 minutes' : `Peak Layer E${idx + 1}`}
                    </span>
                    <h5 className="font-display text-sm font-semibold mt-0.5">{evt.type || evt.name}</h5>
                    <p className="text-[11px] text-on-surface-variant/60">{evt.detail || 'Trajectory alignment nominal'}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-6 py-2 glass-panel rounded-lg font-label-caps text-[10px] text-on-surface-variant/70 hover:text-primary-fixed hover:border-primary-fixed/30 transition-all uppercase" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--muted)', cursor: 'pointer' }}>
              View Annual Calendar
            </button>
          </div>

          {/* Conditions Grid */}
          <div className="glass-panel rounded-2xl p-5 overflow-hidden relative">
            <h3 className="font-display text-base mb-4">Observation Conditions</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="font-telemetry text-[10px] text-on-surface-variant/50 uppercase">Visibility</span>
                <p className="font-telemetry text-base font-bold" style={{ color: 'var(--text)' }}>
                  {weather ? `${100 - weather.cloud_cover}%` : '98%'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-telemetry text-[10px] text-on-surface-variant/50 uppercase">Turbulence</span>
                <p className="font-telemetry text-base font-bold" style={{ color: 'var(--accent)' }}>Low</p>
              </div>
              <div className="space-y-1">
                <span className="font-telemetry text-[10px] text-on-surface-variant/50 uppercase">Light Poll.</span>
                <p className="font-telemetry text-base font-bold" style={{ color: 'var(--text)' }}>Class {light_pollution?.bortle ?? 4}</p>
              </div>
              <div className="space-y-1">
                <span className="font-telemetry text-[10px] text-on-surface-variant/50 uppercase">Atmosphere</span>
                <p className="font-telemetry text-base font-bold" style={{ color: 'var(--text)' }}>
                  {weather?.cloud_cover < 20 ? 'Nominal' : 'Stable'}
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ── EXPLAINER CARDS AT THE BOTTOM ── */}
      <div className="atmospheric-data-grid" style={{ marginTop: 20, gridTemplateColumns: 'repeat(3, 1fr)' }}>
        
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between hover:border-primary-fixed/40 transition-colors cursor-pointer group" style={{ minHeight: '170px' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-primary-fixed" style={{ background: 'rgba(0, 255, 200, 0.05)', color: 'var(--accent)' }}>
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold mb-1">Magnitude Scale</h4>
            <p className="text-[11px] text-on-surface-variant/70 leading-relaxed">Understand how we measure brightness. Lower numbers signify brighter objects in the sky.</p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between hover:border-primary-fixed/40 transition-colors cursor-pointer group" style={{ minHeight: '170px' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-secondary" style={{ background: 'rgba(209, 188, 255, 0.05)', color: 'var(--accent2)' }}>
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>public</span>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold mb-1">Atmospheric Lensing</h4>
            <p className="text-[11px] text-on-surface-variant/70 leading-relaxed">How Earth's atmosphere affects photon capture and spectral analysis during peak observation.</p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between hover:border-primary-fixed/40 transition-colors cursor-pointer group" style={{ minHeight: '170px' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-tertiary-fixed" style={{ background: 'rgba(255, 225, 112, 0.05)', color: 'var(--accent2)' }}>
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>timeline</span>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold mb-1">Delta-V Forecasting</h4>
            <p className="text-[11px] text-on-surface-variant/70 leading-relaxed">Predicting object trajectory adjustments using gravity-assist narrative models.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
