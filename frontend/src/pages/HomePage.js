import { useEffect } from 'react';

export default function HomePage({ onExplore }) {
  useEffect(() => {
    const panels = document.querySelectorAll('.glass-panel');
    const handleMouseMove = (e) => {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const xc = rect.width / 2;
      const yc = rect.height / 2;
      const dx = x - xc;
      const dy = y - yc;
      
      card.style.transform = `perspective(1000px) rotateY(${dx / 50}deg) rotateX(${-dy / 50}deg)`;
    };
    const handleMouseLeave = (e) => {
      const card = e.currentTarget;
      card.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg)`;
    };

    panels.forEach(card => {
      card.addEventListener('mousemove', handleMouseMove);
      card.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      panels.forEach(card => {
        card.removeEventListener('mousemove', handleMouseMove);
        card.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  return (
    <div className="font-body-base text-body-base bg-background selection:bg-primary-container selection:text-on-primary-container min-h-screen">
      {/* Additional inline styles specifically needed for the animations/marquees */}
      <style>{`
        .glow-accent {
            box-shadow: 0 0 20px rgba(0, 224, 176, 0.15);
        }
        .text-glow {
            text-shadow: 0 0 10px rgba(44, 255, 202, 0.4);
        }
        .orbit-container {
            mask-image: radial-gradient(circle at center, black 40%, transparent 100%);
        }
        .broken-stroke {
            clip-path: polygon(0% 0%, 90% 0%, 90% 10%, 100% 10%, 100% 100%, 0% 100%, 0% 20%, 5% 20%, 5% 5%, 0% 5%);
        }
        @keyframes pulse-slow {
            0%, 100% { opacity: 0.8; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.02); }
        }
        .animate-pulse-slow {
            animation: pulse-slow 4s infinite ease-in-out;
        }
        @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        .animate-marquee {
            animation: marquee 30s linear infinite;
        }
      `}</style>

      <main className="relative z-10 pt-12">
        {/* Hero Section */}
        <section className="relative min-h-[80vh] flex flex-col items-center justify-center px-margin-safe overflow-hidden">
          <div className="relative z-10 text-center max-w-5xl">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1 rounded-full bg-primary-container/10 border border-primary-container/20">
              <span className="material-symbols-outlined text-[14px] text-primary-fixed animate-pulse">radar</span>
              <span className="font-telemetry-label text-telemetry-label text-primary-fixed uppercase">System Status: Active</span>
            </div>
            <h1 className="font-display-lg text-display-lg-mobile lg:text-[110px] lg:leading-[0.9] text-primary mb-8 tracking-tighter uppercase text-glow">
              OBSERVE.<br />UNDERSTAND.<br />PREDICT.
            </h1>
            <p className="font-body-base text-body-base text-on-surface-variant max-w-2xl mx-auto mb-12 opacity-80">
              Harness the power of planetary-scale telemetry. Our orbital intelligence platform provides high-fidelity simulations and predictive analytics for the next generation of space exploration.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button 
                onClick={onExplore}
                className="w-full sm:w-auto px-10 py-4 bg-primary-fixed text-on-primary-fixed font-headline-md text-[18px] rounded-lg shadow-lg hover:shadow-primary-fixed/20 transition-all duration-300 active:scale-95"
              >
                Initiate Sequence
              </button>
              <button 
                onClick={onExplore}
                className="w-full sm:w-auto px-10 py-4 border border-white/20 glass-panel font-headline-md text-[18px] text-primary rounded-lg hover:bg-white/5 transition-all duration-300"
              >
                View Live Telemetry
              </button>
            </div>
          </div>
          {/* Scroll Indicator Telemetry */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
            <span className="font-telemetry-label text-telemetry-label text-on-surface-variant/40 rotate-90 mb-4 tracking-[0.3em]">SCROLL</span>
            <div className="w-[1px] h-16 bg-gradient-to-b from-primary-fixed to-transparent"></div>
          </div>
        </section>

        {/* Bento Grid / Intelligence Dimensions */}
        <section className="py-24 px-margin-safe max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="font-headline-md text-headline-md text-primary mb-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-fixed">query_stats</span>
              Intelligence Dimensions
            </h2>
            <div className="w-24 h-[2px] bg-primary-fixed"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
            {/* Large Feature Card */}
            <div className="md:col-span-8 group glass-panel rounded-xl p-panel-padding relative overflow-hidden flex flex-col justify-between min-h-[400px] transition-transform duration-300">
              <div className="absolute top-0 right-0 p-gutter opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
              </div>
              <div>
                <span className="font-telemetry-label text-telemetry-label text-primary-fixed-dim uppercase mb-2 block">Dimension 01</span>
                <h3 className="font-headline-md text-headline-md text-primary mb-4">Orbital Trajectory Synthesis</h3>
                <p className="text-on-surface-variant max-w-md">Predictive modeling of satellite paths and celestial body interactions using quantum-resilient algorithms. Real-time adjustment for atmospheric drag and solar radiation pressure.</p>
              </div>
              <div className="flex items-end justify-between mt-8">
                <div className="space-y-1">
                  <div className="font-telemetry-label text-telemetry-label text-on-surface-variant/50">SIMULATION ACCURACY</div>
                  <div className="font-telemetry-value text-telemetry-value text-primary-fixed">99.982%</div>
                </div>
                <div className="w-32 h-32 relative">
                  <div className="absolute inset-0 border-4 border-primary-fixed/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-primary-fixed rounded-full rotate-45"></div>
                  <div className="absolute inset-0 flex items-center justify-center font-telemetry-value text-primary-fixed">72%</div>
                </div>
              </div>
            </div>

            {/* Vertical Feature Card */}
            <div className="md:col-span-4 glass-panel rounded-xl p-panel-padding flex flex-col border-l-4 border-l-secondary transition-transform duration-300">
              <span className="font-telemetry-label text-telemetry-label text-secondary mb-2 block uppercase">Dimension 02</span>
              <h3 className="font-headline-md text-headline-md text-primary mb-6">Spectral Analysis</h3>
              <div className="flex-grow space-y-6">
                <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                  <div className="flex justify-between mb-2">
                    <span className="font-telemetry-label text-telemetry-label text-on-surface-variant">OXYGEN SENSOR</span>
                    <span className="font-telemetry-label text-telemetry-label text-primary-fixed">NOMINAL</span>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="w-[85%] h-full bg-primary-fixed"></div>
                  </div>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                  <div className="flex justify-between mb-2">
                    <span className="font-telemetry-label text-telemetry-label text-on-surface-variant">NITROGEN LVL</span>
                    <span className="font-telemetry-label text-telemetry-label text-primary-fixed">OPTIMAL</span>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="w-[62%] h-full bg-primary-fixed"></div>
                  </div>
                </div>
              </div>
              <p className="text-on-surface-variant text-sm mt-6">Deep-scan atmospheric composition analysis across 14 spectral bands in real-time.</p>
            </div>

            {/* Bottom Row Cards */}
            <div className="md:col-span-4 glass-panel rounded-xl p-panel-padding relative group overflow-hidden transition-transform duration-300">
              <div className="absolute inset-0 opacity-20 group-hover:scale-110 transition-transform duration-700 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA-bKbJaEW4p1y2ZI2Q3O0D0xRjLEi43XWL8QoN4Qou99fvLQtE4J_wG5KBJtcSHLNwAt0Qg6y6npv56lSsYe-yAX9HHbrlZx60_VEZIL1TR32lUW2puw5i5R48t1mEElKK0GAMIHQXjDj0RBlmsKqo52c2iwkR7ZCIm7nJi1tD-Vg3-6bLEE2OYSEBPTjNTurGBMdQmfPMV11WLqQPZt4RW_jj8SxNPY_XhIOlCpTEqHcgdQOllcRhfKu8rEZ12NkWVtQAAI9dlgw')" }}></div>
              <div className="relative z-10 h-full flex flex-col justify-between min-h-[200px]">
                <span className="material-symbols-outlined text-primary-fixed">monitoring</span>
                <div>
                  <h4 className="font-headline-md text-[20px] text-primary mb-2">Quantum Telemetry</h4>
                  <p className="text-on-surface-variant text-sm">Latency-free data streaming from orbital arrays to ground-based terminal hubs.</p>
                </div>
              </div>
            </div>

            <div className="md:col-span-8 glass-panel rounded-xl p-panel-padding flex items-center justify-between overflow-hidden transition-transform duration-300">
              <div className="max-w-md">
                <span className="font-telemetry-label text-telemetry-label text-primary-fixed-dim mb-2 block uppercase">Dimension 03</span>
                <h4 className="font-headline-md text-headline-md text-primary mb-2">Planetary Awareness Index</h4>
                <p className="text-on-surface-variant">Aggregated global sensing nodes providing a real-time health index of the planetary biosphere.</p>
              </div>
              <div className="hidden lg:flex flex-col items-end gap-2">
                <div className="font-telemetry-value text-[48px] text-primary-fixed leading-none">8.4</div>
                <div className="font-telemetry-label text-telemetry-label text-on-surface-variant uppercase">CSAI GLOBAL RATING</div>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Data Strip */}
        <section className="bg-surface-container-lowest/80 backdrop-blur-md border-y border-white/5 py-8 overflow-hidden">
          <div className="flex whitespace-nowrap gap-12 animate-marquee">
            {/* Repeating telemetry stream */}
            <div className="flex items-center gap-12 shrink-0">
              <div className="flex items-center gap-3">
                <span className="font-telemetry-label text-telemetry-label text-on-surface-variant/40 uppercase">ORBIT_ALT:</span>
                <span className="font-telemetry-value text-telemetry-value text-primary-fixed">408.22 KM</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-telemetry-label text-telemetry-label text-on-surface-variant/40 uppercase">VELOCITY:</span>
                <span className="font-telemetry-value text-telemetry-value text-primary-fixed">7.66 KM/S</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-telemetry-label text-telemetry-label text-on-surface-variant/40 uppercase">INCLINATION:</span>
                <span className="font-telemetry-value text-telemetry-value text-primary-fixed">51.64°</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-telemetry-label text-telemetry-label text-on-surface-variant/40 uppercase">SIGNAL_STRENGTH:</span>
                <span className="font-telemetry-value text-telemetry-value text-primary-fixed">-94 DBM</span>
              </div>
            </div>
            {/* Duplicate for seamless loop */}
            <div className="flex items-center gap-12 shrink-0">
              <div className="flex items-center gap-3">
                <span className="font-telemetry-label text-telemetry-label text-on-surface-variant/40 uppercase">ORBIT_ALT:</span>
                <span className="font-telemetry-value text-telemetry-value text-primary-fixed">408.22 KM</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-telemetry-label text-telemetry-label text-on-surface-variant/40 uppercase">VELOCITY:</span>
                <span className="font-telemetry-value text-telemetry-value text-primary-fixed">7.66 KM/S</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-telemetry-label text-telemetry-label text-on-surface-variant/40 uppercase">INCLINATION:</span>
                <span className="font-telemetry-value text-telemetry-value text-primary-fixed">51.64°</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-telemetry-label text-telemetry-label text-on-surface-variant/40 uppercase">SIGNAL_STRENGTH:</span>
                <span className="font-telemetry-value text-telemetry-value text-primary-fixed">-94 DBM</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative w-full bg-surface-container-lowest border-t border-white/10 flex flex-col md:flex-row justify-between items-center px-margin-safe py-gutter z-20">
        <div className="flex flex-col items-center md:items-start gap-2 mb-8 md:mb-0">
          <span className="font-label-caps text-label-caps text-primary-fixed-dim uppercase tracking-widest">COSMOSCOPE</span>
          <span className="font-telemetry-label text-telemetry-label text-on-surface-variant opacity-60">© 2026 COSMOSCOPE. OBSERVE. UNDERSTAND. PREDICT.</span>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          <a className="font-telemetry-label text-telemetry-label text-on-surface-variant hover:text-primary-fixed transition-colors" href="#legal">Legal Telemetry</a>
          <a className="font-telemetry-label text-telemetry-label text-on-surface-variant hover:text-primary-fixed transition-colors" href="#privacy">Data Privacy</a>
          <a className="font-telemetry-label text-telemetry-label text-on-surface-variant hover:text-primary-fixed transition-colors" href="#protocol">Orbital Protocol</a>
          <a className="font-telemetry-label text-telemetry-label text-on-surface-variant hover:text-primary-fixed transition-colors" href="#status">System Status</a>
        </div>
      </footer>
    </div>
  );
}
