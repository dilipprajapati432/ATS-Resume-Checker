import React from 'react';

const steps = [
  {
    num: '01',
    icon: '📄',
    title: 'Paste or Upload Resume',
    desc: 'Paste your resume text directly or upload a PDF/TXT file. Our system extracts and processes all content.'
  },
  {
    num: '02',
    icon: '💼',
    title: 'Add Job Description',
    desc: 'Copy the full job posting from LinkedIn, Indeed, or any job board. The more detail, the better the analysis.'
  },
  {
    num: '03',
    icon: '⚡',
    title: 'Deep Intelligence Analysis',
    desc: 'Our advanced intelligent engine performs deep semantic analysis comparing your resume against ATS requirements and job criteria.'
  },
  {
    num: '04',
    icon: '📊',
    title: 'Get Actionable Results',
    desc: 'Receive a detailed score breakdown, keyword gaps, format issues, and specific suggestions to improve your match rate.'
  },
];

const features = [
  { icon: '🔑', title: 'Keyword Analysis', desc: 'Identifies exact and semantic keyword matches and gaps' },
  { icon: '📐', title: 'ATS Format Check', desc: 'Checks for formatting issues that confuse ATS parsers' },
  { icon: '💡', title: 'Smart Suggestions', desc: 'Specific, actionable recommendations for each issue' },
  { icon: '📈', title: 'Score Breakdown', desc: '6-dimensional scoring across all key resume factors' },
  { icon: '🎯', title: 'Role Matching', desc: 'Deep analysis of experience and skill alignment' },
  { icon: '⚡', title: 'Instant Results', desc: 'Comprehensive analysis delivered in under 30 seconds' },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding: '30px 24px 60px', background: '#0d0d14' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, letterSpacing: '2px', color: '#c8f04a', marginBottom: 12 }}>
            HOW IT WORKS
          </p>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(30px, 4vw, 48px)', fontWeight: 400, letterSpacing: '-1px', marginBottom: 16 }}>
            From resume to results in{' '}
            <span style={{ fontStyle: 'italic', color: '#c8f04a' }}>4 steps</span>
          </h2>
          <p style={{ color: 'rgba(240,240,245,0.5)', fontSize: 17, maxWidth: 500, margin: '0 auto' }}>
            Our AI does the hard work so you can focus on crafting the perfect application
          </p>
        </div>

        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 32, marginBottom: 48, zIndex: 1 }}>
          {/* Connector Path - Desktop only */}
          <div className="connector-path-container" style={{
            position: 'absolute', top: 80, left: '10%', right: '10%', height: 2,
            background: 'rgba(200,240,74,0.05)', zIndex: 0,
          }}>
            <div className="connector-glow" style={{
              width: '100%', height: '100%',
              background: 'linear-gradient(to right, transparent, #c8f04a, transparent)',
              backgroundSize: '200% 100%',
              animation: 'moveGlow 4s linear infinite',
            }} />
          </div>

          {steps.map((step, i) => (
            <div key={i} style={{
              background: 'rgba(19, 19, 28, 0.7)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 24, padding: '40px 32px', position: 'relative',
              transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
              zIndex: 1,
              willChange: 'transform',
            }}
              className="step-card"
            >
              <div style={{
                fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#c8f04a',
                letterSpacing: '2px', background: 'rgba(200,240,74,0.08)',
                padding: '4px 10px', borderRadius: 100, display: 'inline-block',
                marginBottom: 24, border: '1px solid rgba(200,240,74,0.1)'
              }}>
                STEP {step.num}
              </div>
              <div style={{
                width: 64, height: 64, borderRadius: 20,
                background: 'rgba(255,255,255,0.02)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, marginBottom: 24,
                border: '1px solid rgba(255,255,255,0.05)',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)',
              }}>
                {step.icon}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: '#f0f0f5', letterSpacing: '-0.3px' }}>{step.title}</h3>
              <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.45)', lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          ))}
        </div>

        <style>{`
          @keyframes moveGlow {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
          
          .step-card:hover {
            transform: translateY(-8px);
            border-color: rgba(200,240,74,0.2);
            background: rgba(19, 19, 28, 0.9);
            box-shadow: 0 20px 40px rgba(0,0,0,0.4);
          }

          @media (max-width: 1024px) {
            .connector-path-container { display: none; }
          }
        `}</style>

        {/* Features grid */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 40 }}>
          <h3 style={{ textAlign: 'center', fontFamily: 'Fraunces, serif', fontSize: 32, fontWeight: 400, marginBottom: 40, letterSpacing: '-0.5px' }}>
            Everything you need to get past the ATS
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 20
          }}>
            {features.map((f, i) => (
              <div key={i} style={{
                display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'flex-start',
                background: 'rgba(255,255,255,0.02)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 20, padding: '30px',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                cursor: 'default',
                willChange: 'transform, background, border-color, box-shadow',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.borderColor = 'rgba(200,240,74,0.3)';
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3), 0 0 20px rgba(200,240,74,0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: 'rgba(200,240,74,0.1)',
                  boxShadow: 'inset 0 0 15px rgba(200,240,74,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 26, marginBottom: 8,
                  position: 'relative', overflow: 'hidden'
                }}>
                  {/* Subtle icon glow */}
                  <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, rgba(200,240,74,0.2) 0%, transparent 75%)' }} />
                  <span style={{ position: 'relative' }}>{f.icon}</span>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 10, color: '#f0f0f5', letterSpacing: '-0.3px' }}>{f.title}</div>
                  <div style={{ fontSize: 14.5, color: 'rgba(240,240,245,0.65)', lineHeight: 1.6 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
