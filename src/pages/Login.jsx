import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ username, password })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid User ID or password. Please verify credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a2540', color: '#1e293b', fontFamily: "'Open Sans', sans-serif" }}>

      {/* Top Banner */}
      <div style={{ background: '#001730', borderBottom: '2px solid #ff9900', padding: '.4rem 2rem', fontSize: '.75rem', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>🔒 Official NetBanking Portal · NexusBank Security System</span>
        <span>Customer Support: 1800-11-2211 (Toll Free)</span>
      </div>

      {/* Header */}
      <header style={{ padding: '1rem 2rem', background: '#0a2540', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '.75rem', textDecoration: 'none' }}>
          <img src="/logo.png" alt="NexusBank Logo" style={{ height: 38, width: 38, objectFit: 'contain', borderRadius: 4 }} />
          <div>
            <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-.3px' }}>NexusBank</div>
            <div style={{ color: '#ff9900', fontSize: '.62rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>Corporate & Retail NetBanking</div>
          </div>
        </Link>
        <Link to="/register" style={{ background: '#ff9900', color: '#001730', padding: '.5rem 1.2rem', borderRadius: 4, fontWeight: 800, fontSize: '.82rem', textDecoration: 'none' }}>
          New User Registration
        </Link>
      </header>

      {/* Login Box Container */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem 1rem' }}>
        <div style={{ background: '#ffffff', borderRadius: 8, width: '100%', maxWidth: 440, boxShadow: '0 15px 35px rgba(0,0,0,0.3)', borderTop: '5px solid #ff9900', overflow: 'hidden' }}>

          <div style={{ background: '#001730', padding: '1.2rem 1.6rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '.8rem' }}>
            <img src="/logo.png" alt="NexusBank" style={{ height: 32, width: 32, objectFit: 'contain' }} />
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>NetBanking Login</h2>
              <p style={{ fontSize: '.72rem', color: '#94a3b8', margin: 0 }}>Enter customer ID and password to access dashboard</p>
            </div>
          </div>

          <div style={{ padding: '1.8rem' }}>
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 4, padding: '.75rem 1rem', color: '#991b1b', fontSize: '.84rem', marginBottom: '1.2rem' }}>
                <strong>Login Error:</strong> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.2rem' }}>
                <label htmlFor="user-id-input" style={{ display: 'block', fontSize: '.82rem', fontWeight: 700, color: '#0a2540', marginBottom: '.4rem' }}>
                  User ID / Customer ID
                </label>
                <input
                  id="user-id-input"
                  name="username"
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your User ID (e.g. alice, bob, admin)"
                  style={{
                    width: '100%',
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: 4,
                    padding: '.75rem .9rem',
                    fontSize: '.9rem',
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.4rem' }}>
                <label htmlFor="password-input" style={{ display: 'block', fontSize: '.82rem', fontWeight: 700, color: '#0a2540', marginBottom: '.4rem' }}>
                  Password
                </label>
                <input
                  id="password-input"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  style={{
                    width: '100%',
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: 4,
                    padding: '.75rem .9rem',
                    fontSize: '.9rem',
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: '#005691',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 4,
                  padding: '.8rem',
                  fontWeight: 800,
                  fontSize: '.92rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: '0 2px 6px rgba(0,86,145,0.3)'
                }}
              >
                {loading ? 'Authenticating Credentials...' : 'Login to NetBanking →'}
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', textAlign: 'center', fontSize: '.8rem', color: '#64748b' }}>
              Don't have a NetBanking account?{' '}
              <Link to="/register" style={{ color: '#005691', fontWeight: 700, textDecoration: 'none' }}>
                Register Online
              </Link>
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '.75rem 1.5rem', borderTop: '1px solid #e2e8f0', fontSize: '.72rem', color: '#64748b', textAlign: 'center' }}>
            🔒 Always verify that the URL displays <code>https://bac-project.vercel.app</code>
          </div>
        </div>
      </div>
    </div>
  )
}
