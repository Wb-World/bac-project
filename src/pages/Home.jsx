import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Home() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleHomeLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ username, password })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: '#f4f7fa', minHeight: '100vh', fontFamily: "'Open Sans', sans-serif" }}>

      {/* Ticker */}
      <div style={{ background: '#001730', borderBottom: '2px solid #ff9900', padding: '.35rem 1.5rem', fontSize: '.74rem', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between' }}>
        <span>📢 Official NexusBank NetBanking Portal. Available 24×7 for Instant Transfers.</span>
        <span>📞 Customer Care: 1800-11-2211 (Toll Free)</span>
      </div>

      {/* Header */}
      <header style={{ background: '#0a2540', borderBottom: '3px solid #ff9900', padding: '0 2rem', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '.75rem', textDecoration: 'none' }}>
          <img src="/logo.png" alt="NexusBank" style={{ height: 38, width: 38, objectFit: 'contain', borderRadius: 4 }} />
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-.3px' }}>NexusBank</div>
            <div style={{ color: '#ff9900', fontSize: '.62rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>Online Banking</div>
          </div>
        </Link>
        <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
          {user ? (
            <button onClick={() => navigate('/dashboard')} style={{ background: '#ff9900', color: '#001730', border: 'none', borderRadius: 4, padding: '.5rem 1.2rem', fontWeight: 800, fontSize: '.85rem', cursor: 'pointer' }}>
              Go to Dashboard →
            </button>
          ) : (
            <>
              <Link to="/login" style={{ color: '#cbd5e1', fontSize: '.85rem', fontWeight: 600, textDecoration: 'none' }}>Login</Link>
              <Link to="/register" style={{ background: '#ff9900', color: '#001730', borderRadius: 4, padding: '.5rem 1.2rem', fontWeight: 800, fontSize: '.85rem', textDecoration: 'none' }}>
                Open Account
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #0a2540 0%, #003366 60%, #004d8a 100%)', padding: '3.5rem 2rem 3rem', color: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 360px', gap: '3rem', alignItems: 'center' }}>
          <div>
            <div style={{ background: 'rgba(255,153,0,.15)', border: '1px solid rgba(255,153,0,.3)', borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: '.5rem', padding: '.25rem .75rem', marginBottom: '1rem', fontSize: '.75rem', color: '#ff9900', fontWeight: 700, letterSpacing: '.5px' }}>
              🔒 SECURE BANKING PORTAL
            </div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '.9rem' }}>
              Corporate & Retail<br />
              <span style={{ color: '#ff9900' }}>Internet Banking Services</span>
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.7, maxWidth: 480, marginBottom: '1.8rem' }}>
              Instant fund transfers, real-time passbook, e-statements, and complete account management — all from your browser.
            </p>
            <div style={{ display: 'flex', gap: '.75rem' }}>
              {user ? (
                <button onClick={() => navigate('/dashboard')} style={{ background: '#ff9900', color: '#001730', border: 'none', borderRadius: 4, padding: '.75rem 1.8rem', fontWeight: 800, fontSize: '.95rem', cursor: 'pointer' }}>
                  Open Dashboard →
                </button>
              ) : (
                <>
                  <Link to="/login" style={{ background: '#ff9900', color: '#001730', borderRadius: 4, padding: '.75rem 1.8rem', fontWeight: 800, fontSize: '.95rem', textDecoration: 'none' }}>
                    Login to NetBanking
                  </Link>
                  <Link to="/register" style={{ background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,.4)', borderRadius: 4, padding: '.75rem 1.4rem', fontWeight: 600, fontSize: '.9rem', textDecoration: 'none' }}>
                    New Registration
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Quick Login Card */}
          <div style={{ background: '#fff', borderRadius: 8, padding: '1.8rem', boxShadow: '0 12px 30px rgba(0,0,0,.25)', borderTop: '4px solid #ff9900', color: '#1e293b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '1rem' }}>
              <img src="/logo.png" alt="NexusBank" style={{ height: 32, width: 32, objectFit: 'contain' }} />
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0a2540', margin: 0 }}>NetBanking Login</h3>
                <p style={{ fontSize: '.72rem', color: '#64748b', margin: 0 }}>Retail & Corporate Accounts</p>
              </div>
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 4, padding: '.5rem .8rem', fontSize: '.78rem', color: '#991b1b', marginBottom: '.8rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleHomeLogin}>
              <div style={{ marginBottom: '.8rem' }}>
                <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 700, color: '#0a2540', marginBottom: '.3rem' }}>User ID</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter User ID"
                  style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: 4, padding: '.55rem .8rem', fontSize: '.85rem', outline: 'none' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 700, color: '#0a2540', marginBottom: '.3rem' }}>Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: 4, padding: '.55rem .8rem', fontSize: '.85rem', outline: 'none' }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', background: '#005691', color: '#fff', border: 'none', borderRadius: 4, padding: '.65rem', fontWeight: 800, fontSize: '.88rem', cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                {loading ? 'Authenticating...' : 'Login →'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '.8rem', fontSize: '.75rem', color: '#64748b' }}>
              New customer? <Link to="/register" style={{ color: '#005691', fontWeight: 700 }}>Register online</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '3rem 2rem', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0a2540', marginBottom: '.4rem' }}>Digital Banking Services</h2>
        <p style={{ color: '#64748b', fontSize: '.85rem', marginBottom: '1.8rem' }}>24x7 online access to your finances.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {[
            { icon: '⚡', title: 'Instant Funds Transfer', desc: 'Move money to any account instantly via NEFT, RTGS, and IMPS.' },
            { icon: '📊', title: 'Live Digital Passbook', desc: 'Real-time transaction updates, debits, and credits tracking.' },
            { icon: '🔒', title: 'Secure Authentication', desc: 'Protected by 256-bit encryption and tokenized session controls.' },
            { icon: '📂', title: 'E-Statements Vault', desc: 'Retrieve quarterly statements and account tax documents.' },
          ].map(f => (
            <div key={f.title} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '1.3rem', borderLeft: '4px solid #005691' }}>
              <div style={{ fontSize: '1.6rem', marginBottom: '.5rem' }}>{f.icon}</div>
              <h3 style={{ fontSize: '.95rem', fontWeight: 700, color: '#0a2540', marginBottom: '.3rem' }}>{f.title}</h3>
              <p style={{ fontSize: '.82rem', color: '#64748b', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#001730', color: '#64748b', padding: '1.2rem 2rem', fontSize: '.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '.5rem' }}>
        <span>© 2026 NexusBank Ltd. All Rights Reserved.</span>
        <span>Customer Care: 1800-11-2211 · 256-bit SSL Encrypted</span>
      </footer>
    </div>
  )
}
