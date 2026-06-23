import React from 'react';

export default function EventsPanel({ events }) {
  const formattedEvents = events && events.length > 0 ? events : [
    { type: 'ISS Flyover', detail: 'Visible: 4m 30s · Max Elevation: 68°', icon: '🛸', time: '2026-06-23 21:55 UTC' },
    { type: 'Perseids Meteor Shower Peak', detail: 'Peak activity expected with 100+ meteors/hr', icon: '☄️', time: '2026-06-24 Peak Night' },
    { type: 'Planetary Conjunction', detail: 'Venus & Mars alignment in eastern sky', icon: '🪐', time: '2026-06-26 19:30 UTC' }
  ];

  // Group events by date label
  const getGroupedEvents = () => {
    const groups = {};
    formattedEvents.forEach((evt) => {
      let dateLabel = 'Upcoming';
      if (evt.time) {
        try {
          const datePart = evt.time.split(' ')[0]; // Get "YYYY-MM-DD"
          const d = new Date(datePart);
          if (!isNaN(d.getTime())) {
            const today = new Date();
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            if (d.toDateString() === today.toDateString()) {
              dateLabel = 'Today';
            } else if (d.toDateString() === tomorrow.toDateString()) {
              dateLabel = 'Tomorrow';
            } else {
              dateLabel = d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
            }
          } else {
            dateLabel = evt.time;
          }
        } catch (e) {
          dateLabel = evt.time;
        }
      }
      if (!groups[dateLabel]) {
        groups[dateLabel] = [];
      }
      groups[dateLabel].push(evt);
    });
    return groups;
  };

  const grouped = getGroupedEvents();

  return (
    <div className="dashboard-content animate-fade-in-up">
      {/* ── HEADER ── */}
      <div className="dashboard-header-bar">
        <div>
          <span className="font-telemetry text-primary-fixed/60 text-xs uppercase tracking-[0.2em]">7-Day Forecast Hub</span>
          <h1 className="node-title font-display uppercase">Cosmic Predictions Calendar</h1>
        </div>
      </div>

      {/* ── MAIN AREA ── */}
      <div className="glass-panel rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, rgba(17,19,29,0.5), rgba(25,27,38,0.3))' }}>
        <h3 className="font-display text-lg mb-6">Upcoming Predictive Timeline</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {Object.keys(grouped).map((dateLabel, groupIdx) => (
            <div key={dateLabel} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Group Day Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="font-display" style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--accent)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {dateLabel}
                </span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(0, 255, 200, 0.15)' }} />
              </div>

              {/* Events under this day */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '8px' }}>
                {grouped[dateLabel].map((evt, idx) => (
                  <div 
                    key={idx} 
                    className="glass-panel p-4 rounded-xl premium-border" 
                    style={{ 
                      position: 'relative', 
                      paddingLeft: '56px',
                      background: 'rgba(255, 255, 255, 0.01)',
                      borderColor: 'rgba(255, 255, 255, 0.06)'
                    }}
                  >
                    {/* Bullet / icon container */}
                    <div 
                      style={{ 
                        position: 'absolute', 
                        left: 12, 
                        top: '50%', 
                        transform: 'translateY(-50%)',
                        width: 32, 
                        height: 32, 
                        borderRadius: '50%', 
                        background: 'var(--bg)', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.1rem',
                        zIndex: 2
                      }}
                    >
                      {evt.icon}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <h4 className="font-display text-sm font-semibold" style={{ color: '#fff' }}>{evt.type}</h4>
                        <p className="text-xs text-on-surface-variant/70 mt-1 leading-relaxed">{evt.detail}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-telemetry text-[10px] font-semibold px-2.5 py-0.5 glass-panel rounded-full" style={{ color: 'var(--muted)', borderColor: 'rgba(255,255,255,0.05)' }}>
                          {evt.time ? evt.time.split(' ').slice(1).join(' ') || 'All Day' : 'All Day'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
