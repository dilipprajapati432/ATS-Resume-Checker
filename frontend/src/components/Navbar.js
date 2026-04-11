import React, { useEffect, useState } from 'react';

export default function Navbar({ onReset, hasResults }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      // Add hysteresis: enter floating state at 60px, exit at 20px
      if (!scrolled && currentScrollY > 60) {
        setScrolled(true);
      } else if (scrolled && currentScrollY < 20) {
        setScrolled(false);
      }
      lastScrollY = currentScrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [scrolled]);

  const navBaseStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: scrolled ? 66 : 72,
    padding: scrolled ? '0 28px' : '0 40px',
    background: scrolled ? 'rgba(10,10,15,0.75)' : 'rgba(10,10,15,0.4)',
    backdropFilter: 'blur(24px)',
    borderBottom: scrolled ? 'none' : '1px solid rgba(255,255,255,0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1000,
    transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
  };

  const floatingContainerStyle = {
    position: 'fixed',
    top: scrolled ? 12 : 0,
    left: '50%',
    transform: `translateX(-50%) ${scrolled ? 'translateY(0)' : 'translateY(-10px)'}`,
    width: scrolled ? 'max-content' : '100%',
    minWidth: scrolled ? 'clamp(320px, 92%, 1100px)' : '100%',
    padding: scrolled ? '0 28px' : '0 40px',
    background: scrolled ? 'rgba(10,10,15,0.75)' : 'transparent',
    backdropFilter: scrolled ? 'blur(24px)' : 'none',
    border: scrolled ? '1px solid rgba(255,255,255,0.08)' : 'none',
    borderRadius: scrolled ? 100 : 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1000,
    transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
    boxShadow: scrolled ? '0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)' : 'none',
    pointerEvents: 'auto',
    height: scrolled ? 64 : 72,
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
    <nav style={floatingContainerStyle}>
      <button
        type="button"
        onClick={() => {
          onReset();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
      >
        <div style={brandIconStyle}>⚡</div>
        <span className="brand-text-mobile" style={{
          fontFamily: 'Fraunces, serif', fontSize: scrolled ? 19 : 21,
          fontWeight: 500, color: '#f0f0f5', letterSpacing: '-0.5px',
          transition: 'all 0.5s ease'
        }}>
          Resume<span style={{ color: '#c8f04a', fontStyle: 'italic' }}>IQ</span>
        </span>
      </button>

      <div className="nav-flex-container" style={{ display: 'flex', alignItems: 'center', gap: scrolled ? 16 : 32, transition: 'gap 0.5s ease' }}>
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
          0% { left: -100%; }
          20% { left: 100%; }
          100% { left: 100%; }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }

        @media (max-width: 768px) {
          .nav-hide-mobile { display: none !important; }
          .cta-btn-mobile { 
            padding: 8px 14px !important; 
            font-size: 11px !important;
          }
          .brand-text-mobile { font-size: 17px !important; }
        }
      `}</style>
    </nav>
  );
}
