import React from 'react'

export default class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#080d17', padding: '2rem',
      }}>
        <div style={{
          background: '#131f33', border: '1px solid rgba(239,68,68,.3)',
          borderRadius: 16, padding: '2.5rem', maxWidth: 520, width: '100%', textAlign: 'center',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ color: '#f1f5f9', fontWeight: 700, marginBottom: '.5rem' }}>Something went wrong</h2>
          <p style={{ color: '#64748b', fontSize: '.9rem', marginBottom: '1.5rem' }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/' }}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff', border: 'none', borderRadius: 10,
              padding: '.7rem 1.8rem', fontWeight: 600, fontSize: '.9rem', cursor: 'pointer',
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }
}
