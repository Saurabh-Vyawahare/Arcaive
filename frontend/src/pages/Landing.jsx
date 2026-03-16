import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Sun, Moon } from 'lucide-react';

// ─── Canvas: Sparkle Particles ───────────────────────────────
function useParticles(ref, active, dark) {
  useEffect(() => {
    if (!active || !ref.current) return;
    const c = ref.current, ctx = c.getContext('2d');
    let id, ps = [];
    const resize = () => { c.width = c.offsetWidth * 2; c.height = c.offsetHeight * 2; ctx.scale(2, 2); };
    resize(); window.addEventListener('resize', resize);

    class P {
      constructor(w, h) {
        this.x = Math.random() * w; this.y = Math.random() * h;
        this.s = dark ? (Math.random() * 1.6 + 0.3) : (Math.random() * 2.2 + 0.5);
        this.sx = (Math.random() - 0.5) * 0.22; this.sy = (Math.random() - 0.5) * 0.22;
        this.op = Math.random() * 0.3 + 0.1;
        this.fs = Math.random() * 0.005 + 0.002; this.fd = 1;
        this.w = w; this.h = h;
        const hues = dark
          ? ['150,175,210', '170,190,220', '130,160,200']
          : ['55,85,130', '40,70,120', '74,111,165', '30,60,110', '65,95,145'];
        this.hue = hues[Math.floor(Math.random() * hues.length)];
      }
      update() {
        this.x += this.sx; this.y += this.sy;
        this.op += this.fs * this.fd;
        if (this.op >= (dark ? 0.6 : 0.75) || this.op <= 0.05) this.fd *= -1;
        if (this.x < 0) this.x = this.w; if (this.x > this.w) this.x = 0;
        if (this.y < 0) this.y = this.h; if (this.y > this.h) this.y = 0;
      }
      draw(c) {
        c.beginPath(); c.arc(this.x, this.y, this.s, 0, Math.PI * 2);
        c.fillStyle = `rgba(${this.hue},${this.op})`; c.fill();
      }
    }

    const w = c.offsetWidth, h = c.offsetHeight;
    for (let i = 0; i < (dark ? 90 : 140); i++) ps.push(new P(w, h));
    const go = () => { ctx.clearRect(0, 0, w, h); ps.forEach(p => { p.update(); p.draw(ctx); }); id = requestAnimationFrame(go); };
    go();
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', resize); };
  }, [ref, active, dark]);
}

// ─── Canvas: Wavy Background ─────────────────────────────────
function useWavy(ref, active, dark) {
  useEffect(() => {
    if (!active || !ref.current) return;
    const c = ref.current, ctx = c.getContext('2d');
    let id, t = 0;
    const resize = () => { c.width = c.offsetWidth * 2; c.height = c.offsetHeight * 2; ctx.scale(2, 2); };
    resize(); window.addEventListener('resize', resize);

    const n = (x, y, t) =>
      Math.sin(x * 0.008 + t) * Math.cos(y * 0.006 + t * 0.7) * 0.5 +
      Math.sin(x * 0.004 - t * 0.5) * 0.3 +
      Math.cos(y * 0.01 + t * 0.3) * 0.2;

    const dC = ['rgba(100,130,175,.07)', 'rgba(80,110,155,.05)', 'rgba(130,155,190,.06)', 'rgba(90,120,165,.04)'];
    const lC = ['rgba(50,80,130,.06)', 'rgba(40,70,120,.045)', 'rgba(74,111,165,.055)', 'rgba(60,95,145,.04)'];
    const cols = dark ? dC : lC;
    const bgF = dark ? 'rgba(14,18,26,.15)' : 'rgba(255,255,255,.12)';

    const render = () => {
      t += 0.003;
      const w = c.offsetWidth, h = c.offsetHeight;
      ctx.fillStyle = bgF; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.lineWidth = (dark ? 45 : 50) + i * (dark ? 16 : 18);
        ctx.strokeStyle = cols[i];
        for (let x = 0; x < w; x += 4) {
          const y = n(x, i * 100, t + i * 0.5) * 80 + h * (0.35 + i * 0.1);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      id = requestAnimationFrame(render);
    };
    render();
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', resize); };
  }, [ref, active, dark]);
}

// ─── Canvas: Splash Particles ────────────────────────────────
function useSplashParticles(ref, active) {
  useEffect(() => {
    if (!active || !ref.current) return;
    const c = ref.current, ctx = c.getContext('2d');
    let id, ps = [];
    const resize = () => { c.width = c.offsetWidth * 2; c.height = c.offsetHeight * 2; ctx.scale(2, 2); };
    resize(); window.addEventListener('resize', resize);

    class P {
      constructor(w, h) {
        this.x = Math.random() * w; this.y = Math.random() * h;
        this.s = Math.random() * 2 + 0.5;
        this.sx = (Math.random() - 0.5) * 0.4; this.sy = (Math.random() - 0.5) * 0.4;
        this.op = Math.random() * 0.6 + 0.2;
        this.fs = Math.random() * 0.01 + 0.003; this.fd = 1;
        this.w = w; this.h = h;
        this.hue = ['180,200,230', '150,175,210', '200,215,240', '120,155,200'][Math.floor(Math.random() * 4)];
      }
      update() {
        this.x += this.sx; this.y += this.sy;
        this.op += this.fs * this.fd;
        if (this.op >= 0.9 || this.op <= 0.1) this.fd *= -1;
        if (this.x < 0) this.x = this.w; if (this.x > this.w) this.x = 0;
        if (this.y < 0) this.y = this.h; if (this.y > this.h) this.y = 0;
      }
      draw(c) {
        c.beginPath(); c.arc(this.x, this.y, this.s, 0, Math.PI * 2);
        c.fillStyle = `rgba(${this.hue},${this.op})`; c.fill();
      }
    }

    const w = c.offsetWidth, h = c.offsetHeight;
    for (let i = 0; i < 200; i++) ps.push(new P(w, h));
    const go = () => { ctx.clearRect(0, 0, w, h); ps.forEach(p => { p.update(); p.draw(ctx); }); id = requestAnimationFrame(go); };
    go();
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', resize); };
  }, [ref, active]);
}

// ─── Data ────────────────────────────────────────────────────
const FEATURES = [
  { icon: '🌲', title: 'Tree-Based Indexing', desc: 'Documents become intelligent hierarchies — not flat chunks.' },
  { icon: '🧠', title: 'LLM Reasoning', desc: 'Thinks through the tree like a human expert.' },
  { icon: '🔍', title: 'Traceable Retrieval', desc: 'Every answer includes a full reasoning path.' },
  { icon: '⚡', title: '98.7% Accuracy', desc: 'State-of-the-art on FinanceBench.' },
  { icon: '🔌', title: 'Connect Any Source', desc: 'PDFs, databases, any pipeline.' },
  { icon: '🏢', title: 'Enterprise Ready', desc: 'Multi-doc reasoning, audit trails, API-first.' },
];

// ═════════════════════════════════════════════════════════════
// LANDING PAGE
// ═════════════════════════════════════════════════════════════
export default function Landing() {
  const [phase, setPhase] = useState('splash'); // splash → transition → landing
  const [dark, setDark] = useState(false);

  const splashPartRef = useRef(null);
  const wavyRef = useRef(null);
  const partRef = useRef(null);

  useSplashParticles(splashPartRef, phase === 'splash' || phase === 'transition');
  useWavy(wavyRef, phase === 'landing', dark);
  useParticles(partRef, phase === 'landing', dark);

  // Splash timing
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('transition'), 2200);
    const t2 = setTimeout(() => setPhase('landing'), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Theme-aware colors (inline for canvas-dependent elements)
  const isDark = dark;

  return (
    <div className="w-full h-screen font-sans overflow-hidden relative">

      {/* ═══ SPLASH ANIMATION ═══ */}
      {(phase === 'splash' || phase === 'transition') && (
        <div
          className="absolute inset-0 z-[100] flex flex-col items-center justify-center"
          style={{
            background: '#0A0E16',
            animation: phase === 'transition' ? 'splashZoomOut 0.9s cubic-bezier(0.4,0,0.2,1) forwards' : 'none',
          }}
        >
          <canvas ref={splashPartRef} className="absolute inset-0 w-full h-full" />

          <div className="relative z-10 flex flex-col items-center">
            {/* Logo */}
            <div
              className="w-16 h-16 rounded-2xl bg-brand-blue flex items-center justify-center mb-7"
              style={{
                boxShadow: '0 0 60px rgba(74,111,165,0.4)',
                animation: 'splashLogoIn 0.8s cubic-bezier(0.16,1,0.3,1) forwards',
              }}
            >
              <Layers className="w-7 h-7 text-white" />
            </div>

            {/* Name */}
            <h1
              className="font-serif text-6xl font-medium text-white"
              style={{
                letterSpacing: '12px', opacity: 0,
                animation: 'splashTextIn 1s cubic-bezier(0.16,1,0.3,1) 0.4s forwards',
              }}
            >
              Arcaive
            </h1>

            {/* Line */}
            <div
              className="h-px mt-4"
              style={{
                background: 'linear-gradient(90deg, transparent, #5B82BB, transparent)',
                width: 0, opacity: 0,
                animation: 'splashLineGrow 0.8s ease 0.9s forwards',
              }}
            />

            {/* Tagline */}
            <p
              className="font-mono text-xs text-brand-light uppercase tracking-[2px] mt-3.5"
              style={{ opacity: 0, animation: 'splashSubIn 0.6s ease 1.2s forwards' }}
            >
              Document Intelligence
            </p>
          </div>
        </div>
      )}

      {/* ═══ LANDING PAGE ═══ */}
      {phase === 'landing' && (
        <div
          className="w-full h-full relative overflow-auto"
          style={{
            background: isDark ? '#0E121A' : '#FFFFFF',
            animation: 'landingFadeIn 0.6s ease forwards',
            transition: 'background 0.4s ease',
          }}
        >
          {/* Canvas layers */}
          <canvas ref={wavyRef} className="fixed inset-0 w-full h-full z-0" />
          <canvas ref={partRef} className="fixed inset-0 w-full h-full z-[1] pointer-events-none" />

          {/* ─── Nav ─── */}
          <nav
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-9 py-3.5 backdrop-blur-xl"
            style={{
              background: isDark ? 'rgba(14,18,26,0.7)' : 'rgba(255,255,255,0.85)',
              borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
              transition: 'all 0.3s',
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <span className="font-serif text-xl" style={{ color: isDark ? '#fff' : '#1A1F2E', transition: 'color 0.3s' }}>Arcaive</span>
            </div>

            <div className="flex items-center gap-5">
              {['Features', 'Docs', 'Pricing'].map(t => (
                <span key={t} className="text-sm cursor-pointer transition-colors" style={{ color: isDark ? '#8B95A8' : '#5A6478' }}>{t}</span>
              ))}
              <Link
                to="/auth"
                className="text-sm rounded-lg px-4 py-1.5 transition-all"
                style={{
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(74,111,165,0.25)'}`,
                  color: isDark ? '#fff' : '#4A6FA5',
                }}
              >
                Log In
              </Link>
              <Link to="/auth?signup=true" className="text-sm text-white bg-brand-blue rounded-lg px-5 py-1.5 font-semibold hover:shadow-lg transition-all">
                Sign Up
              </Link>

              {/* Theme Toggle */}
              <button
                onClick={() => setDark(!dark)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(74,111,165,0.06)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                }}
              >
                {isDark
                  ? <Sun className="w-4 h-4" style={{ color: '#8B95A8' }} />
                  : <Moon className="w-4 h-4" style={{ color: '#5A6478' }} />
                }
              </button>
            </div>
          </nav>

          {/* ─── Hero ─── */}
          <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-9 pt-28 pb-16 text-center">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full mb-7"
              style={{
                background: isDark ? 'rgba(74,111,165,0.15)' : 'rgba(74,111,165,0.07)',
                border: `1px solid ${isDark ? 'rgba(74,111,165,0.3)' : 'rgba(74,111,165,0.15)'}`,
                opacity: 0, animation: 'slideUp 0.6s ease 0.1s forwards',
              }}
            >
              <span className="font-mono text-[10.5px] text-brand-light">Powered by PageIndex</span>
              <span style={{ color: isDark ? '#525D72' : '#8B95A8' }}>•</span>
              <span className="font-mono text-[10.5px]" style={{ color: '#3EA06B' }}>98.7% accuracy</span>
            </div>

            {/* Headline */}
            <h1
              className="font-serif text-7xl font-medium max-w-3xl leading-tight tracking-tight"
              style={{ color: isDark ? '#fff' : '#1A1F2E', opacity: 0, animation: 'slideUp 0.7s ease 0.2s forwards', transition: 'color 0.3s' }}
            >
              Your documents,{' '}
              <span className="italic text-brand-light">understood.</span>
            </h1>

            {/* Subhead */}
            <p
              className="text-lg max-w-xl mt-6 leading-relaxed"
              style={{ color: isDark ? '#8B95A8' : '#5A6478', opacity: 0, animation: 'slideUp 0.7s ease 0.35s forwards', transition: 'color 0.3s' }}
            >
              Reasoning-based retrieval that navigates complex documents like a human expert. No vector databases. No chunking. Just intelligence.
            </p>

            {/* CTAs */}
            <div className="flex gap-3 mt-10" style={{ opacity: 0, animation: 'slideUp 0.7s ease 0.5s forwards' }}>
              <Link
                to="/auth?signup=true"
                className="text-white bg-brand-blue rounded-xl px-8 py-3.5 font-semibold text-base transition-all hover:-translate-y-0.5"
                style={{ animation: 'btnGlow 3s ease infinite' }}
              >
                Get Started Free →
              </Link>
              <button
                className="rounded-xl px-6 py-3.5 text-base font-medium transition-all"
                style={{
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(74,111,165,0.25)'}`,
                  background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(74,111,165,0.04)',
                  color: isDark ? '#fff' : '#4A6FA5',
                }}
              >
                View Docs
              </button>
            </div>

            {/* Strikethrough Comparison */}
            <div className="flex items-center gap-5 mt-14 flex-wrap justify-center" style={{ opacity: 0, animation: 'slideUp 0.7s ease 0.65s forwards' }}>
              {['Vector DB', 'Chunking', 'Embeddings'].map(t => (
                <div key={t} className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: isDark ? '#525D72' : '#8B95A8' }} />
                  <span className="font-mono text-[10.5px] line-through" style={{ color: isDark ? '#525D72' : '#8B95A8' }}>{t}</span>
                </div>
              ))}
              <div className="w-px h-3.5" style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }} />
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-light" />
                <span className="font-mono text-[10.5px] text-brand-light">Reasoning-based retrieval</span>
              </div>
            </div>
          </div>

          {/* ─── Features ─── */}
          <div className="relative z-10 max-w-5xl mx-auto px-9 pb-24">
            <div className="text-center mb-12">
              <h2 className="font-serif text-4xl" style={{ color: isDark ? '#fff' : '#1A1F2E', transition: 'color 0.3s' }}>
                Built for <span className="text-brand-light italic">real</span> document intelligence
              </h2>
              <p className="text-sm mt-3 max-w-md mx-auto" style={{ color: isDark ? '#8B95A8' : '#5A6478' }}>
                Not another chatbot wrapper.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {FEATURES.map((f, i) => (
                <div
                  key={i}
                  className="p-6 rounded-xl transition-all cursor-default hover:-translate-y-1"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(74,111,165,0.025)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(74,111,165,0.08)'}`,
                    opacity: 0, animation: `scaleIn 0.5s ease ${0.1 * i}s forwards`,
                  }}
                >
                  <div className="text-2xl mb-3">{f.icon}</div>
                  <div className="text-sm font-semibold mb-2" style={{ color: isDark ? '#fff' : '#1A1F2E', transition: 'color 0.3s' }}>{f.title}</div>
                  <div className="text-xs leading-relaxed" style={{ color: isDark ? '#8B95A8' : '#5A6478' }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ ANIMATIONS (CSS) ═══ */}
      <style>{`
        @keyframes splashLogoIn {
          0% { opacity: 0; transform: scale(0.6); filter: blur(10px); }
          60% { opacity: 1; transform: scale(1.02); filter: blur(0); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes splashTextIn {
          0% { opacity: 0; letter-spacing: 12px; }
          100% { opacity: 1; letter-spacing: 3px; }
        }
        @keyframes splashSubIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 0.6; transform: translateY(0); }
        }
        @keyframes splashLineGrow {
          from { width: 0; opacity: 0; }
          to { width: 80px; opacity: 0.4; }
        }
        @keyframes splashZoomOut {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(2.5); filter: blur(8px); }
        }
        @keyframes landingFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes btnGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(74,111,165,0.12); }
          50% { box-shadow: 0 0 40px rgba(74,111,165,0.28); }
        }
      `}</style>
    </div>
  );
}
