import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import toast from 'react-hot-toast';

// 1. Industry Standard: Robust file handling with specific error feedback
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function AnalyzeForm({ onResults, analyzing, setAnalyzing }) {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [inputMode, setInputMode] = useState('text'); // 'text' | 'file'

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) {
      const error = rejected[0].errors[0];
      if (error?.code === 'file-too-large') {
        toast.error(`File is too large. Maximum size is ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB.`);
      } else {
        toast.error('Invalid file. Only PDF or TXT files under 5MB are supported.');
      }
      return;
    }
    if (accepted.length > 0) {
      setUploadedFile(accepted[0]);
      setResumeText('');
      toast.success(`File "${accepted[0].name}" ready for analysis`);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, 
    accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'] },
    maxFiles: 1, 
    maxSize: MAX_FILE_SIZE,
    disabled: analyzing,
  });

  // 2. Industry Standard: Enhanced Form Validation and Sanitization before request
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const sanitizedJobDesc = jobDescription.trim();
    const sanitizedResumeText = resumeText.trim();

    if (!sanitizedJobDesc) { 
      toast.error('Please provide a job description for context.'); 
      return; 
    }
    
    if (!sanitizedResumeText && !uploadedFile) { 
      toast.error('Please provide your resume by pasting text or uploading a file.'); 
      return; 
    }

    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('jobDescription', sanitizedJobDesc);
      
      if (uploadedFile) {
        formData.append('resumeFile', uploadedFile);
      } else {
        formData.append('resumeText', sanitizedResumeText);
      }

      const API_BASE_URL = process.env.REACT_APP_API_URL || '';
      const { data } = await axios.post(`${API_BASE_URL}/api/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });

      if (data.success) {
        onResults(data.data);
        toast.success('Analysis complete!');
      } else {
         toast.error(data.error || 'Failed to process resume. Please try again.');
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Analysis failed due to a network error. Please try again.';
      toast.error(msg);
    } finally {
      setAnalyzing(false);
    }
  };

  const inputStyle = {
    width: '100%', background: '#111118',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12, color: '#f0f0f5',
    fontFamily: 'Cabinet Grotesk, sans-serif',
    fontSize: 14, lineHeight: 1.6, resize: 'none',
    transition: 'all 0.2s ease',
    padding: '14px 16px',
    height: 320,
  };

  const badgeStyle = {
    fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
    background: 'rgba(255,255,255,0.06)', color: 'rgba(240,240,245,0.4)',
    textTransform: 'uppercase', letterSpacing: '0.5px'
  };


  return (
    <section id="analyze-section" style={{
      padding: '10px 24px 60px',
      background: '#0a0a0f',
      position: 'relative',
    }} aria-labelledby="analyze-heading">
      
      {/* Background glow for the section */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '80%', height: '80%',
        background: 'radial-gradient(circle, rgba(200,240,74,0.03) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} aria-hidden="true" />

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }} className="reveal-fade">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 id="analyze-heading" style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 400, letterSpacing: '-1.5px', marginBottom: 16 }}>
            Ready to <span style={{ fontStyle: 'italic', color: '#c8f04a', textShadow: '0 0 20px rgba(200,240,74,0.15)' }}>optimize?</span>
          </h2>
          <p style={{ color: 'rgba(240,240,245,0.45)', fontSize: 18, maxWidth: 600, margin: '0 auto' }}>
            Provide your details below and let our intelligent engine bridge the gap to your next role.
          </p>
        </div>

        {/* 3. Industry Standard: Semantic <form> with ARIA labels */}
        <form onSubmit={handleSubmit} noValidate aria-label="Resume Analysis Form">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 40 }}>

            {/* Resume Panel */}
            <div style={{
              background: 'rgba(19, 19, 28, 0.6)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 24, padding: 32,
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease'
            }} className="form-panel">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.03)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                    border: '1px solid rgba(255,255,255,0.06)'
                  }} aria-hidden="true">📄</div>
                  <span style={{ fontWeight: 600, fontSize: 16, color: '#f0f0f5' }} id="resume-label">Your Resume</span>
                </div>
                
                {/* Mode Selector */}
                <div 
                  role="group" 
                  aria-label="Resume Input Mode"
                  style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 4, border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  {['text', 'file'].map(mode => (
                    <button key={mode} type="button"
                      aria-pressed={inputMode === mode}
                      onClick={() => { setInputMode(mode); if (mode === 'text') setUploadedFile(null); }}
                      style={{
                        padding: '6px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                        background: inputMode === mode ? '#c8f04a' : 'transparent',
                        color: inputMode === mode ? '#0a0a0f' : 'rgba(240,240,245,0.4)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: 'none', cursor: 'pointer'
                      }}>
                      {mode === 'text' ? 'Paste' : 'Upload'}
                    </button>
                  ))}
                </div>
              </div>

              {inputMode === 'text' ? (
                <>
                  <label htmlFor="resumeTextInput" className="sr-only">Paste Resume Text</label>
                  <textarea
                    id="resumeTextInput"
                    className="professional-textarea"
                    style={{ ...inputStyle }}
                    placeholder="Paste your full resume text here...&#10;&#10;Name, contact info, professional summary, experience..."
                    value={resumeText}
                    onChange={e => setResumeText(e.target.value)}
                    disabled={analyzing}
                    rows={12}
                    aria-required="true"
                    aria-describedby="resume-label"
                  />
                </>
              ) : (
                <div
                  {...getRootProps()}
                  aria-label="Resume File Dropper"
                  tabIndex={0}
                  style={{
                    height: 320, border: `2px dashed ${isDragActive ? '#c8f04a' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 16, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 16,
                    background: isDragActive ? 'rgba(200,240,74,0.03)' : 'rgba(10,10,20,0.4)',
                    cursor: 'pointer', transition: 'all 0.3s', padding: 32,
                  }}>
                  <input {...getInputProps()} aria-hidden="true" />
                  
                  {uploadedFile ? (
                    <div style={{ textAlign: 'center', animation: 'scaleIn 0.3s ease' }}>
                      <div style={{ fontSize: 44, marginBottom: 12 }}>✅</div>
                      <div style={{ fontWeight: 600, color: '#c8f04a', fontSize: 15, marginBottom: 4 }}>{uploadedFile.name}</div>
                      <div style={{ fontSize: 13, color: 'rgba(240,240,245,0.3)', marginBottom: 16 }}>
                        {(uploadedFile.size / 1024).toFixed(1)} KB
                      </div>
                      <button type="button" 
                        onClick={e => { e.stopPropagation(); setUploadedFile(null); }}
                        aria-label="Remove uploaded file"
                        style={{
                          fontSize: 12, fontWeight: 600, color: '#ff4d4d',
                          background: 'rgba(255,77,77,0.08)', border: '1px solid rgba(255,77,77,0.15)',
                          padding: '6px 14px', borderRadius: 8, cursor: 'pointer'
                        }}>
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 48, marginBottom: 16, opacity: isDragActive ? 1 : 0.4 }} aria-hidden="true">
                        {isDragActive ? '📂' : '📁'}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8, color: '#f0f0f5' }}>
                        {isDragActive ? 'Release to drop' : 'Drop your resume'}
                      </div>
                      <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.3)', marginBottom: 20 }}>PDF or TXT up to 5MB</p>
                      <div style={{
                        fontSize: 13, fontWeight: 600,
                        background: 'rgba(200,240,74,0.1)', color: '#c8f04a',
                        border: '1px solid rgba(200,240,74,0.2)',
                        padding: '10px 24px', borderRadius: 10,
                        transition: 'all 0.2s'
                      }} className="browse-btn">Browse files</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Job Description Panel */}
            <div style={{
              background: 'rgba(19, 19, 28, 0.6)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 24, padding: 32,
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }} className="form-panel">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.03)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                    border: '1px solid rgba(255,255,255,0.06)'
                  }} aria-hidden="true">💼</div>
                  <span style={{ fontWeight: 600, fontSize: 16, color: '#f0f0f5' }} id="job-req-label">Job Requirements</span>
                </div>
                <span style={{ ...badgeStyle, background: 'rgba(200,240,74,0.1)', color: '#c8f04a', border: '1px solid rgba(200,240,74,0.15)' }}>Required</span>
              </div>
              
              <label htmlFor="jobDescriptionInput" className="sr-only">Job Description</label>
              <textarea
                id="jobDescriptionInput"
                className="professional-textarea"
                style={{ ...inputStyle }}
                placeholder="Paste the target job description...&#10;&#10;Include role, requirements, and preferred qualifications for a precise match."
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                disabled={analyzing}
                rows={12}
                aria-required="true"
                aria-describedby="job-req-label"
              />
              <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }} aria-label="Supported Integrations">
                {['LinkedIn', 'Indeed', 'Greenhouse', 'Lever'].map(src => (
                  <span key={src} style={{
                    fontSize: 11, fontWeight: 600, color: 'rgba(240,240,245,0.25)',
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                    padding: '4px 12px', borderRadius: 100, transition: 'all 0.3s'
                  }}
                    className="platform-chip"
                  >
                    {src} Ready
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button 
              type="submit" 
              disabled={analyzing} 
              className="shine-button" 
              aria-live="polite"
              aria-busy={analyzing}
              style={{
                background: analyzing ? 'rgba(200,240,74,0.3)' : '#c8f04a',
                color: '#0a0a0f', border: 'none', borderRadius: 14,
                padding: '18px 60px', fontSize: 18, fontWeight: 700,
                cursor: analyzing ? 'not-allowed' : 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 12,
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                minWidth: 260, justifyContent: 'center',
                boxShadow: '0 10px 30px rgba(200,240,74,0.25)',
                position: 'relative', overflow: 'hidden'
              }}
            >
              {analyzing ? (
                <>
                  <span className="loader-dots" aria-hidden="true" />
                  Analyzing Resume...
                </>
              ) : (
                <>
                  <span style={{ fontSize: 20 }} aria-hidden="true">⚡</span>
                  Analyze Resume
                </>
              )}
            </button>
            <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, color: 'rgba(240,240,245,0.3)' }}>
              <span style={{ fontSize: 12 }}>Takes 10–25s</span>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} aria-hidden="true" />
              <span style={{ fontSize: 12 }}>Unified ATS Engine v2.4</span>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        /* Visually Hidden Class for Accessibility */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
        .professional-textarea {
          outline: none !important;
          transition: all 0.3s ease !important;
        }
        .professional-textarea:focus {
          border-color: rgba(200,240,74,0.3) !important;
          background: rgba(255,255,255,0.06) !important;
          box-shadow: 0 0 20px rgba(200,240,74,0.05);
        }
        .professional-textarea::-webkit-scrollbar {
          width: 6px;
        }
        .professional-textarea::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.08);
          border-radius: 10px;
        }
        .panel-hover:hover {
          border-color: rgba(200,240,74,0.15) !important;
          transform: translateY(-4px);
        }
        .platform-chip:hover {
          color: #c8f04a !important;
          border-color: rgba(200,240,74,0.2) !important;
          background: rgba(200,240,74,0.05) !important;
        }
        .browse-btn:hover {
          background: rgba(200,240,74,0.15) !important;
          transform: scale(1.02);
        }
        .shine-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(200,240,74,0.4);
        }
        .shine-button:active {
          transform: translateY(-1px);
        }
        .loader-dots {
          width: 18px; height: 18px; border: 2px solid rgba(10,10,15,0.2);
          border-top-color: #0a0a0f; border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .reveal-fade {
          animation: reveal 1s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes reveal {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @media (max-width: 900px) {
          form > div:first-child { grid-template-columns: 1fr !important; gap: 20px !important; }
          .shine-button { width: 100% !important; padding: 18px 24px !important; }
        }
      `}</style>
    </section>
  );
}

