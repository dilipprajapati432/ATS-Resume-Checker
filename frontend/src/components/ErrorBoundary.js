import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
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
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,82,82,0.2)',
            borderRadius: '32px',
            padding: '60px 40px',
            maxWidth: '500px',
            width: '100%',
            position: 'relative',
            zIndex: 1,
            boxShadow: '0 40px 100px rgba(0,0,0,0.5)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>🛡️</div>
            
            <h1 style={{
              fontFamily: 'Fraunces, serif',
              fontSize: '32px',
              fontWeight: 400,
              marginBottom: '16px',
              letterSpacing: '-1px',
              color: '#ff5252'
            }}>
              Something went wrong
            </h1>
            
            <p style={{
              fontSize: '15px',
              lineHeight: '1.6',
              color: 'rgba(240,240,245,0.6)',
              marginBottom: '40px'
            }}>
              Don't worry—your data is safe. An unexpected error occurred. <br/>
              Let's refresh and try that again.
            </p>

            <button
              onClick={this.handleReload}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                background: '#ff5252',
                color: '#fff',
                padding: '16px 32px',
                borderRadius: '100px',
                border: 'none',
                fontWeight: 700,
                fontSize: '15px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                boxShadow: '0 10px 30px rgba(255,82,82,0.3)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(255,82,82,0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(255,82,82,0.3)';
              }}
            >
              <span>🔄</span> Refresh Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
