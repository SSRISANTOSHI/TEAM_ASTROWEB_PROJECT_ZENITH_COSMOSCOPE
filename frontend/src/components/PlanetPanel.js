import React from 'react';

export default function PlanetPanel({ planets, moon }) {
  const sorted = [...planets].sort((a, b) => b.altitude - a.altitude);

  const planetEmoji = {
    Mercury: '☿', Venus: '♀', Mars: '♂', Jupiter: '♃',
    Saturn: '♄', Uranus: '⛢', Neptune: '♆',
  };

  const getPlanetColor = (name) => {
    switch (name) {
      case 'Mercury': return '#8c8c8c';
      case 'Venus': return '#e3bb76';
      case 'Mars': return '#ff6b6b';
      case 'Jupiter': return '#e9c400';
      case 'Saturn': return '#ffe170';
      case 'Uranus': return '#a5f3fc';
      case 'Neptune': return '#38bdf8';
      default: return '#00ffc8';
    }
  };

  return (
    <div className="font-body-base text-on-surface bg-background selection:bg-primary-fixed/30 overflow-y-auto">
      <style>{`
        .orbit-dashed {
            stroke-dasharray: 4 4;
        }
        .text-glow {
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.25);
        }
      `}</style>

      {/* ── HEADER ── */}
      <div className="border-b border-white/10 pb-6 mb-8">
        <span className="font-telemetry-label text-telemetry-label text-primary-fixed/60 uppercase tracking-[0.2em]">Observational Sky</span>
        <h1 className="font-headline-md text-3xl font-bold text-primary uppercase mt-1">Celestial Bodies</h1>
      </div>

      {/* ── GRID OF BODIES ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        {/* Moon Card */}
        <div className="glass-panel p-5 rounded-xl border border-white/5 hover:border-white/20 transition-all duration-300 flex flex-col justify-between min-h-[220px]">
          <div className="flex justify-between items-center mb-4">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-telemetry uppercase tracking-widest ${moon.visible ? 'bg-primary-container/20 text-primary-fixed-dim border border-primary-fixed/30' : 'bg-white/5 text-on-surface-variant/40 border border-white/5'}`}>
              {moon.visible ? 'VISIBLE' : 'BELOW'}
            </span>
            <span className="material-symbols-outlined text-2xl" style={{ color: '#fff' }}>brightness_2</span>
          </div>
          <div>
            <h4 className="font-headline-md text-lg text-primary font-bold">Moon</h4>
            <p className="font-telemetry-label text-[10px] text-on-surface-variant/60 mt-1 uppercase">Waxing Gibbous ({moon.phase}%)</p>
            <div className="w-full h-12 my-4">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 160 50">
                <path d="M0 30 Q 80 15 160 30" fill="none" stroke="#fff" strokeWidth="2" />
              </svg>
            </div>
          </div>
          <div className="flex justify-between items-end mt-2 pt-2 border-t border-white/5">
            <div className="flex flex-col">
              <span className="font-telemetry-label text-[9px] text-on-surface-variant/60 uppercase">ALTITUDE</span>
              <span className="font-telemetry-value text-sm text-primary-fixed-dim">{moon.altitude}°</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="font-telemetry-label text-[9px] text-on-surface-variant/60 uppercase">AZIMUTH</span>
              <span className="font-telemetry-value text-sm text-primary-fixed-dim">{moon.azimuth}°</span>
            </div>
          </div>
        </div>

        {/* Planet Cards */}
        {sorted.map((p) => {
          const color = getPlanetColor(p.name);
          return (
            <div 
              className="glass-panel p-5 rounded-xl border transition-all duration-300 flex flex-col justify-between min-h-[220px]"
              key={p.name}
              style={{ 
                borderColor: p.visible ? `rgba(${hexToRgb(color)}, 0.25)` : 'rgba(255,255,255,0.05)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = p.visible ? color : 'rgba(255,255,255,0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = p.visible ? `rgba(${hexToRgb(color)}, 0.25)` : 'rgba(255,255,255,0.05)'; }}
            >
              <div className="flex justify-between items-center mb-4">
                <span 
                  className="px-2 py-0.5 rounded text-[10px] font-bold font-telemetry uppercase tracking-widest"
                  style={{ 
                    background: p.visible ? `rgba(${hexToRgb(color)}, 0.1)` : 'rgba(255,255,255,0.03)',
                    color: p.visible ? color : 'var(--muted)',
                    border: p.visible ? `1px solid rgba(${hexToRgb(color)}, 0.2)` : '1px solid rgba(255,255,255,0.05)'
                  }}
                >
                  {p.visible ? 'VISIBLE' : 'BELOW'}
                </span>
                <span className="font-headline-md text-xl" style={{ color: p.visible ? color : 'var(--muted)' }}>
                  {planetEmoji[p.name] || '⭐'}
                </span>
              </div>
              <div>
                <h4 className="font-headline-md text-lg font-bold" style={{ color: p.visible ? '#fff' : 'var(--muted)' }}>{p.name}</h4>
                <p className="font-telemetry-label text-[10px] text-on-surface-variant/40 mt-1 uppercase">{p.source || 'NASA Horizons'}</p>
                <div className="w-full h-12 my-4">
                  <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 160 50">
                    <path d="M0 25 Q 40 10 80 40 T 160 20" fill="none" stroke={p.visible ? color : 'rgba(255,255,255,0.15)'} strokeWidth="1.5" />
                  </svg>
                </div>
              </div>
              <div className="flex justify-between items-end mt-2 pt-2 border-t border-white/5">
                <div className="flex flex-col">
                  <span className="font-telemetry-label text-[9px] text-on-surface-variant/60 uppercase">ALTITUDE</span>
                  <span className="font-telemetry-value text-sm">{p.altitude}°</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="font-telemetry-label text-[9px] text-on-surface-variant/60 uppercase">MAGNITUDE</span>
                  <span className="font-telemetry-value text-sm" style={{ color: p.visible ? color : 'inherit' }}>{p.magnitude}</span>
                </div>
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
}

// Helper to convert hex to rgb
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? 
    `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` 
    : '0, 255, 200';
}
