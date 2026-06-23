import { useState, useEffect } from 'react';
import OrbitalScene from './OrbitalScene';

export default function Dashboard({ data }) {
  const { csai, location, weather, moon, light_pollution, space_weather, space_risk } = data;
  const [timeStr, setTimeStr] = useState('');
  const [latency, setLatency] = useState(24);

  // Update clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    };
    updateTime();
    const id = setInterval(updateTime, 1000);
    return () => clearInterval(id);
  }, []);

  // Update simulated latency with slight jitter
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(prev => {
        const base = 24;
        const jitter = Math.floor(Math.random() * 5) - 2;
        return base + jitter;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const interp =
    csai >= 80
      ? 'Pristine Conditions'
      : csai >= 60
      ? 'Good Visibility'
      : csai >= 40
      ? 'Moderate Visibility'
      : 'Limited Visibility';

  const interpDesc =
    csai >= 80
      ? 'Optimal conditions for deep-sky observation.'
      : csai >= 60
      ? 'Favorable conditions. Main celestial objects are highly visible.'
      : csai >= 40
      ? 'Moderate sky quality. Some light pollution or light cloud cover.'
      : 'Poor conditions. High cloud cover or extreme light pollution.';

  const planet = (data.planets && data.planets.find(p => p.visible)) || (data.planets && data.planets[0]) || {
    name: 'Jupiter',
    altitude: 68,
    azimuth: 142,
    magnitude: -2.1,
    visible: true
  };

  const latStr = `${Math.abs(location.lat).toFixed(4)}° ${location.lat >= 0 ? 'N' : 'S'}`;
  const lonStr = `${Math.abs(location.lon).toFixed(4)}° ${location.lon >= 0 ? 'E' : 'W'}`;

  const radius = 110;
  const circ = 2 * Math.PI * radius;
  const strokeDashoffset = circ - (csai / 100) * circ;

  // Observation Suitability Engine Explanations (Feature 9)
  const positives = [];
  const negatives = [];

  if (weather.cloud_cover < 20) {
    positives.push(`Clear sky (${weather.cloud_cover}% clouds)`);
  } else if (weather.cloud_cover > 60) {
    negatives.push(`Heavy clouds (${weather.cloud_cover}%)`);
  } else {
    positives.push(`Partly cloudy (${weather.cloud_cover}%)`);
  }

  if (light_pollution && light_pollution.bortle <= 3) {
    positives.push(`Pristine dark sky (Bortle ${light_pollution.bortle})`);
  } else if (light_pollution && light_pollution.bortle >= 7) {
    negatives.push(`Severe city light pollution (Bortle ${light_pollution.bortle})`);
  } else if (light_pollution) {
    positives.push(`Suburban sky (Bortle ${light_pollution.bortle})`);
  }

  const visiblePlanetsCount = (data.planets && data.planets.filter(p => p.visible).length) || 0;
  if (visiblePlanetsCount >= 2) {
    positives.push(`${visiblePlanetsCount} planets visible`);
  } else if (visiblePlanetsCount === 1) {
    positives.push(`1 planet visible`);
  } else {
    negatives.push(`No planets currently visible`);
  }

  if (moon && moon.visible) {
    if (moon.phase > 50) {
      negatives.push(`Bright moon (${moon.phase}% phase)`);
    } else {
      positives.push(`Low moon glow (${moon.phase}% phase)`);
    }
  } else {
    positives.push("Moon is below horizon");
  }

  if (space_weather) {
    if (space_weather.kp_index >= 5) {
      negatives.push(`Solar Storm Active (Kp ${space_weather.kp_index})`);
    } else {
      positives.push(`Quiet space weather (Kp ${space_weather.kp_index})`);
    }
  }

  if (space_risk) {
    if (space_risk.risk_score > 60) {
      negatives.push(`High orbital risk (${space_risk.risk_score}/100)`);
    } else {
      positives.push(`Nominal orbital traffic risk`);
    }
  }

  return (
    <div className="font-body-base text-on-surface bg-background selection:bg-primary-fixed/30 overflow-y-auto">
      <style>{`
        .csai-glow {
            text-shadow: 0 0 20px rgba(0, 224, 176, 0.6);
        }
        .bloom-green {
            box-shadow: inset 0 0 15px rgba(0, 224, 176, 0.2), 0 0 20px rgba(0, 224, 176, 0.1);
        }
        .orbit-dashed {
            stroke-dasharray: 4 4;
        }
        .scan-line {
            width: 100%;
            height: 2px;
            background: linear-gradient(90deg, transparent, rgba(0, 224, 176, 0.2), transparent);
            position: absolute;
            animation: scan 4s linear infinite;
        }
        @keyframes scan {
            0% { top: 0%; }
            100% { top: 100%; }
        }
        .pulse-protocol {
            animation: pulse-border 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse-border {
            0%, 100% { border-color: rgba(0, 224, 176, 0.5); }
            50% { border-color: rgba(0, 224, 176, 0.1); }
        }
      `}</style>

      {/* ── HEADER TELEMETRY ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-6 mb-8 gap-4">
        <div>
          <span className="font-telemetry-label text-telemetry-label text-primary-fixed-dim uppercase tracking-widest">Observation Node</span>
          <h1 className="font-headline-md text-3xl text-primary font-bold uppercase mt-1">{location.name} Node</h1>
          <div className="flex items-center gap-3 mt-2 text-xs text-on-surface-variant/70">
            <span className="w-2 h-2 rounded-full bg-primary-fixed-dim animate-pulse"></span>
            <span className="font-telemetry">STATION ACTIVE: IN-{location.name.substring(0, 3).toUpperCase()}-04</span>
            <span className="opacity-30">|</span>
            <span className="font-telemetry">LOCAL TIME: {timeStr || 'PENDING'}</span>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="glass-panel rounded-xl px-5 py-3 border border-white/10 flex flex-col">
            <span className="font-label-caps text-label-caps text-on-surface-variant/60 uppercase">LATITUDE</span>
            <span className="font-telemetry-value text-primary-fixed">{latStr}</span>
          </div>
          <div className="glass-panel rounded-xl px-5 py-3 border border-white/10 flex flex-col">
            <span className="font-label-caps text-label-caps text-on-surface-variant/60 uppercase">LONGITUDE</span>
            <span className="font-telemetry-value text-primary-fixed">{lonStr}</span>
          </div>
        </div>
      </div>

      {/* ── MAIN DASHBOARD GRID ── */}
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Central CSAI Gauge */}
          <div className="lg:col-span-8 glass-panel rounded-xl p-8 relative overflow-hidden flex flex-col items-center justify-center min-h-[420px] border border-white/10">
            <div className="scan-line"></div>
            <OrbitalScene />
            
            <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
              <div className="w-2 h-2 rounded-full bg-primary-fixed-dim animate-pulse"></div>
              <span className="font-telemetry-label text-telemetry-label uppercase text-primary-fixed-dim">Project Zenith // Core System</span>
            </div>

            {/* Gauge Graphic */}
            <div className="relative w-64 h-64 flex items-center justify-center z-10">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle className="text-white/5" cx="128" cy="128" fill="transparent" r={radius} stroke="currentColor" strokeWidth="2"></circle>
                <circle className="text-primary-fixed-dim drop-shadow-[0_0_10px_rgba(0,224,176,0.5)]" cx="128" cy="128" fill="transparent" r={radius} stroke="currentColor" stroke-dasharray={circ} stroke-dashoffset={strokeDashoffset} strokeWidth="8"></circle>
              </svg>
              <div className="text-center z-10">
                <div className="font-display-lg text-6xl csai-glow text-primary-fixed-dim">{csai}</div>
                <div className="font-telemetry-label text-telemetry-label text-on-surface-variant tracking-widest mt-[-4px]">CSAI INDEX</div>
              </div>
              <div className="absolute w-full h-full animate-[spin_20s_linear_infinite] opacity-30">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-primary-fixed-dim rounded-full"></div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-12 w-full max-w-lg z-20">
              <div className="text-center">
                <div className="text-on-surface-variant font-telemetry-label text-[10px] uppercase tracking-tighter mb-1">Atmospheric Clarity</div>
                <div className="text-primary-fixed font-telemetry-value text-telemetry-value">{100 - weather.cloud_cover}%</div>
              </div>
              <div className="text-center border-x border-white/5">
                <div className="text-on-surface-variant font-telemetry-label text-[10px] uppercase tracking-tighter mb-1">Signal Latency</div>
                <div className="text-tertiary-fixed-dim font-telemetry-value text-telemetry-value">{latency}ms</div>
              </div>
              <div className="text-center">
                <div className="text-on-surface-variant font-telemetry-label text-[10px] uppercase tracking-tighter mb-1">Light Pollution</div>
                <div className="text-primary-fixed font-telemetry-value text-telemetry-value">Bortle {light_pollution?.bortle ?? 4}</div>
              </div>
            </div>

            {/* Suitability Engine Positives/Negatives Breakdown */}
            <div className="w-full max-w-lg mt-6 pt-4 border-t border-white/5 z-20">
              <div className="flex justify-between items-center mb-3">
                <span className="font-label-caps text-label-caps text-primary-fixed-dim uppercase">{interp}</span>
                <span className="text-[10px] text-on-surface-variant">{interpDesc}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  {positives.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] font-telemetry-label text-primary-fixed-dim">
                      <span className="material-symbols-outlined text-[12px]">check_circle</span>
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  {negatives.map((n, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] font-telemetry-label text-error">
                      <span className="material-symbols-outlined text-[12px]">cancel</span>
                      <span>{n}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Global Stats */}
          <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">
            {/* Active Mission card */}
            <div className="glass-panel rounded-xl p-6 border-t-2 border-primary-fixed pulse-protocol flex-1 flex flex-col justify-between min-h-[190px]">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="font-telemetry-label text-telemetry-label text-primary-fixed-dim uppercase">Active Mission</div>
                  <span className="material-symbols-outlined text-primary-fixed-dim text-sm">rocket_launch</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-primary mb-2">ZENITH-14</h3>
                <p className="text-on-surface-variant text-sm opacity-80 leading-relaxed">
                  Deep orbital scan targeting the outer asteroid belt. Data synthesis currently at 64% completion.
                </p>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-[10px] font-telemetry-label text-on-surface-variant">
                  <span>SYNTHESIS PROGRESS</span>
                  <span className="text-primary-fixed">64%</span>
                </div>
                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                  <div className="bg-primary-fixed w-[64%] h-full shadow-[0_0_8px_rgba(0,224,176,1)]"></div>
                </div>
              </div>
            </div>

            {/* Weather Card */}
            <div className="glass-panel rounded-xl p-6 flex flex-col justify-center min-h-[190px]">
              <div className="font-telemetry-label text-telemetry-label text-on-surface-variant uppercase mb-4">Local Weather Conditions</div>
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                  <span className="material-symbols-outlined text-3xl text-primary-fixed-dim">
                    {weather.cloud_cover < 20 ? 'wb_sunny' : weather.cloud_cover < 60 ? 'cloud' : 'thunderstorm'}
                  </span>
                </div>
                <div>
                  <div className="font-telemetry-value text-telemetry-value text-primary uppercase">
                    {weather.cloud_cover < 20 ? 'NOMINAL / CLEAR' : weather.cloud_cover < 60 ? 'SCATTERED CLOUDS' : 'HEAVY CLOUDS'}
                  </div>
                  <div className="text-xs text-on-surface-variant mt-1">Cloud cover base at {weather.cloud_cover}%</div>
                  <div className="text-xs text-on-surface-variant">Visibility: {(weather.visibility / 1000).toFixed(1)} KM</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Best Viewing Window Timeline */}
        <section className="glass-panel rounded-xl p-8 border border-white/5">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="font-headline-md text-headline-md text-primary tracking-tight">Best Viewing Window</h2>
              <p className="text-on-surface-variant text-sm mt-1">Optimal celestial visibility periods for current coordinates</p>
            </div>
            <div className="text-right">
              <div className="text-on-surface-variant font-telemetry-label text-[10px] uppercase mb-1">Next Peak In</div>
              <div className="text-tertiary-fixed-dim font-telemetry-value text-telemetry-value">02:14:55</div>
            </div>
          </div>
          <div className="relative h-24 flex items-center">
            {/* Timeline line */}
            <div className="absolute w-full h-[1px] bg-white/10 top-1/2 -translate-y-1/2"></div>
            <div className="flex justify-between w-full relative z-10">
              <div className="flex flex-col items-center gap-3 group cursor-pointer">
                <div className="text-[10px] font-telemetry-label text-on-surface-variant group-hover:text-primary transition-colors">18:00</div>
                <div className="w-2.5 h-2.5 rounded-full border border-white/30 bg-background group-hover:border-primary-fixed transition-all"></div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-telemetry-label text-primary-fixed-dim">Dusk</div>
              </div>
              <div className="flex flex-col items-center gap-3 group cursor-pointer">
                <div className="text-[10px] font-telemetry-label text-on-surface-variant group-hover:text-primary transition-colors">20:30</div>
                <div className="w-2.5 h-2.5 rounded-full border-2 border-primary-fixed bg-primary-fixed-dim group-hover:scale-125 shadow-[0_0_10px_rgba(0,224,176,0.8)] transition-all"></div>
                <div className="text-[10px] font-telemetry-label text-primary-fixed-dim uppercase font-bold">Peak View</div>
              </div>
              <div className="flex flex-col items-center gap-3 group cursor-pointer">
                <div className="text-[10px] font-telemetry-label text-on-surface-variant group-hover:text-primary transition-colors">22:00</div>
                <div className="w-2.5 h-2.5 rounded-full border border-white/30 bg-background group-hover:border-primary-fixed transition-all"></div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-telemetry-label text-primary-fixed-dim">ISS Pass</div>
              </div>
              <div className="flex flex-col items-center gap-3 group cursor-pointer">
                <div className="text-[10px] font-telemetry-label text-on-surface-variant group-hover:text-primary transition-colors font-bold text-white">01:15</div>
                <div className="w-2.5 h-2.5 rounded-full border-2 border-tertiary-fixed bg-tertiary-fixed-dim group-hover:scale-125 shadow-[0_0_10px_rgba(233,196,0,0.8)] transition-all"></div>
                <div className="text-[10px] font-telemetry-label text-tertiary-fixed-dim uppercase font-bold">Jupiter Transit</div>
              </div>
              <div className="flex flex-col items-center gap-3 group cursor-pointer">
                <div className="text-[10px] font-telemetry-label text-on-surface-variant group-hover:text-primary transition-colors">04:00</div>
                <div className="w-2.5 h-2.5 rounded-full border border-white/30 bg-background group-hover:border-primary-fixed transition-all"></div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-telemetry-label text-primary-fixed-dim">Dawn</div>
              </div>
            </div>
          </div>
        </section>

        {/* LEO Object Tracking Sparkline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: ISS */}
          <div className="glass-panel rounded-xl p-6 border border-white/5 group hover:border-primary-fixed-dim/30 transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="font-telemetry-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Orbit Class: LEO</div>
                <h4 className="font-headline-md text-xl text-primary font-bold">ISS</h4>
              </div>
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 text-primary-fixed-dim">
                <span className="material-symbols-outlined">satellite</span>
              </div>
            </div>
            {/* Sparkline SVG */}
            <div className="w-full h-16 mb-6">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 20">
                <path className="text-white/10 orbit-dashed" d="M0,10 Q25,0 50,10 T100,10" fill="none" stroke="currentColor" strokeWidth="1"></path>
                <path className="text-primary-fixed-dim" d="M0,10 Q25,0 50,10" fill="none" stroke="currentColor" strokeWidth="2"></path>
                <circle className="text-primary-fixed-dim animate-pulse" cx="50" cy="10" fill="currentColor" r="2.5"></circle>
              </svg>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-telemetry-label text-[10px]">ALTITUDE</span>
                <span className="text-primary font-telemetry-value text-sm">418 KM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-telemetry-label text-[10px]">VELOCITY</span>
                <span className="text-primary font-telemetry-value text-sm">7.66 KM/S</span>
              </div>
            </div>
          </div>

          {/* Card 2: Jupiter */}
          <div className="glass-panel rounded-xl p-6 border border-white/5 group hover:border-tertiary-fixed-dim/30 transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="font-telemetry-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Type: Gas Giant</div>
                <h4 className="font-headline-md text-xl text-primary font-bold">{planet.name.toUpperCase()}</h4>
              </div>
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 text-tertiary-fixed-dim">
                <span className="material-symbols-outlined">blur_circular</span>
              </div>
            </div>
            {/* Sparkline SVG */}
            <div className="w-full h-16 mb-6">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 20">
                <path className="text-white/10 orbit-dashed" d="M0,15 L20,12 L40,14 L60,8 L80,10 L100,2" fill="none" stroke="currentColor" strokeWidth="1"></path>
                <path className="text-tertiary-fixed-dim" d="M0,15 L20,12 L40,14 L60,8" fill="none" stroke="currentColor" strokeWidth="2"></path>
                <circle className="text-tertiary-fixed-dim" cx="60" cy="8" fill="currentColor" r="2.5"></circle>
              </svg>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-telemetry-label text-[10px]">ALTITUDE</span>
                <span className="text-primary font-telemetry-value text-sm">{planet.altitude.toFixed(1)}°</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-telemetry-label text-[10px]">MAGNITUDE</span>
                <span className="text-primary font-telemetry-value text-sm">{planet.magnitude}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Moon */}
          <div className="glass-panel rounded-xl p-6 border border-white/5 group hover:border-primary-fixed/30 transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="font-telemetry-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Phase: Gibbous</div>
                <h4 className="font-headline-md text-xl text-primary font-bold">MOON</h4>
              </div>
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 text-primary">
                <span className="material-symbols-outlined">brightness_2</span>
              </div>
            </div>
            {/* Sparkline SVG */}
            <div className="w-full h-16 mb-6">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 20">
                <path className="text-white/10 orbit-dashed" d="M0,5 C30,5 30,15 50,15 C70,15 70,5 100,5" fill="none" stroke="currentColor" strokeWidth="1"></path>
                <path className="text-primary" d="M0,5 C30,5 30,15 50,15" fill="none" stroke="currentColor" stroke-width="2"></path>
                <circle className="text-primary" cx="50" cy="15" fill="currentColor" r="2.5"></circle>
              </svg>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-telemetry-label text-[10px]">ILLUMINATION</span>
                <span className="text-primary font-telemetry-value text-sm">{moon.phase}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-telemetry-label text-[10px]">ALTITUDE</span>
                <span className="text-primary font-telemetry-value text-sm">{moon.altitude}°</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
