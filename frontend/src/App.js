import { useState, useEffect, useCallback } from 'react';
import './App.css';
import GlobeMap from './components/GlobeMap';
import Dashboard from './components/Dashboard';
import PlanetPanel from './components/PlanetPanel';
import OrbitalPanel from './components/OrbitalPanel';
import EventsPanel from './components/EventsPanel';
import NarratorPanel from './components/NarratorPanel';
import LeaderboardPanel from './components/LeaderboardPanel';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import MissionPage from './pages/MissionPage';
import ContactPage from './pages/ContactPage';
import NebulaBackground from './components/NebulaBackground';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const NAV_LINKS = [
  { id: 'home',     label: 'Home' },
  { id: 'about',    label: 'About' },
  { id: 'mission',  label: 'Mission & Vision' },
  { id: 'contact',  label: 'Contact' },
];

const SIDEBAR_PAGES = [
  { id: 'globe',     label: 'Coordinates',    icon: 'location_on' },
  { id: 'dashboard', label: 'Real-time Feed', icon: 'sensors' },
  { id: 'sky',       label: 'Object Tracking',icon: 'visibility' },
  { id: 'orbital',   label: 'Orbital Traffic',icon: 'radar' },
  { id: 'events',    label: 'Forecasts',     icon: 'schedule' },
  { id: 'ai',        label: 'AI Narrator',    icon: 'psychology' },
  { id: 'leaderboard', label: 'Leaderboard',  icon: 'workspace_premium' },
];

async function reverseGeocode(lat, lon) {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const d = await r.json();
    const addr = d.address || {};
    return addr.city || addr.town || addr.village || addr.county || addr.country || 'Selected Location';
  } catch {
    return 'Selected Location';
  }
}

export default function App() {
  const [page, setPage] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);

  // Explorer state
  const [selectedLocation, setSelectedLocation] = useState({ lat: 13.0827, lon: 80.2707, name: 'Chennai, IN' });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [cosmicData, setCosmicData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [issPosition, setIssPosition] = useState(null);
  const [error, setError] = useState(null);

  // Poll ISS every 10s
  useEffect(() => {
    const fetchISS = () =>
      fetch(`${API}/api/iss`)
        .then((r) => r.json())
        .then(setIssPosition)
        .catch(() => {});
    fetchISS();
    const id = setInterval(fetchISS, 10000);
    return () => clearInterval(id);
  }, []);

  // Fetch cosmic data helper
  const fetchCosmicData = useCallback(async (lat, lon, name, dateObj) => {
    setLoading(true);
    setError(null);
    try {
      const dateStr = dateObj ? `&date=${encodeURIComponent(dateObj.toISOString())}` : '';
      const r = await fetch(
        `${API}/api/cosmic-data?lat=${lat}&lon=${lon}&name=${encodeURIComponent(name)}${dateStr}`
      );
      if (!r.ok) throw new Error('API error');
      const d = await r.json();
      setCosmicData(d);
    } catch {
      setError('Failed to fetch cosmic data. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  // Trigger fetch when location or date changes
  useEffect(() => {
    if (selectedLocation) {
      fetchCosmicData(selectedLocation.lat, selectedLocation.lon, selectedLocation.name, selectedDate);
    }
  }, [selectedLocation, selectedDate, fetchCosmicData]);

  // Scroll to top on page change
  useEffect(() => { window.scrollTo(0, 0); }, [page]);

  const navigate = (p) => { setPage(p); setMenuOpen(false); };

  const handleLocationSelect = useCallback(async (lat, lon) => {
    const name = await reverseGeocode(lat, lon);
    setSelectedLocation({ lat, lon, name });
  }, []);

  const renderPageContent = () => {
    // If loading first time and not map/home
    if (loading && !cosmicData && page !== 'home' && page !== 'globe') {
      return (
        <div className="loading-panel">
          <div className="spinner" />
          <span>Scanning the cosmos...</span>
        </div>
      );
    }
    if (error && page !== 'home' && page !== 'globe') {
      return (
        <div className="loading-panel">
          <span style={{ fontSize: '2rem' }}>⚠️</span>
          <span style={{ color: 'var(--warn)', textAlign: 'center', fontSize: '0.82rem' }}>{error}</span>
        </div>
      );
    }

    switch (page) {
      case 'home':
        return <HomePage onExplore={() => navigate('globe')} />;
      case 'about':
        return <AboutPage />;
      case 'mission':
        return <MissionPage />;
      case 'contact':
        return <ContactPage />;
      case 'globe':
        return (
          <div className="globe-page-container">
            <GlobeMap
              onLocationSelect={handleLocationSelect}
              selectedLocation={selectedLocation}
              issPosition={issPosition}
            />
            {/* Coordinates HUD Overlay */}
            <div className="hud-coords-panel glass-panel premium-border">
              <div className="hud-header">
                <span className="material-symbols-outlined font-icon">explore</span>
                <span className="font-telemetry font-bold">POSITIONING</span>
              </div>
              <div className="hud-body">
                {selectedLocation ? (
                  <>
                    <p className="hud-location-name">📍 {selectedLocation.name}</p>
                    <div className="hud-coord-row">
                      <span className="font-telemetry text-muted">LAT:</span>
                      <span className="font-telemetry font-bold">{selectedLocation.lat.toFixed(4)}° {selectedLocation.lat >= 0 ? 'N' : 'S'}</span>
                    </div>
                    <div className="hud-coord-row">
                      <span className="font-telemetry text-muted">LON:</span>
                      <span className="font-telemetry font-bold">{selectedLocation.lon.toFixed(4)}° {selectedLocation.lon >= 0 ? 'E' : 'W'}</span>
                    </div>
                  </>
                ) : (
                  <p className="hud-no-location">No location selected</p>
                )}
                {loading && (
                  <div className="hud-loading-bar">
                    <span className="spinner-mini"></span>
                    <span className="font-telemetry text-xs text-accent">Synchronizing node...</span>
                  </div>
                )}
              </div>
              <div className="hud-divider"></div>
              <div className="hud-footer">
                <div className="flex-align-center gap-2">
                  <div className="active-ping-dot"></div>
                  <span className="font-display text-accent text-xs font-bold uppercase tracking-wider">Active Observation</span>
                </div>
                <p className="hud-desc text-muted">Click anywhere on the globe to set a new observation node and synchronize telemetry.</p>
              </div>
            </div>

            {/* Click to Explore Prompt */}
            {!selectedLocation && (
              <div className="click-explore-prompt">
                <div className="click-prompt-icon-wrap">
                  <span className="material-symbols-outlined">ads_click</span>
                </div>
                <span className="font-display text-accent tracking-widest uppercase">Click to Explore</span>
              </div>
            )}

            {/* Mini CSAI Gauge (Bottom Right) */}
            {cosmicData && (
              <div className="hud-csai-panel glass-panel premium-border">
                <div className="flex-between mb-4">
                  <span className="font-display font-bold text-xs uppercase text-muted">CSAI Index</span>
                  <span className="badge badge-stable font-telemetry text-[10px]">STABLE</span>
                </div>
                <div className="flex-align-center gap-6">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="hud-gauge-svg">
                      <circle className="hud-gauge-track" cx="32" cy="32" r="28" />
                      <circle 
                        className="hud-gauge-fill" 
                        cx="32" 
                        cy="32" 
                        r="28" 
                        strokeDasharray={2 * Math.PI * 28} 
                        strokeDashoffset={2 * Math.PI * 28 - (cosmicData.csai / 100) * 2 * Math.PI * 28}
                      />
                    </svg>
                    <span className="hud-gauge-val font-telemetry font-bold">{cosmicData.csai}</span>
                  </div>
                  <div>
                    <span className="text-muted text-[10px] uppercase font-telemetry">Collision Risk</span>
                    <span className="font-telemetry font-bold block text-sm">Low (0.003%)</span>
                    <div className="flex gap-1 mt-1">
                      <span className="bar-indicator active"></span>
                      <span className="bar-indicator active"></span>
                      <span className="bar-indicator active"></span>
                      <span className="bar-indicator"></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'dashboard':
        return cosmicData ? <Dashboard data={cosmicData} /> : null;
      case 'sky':
        return cosmicData ? <PlanetPanel planets={cosmicData.planets} moon={cosmicData.moon} /> : null;
      case 'orbital':
        return cosmicData ? <OrbitalPanel satellites={cosmicData.satellites} iss={cosmicData.iss} data={cosmicData} /> : null;
      case 'events':
        return cosmicData ? <EventsPanel events={cosmicData.events} /> : null;
      case 'ai':
        return cosmicData ? <NarratorPanel narrative={cosmicData.narrative} csai={cosmicData.csai} csai_breakdown={cosmicData.csai_breakdown} light_pollution={cosmicData.light_pollution} events={cosmicData.events} weather={cosmicData.weather} space_weather={cosmicData.space_weather} space_risk={cosmicData.space_risk} photography_advisor={cosmicData.photography_advisor} cosmicData={cosmicData} /> : null;
      case 'leaderboard':
        return <LeaderboardPanel onSelectCity={(lat, lon, name) => { setSelectedLocation({ lat, lon, name }); navigate('globe'); }} />;
      default:
        return null;
    }
  };

  const isMarketingPage = ['home', 'about', 'mission', 'contact'].includes(page);

  return (
    <div className="app">
      <NebulaBackground />

      {/* ── TOP NAV BAR (HEADER) ── */}
      <header className="app-header">
        <div className="header-left">
          <button className="logo-container" onClick={() => navigate('home')}>
            <span className="logo-icon">🔭</span>
            <div>
              <span className="logo-name">COSMOSCOPE</span>
              <span className="logo-tag">Observe · Understand · Predict</span>
            </div>
          </button>
        </div>

        <nav className="header-nav hidden md:flex">
          {NAV_LINKS.map((n) => (
            <button
              key={n.id}
              className={`header-nav-link${page === n.id ? ' active' : ''}`}
              onClick={() => navigate(n.id)}
            >
              {n.label}
            </button>
          ))}
        </nav>

        <div className="header-right">
          {!isMarketingPage && (
            <div className="location-badge hidden sm:flex">
              <span className="material-symbols-outlined badge-icon">location_on</span>
              <span className="font-telemetry">{selectedLocation ? selectedLocation.name.toUpperCase() : 'SELECTING NODE...'}</span>
            </div>
          )}

          {!isMarketingPage && (
            <button className="hamburger lg:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              <span /><span /><span />
            </button>
          )}
        </div>
      </header>

      {/* ── SIDE NAV BAR (ASIDE) ── */}
      {!isMarketingPage && (
        <aside className={`app-sidebar${menuOpen ? ' open' : ''}`}>
          <div className="sidebar-header">
            <div className="sidebar-logo-box">
              <span className="material-symbols-outlined logo-symbol" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            </div>
            <div className="sidebar-header-text">
              <h3>AI NARRATOR</h3>
              <p>{loading ? 'Scanning Horizon...' : 'Orbital Analysis Active'}</p>
            </div>
          </div>

          <nav className="sidebar-nav">
            {SIDEBAR_PAGES.map((p) => (
              <button
                key={p.id}
                className={`sidebar-link${page === p.id ? ' active' : ''}`}
                onClick={() => navigate(p.id)}
              >
                <span className="material-symbols-outlined link-icon">{p.icon}</span>
                <span className="link-text">{p.label}</span>
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="sidebar-footer-links">
              <a href="#support" className="sidebar-foot-link">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>help</span> Support
              </a>
              <a href="#docs" className="sidebar-foot-link">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>description</span> Docs
              </a>
            </div>
          </div>
        </aside>
      )}

      {/* ── MAIN CONTENT AREA ── */}
      <main className={`main-content${isMarketingPage ? ' full-width' : ''}`}>
        {!isMarketingPage && (
          <TimeTravelPortal selectedDate={selectedDate} onChangeDate={setSelectedDate} />
        )}
        {renderPageContent()}
      </main>
    </div>
  );
}

// ── TimeTravelPortal Component ──
function TimeTravelPortal({ selectedDate, onChangeDate }) {
  const dates = [
    { label: 'Yesterday', getDate: () => { const d = new Date(); d.setDate(d.getDate() - 1); return d; } },
    { label: 'Today', getDate: () => new Date() },
    { label: 'Tomorrow', getDate: () => { const d = new Date(); d.setDate(d.getDate() + 1); return d; } },
    { label: 'Next Week', getDate: () => { const d = new Date(); d.setDate(d.getDate() + 7); return d; } },
  ];

  const getActiveButton = () => {
    const todayStr = new Date().toDateString();
    const selStr = selectedDate.toDateString();

    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(); nextWeek.setDate(nextWeek.getDate() + 7);

    if (selStr === todayStr) return 'Today';
    if (selStr === yesterday.toDateString()) return 'Yesterday';
    if (selStr === tomorrow.toDateString()) return 'Tomorrow';
    if (selStr === nextWeek.toDateString()) return 'Next Week';
    return 'Custom';
  };

  const active = getActiveButton();

  return (
    <div className="time-travel-portal glass-panel premium-border" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', borderRadius: '16px', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span className="material-symbols-outlined portal-icon animate-pulse" style={{ color: 'var(--accent)' }}>history_toggle_off</span>
        <span className="font-display" style={{ fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '0.1em', color: 'var(--accent)' }}>TEMPORAL DIGITAL TWIN</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {dates.map((d) => (
          <button
            key={d.label}
            onClick={() => onChangeDate(d.getDate())}
            className={`portal-btn font-telemetry`}
            style={{
              padding: '6px 12px',
              fontSize: '0.72rem',
              borderRadius: '8px',
              cursor: 'pointer',
              border: active === d.label ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.06)',
              background: active === d.label ? 'rgba(0, 255, 200, 0.1)' : 'rgba(255,255,255,0.02)',
              color: active === d.label ? 'var(--accent)' : 'var(--muted)',
              transition: 'all 0.2s'
            }}
          >
            {d.label}
          </button>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '8px', border: active === 'Custom' ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--muted)' }}>calendar_month</span>
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => {
              if (e.target.value) {
                onChangeDate(new Date(e.target.value));
              }
            }}
            style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.72rem', outline: 'none', cursor: 'pointer' }}
          />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span className="font-telemetry text-muted" style={{ fontSize: '0.72rem' }}>Observation Horizon:</span>
        <span className="font-telemetry font-bold text-white" style={{ fontSize: '0.72rem', textShadow: '0 0 10px rgba(255,255,255,0.2)' }}>
          {selectedDate.toLocaleString('en-US', { dateStyle: 'medium' })}
        </span>
      </div>
    </div>
  );
}
