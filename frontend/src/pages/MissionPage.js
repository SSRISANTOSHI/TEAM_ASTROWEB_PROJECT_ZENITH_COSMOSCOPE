import { useEffect } from 'react';

export default function MissionPage() {
  useEffect(() => {
    // Mouse move tilt effect for cards
    const panels = document.querySelectorAll('.glass-panel');
    const handleMouseMove = (e) => {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const moveX = (x - centerX) / 30;
      const moveY = (y - centerY) / 30;
      
      card.style.transform = `perspective(1000px) rotateX(${-moveY}deg) rotateY(${moveX}deg)`;
    };
    const handleMouseLeave = (e) => {
      const card = e.currentTarget;
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
    };

    panels.forEach(card => {
      card.addEventListener('mousemove', handleMouseMove);
      card.addEventListener('mouseleave', handleMouseLeave);
    });

    // Intersection observer for roadmap reveal animations
    const observerOptions = { threshold: 0.2 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100');
          entry.target.classList.remove('opacity-0', 'translate-y-10');
        }
      });
    }, observerOptions);

    const sections = document.querySelectorAll('.roadmap-reveal-section');
    sections.forEach(section => {
      section.classList.add('transition-all', 'duration-1000', 'opacity-0', 'translate-y-10');
      observer.observe(section);
    });

    return () => {
      panels.forEach(card => {
        card.removeEventListener('mousemove', handleMouseMove);
        card.removeEventListener('mouseleave', handleMouseLeave);
      });
      sections.forEach(section => {
        observer.unobserve(section);
      });
    };
  }, []);

  return (
    <div className="font-body-base text-body-base bg-background selection:bg-primary-container selection:text-on-primary-container min-h-screen">
      <style>{`
        .roadmap-line {
            background: linear-gradient(to bottom, #00e0b0, #7000ff, #ff3d00);
            width: 2px;
            box-shadow: 0 0 15px #00e0b0;
        }
        .glow-text {
            text-shadow: 0 0 20px rgba(0, 224, 176, 0.5);
        }
        .bento-grid {
            display: grid;
            grid-template-columns: repeat(12, 1fr);
            gap: 24px;
        }
        @keyframes pulse-glow {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
        }
        .animate-glow {
            animation: pulse-glow 3s infinite ease-in-out;
        }
      `}</style>

      <main className="pt-12 pb-24 px-margin-safe max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="max-w-5xl mx-auto text-center mb-32">
          <div className="font-label-caps text-label-caps text-primary-fixed mb-6 tracking-[0.3em] uppercase">The Future of Celestial Intelligence</div>
          <h1 className="font-display-lg text-display-lg md:text-[72px] leading-tight mb-8 glow-text uppercase">
            Observe. Understand.<br />
            <span className="text-primary-fixed">Predict.</span>
          </h1>
          <p className="font-body-base text-body-base text-on-surface-variant max-w-2xl mx-auto opacity-80">
            Bridging the gap between high-fidelity aerospace telemetry and visionary planetary intelligence. Our mission is to secure the orbital frontier through predictive analytics.
          </p>
        </section>

        {/* Immersive Roadmap Visualization */}
        <section className="relative max-w-6xl mx-auto py-24 mb-40">
          <div className="absolute left-1/2 -translate-x-1/2 h-full roadmap-line opacity-30 hidden md:block"></div>
          <div className="space-y-32 relative">
            {/* Stage 1: Raw Telemetry */}
            <div className="flex flex-col md:flex-row items-center gap-12 roadmap-reveal-section">
              <div className="flex-1 md:text-right">
                <div className="font-telemetry-label text-telemetry-label text-primary-fixed mb-2">PHASE_01 // ACQUISITION</div>
                <h3 className="font-headline-md text-headline-md text-primary mb-4">Raw Telemetry</h3>
                <p className="text-on-surface-variant opacity-70">Harvesting millions of data points from diverse orbital arrays and deep-space sensors.</p>
              </div>
              <div className="w-16 h-16 rounded-full glass-panel flex items-center justify-center z-10 border-primary-fixed/50">
                <span className="material-symbols-outlined text-primary-fixed text-3xl">sensors</span>
              </div>
              <div className="flex-1">
                <div className="glass-panel p-6 rounded-xl border-white/5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="font-telemetry-label text-[10px] text-on-surface-variant/60 uppercase">Stream Rate</div>
                      <div className="font-telemetry-value text-telemetry-value text-primary-fixed">14.2 GB/s</div>
                    </div>
                    <div>
                      <div className="font-telemetry-label text-[10px] text-on-surface-variant/60 uppercase">Active Nodes</div>
                      <div className="font-telemetry-value text-telemetry-value text-primary-fixed">1,024</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stage 2: Processing */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12 roadmap-reveal-section">
              <div className="flex-1 text-left">
                <div className="font-telemetry-label text-telemetry-label text-secondary-fixed mb-2">PHASE_02 // COGNITION</div>
                <h3 className="font-headline-md text-headline-md text-primary mb-4">Neural Synthesis</h3>
                <p className="text-on-surface-variant opacity-70">Filtering noise from signal using proprietary orbital mechanics AI models.</p>
              </div>
              <div className="w-16 h-16 rounded-full glass-panel flex items-center justify-center z-10 border-secondary-fixed/50">
                <span className="material-symbols-outlined text-secondary-fixed text-3xl">psychology</span>
              </div>
              <div className="flex-1">
                <div className="relative h-40 w-full rounded-xl overflow-hidden glass-panel border-white/5 flex items-center justify-center">
                  <span className="font-telemetry-label text-on-surface-variant opacity-40 uppercase">A.I. Model Active</span>
                </div>
              </div>
            </div>

            {/* Stage 3: Prediction */}
            <div className="flex flex-col md:flex-row items-center gap-12 roadmap-reveal-section">
              <div className="flex-1 md:text-right">
                <div className="font-telemetry-label text-telemetry-label text-error mb-2">PHASE_03 // FORESIGHT</div>
                <h3 className="font-headline-md text-headline-md text-primary mb-4">Predictive Insight</h3>
                <p className="text-on-surface-variant opacity-70">Anticipating orbital shifts and atmospheric anomalies before they materialize.</p>
              </div>
              <div className="w-16 h-16 rounded-full glass-panel flex items-center justify-center z-10 border-error/50">
                <span className="material-symbols-outlined text-error text-3xl">timeline</span>
              </div>
              <div className="flex-1">
                <div className="glass-panel p-6 rounded-xl border-error/20 bg-error/5">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-2 h-2 rounded-full bg-error animate-glow"></div>
                    <span className="font-telemetry-label text-error uppercase">Anomaly Detected: Orbital Decay Alpha-9</span>
                  </div>
                  <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                    <div className="bg-error h-full w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Visionary Values Bento Grid */}
        <section className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-headline-md text-headline-md text-primary">Core Values</h2>
            <div className="w-24 h-1 bg-primary-fixed mx-auto mt-4"></div>
          </div>
          <div className="bento-grid">
            {/* Transparency */}
            <div className="col-span-12 md:col-span-8 glass-panel p-gutter rounded-2xl group hover:border-primary-fixed/50 transition-all duration-500">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="font-label-caps text-label-caps text-primary-fixed-dim mb-2">01. TRUST</div>
                  <h4 className="font-headline-md text-headline-md text-primary">Absolute Transparency</h4>
                </div>
                <span className="material-symbols-outlined text-primary-fixed-dim text-4xl group-hover:rotate-12 transition-transform">visibility</span>
              </div>
              <p className="text-on-surface-variant max-w-lg mb-8">Every data point we provide is verifiable. We believe the future of space exploration depends on open, accessible, and truthful telemetry sharing across global sectors.</p>
              <div className="h-48 w-full rounded-xl overflow-hidden relative">
                <img 
                  className="w-full h-full object-cover opacity-60" 
                  alt="A futuristic digital control room with wide panoramic screens displaying complex orbital data visualizations." 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyB_bcmhoMl4aHbHUDN8wdSmncndYVhLC0cbTu-XZeXZ_4cb7d9avBmVxGD86Apek_pmHN3JB_su-mMicPdOLWX6pJkG_MXob5g178HnBx0K_aNUqOgkTSgZkHCwAXFTkxs9e1q96IYy1-Q88RaMJxZVwbzoAVeh5VjIibM6ZmywEaO61_EQR2neYRq5wpn5u0fF2lePkDLS1T-hWTClVHTHV0pLzD5Kz9kGvjpBhAqrn-xPllklLFTmTI47ktrzflipdl7Qd_KDg"
                />
              </div>
            </div>

            {/* Precision */}
            <div className="col-span-12 md:col-span-4 glass-panel p-gutter rounded-2xl flex flex-col justify-between border-secondary-container/30">
              <div>
                <div className="font-label-caps text-label-caps text-secondary mb-2">02. PRECISION</div>
                <h4 className="font-headline-md text-headline-md text-primary">Micron-Level Fidelity</h4>
              </div>
              <p className="text-on-surface-variant text-sm mt-4">In the vacuum of space, there is no room for error. We operate at the highest possible fidelity threshold.</p>
              <div className="mt-8 pt-8 border-t border-white/5">
                <div className="flex justify-between font-telemetry-label text-[10px] text-on-surface-variant/50">
                  <span>ERROR_MARGIN</span>
                  <span>0.000004%</span>
                </div>
              </div>
            </div>

            {/* Innovation */}
            <div className="col-span-12 md:col-span-4 glass-panel p-gutter rounded-2xl border-white/5">
              <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-primary-fixed">auto_awesome</span>
              </div>
              <h4 className="font-headline-md text-headline-md text-primary mb-4">Hyper-Innovation</h4>
              <p className="text-on-surface-variant text-sm">We don't just use existing tech; we build the sensors and algorithms that define the next century of aerospace data.</p>
            </div>

            {/* Global Impact */}
            <div className="col-span-12 md:col-span-8 glass-panel p-gutter rounded-2xl relative overflow-hidden flex items-center border-white/10">
              <div className="relative z-10 w-1/2">
                <div className="font-label-caps text-label-caps text-primary-fixed mb-2">04. IMPACT</div>
                <h4 className="font-headline-md text-headline-md text-primary mb-4">Securing the Sphere</h4>
                <p className="text-on-surface-variant text-sm">Our work protects critical satellite infrastructure and planetary assets for the entire human species.</p>
              </div>
              <div className="absolute right-0 top-0 h-full w-1/2 opacity-20 hover:opacity-40 transition-opacity">
                <img 
                  className="w-full h-full object-cover" 
                  alt="A cinematic view of Earth from low orbit, showing the curved horizon with a glowing blue atmosphere." 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhkiMnANtSbuLRIyuIOiVLNlYCEdkIT3dM8vh8K-pLFa1wsV9oKE34-rTPEVGg6Gp6Ut6zB0_OtJYZGqnq9hHv4npkMhk-HO_F6qjshUUxZl1Kv_cH6QBcbJs6-JlwN79VY2Dr3t7pJDKs0N8gcii7FZO0zkPsiJJMhlxAvkosmTwBZBLfOM_ZaIY6mgyDThr8b7Jy4ArmP35rYX3U424qs7XaJPXIwjK7-C0-3lDO39MdXl2C_U4o4DOSBhBhwIRCEl-DV7ZqcLg"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative w-full bg-surface-container-lowest border-t border-white/10 flex flex-col md:flex-row justify-between items-center px-margin-safe py-gutter z-20">
        <div className="font-label-caps text-label-caps text-primary-fixed-dim mb-4 md:mb-0">COSMOSCOPE</div>
        <div className="font-telemetry-label text-telemetry-label text-on-surface-variant text-center md:text-left opacity-60">
          © 2026 COSMOSCOPE. OBSERVE. UNDERSTAND. PREDICT.
        </div>
        <nav className="flex gap-6 mt-4 md:mt-0">
          <a className="font-telemetry-label text-telemetry-label text-on-surface-variant hover:text-primary-fixed transition-colors" href="#legal">Legal Telemetry</a>
          <a className="font-telemetry-label text-telemetry-label text-on-surface-variant hover:text-primary-fixed transition-colors" href="#privacy">Data Privacy</a>
          <a className="font-telemetry-label text-telemetry-label text-on-surface-variant hover:text-primary-fixed transition-colors" href="#status">System Status</a>
        </nav>
      </footer>
    </div>
  );
}
