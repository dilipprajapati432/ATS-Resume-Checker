import React, { useState } from 'react';

// Premium SVG Icons for stability
const LinkedInIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
);

const FacebookIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);

const MailIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
);

const ShieldIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
);

const LegalModal = ({ title, content, onClose }) => (
  <div style={{
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    background: 'rgba(5,5,10,0.85)', backdropFilter: 'blur(12px)',
    zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '24px', animation: 'fadeIn 0.3s ease'
  }} onClick={onClose}>
    <div style={{
      maxWidth: '640px', width: '100%', maxHeight: '80vh', overflowY: 'auto',
      background: '#151520', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '24px', padding: '40px', position: 'relative',
      boxShadow: '0 30px 60px rgba(0,0,0,0.6)', cursor: 'default'
    }} onClick={e => e.stopPropagation()}>
      <button onClick={onClose} style={{
        position: 'absolute', top: 24, right: 24, background: 'rgba(255,255,255,0.05)',
        border: 'none', color: 'rgba(240,240,245,0.5)', width: 32, height: 32,
        borderRadius: '50%', cursor: 'pointer', transition: 'all 0.2s'
      }} onMouseEnter={e => e.target.style.color = '#c8f04a'} onMouseLeave={e => e.target.style.color = 'rgba(240,240,245,0.5)'}>✕</button>
      
      <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, color: '#f0f0f5', marginBottom: 24 }}>{title}</h2>
      <div style={{ 
        fontFamily: 'DM Mono, monospace', fontSize: 13, color: 'rgba(240,240,245,0.6)', 
        lineHeight: 1.8, whiteSpace: 'pre-wrap'
      }}>
        {content}
      </div>
    </div>
  </div>
);

export default function Footer() {
  const [activeModal, setActiveModal] = useState(null);

  const legalContent = {
    privacy: `PRIVACY POLICY\nLast Updated: April 2026\n\n1. DATA COLLECTION\nResumeIQ processes strictly the resume text and job descriptions you provide for real-time analysis. We do not store your personal identifiable information (PII) on a permanent basis.\n\n2. ANALYSIS LOGIC\nOur AI-driven engine compares your skills against job market demand. This analysis is performed in memory and is transient.\n\n3. THIRD PARTY HANDLING\nWe do not sell or share your resume data with external recruiters or advertising networks.\n\n4. CONTACT\nFor any data-related inquiries, reach out to us at: dilipkohar4320@gmail.com`,
    terms: `TERMS OF SERVICE\nLast Updated: April 2026\n\n1. SCOPE OF SERVICE\nResumeIQ is an AI-powered advisory tool designed to assist candidates in optimizing their resumes for ATS (Applicant Tracking Systems).\n\n2. LIMITATION OF LIABILITY\nWhile we strive for maximum accuracy, ResumeIQ does not guarantee employment or specific interview outcomes. Our scores are directional benchmarks based on industry standards.\n\n3. USER CONDUCT\nYou agree not to misuse the platform for batch data scraping or deceptive representation.\n\n4. INQUIRIES\nTechnical or usage questions can be sent to: dilipkohar4320@gmail.com`,
    about: `ABOUT RESUMEIQ\n\nResumeIQ was born out of a simple observation: the modern job market is controlled by algorithms, but resumes are written by humans. This gap often prevents qualified talent from even reaching an interview.\n\nOUR MISSION\nTo democratize high-end ATS intelligence. We believe every candidate deserves a fair chance to be seen by a human recruiter. By using state-of-the-art AI (Gemini & Groq), we provide the same level of analysis used by fortune 500 companies—available to everyone.\n\nDEVELOPED BY\nDilip Prajapati\n\nJoin us in making the job search more transparent and rewarding.`
  };

  return (
    <>
      {activeModal && (
        <LegalModal 
          title={activeModal === 'privacy' ? 'Privacy Policy' : activeModal === 'about' ? 'About Us' : 'Terms of Service'}
          content={legalContent[activeModal]}
          onClose={() => setActiveModal(null)}
        />
      )}
      <footer style={{
        padding: '40px 24px 40px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(10,10,15,0.9)',
        backdropFilter: 'blur(20px)',
        position: 'relative',
        overflow: 'hidden',
      }}>

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 40 }}>
        {/* Brand Section */}
        <div style={{ flex: '1 1 320px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div className="footer-brand-icon" style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #c8f04a, #4af0c8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
              boxShadow: '0 4px 15px rgba(200,240,74,0.2)',
            }}>⚡</div>
            <span style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 500, color: '#f0f0f5', letterSpacing: '-0.5px' }}>
              Resume<span style={{ color: '#c8f04a', fontStyle: 'italic' }}>IQ</span>
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(240,240,245,0.45)', lineHeight: 1.5, maxWidth: 300, margin: '0 0 8px 0' }}>
            The #1 AI-powered ATS Resume Checker for modern professionals.
          </p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ 
              fontSize: 10, color: '#3ddc84', background: 'rgba(61,220,132,0.06)', 
              padding: '6px 12px', borderRadius: '100px', border: '1px solid rgba(61,220,132,0.12)',
              display: 'flex', alignItems: 'center', gap: 7, fontWeight: 700, letterSpacing: '0.4px',
              textTransform: 'uppercase', boxShadow: '0 2px 10px rgba(61,220,132,0.05)'
            }}>
              <ShieldIcon size={12} /> Privacy-First: No Data Storage
            </div>
          </div>
        </div>

        {/* Links Navigation */}
        <div style={{ display: 'flex', gap: 60, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h4 style={{ fontSize: 10, textTransform: 'uppercase', color: 'rgba(240,240,245,0.3)', fontWeight: 700, letterSpacing: '1px', marginBottom: 4 }}>Quick Links</h4>
            <button className="footer-link-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</button>
            <button onClick={() => setActiveModal('about')} className="footer-link-btn">About Us</button>
            <a href="#how-it-works" className="footer-link">Methodology</a>
            <a href="#analyze-section" className="footer-link">Analysis Tool</a>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h4 style={{ fontSize: 10, textTransform: 'uppercase', color: 'rgba(240,240,245,0.3)', fontWeight: 700, letterSpacing: '1px', marginBottom: 4 }}>Legal</h4>
            <button 
              onClick={() => setActiveModal('privacy')}
              className="footer-link-btn" 
            >Privacy Policy</button>
            <button 
              onClick={() => setActiveModal('terms')}
              className="footer-link-btn"
            >Terms of Service</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h4 style={{ fontSize: 10, textTransform: 'uppercase', color: 'rgba(240,240,245,0.3)', fontWeight: 700, letterSpacing: '1px', marginBottom: 4 }}>Contact</h4>
            <a href="https://www.linkedin.com/in/dilip-kohar-014627293" target="_blank" rel="noopener noreferrer" className="footer-link-social linkedin">
              <LinkedInIcon size={14} /> LinkedIn
            </a>
            <a href="https://www.facebook.com/dilip.kohar.7" target="_blank" rel="noopener noreferrer" className="footer-link-social facebook">
              <FacebookIcon size={14} /> Facebook
            </a>
            <a href="mailto:dilipkohar4320@gmail.com" className="footer-link-social">
              <MailIcon size={14} /> Email Me
            </a>
          </div>
        </div>
      </div>

      <div style={{ 
        maxWidth: 1100, margin: '8px auto 0', paddingTop: 12, 
        borderTop: '1px solid rgba(255,255,255,0.04)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20
      }}>
        <div style={{ color: 'rgba(240,240,245,0.35)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span>© 2026 ResumeIQ. All Rights Reserved.</span>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ color: 'rgba(240,240,245,0.25)' }}>Developed by <span style={{ color: 'rgba(200,240,74,0.6)', fontWeight: 500 }}>Dilip Prajapati</span></span>
        </div>
        <div style={{
          fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '1px', color: '#c8f04a', opacity: 0.4,
          background: 'rgba(200,240,74,0.05)', padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(200,240,74,0.1)'
        }}>
          RESUME PORTFOLIO EDITION
        </div>
      </div>

      <style>{`
        .footer-link, .footer-link-btn {
          font-size: 13.5px;
          color: rgba(240,240,245,0.5);
          text-decoration: none;
          background: none; border: none; padding: 0; text-align: left;
          transition: all 0.2s ease;
          display: inline-block; cursor: pointer;
        }
        .footer-link:hover, .footer-link-btn:hover {
          color: #c8f04a;
          transform: translateX(4px);
        }

        .footer-link-social {
          font-size: 13.5px;
          color: rgba(240,240,245,0.5);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .footer-link-social:hover {
          transform: translateY(-1px);
          color: #f0f0f5;
        }

        .footer-brand-icon {
          animation: brandFloat 4s ease-in-out infinite;
        }

        @keyframes brandFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }

        @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }

        @media (max-width: 768px) {
          footer { padding: 40px 24px !important; }
          .footer-link:hover, .footer-link-btn:hover { transform: none; }
        }
      `}</style>
    </footer>
    </>
  );
}
