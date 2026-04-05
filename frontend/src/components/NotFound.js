import React, { useEffect } from 'react';

const NotFound = () => {
  useEffect(() => {
    document.title = "404: Not Found | ResumeIQ";
    return () => { document.title = "ResumeIQ | AI ATS Resume Checker"; };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, #1a1a2e 0%, #0a0a0f 100%)',
      color: '#f0f0f5',
      padding: '24px',
      textAlign: 'center'
    }}>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: 'clamp(200px, 30vw, 400px)',
        fontWeight: 900,
        color: 'rgba(200,240,74,0.03)',
        zIndex: 0,
        userSelect: 'none',
        pointerEvents: 'none'
      }}>
        404
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '32px',
        padding: '60px 40px',
        maxWidth: '500px',
        width: '100%',
        position: 'relative',
        zIndex: 1,
        boxShadow: '0 40px 100px rgba(0,0,0,0.5)'
      }}>
        <div style={{
          fontSize: '64px',
          marginBottom: '24px'
        }}>
          🛰️
        </div>
        
        <h1 style={{
          fontFamily: 'Fraunces, serif',
          fontSize: '48px',
          fontWeight: 400,
          marginBottom: '16px',
          letterSpacing: '-1px',
          color: '#c8f04a'
        }}>
          ResumeIQ
        </h1>
        
        <p style={{
          fontSize: '16px',
          lineHeight: '1.6',
          color: 'rgba(240,240,245,0.6)',
          marginBottom: '40px'
        }}>
          The page you're looking for has drifted beyond our orbit. <br/>
          Let's get you back to the home base.
        </p>

        <a 
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            background: '#c8f04a',
            color: '#0a0a0f',
            padding: '16px 32px',
            borderRadius: '100px',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '15px',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            boxShadow: '0 10px 30px rgba(200,240,74,0.3)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(200,240,74,0.4)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(200,240,74,0.3)';
          }}
        >
          <span>🏠</span> Back to Dashboard
        </a>
      </div>

      <div style={{
        position: 'absolute',
        bottom: '40px',
        fontFamily: 'DM Mono, monospace',
        fontSize: '12px',
        color: 'rgba(240,240,245,0.3)',
        letterSpacing: '1px'
      }}>
        ERROR_CODE: PAGE_UNDETERMINED_404
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&display=swap');
      `}</style>
    </div>
  );
};

export default NotFound;
