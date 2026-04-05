import React, { useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

const verdictConfig = {
  Excellent: { color: '#3ddc84', bg: 'rgba(61,220,132,0.15)', border: 'rgba(61,220,132,0.3)', glow: 'rgba(61,220,132,0.2)' },
  Strong: { color: '#4af0c8', bg: 'rgba(74,240,200,0.15)', border: 'rgba(74,240,200,0.3)', glow: 'rgba(74,240,200,0.2)' },
  Good: { color: '#c8f04a', bg: 'rgba(200,240,74,0.15)', border: 'rgba(200,240,74,0.3)', glow: 'rgba(200,240,74,0.2)' },
  Fair: { color: '#ffb830', bg: 'rgba(255,184,48,0.15)', border: 'rgba(255,184,48,0.3)', glow: 'rgba(255,184,48,0.2)' },
  Poor: { color: '#ff5252', bg: 'rgba(255,82,82,0.15)', border: 'rgba(255,82,82,0.3)', glow: 'rgba(255,82,82,0.2)' },
};

const severityConfig = {
  critical: { color: '#ff5252', bg: 'rgba(255,82,82,0.12)', label: 'CRITICAL', icon: '🔴' },
  warning: { color: '#ffb830', bg: 'rgba(255,184,48,0.12)', label: 'WARNING', icon: '🟡' },
  info: { color: '#4a9fff', bg: 'rgba(74,159,255,0.12)', label: 'INFO', icon: '🔵' },
};

const priorityConfig = {
  high: { color: '#c8f04a', label: 'High Priority' },
  medium: { color: '#ffb830', label: 'Medium' },
  low: { color: '#7a7a90', label: 'Low' },
};

const GlassCard = ({ children, style = {}, delay = 0 }) => (
  <div className="reveal-up" style={{
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 24,
    padding: 32,
    animationDelay: `${delay}ms`,
    ...style
  }}>
    {children}
  </div>
);

function ScoreBar({ score, color }) {
  return (
    <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 10, overflow: 'hidden' }}>
      <div className="progress-fill" style={{
        height: '100%', width: `${score}%`, borderRadius: 10,
        background: color, boxShadow: `0 0 15px ${color}40`
      }} />
    </div>
  );
}

function ScoreCard({ label, icon, score, delay }) {
  const color = score >= 75 ? '#3ddc84' : score >= 55 ? '#ffb830' : '#ff5252';
  return (
    <div className="reveal-up score-card-hover" style={{
      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 16, padding: '24px', display: 'flex', flexDirection: 'column', gap: 12,
      animationDelay: `${delay}ms`, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: 'rgba(240,240,245,0.4)', fontWeight: 500 }}>{icon} {label}</span>
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 24, color, fontWeight: 600 }}>{score}</span>
      </div>
      <ScoreBar score={score} color={color} />
    </div>
  );
}

export default function Results({ data, onReset }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'keywords', label: `Keywords (${(data.keywords?.found?.length || 0) + (data.keywords?.missing?.length || 0)})` },
    { id: 'issues', label: `Issues (${data.issues?.length || 0})` },
    { id: 'suggestions', label: `Pro Tips (${data.suggestions?.length || 0})` },
  ];

  const activeIdx = tabs.findIndex(t => t.id === activeTab);
  const vc = verdictConfig[data.verdict] || verdictConfig.Fair;
  const radarData = data.scores ? Object.values(data.scores).map(s => ({
    subject: s.label.split(' ')[0],
    score: s.score,
    fullMark: 100,
  })) : [];

  const handleTouchStart = (e) => setTouchStart(e.touches[0].clientX);
  const handleTouchMove = (e) => setTouchEnd(e.touches[0].clientX);
  const handleTouchEnd = () => {
    if (touchStart === null || touchEnd === null) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 70;
    const isRightSwipe = distance < -70;

    if (isLeftSwipe && activeIdx < tabs.length - 1) setActiveTab(tabs[activeIdx + 1].id);
    if (isRightSwipe && activeIdx > 0) setActiveTab(tabs[activeIdx - 1].id);
    setTouchStart(null); setTouchEnd(null);
  };

  return (
    <section id="results-section" style={{
      padding: '100px 24px 80px',
      background: 'radial-gradient(circle at 50% -20%, rgba(200,240,74,0.03), #0a0a0f 60%)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      minHeight: '100vh',
      scrollMarginTop: '100px'
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div className="results-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 24 }}>
          <div style={{ minWidth: 280 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 10, fontFamily: 'DM Mono, monospace', color: '#c8f04a',
                background: 'rgba(200,240,74,0.1)', padding: '5px 12px', borderRadius: 6, letterSpacing: '1px',
                whiteSpace: 'nowrap', border: '1px solid rgba(200,240,74,0.15)'
              }}>ATS VERIFIED REPORT</span>
              <span style={{ color: 'rgba(240,240,245,0.2)', fontSize: 12 }} className="header-dot">•</span>
              <span style={{ fontSize: 12, color: 'rgba(240,240,245,0.4)', fontWeight: 500, letterSpacing: '0.2px' }}>{data.job_title_match}</span>
            </div>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 400, color: '#f0f0f5', letterSpacing: '-1px', lineHeight: 1.1 }}>
              Resume Analysis
            </h2>
          </div>
          <button onClick={onReset} className="shiny-btn" style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 100, padding: '12px 24px', color: '#f0f0f5', fontSize: 14,
            cursor: 'pointer', position: 'relative', overflow: 'hidden'
          }}>
            ← Analyze Another
          </button>
        </div>

        {/* Hero Section */}
        <div className="results-hero-grid" style={{ display: 'grid', gap: 24, marginBottom: 40 }}>
          <GlassCard style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, border: `1px solid ${vc.border}` }} delay={100}>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: 140, height: 140, background: vc.glow, borderRadius: '50%', filter: 'blur(40px)', opacity: 0.5
              }} />
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: 100, fontWeight: 300, color: vc.color, lineHeight: 1, position: 'relative' }}>
                {data.overall_score}
              </div>
            </div>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '2px', color: 'rgba(240,240,245,0.4)' }}>SCORE / 100</div>
            <div style={{
              background: vc.bg, border: `1px solid ${vc.border}`,
              borderRadius: 100, padding: '6px 20px',
              fontFamily: 'DM Mono, monospace', fontSize: 14, fontWeight: 600, color: vc.color,
              boxShadow: `0 0 20px ${vc.color}20`
            }}>
              {data.verdict.toUpperCase()}
            </div>
          </GlassCard>

          <GlassCard delay={200} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, color: '#f0f0f5', marginBottom: -4 }}>Smart Summary</h3>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: 'rgba(240,240,245,0.7)', fontWeight: 400 }}>{data.summary}</p>
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <div style={{ fontSize: 11, color: 'rgba(240,240,245,0.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>Experience Profile</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#f0f0f5', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>{data.candidate_experience_years || '0 Yrs'}</span>
                  <span style={{ fontSize: 10, color: 'rgba(240,240,245,0.2)', fontWeight: 400 }}>VS</span>
                  <span style={{ color: '#c8f04a' }}>{data.experience_years_required || 'Any'}</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'rgba(240,240,245,0.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>Keyword Health</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#c8f04a' }}>{data.keywords?.found?.length || 0} Found</div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Sub-score cards */}
        <div className="results-sub-grid" style={{ display: 'grid', gap: 16, marginBottom: 50 }}>
          {data.scores && Object.values(data.scores).map((s, i) => (
            <ScoreCard key={i} label={s.label} icon={s.icon} score={s.score} delay={300 + (i * 100)} />
          ))}
        </div>

        {/* Tab System */}
        <div className="reveal-up tab-container" style={{
          background: 'rgba(255,255,255,0.04)', padding: '6px 8px', borderRadius: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 40, border: '1px solid rgba(255,255,255,0.1)',
          position: 'relative'
        }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              background: activeTab === tab.id ? 'rgba(200,240,74,0.12)' : 'transparent',
              border: 'none', cursor: 'pointer',
              padding: '10px 24px', fontSize: 13, fontWeight: 600,
              color: activeTab === tab.id ? '#c8f04a' : 'rgba(240,240,245,0.4)',
              borderRadius: 100, transition: 'all 0.3s',
              whiteSpace: 'nowrap'
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Swipeable Content Area */}
        <div 
          key={activeTab}
          className="reveal-up"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ transition: 'all 0.4s ease' }}
        >
          {activeTab === 'overview' && (
            <div className="results-overview-grid" style={{ display: 'grid', gap: 24 }}>
              <GlassCard style={{ padding: 'clamp(20px, 5vw, 40px)', overflow: 'hidden' }}>
                <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 32, color: '#f0f0f5' }}>Competency Radar</h4>
                <div className="radar-wrapper" style={{ width: '100%', height: 300, display: 'flex', justifyContent: 'center' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(240,240,245,0.5)', fontSize: 10, fontFamily: 'DM Mono' }} />
                      <Radar dataKey="score" stroke="#c8f04a" fill="#c8f04a" fillOpacity={0.15} strokeWidth={2} />
                      <Tooltip contentStyle={{ background: '#1c1c28', border: 'none', borderRadius: 12, color: '#f0f0f5', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
              <GlassCard style={{ padding: 40 }}>
                <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 24, color: '#f0f0f5' }}>Executive Summary</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {(data.issues || []).slice(0, 3).map((issue, i) => {
                    const sc = severityConfig[issue.severity] || severityConfig.info;
                    return (
                      <div key={i} style={{ display: 'flex', gap: 16, padding: '20px', background: sc.bg, borderRadius: 16, border: `1px solid ${sc.color}15` }}>
                        <span style={{ fontSize: 18 }}>{sc.icon}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: '#f0f0f5', marginBottom: 4 }}>{issue.title}</div>
                          <div style={{ fontSize: 13, color: 'rgba(240,240,245,0.55)', lineHeight: 1.5 }}>{issue.description}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            </div>
          )}

          {activeTab === 'keywords' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {[
                { title: 'Found Keywords', items: data.keywords?.found, color: '#3ddc84', bg: 'rgba(61,220,132,0.1)', border: 'rgba(61,220,132,0.15)', icon: '✓' },
                { title: 'Critical Missing Skills', items: data.keywords?.missing, color: '#ff5252', bg: 'rgba(255,82,82,0.1)', border: 'rgba(255,82,82,0.15)', icon: '✗' },
              ].map(({ title, items, color, bg, border, icon }) => items?.length > 0 && (
                <GlassCard key={title} style={{ padding: 40 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 24, color }}>{title.toUpperCase()}</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                    {items.map((kw, i) => (
                      <span key={i} className="keyword-tag" style={{
                        fontFamily: 'DM Mono, monospace', fontSize: 13,
                        background: bg, border: `1px solid ${border}`,
                        color, borderRadius: 100, padding: '8px 20px',
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        transition: 'all 0.2s'
                      }}>
                        <span style={{ fontSize: 12, opacity: 0.6 }}>{icon}</span> {kw}
                      </span>
                    ))}
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

          {activeTab === 'issues' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {(data.issues || []).map((issue, i) => {
                const sc = severityConfig[issue.severity] || severityConfig.info;
                return (
                  <GlassCard key={i} style={{
                    borderLeft: `2px solid ${sc.color}`, padding: '24px 32px',
                    display: 'flex', gap: 20, alignItems: 'center'
                  }}>
                    <div style={{
                      flexShrink: 0, fontFamily: 'DM Mono, monospace', fontSize: 11,
                      fontWeight: 600, color: sc.color, background: sc.bg,
                      padding: '6px 12px', borderRadius: 6
                    }}>{sc.label}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 16, color: '#f0f0f5', marginBottom: 4 }}>{issue.title}</div>
                      <div style={{ fontSize: 14, color: 'rgba(240,240,245,0.5)', lineHeight: 1.6 }}>{issue.description}</div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}

          {activeTab === 'suggestions' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
              {(data.suggestions || []).map((s, i) => (
                <GlassCard key={i} style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 10, color: '#c8f04a', background: 'rgba(200,240,74,0.1)', padding: '4px 10px', borderRadius: 4, textTransform: 'uppercase' }}>{s.category}</span>
                    <span style={{ fontSize: 11, fontFamily: 'DM Mono', color: priorityConfig[s.priority]?.color }}>{priorityConfig[s.priority]?.label}</span>
                  </div>
                  <h4 style={{ fontSize: 17, fontWeight: 600, color: '#f0f0f5' }}>{s.title}</h4>
                  <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.55)', lineHeight: 1.7 }}>{s.action}</p>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .results-hero-grid {
          display: grid;
          grid-template-columns: minmax(280px, 1fr) 2fr;
        }
        .results-overview-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
        }
        .results-sub-grid {
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        }

        .tab-container::-webkit-scrollbar { display: none; }
        .tab-container { -ms-overflow-style: none; scrollbar-width: none; }

        .reveal-up {
          opacity: 0;
          transform: translateY(20px);
          animation: revealUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }

        @keyframes revealUp {
          to { opacity: 1; transform: translateY(0); }
        }

        .progress-fill {
          animation: slideRight 1.5s cubic-bezier(0.6, 0, 0.4, 1) forwards;
          transform-origin: left;
        }

        @keyframes slideRight {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }

        .shiny-btn:hover {
          background: rgba(255,255,255,0.08) !important;
          border-color: rgba(200,240,74,0.3) !important;
          color: #c8f04a !important;
          transform: translateY(-2px);
        }

        .score-card-hover:hover {
          transform: translateY(-4px);
          border-color: rgba(255,255,255,0.12) !important;
          background: rgba(255,255,255,0.04) !important;
        }

        .keyword-tag:hover {
          transform: translateY(-2px);
          border-color: currentColor !important;
        }

        @media (max-width: 992px) {
          .results-hero-grid, .results-overview-grid, .results-sub-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 768px) {
          section#results-section { padding: 160px 16px 60px !important; }
          .results-hero-grid { gap: 16px !important; }
          .results-header { align-items: flex-start !important; }
          .header-dot { display: none; }
          .radar-wrapper { transform: scale(0.9); margin: -20px 0; }
          .tab-container { 
            overflow-x: hidden !important; 
            display: flex !important;
            justify-content: stretch !important; 
            padding: 4px !important; 
            max-width: 100% !important;
            gap: 2px !important;
          }
          .tab-container button {
            flex: 1 !important;
            padding: 10px 4px !important;
            font-size: 13px !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            text-align: center !important;
          }
          .tab-container button:first-child { margin-left: 0 !important; }
          .tab-container button:last-child { margin-right: 0 !important; }
        }
      `}</style>
    </section>
  );
}
