import { useState, useEffect } from 'react';

export default function OrbitalPanel({ satellites, iss, data }) {
  const { active, debris, congestion_pct } = satellites;
  const [overheadSats, setOverheadSats] = useState([]);
  const [selectedSat, setSelectedSat] = useState(null);

  const space_risk = data?.space_risk || { risk_score: 42.5, summary: 'Nominal conditions', debris_nearby: 1 };

  // Generate a list of local overhead satellites dynamically with metadata
  useEffect(() => {
    const names = [
      'STARLINK-30241', 'SENTINEL-6A', 'COSMOS 2542', 'ONEWEB-0422',
      'GPS III-SV05', 'ISS (ZARYA)', 'TIANGONG', 'METEOR-M2',
      'NOAA-19', 'LANDSAT 8', 'HUBBLE', 'AQUA', 'TERRA'
    ];
    const operators = {
      'STARLINK': { op: 'SpaceX', country: 'USA', purpose: 'Internet Communication', launch: '2022-11-14', status: 'Active' },
      'SENTINEL': { op: 'ESA', country: 'ESA/Europe', purpose: 'Earth Observation', launch: '2020-11-21', status: 'Active' },
      'COSMOS': { op: 'Roscosmos', country: 'Russia', purpose: 'Military Navigation', launch: '2019-12-25', status: 'Deviated' },
      'ONEWEB': { op: 'Eutelsat OneWeb', country: 'UK', purpose: 'Internet Communication', launch: '2021-07-01', status: 'Active' },
      'GPS': { op: 'US Space Force', country: 'USA', purpose: 'Navigation', launch: '2021-06-18', status: 'Active' },
      'ISS': { op: 'International Consortium', country: 'Multi-national', purpose: 'Scientific Research', launch: '1998-11-20', status: 'Active' },
      'TIANGONG': { op: 'CNSA', country: 'China', purpose: 'Scientific Research', launch: '2021-04-29', status: 'Active' },
      'METEOR': { op: 'Roscosmos', country: 'Russia', purpose: 'Weather Observation', launch: '2019-07-05', status: 'Active' },
      'NOAA': { op: 'NOAA', country: 'USA', purpose: 'Weather Observation', launch: '2009-02-06', status: 'Active' },
      'LANDSAT': { op: 'NASA / USGS', country: 'USA', purpose: 'Earth Observation', launch: '2013-02-11', status: 'Active' },
      'HUBBLE': { op: 'NASA / ESA', country: 'USA', purpose: 'Scientific / Astronomy', launch: '1990-04-24', status: 'Active' },
      'AQUA': { op: 'NASA', country: 'USA', purpose: 'Scientific / Climate', launch: '2002-05-04', status: 'Active' },
      'TERRA': { op: 'NASA', country: 'USA', purpose: 'Earth Observation', launch: '1999-12-18', status: 'Active' }
    };
    const types = ['Active', 'Observation', 'Deviated', 'Communication', 'Navigation', 'Scientific'];
    
    const list = names.map((name, i) => {
      const isISS = name.includes('ISS');
      const isCosmos = name.includes('COSMOS');
      const satType = isISS ? 'Active' : isCosmos ? 'Deviated' : types[i % types.length];
      const alt = isISS ? 418.0 : isCosmos ? 364.1 : 500 + (i * 125) + Math.random() * 10;
      const norad = 40000 + i * 847 + Math.floor(Math.random() * 100);
      
      const prefix = name.split('-')[0].split(' ')[0];
      const meta = operators[prefix] || { op: 'Unknown', country: 'Global', purpose: 'Scientific', launch: '2020-01-01', status: 'Active' };

      return {
        name,
        norad,
        type: satType,
        altitude: alt,
        inclination: (30 + i * 7.5 + Math.random() * 2).toFixed(2),
        drift: isCosmos ? '+1.2m/s²' : null,
        operator: meta.op,
        country: meta.country,
        purpose: meta.purpose,
        launchDate: meta.launch,
        status: meta.status,
        orbitType: isCosmos ? 'LEO / Deviated' : 'LEO / Polar'
      };
    });

    setOverheadSats(list);
  }, []);

  // Simulate real-time updates for telemetry values
  useEffect(() => {
    const id = setInterval(() => {
      setOverheadSats(prev => 
        prev.map(sat => {
          if (Math.random() > 0.7) {
            const change = (Math.random() - 0.5) * 0.2;
            return {
              ...sat,
              altitude: parseFloat((sat.altitude + change).toFixed(1))
            };
          }
          return sat;
        })
      );
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="font-body-base text-on-surface bg-background selection:bg-primary-fixed/30 overflow-y-auto">
      <style>{`
        .csai-glow {
            box-shadow: 0 0 20px rgba(0, 224, 176, 0.15), inset 0 0 10px rgba(0, 224, 176, 0.05)
        }
        .critical-glow {
            box-shadow: 0 0 30px rgba(255, 61, 0, 0.3);
            animation: pulse-glow 2s infinite ease-in-out
        }
        @keyframes pulse-glow {
            0%, 100% {
                opacity: 0.8;
                transform: scale(1);
            } 50% {
                opacity: 1;
                transform: scale(1.02);
            }
        }
        .scanline {
            background: linear-gradient(to bottom, transparent 50%, rgba(0, 224, 176, 0.05) 50%);
            background-size: 100% 4px
        }
        .orbit-dashed {
            stroke-dasharray: 4 4;
        }
      `}</style>

      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-6 mb-8 gap-4">
        <div>
          <span className="font-telemetry-label text-telemetry-label text-primary-fixed/60 uppercase tracking-[0.3em]">Traffic Segment LEO-04</span>
          <h1 className="font-headline-md text-3xl font-bold text-primary uppercase mt-1">Orbital Traffic Layer</h1>
        </div>
        <div className="flex gap-4">
          <div className="glass-panel rounded-xl px-6 py-4 border-l-4 border-error critical-glow flex flex-col justify-center min-w-[200px]">
            <p className="font-telemetry text-on-surface-variant/60 text-[10px] uppercase">Space Risk Index</p>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-4xl text-error font-bold" style={{ textShadow: '0 0 15px rgba(255, 180, 171, 0.4)' }}>
                {space_risk.risk_score}/100
              </span>
              <span className="font-telemetry text-xs text-error font-bold uppercase">
                {space_risk.risk_score > 70 ? 'CRITICAL' : 'MODERATE'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── TOP ROW ASSET TRACKING CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Starlink */}
        <div className="glass-panel p-5 rounded-xl border-t-2 border-primary-fixed csai-glow flex flex-col justify-between hover:bg-surface-variant/20 transition-all cursor-pointer group">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="text-[10px] font-label-caps text-on-surface-variant opacity-60 mb-1">ASSET ID: SL-7421</div>
              <h3 className="font-headline-md text-lg text-primary font-bold uppercase">Starlink-7421</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-container/20 text-primary-fixed-dim border border-primary-fixed/30 uppercase tracking-widest">Active</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4 text-xs font-telemetry">
            <div>
              <span className="text-[9px] text-on-surface-variant/60 uppercase block">Operator</span>
              <span className="text-primary-fixed-dim">SpaceX</span>
            </div>
            <div>
              <span className="text-[9px] text-on-surface-variant/60 uppercase block">Purpose</span>
              <span className="text-primary-fixed-dim">Internet</span>
            </div>
          </div>
          <div className="flex items-end justify-between pt-2 border-t border-white/5">
            <div className="space-y-0.5">
              <span className="text-[10px] text-on-surface-variant font-telemetry-label uppercase block">Signal Strength</span>
              <span className="text-lg font-telemetry-value text-primary-fixed-dim font-bold">-104.2 dBm</span>
            </div>
            <div className="h-6 w-24 bg-white/5 overflow-hidden rounded relative">
              <div className="h-full w-2/3 bg-primary-fixed opacity-40"></div>
            </div>
          </div>
        </div>

        {/* Card 2: Sentinel-6A */}
        <div className="glass-panel p-5 rounded-xl border-t-2 border-tertiary-fixed-dim flex flex-col justify-between hover:bg-surface-variant/20 transition-all cursor-pointer group">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="text-[10px] font-label-caps text-on-surface-variant opacity-60 mb-1">ASSET ID: S6-OCEAN</div>
              <h3 className="font-headline-md text-lg text-primary font-bold uppercase">Sentinel-6A</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-tertiary-container/20 text-tertiary-fixed-dim border border-tertiary-fixed-dim/30 uppercase tracking-widest">Observation</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4 text-xs font-telemetry">
            <div>
              <span className="text-[9px] text-on-surface-variant/60 uppercase block">Operator</span>
              <span className="text-primary-fixed-dim">ESA</span>
            </div>
            <div>
              <span className="text-[9px] text-on-surface-variant/60 uppercase block">Sea Level Delta</span>
              <span className="text-primary-fixed-dim">+3.21 mm</span>
            </div>
          </div>
          <div className="flex items-end justify-between pt-2 border-t border-white/5">
            <div className="space-y-0.5">
              <span className="text-[10px] text-on-surface-variant font-telemetry-label uppercase block">Spectral Status</span>
              <span className="text-lg font-telemetry-value text-tertiary-fixed-dim font-bold">NOMINAL</span>
            </div>
            <div className="flex gap-1 h-6 items-end">
              <div className="w-1.5 h-3 bg-tertiary-fixed-dim"></div>
              <div className="w-1.5 h-5 bg-tertiary-fixed-dim"></div>
              <div className="w-1.5 h-2 bg-tertiary-fixed-dim"></div>
              <div className="w-1.5 h-6 bg-tertiary-fixed-dim"></div>
            </div>
          </div>
        </div>

        {/* Card 3: Cosmos 2542 */}
        <div className="glass-panel p-5 rounded-xl border-t-2 border-error flex flex-col justify-between hover:bg-error/5 transition-all cursor-pointer group">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="text-[10px] font-label-caps text-on-surface-variant opacity-60 mb-1">ASSET ID: C-2542</div>
              <h3 className="font-headline-md text-lg text-primary font-bold uppercase">Cosmos 2542</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-error-container/30 text-error border border-error/30 uppercase tracking-widest">Deviated</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4 text-xs font-telemetry">
            <div>
              <span className="text-[9px] text-on-surface-variant/60 uppercase block">Operator</span>
              <span className="text-error">Roscosmos</span>
            </div>
            <div>
              <span className="text-[9px] text-on-surface-variant/60 uppercase block">Radial Deviation</span>
              <span className="text-error">12.44 KM</span>
            </div>
          </div>
          <div className="flex items-end justify-between pt-2 border-t border-white/5">
            <div className="space-y-0.5">
              <span className="text-[10px] text-on-surface-variant font-telemetry-label uppercase block">Alert Status</span>
              <span className="text-lg font-telemetry-value text-error font-bold">WARNING</span>
            </div>
            <span className="material-symbols-outlined text-error animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>error_med</span>
          </div>
        </div>
      </div>

      {/* ── GRID LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Heatmap and Alerts */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* LEO Density Heatmap */}
          <div className="glass-panel rounded-xl overflow-hidden relative min-h-[440px] flex flex-col border border-white/10" style={{ background: 'linear-gradient(135deg, rgba(17,19,29,0.5), rgba(25,27,38,0.3))' }}>
            <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-screen bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCK3oEstOLNYPjnNCfxhUcneWS2ROafrm5S0tQ_-1BajzWxj1-_PP1BkVUbAN1-CHEsszJ47mhqtjCYZ1hCSkXo8Hd2De15l7JjInYLrw-kG0TS1Bf-8VdKM_sVAoIL6tVgyHgp-oEkuxyO1VDVRFWUCWWGvOPlLXGG5fx5MvZgzYGWitInmGumuUgWMYTCitca4YvuZFTqaN5gYCMRyBxgtyFJHwppLRzT0Cy5mmnUXWr2FNcCUGkyvzl6dtVCv29nyayXYB3B-j4')" }}></div>
            <div className="scanline pointer-events-none absolute inset-0" style={{ opacity: 0.15 }}></div>

            <div className="relative z-20 p-6 flex justify-between items-start">
              <div>
                <h3 className="font-headline-md text-xl text-primary font-bold uppercase">LEO Density Heatmap</h3>
                <p className="text-xs text-on-surface-variant mt-1">Active distribution monitoring in Low Earth Orbit zones.</p>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 glass-panel border border-white/5 rounded-full text-[10px] font-telemetry uppercase tracking-widest">Live Stream</span>
                <span className="px-3 py-1 glass-panel border border-primary-fixed/20 rounded-full text-[10px] font-telemetry uppercase tracking-widest animate-pulse text-primary-fixed">Synchronized</span>
              </div>
            </div>

            {/* Radar Simulation SVG Graphic */}
            <div className="flex justify-center my-6 z-20">
              <svg width="180" height="180" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(0, 255, 200, 0.15)" strokeWidth="1.5" />
                <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(0, 255, 200, 0.1)" strokeWidth="1" />
                <circle cx="100" cy="100" r="30" fill="none" stroke="rgba(0, 255, 200, 0.05)" strokeWidth="1" />
                <line x1="100" y1="100" x2="190" y2="100" stroke="#00ffc8" strokeWidth="1.5" style={{ transformOrigin: '100px 100px', animation: 'spin 4s linear infinite' }} />
                {/* Debris points */}
                <circle cx="120" cy="80" r="3" fill="#ffb4ab" className="animate-pulse" />
                <circle cx="70" cy="130" r="2.5" fill="#d1bcff" />
                <circle cx="140" cy="120" r="3" fill="#ffb4ab" />
              </svg>
            </div>

            <div className="mt-auto relative z-20 p-6 grid grid-cols-4 gap-4 border-t border-white/5 bg-black/20">
              <div className="glass-panel p-4 rounded-xl border border-white/5">
                <p className="font-telemetry text-[10px] text-on-surface-variant/40 uppercase">Active Satellites</p>
                <p className="font-telemetry text-xl text-primary-fixed mt-1 font-bold">{active.toLocaleString()}</p>
              </div>
              <div className="glass-panel p-4 rounded-xl border border-white/5">
                <p className="font-telemetry text-[10px] text-on-surface-variant/40 uppercase">Avg Velocity</p>
                <p className="font-telemetry text-xl text-on-surface mt-1 font-bold">7.66 km/s</p>
              </div>
              <div className="glass-panel p-4 rounded-xl border border-white/5">
                <p className="font-telemetry text-[10px] text-on-surface-variant/40 uppercase">Debris Count</p>
                <p className="font-telemetry text-xl text-error mt-1 font-bold">{debris.toLocaleString()}</p>
              </div>
              <div className="glass-panel p-4 rounded-xl border border-white/5">
                <p className="font-telemetry text-[10px] text-on-surface-variant/40 uppercase">Congestion Index</p>
                <p className="font-telemetry text-xl mt-1 font-bold text-tertiary-fixed-dim">{congestion_pct}%</p>
              </div>
            </div>
          </div>

          {/* Secondary Row: Debris & Zone Health */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Space Debris Alert */}
            <div className="glass-panel p-6 rounded-xl overflow-hidden relative border border-white/10" style={{ borderLeft: space_risk.debris_nearby > 0 ? '4px solid #ffb4ab' : '4px solid #00ffc8' }}>
              <div className="scanline absolute inset-0 pointer-events-none" style={{ opacity: 0.1 }}></div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-headline-md text-lg font-bold flex items-center gap-2" style={{ color: space_risk.debris_nearby > 0 ? '#ffb4ab' : '#00ffc8' }}>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {space_risk.debris_nearby > 0 ? 'warning' : 'check_circle'}
                    </span>
                    Zenith Debris Alerts
                  </h3>
                  <p className="text-xs text-on-surface-variant/60">Zenith Proximity Reports</p>
                </div>
                <div className="text-right">
                  <span className="block font-display text-3xl font-bold" style={{ color: space_risk.debris_nearby > 0 ? '#ffb4ab' : '#00ffc8' }}>
                    {space_risk.debris_nearby}
                  </span>
                  <span className="font-telemetry text-[9px] uppercase text-on-surface-variant/40">Tracked Hazards</span>
                </div>
              </div>
              
              <div className="space-y-4">
                {space_risk.debris_nearby > 0 ? (
                  Array.from({ length: space_risk.debris_nearby }).map((_, i) => (
                    <div key={i} className="p-3 rounded-lg border" style={{ background: 'rgba(255, 180, 171, 0.05)', borderColor: 'rgba(255, 180, 171, 0.15)' }}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-telemetry text-xs font-bold text-error">DEBRIS-SEC-{4000 + i * 138}</span>
                        <span className="font-telemetry text-[8px] px-2 py-0.5 rounded bg-error/20 text-error">CLOSE PASS</span>
                      </div>
                      <div className="grid grid-cols-2 gap-y-1 text-[10px] font-telemetry">
                        <div className="text-on-surface-variant/60">COLLISION PROB:</div>
                        <div className="text-right text-error">{(0.012 * (i + 1)).toFixed(3)}%</div>
                        <div className="text-on-surface-variant/60">PROXIMITY:</div>
                        <div className="text-right">{280 + i * 110}m</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-on-surface-variant/60 italic">No debris objects passing within hazard boundaries.</p>
                )}
              </div>
            </div>

            {/* LEO Zone Distribution */}
            <div className="glass-panel p-6 rounded-xl border border-white/10 flex flex-col justify-between">
              <div>
                <h3 className="font-headline-md text-lg font-bold text-primary uppercase">LEO Zone Health</h3>
                <p className="text-xs text-on-surface-variant/60">Structural stability of orbital planes</p>
              </div>
              <div className="space-y-4 mt-6">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-telemetry uppercase tracking-widest text-on-surface-variant/60">
                    <span>200km - 500km</span>
                    <span className="text-primary-fixed-dim">Stable</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-[85%] bg-primary-fixed-dim"></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-telemetry uppercase tracking-widest text-on-surface-variant/60">
                    <span>500km - 1200km</span>
                    <span className="text-tertiary-fixed-dim">Congested</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-[92%] bg-tertiary-fixed-dim"></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-telemetry uppercase tracking-widest text-on-surface-variant/60">
                    <span>Polar Orbitals</span>
                    <span className="text-primary-fixed-dim">Nominal</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-[40%] bg-primary-fixed-dim"></div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Local Overhead Satellite list */}
        <div className="lg:col-span-4 glass-panel rounded-xl flex flex-col overflow-hidden max-h-[660px] border border-white/10 relative">
          
          {/* Detailed Satellite Purpose Identification Inspector */}
          {selectedSat && (
            <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col p-6 animate-in fade-in slide-in-from-right duration-300">
              <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
                <div>
                  <h4 className="font-headline-md text-base text-primary-fixed font-bold">{selectedSat.name}</h4>
                  <span className="font-telemetry text-[9px] text-on-surface-variant/60">NORAD ID: {selectedSat.norad}</span>
                </div>
                <button 
                  onClick={() => setSelectedSat(null)}
                  className="text-on-surface-variant/60 hover:text-primary-fixed p-1 rounded-full"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <div className="flex-1 flex flex-col gap-4 text-xs">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-on-surface-variant/60 font-telemetry">OPERATOR</span>
                  <span className="font-bold text-white">{selectedSat.operator}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-on-surface-variant/60 font-telemetry">MISSION / PURPOSE</span>
                  <span className="font-bold text-tertiary-fixed-dim text-right max-w-[180px]">{selectedSat.purpose}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-on-surface-variant/60 font-telemetry">COUNTRY</span>
                  <span className="font-bold text-white">{selectedSat.country}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-on-surface-variant/60 font-telemetry">LAUNCH DATE</span>
                  <span className="font-bold text-white">{selectedSat.launchDate}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-on-surface-variant/60 font-telemetry">ORBIT TYPE</span>
                  <span className="font-bold text-white">{selectedSat.orbitType}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-on-surface-variant/60 font-telemetry">ALTITUDE</span>
                  <span className="font-bold text-primary-fixed">{selectedSat.altitude} km</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2 items-center">
                  <span className="text-on-surface-variant/60 font-telemetry">STATUS</span>
                  <span 
                    className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      selectedSat.status === 'Active' ? 'bg-primary-container/20 text-primary-fixed-dim' : 'bg-error-container/20 text-error'
                    }`}
                  >
                    {selectedSat.status}
                  </span>
                </div>
              </div>

              <div className="mt-auto border-t border-white/10 pt-4">
                <button 
                  onClick={() => setSelectedSat(null)}
                  className="w-full py-3 text-xs border border-white/10 rounded-lg bg-white/5 text-white font-label-caps uppercase hover:bg-white/10 transition-all active:scale-[0.98]"
                >
                  Return to List
                </button>
              </div>
            </div>
          )}

          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
            <div>
              <h3 className="font-headline-md text-lg font-bold text-primary uppercase">Local Overhead</h3>
              <p className="font-telemetry text-xs mt-1 text-primary-fixed-dim">{overheadSats.length} TRACKED OBJECTS</p>
            </div>
            <button className="material-symbols-outlined text-on-surface-variant/60 hover:text-primary-fixed">filter_list</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {overheadSats.map((sat) => (
              <div 
                key={sat.norad} 
                onClick={() => setSelectedSat(sat)}
                className="p-3.5 rounded-xl hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/10"
                style={{ 
                  background: sat.type === 'Deviated' ? 'rgba(255, 180, 171, 0.03)' : 'transparent',
                  borderColor: sat.type === 'Deviated' ? 'rgba(255, 180, 171, 0.1)' : 'transparent' 
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded flex items-center justify-center"
                      style={{ 
                        background: sat.type === 'Deviated' ? 'rgba(255, 180, 171, 0.1)' : sat.type === 'Observation' ? 'rgba(209, 188, 255, 0.1)' : 'rgba(0, 255, 200, 0.1)',
                        color: sat.type === 'Deviated' ? 'var(--warn)' : sat.type === 'Observation' ? 'var(--accent2)' : 'var(--accent)'
                      }}
                    >
                      <span className="material-symbols-outlined text-lg">
                        {sat.type === 'Observation' ? 'public' : sat.type === 'Deviated' ? 'radar' : 'satellite'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-telemetry text-xs font-bold text-white">{sat.name}</h4>
                      <span className="font-telemetry text-[9px] text-on-surface-variant/40">NORAD: {sat.norad}</span>
                    </div>
                  </div>
                  <span 
                    className="px-2 py-0.5 rounded font-telemetry text-[8px] uppercase tracking-widest"
                    style={{ 
                      background: sat.type === 'Deviated' ? 'rgba(255, 180, 171, 0.15)' : sat.type === 'Observation' ? 'rgba(209, 188, 255, 0.15)' : 'rgba(0, 255, 200, 0.15)',
                      color: sat.type === 'Deviated' ? 'var(--warn)' : sat.type === 'Observation' ? 'var(--accent2)' : 'var(--accent)'
                    }}
                  >
                    {sat.type}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-y-1 text-[10px] font-telemetry">
                  <div className="text-on-surface-variant/60 uppercase">Altitude</div>
                  <div className="text-right text-white">{sat.altitude} km</div>
                  <div className="text-on-surface-variant/60 uppercase">
                    {sat.drift ? 'Drift Rate' : 'Inclination'}
                  </div>
                  <div className="text-right" style={{ color: sat.drift ? 'var(--warn)' : 'inherit' }}>
                    {sat.drift || `${sat.inclination}°`}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-white/5 border-t border-white/5">
            <button className="w-full py-2.5 rounded-lg border border-primary-fixed/20 text-primary-fixed font-label-caps text-xs hover:bg-primary-fixed/10 transition-all active:scale-[0.98]">
              View All {overheadSats.length} Objects
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
