import { useState, useEffect } from 'react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export default function LeaderboardPanel({ onSelectCity }) {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/leaderboard`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load leaderboard');
        return res.json();
      })
      .then((data) => {
        setCities(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="dashboard-content animate-fade-in-up">
      {/* ── HEADER ── */}
      <div className="dashboard-header-bar">
        <div>
          <span className="font-telemetry text-primary-fixed/60 text-xs uppercase tracking-[0.2em]">Global Standings</span>
          <h1 className="node-title font-display uppercase">Cosmic Observation Rankings</h1>
        </div>
      </div>

      {loading ? (
        <div className="loading-panel">
          <div className="spinner" />
          <span>Syncing global nodes...</span>
        </div>
      ) : error ? (
        <div className="loading-panel">
          <span style={{ fontSize: '2rem' }}>⚠️</span>
          <span style={{ color: 'var(--warn)', fontSize: '0.82rem' }}>{error}</span>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, rgba(17,19,29,0.5), rgba(25,27,38,0.3))' }}>
          <h3 className="font-display text-lg mb-6">Top Astronomical Observatories Today</h3>
          
          <div style={{ overflowX: 'auto' }}>
            <table className="leaderboard-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Rank</th>
                  <th style={{ padding: '12px 16px' }}>City / Location</th>
                  <th style={{ padding: '12px 16px' }}>Coordinates</th>
                  <th style={{ padding: '12px 16px' }}>Bortle Scale</th>
                  <th style={{ padding: '12px 16px' }}>Cloud Cover</th>
                  <th style={{ padding: '12px 16px' }}>CSAI Score</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cities.map((city, idx) => {
                  const scoreColor = city.csai >= 80 ? 'var(--accent)' : city.csai >= 60 ? 'var(--accent2)' : 'var(--warn)';
                  return (
                    <tr 
                      key={city.name} 
                      style={{ 
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        background: idx === 0 ? 'rgba(0, 255, 200, 0.01)' : 'transparent',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = idx === 0 ? 'rgba(0, 255, 200, 0.01)' : 'transparent'}
                    >
                      <td style={{ padding: '16px', fontWeight: 'bold', color: idx < 3 ? 'var(--accent)' : 'inherit' }}>
                        {idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : `${idx + 1}`}
                      </td>
                      <td style={{ padding: '16px', fontWeight: 'semibold' }}>{city.name}</td>
                      <td style={{ padding: '16px', fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--muted)' }}>
                        {city.lat.toFixed(2)}°, {city.lon.toFixed(2)}°
                      </td>
                      <td style={{ padding: '16px' }}>Class {city.bortle}</td>
                      <td style={{ padding: '16px' }}>{city.cloud_cover}%</td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: scoreColor, fontWeight: 'bold', width: '32px' }}>{city.csai}</span>
                          <div style={{ flex: 1, minWidth: '60px', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `${city.csai}%`, height: '100%', background: scoreColor, borderRadius: '2px' }} />
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <button 
                          onClick={() => onSelectCity(city.lat, city.lon, city.name)}
                          style={{ 
                            padding: '6px 12px', 
                            fontSize: '0.72rem', 
                            borderRadius: '8px', 
                            border: '1px solid rgba(0, 255, 200, 0.2)', 
                            background: 'rgba(0, 255, 200, 0.05)', 
                            color: 'var(--accent)', 
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = 'var(--bg)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0, 255, 200, 0.05)'; e.currentTarget.style.color = 'var(--accent)'; }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>travel_explore</span>
                          Fly To
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
