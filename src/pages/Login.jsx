import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await login(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please verify user ID & password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="bank-ticker-bar">
        <div className="bank-ticker-left">
          <span className="ticker-badge">SECURE BANKING</span>
          <span>Official Corporate NetBanking Portal. Check URL starts with https://</span>
        </div>
      </div>

      <nav className="topnav">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
            <div className="brand-icon">N</div>
            <span className="brand-name">NexusBank</span>
          </Link>
        </div>
        <div className="topnav-right">
          <Link to="/register" className="btn btn-accent btn-sm">Register NetBanking →</Link>
        </div>
      </nav>

      <div className="auth-container">
        <div className="auth-box">
          <div className="auth-logo">
            <div className="brand-icon">N</div>
            <div>
              <div className="auth-title">NetBanking Login</div>
              <div style={{ fontSize: '.72rem', color: '#64748b' }}>Retail & Corporate Banking Portal</div>
            </div>
          </div>

          <div className="security-banner">
            <span>🔒</span>
            <div>Use virtual keyboard or ensure caps lock is off. Never share credentials.</div>
          </div>

          {error && (
            <div className="alert alert-error">
              <span>⚠</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="username">User ID / Customer ID</label>
              <input
                id="username" type="text" className="form-input"
                placeholder="Enter User ID"
                value={form.username}
                onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                required autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password" type="password" className="form-input"
                placeholder="Enter Password"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                required
              />
            </div>

            <button id="login-submit" type="submit" className="btn btn-primary btn-full mt-3" disabled={loading}>
              {loading ? 'Authenticating...' : 'Login to NetBanking →'}
            </button>
          </form>

          <div className="text-center mt-3">
            <span className="text-muted text-sm">New to NetBanking? </span>
            <Link to="/register" style={{ color: '#005691', fontSize: '.84rem', fontWeight: 700 }}>Register Customer Account</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
