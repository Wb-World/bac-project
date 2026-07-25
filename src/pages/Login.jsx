import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [form, setForm]     = useState({ username: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await login(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid User ID or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #001730 0%, #0a2540 50%, #003366 100%)', display: 'flex', flexDirection: 'column', fontFamily: "'Open Sans', sans-serif" }}>

      {/* Top ticker */}
      <div style={{ background: '#000f1e', borderBottom: '2px solid #ff9900', padding: '.3rem 2rem', fontSize: '.72rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
        <span>🔐 Secure Session · 256-bit TLS Encryption Active</span>
        <span>📞 Helpdesk: 1800-11-2211</span>
      </div>

      {/* Header */}
      <header style={{ padding: '.8rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '.7rem', textDecoration: 'none' }}>
          <img src="/logo.png" alt="NexusBank" style={{ height: 36, objectFit: 'contain', borderRadius: 4 }} />
          <div>
            <div style={{ fontWeight: 800, color: '#fff', fontSize: '1.1rem' }}>NexusBank</div>
            <div style={{ fontSize: '.58rem', color: '#ff9900', letterSpacing: '1px', textTransform: 'uppercase' }}>Online Banking</div>
          </div>
        </Link>
        <Link to="/register" style={{ background: '#ff9900', color: '#001730', padding: '.45rem 1.1rem', borderRadius: 4, fontWeight: 800, fontSize: '.8rem', textDecoration: 'none' }}>
          New Registration
        </Link>
      </header>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Card */}
          <div style={{ background: '#ffffff', borderRadius: 8, boxShadow: '0 20px 50px rgba(0,0,0,.4)', borderTop: '5px solid #ff9900', overflow: 'hidden' }}>

            {/* Card header stripe */}
            <div style={{ background: '#0a2540', padding: '1.2rem 1.8rem', display: 'flex', alignItems: 'center', gap: '.7rem' }}>
              <img src="/logo.png" alt="NexusBank" style={{ height: 30, objectFit: 'contain', borderRadius: 3 }} />
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '.95rem' }}>NetBanking Portal</div>
                <div style={{ color: '#94a3b8', fontSize: '.68rem' }}>Retail &amp; Corporate Accounts</div>
              </div>
            </div>

            <div style={{ padding: '1.8rem' }}>
              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 4, padding: '.7rem .9rem', fontSize: '.82rem', color: '#991b1b', marginBottom: '1rem', display: 'flex', gap: '.5rem' }}>
                  <span>⚠</span> {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '.9rem' }}>
                  <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 700, color: '#374151', marginBottom: '.3rem' }}>
                    User ID / Customer ID
                  </label>
                  <input
                    type="text" required autoFocus
                    value={form.username}
                    onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                    placeholder="Enter your User ID"
                    style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 4, padding: '.65rem .85rem', fontSize: '.88rem', outline: 'none', transition: 'border-color .15s' }}
                  />
                </div>
                <div style={{ marginBottom: '1.2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.3rem' }}>
                    <label style={{ fontSize: '.78rem', fontWeight: 700, color: '#374151' }}>Password</label>
                    <a href="#" style={{ fontSize: '.72rem', color: '#005691', fontWeight: 600 }}>Forgot Password?</a>
                  </div>
                  <input
                    type="password" required
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="••••••••"
                    style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 4, padding: '.65rem .85rem', fontSize: '.88rem', outline: 'none' }}
                  />
                </div>
                <button type="submit" disabled={loading} style={{ width: '100%', background: '#005691', color: '#fff', border: 'none', borderRadius: 4, padding: '.75rem', fontWeight: 700, fontSize: '.9rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1 }}>
                  {loading ? 'Authenticating…' : 'Login to NetBanking →'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', fontSize: '.78rem', color: '#64748b' }}>
                First time here? <Link to="/register" style={{ color: '#005691', fontWeight: 700 }}>Register for NetBanking</Link>
              </div>
            </div>

            {/* Security footer */}
            <div style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '.75rem 1.8rem', display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.7rem', color: '#64748b' }}>
              <span>🔒</span>
              <span>Never share your password or OTP. NexusBank will never ask for them.</span>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '.72rem', color: '#94a3b8' }}>
            © 2026 NexusBank Ltd · RBI Regulated · 256-bit SSL Secured
          </div>
        </div>
      </div>
    </div>
  )
}
