import { useEffect } from 'react';

export default function AboutPage() {
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
      <style>{`
        .bloom-primary {
            box-shadow: 0 0 20px rgba(0, 224, 176, 0.2);
        }
        .inner-glow {
            box-shadow: inset 0 0 10px rgba(44, 255, 202, 0.1);
        }
        .broken-stroke {
            stroke-dasharray: 4 2;
        }
        @keyframes pulse-glow {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
        }
        .animate-pulse-glow {
            animation: pulse-glow 3s infinite ease-in-out;
        }
        .hero-gradient {
            background: radial-gradient(circle at 50% 50%, rgba(0, 224, 176, 0.05) 0%, transparent 70%);
        }
      `}</style>

      <main className="pt-12 relative">
        {/* Hero Shader / Scene */}
        <div className="h-[400px] relative overflow-hidden flex flex-col items-center justify-center">
          <div className="absolute inset-0 hero-gradient"></div>
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-margin-safe">
            <span className="font-telemetry-label text-telemetry-label text-primary-fixed tracking-[0.3em] mb-4">OBSERVE. UNDERSTAND. PREDICT.</span>
            <h1 className="font-display-lg text-display-lg md:text-[72px] text-white max-w-4xl leading-tight uppercase">
              The Intelligent Cosmic <span className="text-primary-fixed-dim">Digital Twin</span>
            </h1>
            <p className="font-body-base text-body-base text-on-surface-variant max-w-2xl mt-6 opacity-80">
              A multi-layered orbital simulation engine bridging the gap between raw telemetry and actionable celestial intelligence.
            </p>
          </div>
        </div>

        {/* Narrative Section: The Concept */}
        <section className="px-margin-safe py-24 grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center max-w-7xl mx-auto">
          <div className="lg:col-span-5 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-container/10 border border-primary-fixed/20 rounded">
              <span className="material-symbols-outlined text-[16px] text-primary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>hub</span>
              <span className="font-telemetry-label text-telemetry-label text-primary-fixed">CORE ARCHITECTURE</span>
            </div>
            <h2 className="font-headline-md text-headline-md text-primary">Synchronizing the Universe in Real-Time</h2>
            <p className="font-body-base text-body-base text-on-surface-variant">
              COSMOSCOPE isn't just a visualization tool—it's a living replica of our orbital environment. By ingesting high-frequency NASA data streams and processing them through our custom orbital mechanics engine, we create a high-fidelity "Digital Twin" of the Earth-Moon system.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-panel p-panel-padding rounded-lg">
                <div className="font-telemetry-value text-telemetry-value text-primary-fixed">0.12s</div>
                <div className="font-telemetry-label text-telemetry-label text-on-surface-variant opacity-60">LATENCY</div>
              </div>
              <div className="glass-panel p-panel-padding rounded-lg">
                <div className="font-telemetry-value text-telemetry-value text-primary-fixed">18.4K</div>
                <div className="font-telemetry-label text-telemetry-label text-on-surface-variant opacity-60">ACTIVE OBJECTS</div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7 relative h-[450px]">
            <div className="absolute inset-0 glass-panel rounded-xl overflow-hidden bloom-primary">
              <img 
                className="w-full h-full object-cover" 
                alt="A highly detailed technical diagram of orbital paths surrounding a glowing 3D Earth." 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_xWd_QqViivGHPZS20Pm4m10Os5vaxvwR1-CLvumhcbTKEgOiR3vyoPmkxRfp5_7TGUlDnHwKWE96o0lVfPq8JmsuyFYKLTQdLR3P08Vl2WxKVIFYoC3Bxt3iLPLxzT_rzVx_5dixSj1n5t-nEEyV06lGa1kSz1C3KMhxty3tBCFQ6YeeSvY71mI4D-7Yd9Sh8Tc5N8hpQsinNdMV3XWV6dL3Tjf0uW5dNVx2N-Kvao2QSVji4-KjTfaN9-TGHbbCqQend996Y3k"
              />
              <div className="absolute bottom-6 left-6 flex flex-col gap-2">
                <div className="bg-surface-container-highest/80 backdrop-blur-md px-4 py-2 border-l-2 border-primary-fixed flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary-fixed animate-pulse"></div>
                  <span className="font-telemetry-label text-telemetry-label">STREAMING LIVE TELEMETRY [ALPHA-7]</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid: Tech Stack */}
        <section className="px-margin-safe py-24 bg-surface-container-lowest/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-headline-md text-headline-md text-primary">The Orbital Tech Stack</h2>
              <p className="font-body-base text-body-base text-on-surface-variant mt-2">Precision engineered for massive-scale celestial data.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-4 auto-rows-[180px]">
              {/* CesiumJS Card */}
              <div className="lg:col-span-8 md:row-span-2 glass-panel rounded-xl p-8 flex flex-col justify-between group overflow-hidden relative">
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="material-symbols-outlined text-primary-fixed text-[32px]">language</span>
                    <h3 className="font-headline-md text-headline-md text-primary">CesiumJS</h3>
                  </div>
                  <p className="font-body-base text-body-base text-on-surface-variant max-w-md">
                    Our primary geospatial engine. CesiumJS allows us to render planetary-scale environments with millimeter precision, supporting massive 3D tilesets for terrain and atmospheric modeling.
                  </p>
                </div>
              </div>
              {/* NASA APIs */}
              <div className="lg:col-span-4 md:row-span-2 glass-panel rounded-xl p-8 border-primary-fixed/20 bg-primary-container/5">
                <span className="material-symbols-outlined text-primary-fixed mb-6">rocket</span>
                <h3 className="font-headline-md text-headline-md text-primary mb-4">NASA APIs</h3>
                <p className="font-body-base text-body-base text-on-surface-variant">
                  Direct integration with JPL's Horizons System and the Small-Body Database. We ingest near-real-time orbital elements for over 1.2 million known objects.
                </p>
                <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-telemetry-label text-telemetry-label opacity-60">JPL HORIZONS</span>
                    <span className="font-telemetry-label text-telemetry-label text-primary-fixed">CONNECTED</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-telemetry-label text-telemetry-label opacity-60">SPICE KERNELS</span>
                    <span className="font-telemetry-label text-telemetry-label text-primary-fixed">MOUNTED</span>
                  </div>
                </div>
              </div>
              {/* Three.js Visuals */}
              <div className="lg:col-span-4 md:row-span-1 glass-panel rounded-xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded bg-white/5 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary-fixed">deployed_code</span>
                </div>
                <div>
                  <div className="font-label-caps text-label-caps text-primary">Three.js</div>
                  <div className="font-telemetry-label text-telemetry-label text-on-surface-variant opacity-60">Volumetric Effects</div>
                </div>
              </div>
              {/* Web Workers */}
              <div className="lg:col-span-4 md:row-span-1 glass-panel rounded-xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded bg-white/5 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary-fixed">memory</span>
                </div>
                <div>
                  <div className="font-label-caps text-label-caps text-primary">Multi-threading</div>
                  <div className="font-telemetry-label text-telemetry-label text-on-surface-variant opacity-60">Off-main-thread Physics</div>
                </div>
              </div>
              {/* Predictive ML */}
              <div className="lg:col-span-4 md:row-span-1 glass-panel rounded-xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded bg-white/5 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary-fixed">auto_graph</span>
                </div>
                <div>
                  <div className="font-label-caps text-label-caps text-primary">Predictive ML</div>
                  <div className="font-telemetry-label text-telemetry-label text-on-surface-variant opacity-60">Anomaly Trajectories</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section: AstroWeb */}
        <section className="px-margin-safe py-24 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
            <div className="max-w-xl">
              <h2 className="font-headline-md text-headline-md text-primary">Team AstroWeb</h2>
              <p className="font-body-base text-body-base text-on-surface-variant mt-4">
                The software architect and orbital dynamics designer behind COSMOSCOPE, bringing telemetry visualization to life.
              </p>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="group w-full max-w-[340px]">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-6">
                <img 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  alt="Portrait of S SRISANTOSHI, Team Lead and Project Lead." 
                  src="/Myphoto.jpg"
                  onError={(e) => {
                    e.currentTarget.src = "https://lh3.googleusercontent.com/aida-public/AB6AXuBIHv5Eg0uClpadZd_XSXWa4xXJi3AIRU47SSYVcTqzKd9pTL3zX0RLBM4mj6qryjLvtZRmvYhl8Ohuh2N1nPmaxxVkUsk3rkNkN4TYhISQfDkI5KORw4wqb-MGt7XKkVITpdkOIw8jUd37o-xo0HD3KdzcMTqbRICcXt92fpgKodydLgBtX8YoxQBuLwzf6cgykkPFX1VYS_IZU5YMZ0hNnfXrqP-Org9g7A9qgRqX89YMilJKc8uYym_bW6sJSHuyryiF-rJ_-Fc";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60"></div>
                <div className="absolute bottom-4 left-4">
                  <div className="font-telemetry-label text-telemetry-label text-primary-fixed">TEAM LEAD &amp; PROJECT LEAD</div>
                </div>
              </div>
              <h4 className="font-headline-md text-headline-md text-primary">S SRISANTOSHI</h4>
              <p className="font-telemetry-label text-telemetry-label text-on-surface-variant opacity-60">Orbital Dynamics &amp; Visualization</p>
            </div>
          </div>
        </section>



        {/* Final CTA / Vision */}
        <section className="px-margin-safe py-32 relative overflow-hidden text-center max-w-7xl mx-auto">
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="font-display-lg text-display-lg text-white mb-8">Ready to see the unseen?</h2>
            <p className="font-body-base text-body-base text-on-surface-variant mb-12 opacity-80">
              Join the thousands of scientists, students, and space enthusiasts who use COSMOSCOPE to monitor the pulse of our planet's orbital sphere.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative w-full bg-surface-container-lowest border-t border-white/10 flex flex-col md:flex-row justify-between items-center px-margin-safe py-gutter z-20">
        <div className="font-label-caps text-label-caps text-primary-fixed-dim mb-4 md:mb-0">COSMOSCOPE</div>
        <div className="flex flex-wrap justify-center gap-6 mb-4 md:mb-0">
          <a className="font-telemetry-label text-telemetry-label text-on-surface-variant hover:text-primary-fixed transition-colors" href="#legal">Legal Telemetry</a>
          <a className="font-telemetry-label text-telemetry-label text-on-surface-variant hover:text-primary-fixed transition-colors" href="#privacy">Data Privacy</a>
          <a className="font-telemetry-label text-telemetry-label text-on-surface-variant hover:text-primary-fixed transition-colors" href="#protocol">Orbital Protocol</a>
          <a className="font-telemetry-label text-telemetry-label text-on-surface-variant hover:text-primary-fixed transition-colors" href="#status">System Status</a>
        </div>
        <div className="font-telemetry-label text-telemetry-label text-on-surface-variant opacity-60">
          © 2026 COSMOSCOPE. OBSERVE. UNDERSTAND. PREDICT.
        </div>
      </footer>
    </div>
  );
}
