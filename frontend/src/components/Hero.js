import React, { useEffect, useState } from 'react';

const statsData = [
  { target: 98, suffix: '%', label: 'ATS systems use keyword scanning' },
  { target: 75, suffix: '%', label: 'Resumes rejected before human review' },
  { target: 3, suffix: '×', label: 'More interviews with optimized resume' },
];

const StatCard = ({ target, suffix, label, index }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = target;
    const duration = 2000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <div style={{
      padding: '28px 20px',
      background: 'rgba(15, 15, 23, 0.6)',
      backdropFilter: 'blur(10px)',
      borderRight: index < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none',
      transition: 'all 0.3s ease',
      cursor: 'default',
      willChange: 'transform, background',
    }}
      className="stat-card"
    >
      <div style={{
        fontFamily: 'Fraunces, serif', fontSize: 44, fontWeight: 500, color: '#c8f04a',
        lineHeight: 1, marginBottom: 8, display: 'flex', justifyContent: 'center', alignItems: 'baseline'
      }}>
        <span style={{ transition: 'all 0.5s ease' }}>{count}</span>
        <span style={{ fontSize: 24, marginLeft: 2, opacity: 0.8 }}>{suffix}</span>
      </div>
      <div style={{ fontSize: 13, color: 'rgba(240,240,245,0.5)', lineHeight: 1.4 }}>{label}</div>
    </div>
  );
};

export default function Hero() {
  return (
    <section style={{
      minHeight: '85vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      padding: '120px 24px 60px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(200,240,74,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(200,240,74,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black, transparent)',
        pointerEvents: 'none',
        willChange: 'transform',
        transform: 'translateZ(0)',
      }} />

      {/* Glow orbs - dynamic feel */}
      <div className="glow-orb orb-1" style={{
        position: 'absolute', top: '20%', left: '15%', width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(200,240,74,0.08) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none',
        willChange: 'transform', transform: 'translateZ(0)',
      }} />
      <div className="glow-orb orb-2" style={{
        position: 'absolute', top: '30%', right: '15%', width: 300, height: 300,
        background: 'radial-gradient(circle, rgba(74,240,200,0.06) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none',
        willChange: 'transform', transform: 'translateZ(0)',
      }} />

      <div style={{ position: 'relative', maxWidth: 880 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(200,240,74,0.08)', border: '1px solid rgba(200,240,74,0.15)',
          borderRadius: 100, padding: '6px 16px', marginBottom: 32,
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        }}>
          <span className="pulse-dot" />
          <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'DM Mono, monospace', color: '#c8f04a', letterSpacing: '1px', textTransform: 'uppercase' }}>
            AI-POWERED RESUME INSIGHTS
          </span>
        </div>

        <h1 style={{
          fontFamily: 'Fraunces, serif',
          fontSize: 'clamp(46px, 8vw, 84px)',
          fontWeight: 400,
          lineHeight: 1,
          letterSpacing: '-2.5px',
          marginBottom: 28,
          color: '#f0f0f5',
        }}>
          Will your resume{' '}
          <span style={{ fontStyle: 'italic', color: '#c8f04a', textShadow: '0 0 30px rgba(200,240,74,0.2)' }}>survive</span>
          {' '}the filter?
        </h1>

        <p style={{
          fontSize: 19, lineHeight: 1.6,
          color: 'rgba(240,240,245,0.55)',
          maxWidth: 600, margin: '0 auto 48px',
        }}>
          75% of resumes never reach human eyes. Our intelligent analysis system compares your resume against any job description and tells you exactly how to optimize for success.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#analyze-section" style={{
            background: '#c8f04a', color: '#0a0a0f',
            padding: '16px 40px', borderRadius: 12,
            fontSize: 16, fontWeight: 700,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'inline-flex', alignItems: 'center', gap: 10,
            boxShadow: '0 8px 25px rgba(200,240,74,0.2)',
            textDecoration: 'none'
          }}
            className="hero-cta-main"
          >
            Analyze Resume <span style={{ fontSize: 20 }}>→</span>
          </a>
          <a href="#how-it-works" style={{
            background: 'rgba(255,255,255,0.03)', color: '#f0f0f5',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '16px 36px', borderRadius: 12,
            fontSize: 16, fontWeight: 500,
            transition: 'all 0.3s',
            textDecoration: 'none'
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          >
            How it works
          </a>
        </div>

        {/* Social Proof */}
        <div style={{
          marginTop: 40, fontSize: 13, color: 'rgba(240,240,245,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16
        }}>
          <span style={{ height: 1, width: 32, background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.08))' }} />
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '0.2px' }}>
            Trusted by <span style={{ color: '#c8f04a', fontWeight: 600 }}>10,000+</span> Students, Professionals & Recruiters
          </span>
          <span style={{ height: 1, width: 32, background: 'linear-gradient(to left, transparent, rgba(255,255,255,0.08))' }} />
        </div>

        {/* Stats row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1, marginTop: 70,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20, overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        }}>
          {statsData.map((s, i) => (
            <StatCard key={i} target={s.target} suffix={s.suffix} label={s.label} index={i} />
          ))}
        </div>
      </div>

      <style>{`
        .pulse-dot {
          width: 6px; height: 6px; borderRadius: 50%; background: #c8f04a;
          display: inline-block; animation: pulse 2s infinite;
          boxShadow: 0 0 10px #c8f04a;
        }
        
        .hero-cta-main:hover {
          transform: translateY(-3px) scale(1.02);
          boxShadow: 0 12px 30px rgba(200,240,74,0.35);
        }

        .stat-card:hover {
          background: rgba(200,240,74,0.03) !important;
        }

        .orb-1 { animation: float 10s ease-in-out infinite; }
        .orb-2 { animation: float 14s ease-in-out infinite reverse; }

        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -20px); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }

        @media (max-width: 768px) {
          .stats-row { gridTemplateColumns: 1fr; }
          .stat-card { borderRight: none; borderBottom: 1px solid rgba(255,255,255,0.06); }
        }
      `}</style>
    </section>
  );
}
