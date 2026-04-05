import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AnalyzeForm from './components/AnalyzeForm';
import Results from './components/Results';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';
import NotFound from './components/NotFound';

export default function App() {
  const [results, setResults] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Force scroll to top on refresh
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleResults = (data) => {
    setResults(data);
    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleReset = () => {
    setResults(null);
    // Use a small delay to allow the DOM to render the form before scrolling
    setTimeout(() => {
      document.getElementById('analyze-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 10);
  };

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e1e28',
            color: '#f0f0f5',
            border: '1px solid rgba(255,255,255,0.1)',
            fontFamily: 'Cabinet Grotesk, sans-serif',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#3ddc84', secondary: '#0a0a0f' } },
          error: { iconTheme: { primary: '#ff5252', secondary: '#0a0a0f' } },
        }}
      />
      <Navbar onReset={handleReset} hasResults={!!results} />
      
      <Routes>
        <Route path="/" element={
          <>
            {!results && <Hero />}
            {!results && <HowItWorks />}
            {!results && (
              <div id="analyze-section">
                <AnalyzeForm onResults={handleResults} analyzing={analyzing} setAnalyzing={setAnalyzing} />
              </div>
            )}
            {results && (
              <div id="results-section">
                <Results data={results} onReset={handleReset} />
              </div>
            )}
          </>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </>
  );
}
