import { useState, useEffect } from 'react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'System Integration', message: '' });
  const [sent, setSent] = useState(false);
  const [localTime, setLocalTime] = useState('--:--:--');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLocalTime(timeStr);
    };
    updateTime();
    const id = setInterval(updateTime, 1000);
    return () => clearInterval(id);
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.name && form.email && form.message) {
      setSent(true);
    }
  };

  return (
    <div className="font-body-base text-body-base bg-background selection:bg-primary-container selection:text-on-primary-container min-h-screen">
      <style>{`
        .glow-cyan {
            box-shadow: 0 0 15px rgba(0, 224, 176, 0.3);
        }
        .input-focus:focus {
            outline: none;
            border-color: #00e0b0;
            box-shadow: 0 0 10px rgba(0, 224, 176, 0.4);
        }
        .scanline {
            width: 100%;
            height: 2px;
            background: rgba(0, 224, 176, 0.1);
            position: absolute;
            top: 0;
            animation: scan 4s linear infinite;
        }
        @keyframes scan {
            0% { top: 0; }
            100% { top: 100%; }
        }
      `}</style>

      <main className="min-h-[85vh] pt-12 pb-24 px-margin-safe relative overflow-hidden max-w-7xl mx-auto">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Left Header Section */}
          <div className="lg:col-span-12 mb-12">
            <div className="flex items-center gap-4 mb-4">
              <span className="h-px w-12 bg-primary-fixed"></span>
              <span className="font-telemetry-label text-telemetry-label text-primary-fixed uppercase">Establish Communication Path</span>
            </div>
            <h1 className="font-display-lg text-display-lg md:text-[64px] text-primary uppercase leading-none mb-6">Contact<br />The Terminal</h1>
            <p className="font-body-base text-body-base text-on-surface-variant max-w-2xl">
              Reach across the orbital divide. Our telemetry team is on standby to assist with integration, mission planning, or system inquiries.
            </p>
          </div>

          {/* Main Contact Terminal */}
          <div className="lg:col-span-7">
            <div className="glass-panel p-panel-padding rounded-xl relative overflow-hidden">
              <div className="scanline"></div>
              
              {sent ? (
                <div className="bg-primary-container/10 border border-primary-fixed/20 p-8 rounded-lg text-center flex flex-col items-center gap-4 relative z-10 my-4">
                  <span className="text-3xl">✅</span>
                  <h4 className="font-headline-md text-primary">Transmission Received</h4>
                  <p className="text-on-surface-variant text-sm">Your uplink signal has been synchronized. We will communicate back on your digital frequency shortly.</p>
                  <button 
                    onClick={() => { setSent(false); setForm({ name: '', email: '', subject: 'System Integration', message: '' }); }}
                    className="px-6 py-2 border border-primary-fixed-dim/30 rounded text-primary-fixed-dim font-bold text-xs uppercase hover:bg-primary-fixed-dim/10 transition-all mt-4"
                  >
                    Send another signal
                  </button>
                </div>
              ) : (
                <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-telemetry-label text-telemetry-label text-on-surface-variant uppercase">Operator Identity</label>
                      <input 
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full bg-surface-container-highest/30 border border-white/10 rounded-lg p-4 font-body-base text-primary input-focus transition-all" 
                        placeholder="FULL NAME" 
                        type="text"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-telemetry-label text-telemetry-label text-on-surface-variant uppercase">Digital Frequency</label>
                      <input 
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full bg-surface-container-highest/30 border border-white/10 rounded-lg p-4 font-body-base text-primary input-focus transition-all" 
                        placeholder="EMAIL ADDRESS" 
                        type="email"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="font-telemetry-label text-telemetry-label text-on-surface-variant uppercase">Inquiry Vector</label>
                    <select 
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      className="w-full bg-surface-container-highest/30 border border-white/10 rounded-lg p-4 font-body-base text-primary input-focus transition-all appearance-none"
                    >
                      <option value="System Integration">System Integration</option>
                      <option value="Orbital Telemetry Data">Orbital Telemetry Data</option>
                      <option value="Strategic Partnerships">Strategic Partnerships</option>
                      <option value="Technical Support">Technical Support</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="font-telemetry-label text-telemetry-label text-on-surface-variant uppercase">Encrypted Transmission</label>
                    <textarea 
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      className="w-full bg-surface-container-highest/30 border border-white/10 rounded-lg p-4 font-body-base text-primary input-focus transition-all" 
                      placeholder="MESSAGE CONTENT..." 
                      rows="5"
                      required
                    ></textarea>
                  </div>
                  <button className="w-full py-5 bg-primary-container text-on-primary-container font-headline-md text-headline-md rounded-lg flex justify-center items-center gap-3 hover:shadow-[0_0_30px_rgba(0,255,200,0.4)] transition-all active:scale-[0.98]" type="submit">
                    <span className="material-symbols-outlined">send</span>
                    Transmit Uplink
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar Telemetry & Status */}
          <div className="lg:col-span-5 space-y-gutter">
            {/* Satellite Uplink Status Visualization */}
            <div className="glass-panel p-panel-padding rounded-xl flex flex-col justify-between min-h-[320px] relative overflow-hidden">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="font-headline-md text-headline-md text-primary-fixed mb-1">Satellite Uplink</h3>
                  <p className="font-telemetry-label text-telemetry-label text-on-surface-variant">Active Connection: ALPHA-7</p>
                </div>
                <div className="flex items-center gap-2 text-primary-fixed-dim">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-fixed opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-fixed"></span>
                  </span>
                  <span className="font-telemetry-label text-telemetry-label">SECURE</span>
                </div>
              </div>
              
              <div className="flex-grow flex items-center justify-center py-4">
                <span className="material-symbols-outlined text-[100px] text-primary-fixed-dim/20 animate-pulse">satellite_alt</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/5">
                <div className="space-y-1">
                  <span className="font-telemetry-label text-telemetry-label text-on-surface-variant block">Signal Strength</span>
                  <span className="font-telemetry-value text-telemetry-value text-primary">98.4%</span>
                </div>
                <div className="space-y-1 text-right">
                  <span className="font-telemetry-label text-telemetry-label text-on-surface-variant block">Latency</span>
                  <span className="font-telemetry-value text-telemetry-value text-primary">14ms</span>
                </div>
              </div>
            </div>

            {/* High-Tech Coordinate Display */}
            <div className="glass-panel p-panel-padding rounded-xl">
              <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                Earth-Based Command
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="font-telemetry-value text-telemetry-value text-primary leading-tight">37.7749° N, 122.4194° W</p>
                  <p className="font-body-base text-body-base text-on-surface-variant">Mission Control Center, Sector 4</p>
                </div>
                <div className="flex gap-4 pt-4">
                  <div className="flex-1 p-3 bg-white/5 rounded border border-white/5 text-center">
                    <span className="font-telemetry-label text-telemetry-label block mb-1">Timezone</span>
                    <span className="font-telemetry-value text-telemetry-value">UTC-8</span>
                  </div>
                  <div className="flex-1 p-3 bg-white/5 rounded border border-white/5 text-center">
                    <span className="font-telemetry-label text-telemetry-label block mb-1">Local Time</span>
                    <span className="font-telemetry-value text-telemetry-value">{localTime}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AstroWeb Social Links */}
            <div className="glass-panel p-panel-padding rounded-xl">
              <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-4 uppercase">AstroWeb Protocols</h3>
              <div className="grid grid-cols-2 gap-2">
                <a className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary-container/10 transition-colors group" href="https://www.linkedin.com/in/s-srisantoshi-b2b148326/">
                  <div className="w-8 h-8 rounded-full border border-primary-fixed/30 flex items-center justify-center text-primary-fixed group-hover:bg-primary-fixed group-hover:text-on-primary">
                    <span className="material-symbols-outlined text-[18px]">hub</span>
                  </div>
                  <span className="font-label-caps text-label-caps text-primary">LINKEDIN</span>
                </a>
                <a className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary-container/10 transition-colors group" href="https://github.com/SSRISANTOSHI/TEAM_ASTROWEB_PROJECT_ZENITH_COSMOSCOPE">
                  <div className="w-8 h-8 rounded-full border border-primary-fixed/30 flex items-center justify-center text-primary-fixed group-hover:bg-primary-fixed group-hover:text-on-primary">
                    <span className="material-symbols-outlined text-[18px]">terminal</span>
                  </div>
                  <span className="font-label-caps text-label-caps text-primary">GITHUB</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative w-full bg-surface-container-lowest border-t border-white/10 flex flex-col md:flex-row justify-between items-center px-margin-safe py-gutter z-20">
        <div className="font-label-caps text-label-caps text-primary-fixed-dim mb-4 md:mb-0">
          COSMOSCOPE. OBSERVE. UNDERSTAND. PREDICT.
        </div>
        <div className="flex gap-8">
          <a className="font-telemetry-label text-telemetry-label text-on-surface-variant hover:text-primary-fixed transition-colors uppercase" href="#legal">Legal Telemetry</a>
          <a className="font-telemetry-label text-telemetry-label text-on-surface-variant hover:text-primary-fixed transition-colors" href="#privacy">Data Privacy</a>
          <a className="font-telemetry-label text-telemetry-label text-on-surface-variant hover:text-primary-fixed transition-colors" href="#status">System Status</a>
        </div>
        <div className="mt-4 md:mt-0 font-telemetry-label text-telemetry-label text-on-surface-variant">
          © 2026 COSMOSCOPE.
        </div>
      </footer>
    </div>
  );
}
