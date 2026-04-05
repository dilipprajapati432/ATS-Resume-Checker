import React, { useEffect, useState } from 'react';

export default function Navbar({ onReset, hasResults }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navBaseStyle = {
    position: 'fixed',
    top: scrolled ? 12 : 0,
    left: scrolled ? '50%' : 0,
    right: scrolled ? 'auto' : 0,
    transform: scrolled ? 'translateX(-50%)' : 'none',
    width: scrolled ? 'max-content' : '100%',
    minWidth: scrolled ? '460px' : 'none',
    height: scrolled ? 60 : 72,
    padding: scrolled ? '0 24px' : '0 40px',
    background: scrolled ? 'rgba(10,10,15,0.75)' : 'rgba(10,10,15,0.4)',
    backdropFilter: 'blur(24px)',
    borderBottom: scrolled ? 'none' : '1px solid rgba(255,255,255,0.05)',
    border: scrolled ? '1px solid rgba(255,255,255,0.08)' : 'none',
    borderRadius: scrolled ? 100 : 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1000,
    transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
    boxShadow: scrolled ? '0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)' : 'none',
    willChange: 'transform, background, border-radius, padding',
  };

  const brandIconStyle = {
    width: 32, height: 32, borderRadius: 8,
    background: 'linear-gradient(135deg, #c8f04a, #4af0c8)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16, color: '#0a0a0f',
    boxShadow: scrolled ? '0 0 20px rgba(200,240,74,0.3)' : 'none',
    animation: 'pulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1)',
  };

  const linkStyle = {
    fontSize: 13, fontWeight: 500, color: 'rgba(240,240,245,0.5)',
    padding: '8px 16px', borderRadius: 100, transition: 'all 0.3s ease',
    textDecoration: 'none', fontFamily: 'DM Mono, monospace',
    letterSpacing: '0.3px'
  };

  const ctaStyle = {
    fontSize: 13, fontWeight: 700, color: '#0a0a0f',
    background: '#c8f04a', padding: '10px 24px', borderRadius: 100,
    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    boxShadow: '0 4px 15px rgba(200,240,74,0.2)',
    textDecoration: 'none', position: 'relative', overflow: 'hidden',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    textAlign: 'center', lineHeight: 1.2
  };

  return (
    <nav style={navBaseStyle}>
      <button
        type="button"
        onClick={() => {
          onReset();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
      >
        <div style={brandIconStyle}>⚡</div>
        <span style={{
          fontFamily: 'Fraunces, serif', fontSize: scrolled ? 19 : 21,
          fontWeight: 500, color: '#f0f0f5', letterSpacing: '-0.5px',
          transition: 'font-size 0.5s ease'
        }}>
          Resume<span style={{ color: '#c8f04a', fontStyle: 'italic' }}>IQ</span>
        </span>
      </button>

      <div className="nav-flex-container" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <a
          href="#how-it-works"
          onClick={e => { if (hasResults) onReset(); }}
          style={linkStyle}
          className="nav-link-hover nav-hide-mobile"
        >
          How it works
        </a>
        <a
          href="#analyze-section"
          onClick={e => { if (hasResults) onReset(); }}
          style={ctaStyle}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(200,240,74,0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(200,240,74,0.2)'; }}
          className="shine-btn cta-btn-mobile"
        >
          Check Resume
        </a>
      </div>

      <style>{`
        .nav-link-hover:hover { color: #f0f0f5; background: rgba(255,255,255,0.05); }
        
        .shine-btn::after {
          content: '';
          position: absolute;
          top: -50%; left: -50%;
          width: 200%; height: 200%;
          background: linear-gradient(
            45deg,
            transparent,
            rgba(255,255,255,0.3),
            transparent
          );
          transform: rotate(45deg);
          animation: shine 3s infinite;
        }

        @keyframes shine {
          0% { left: -100%; transition-property: left; transition-duration: 0.7s; transition-timing-function: linear; }
          20% { left: 100%; transition-property: left; transition-duration: 0.7s; transition-timing-function: linear; }
          100% { left: 100%; }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }

        @media (max-width: 768px) {
          nav { 
            width: calc(100% - 24px) !important; 
            min-width: auto !important; 
            left: 12px !important; 
            transform: none !important; 
            top: 12px !important;
            padding: 0 10px !important;
          }
          .nav-flex-container { gap: 16px !important; }
          .nav-hide-mobile { display: block !important; padding: 6px 4px !important; font-size: 13px !important; }
          .cta-btn-mobile { 
            padding: 8px 12px !important; 
            font-size: 13px !important;
            white-space: nowrap !important;
          }
        }
      `}</style>
    </nav>
  );
}
