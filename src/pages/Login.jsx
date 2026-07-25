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
      setError(err.response?.data?.error || 'Login failed. Check credentials.')
    } finally {
      setLoading(false)
    }
  }

  const quickLogin = (username, password) => {
    setForm({ username, password })
    setTimeout(() => document.getElementById('login-submit')?.click(), 100)
  }

  return (
    <div className="auth-page">
      <nav className="topnav">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
            <div className="brand-icon">N</div>
            <span className="brand-name">NexusBank</span>
          </Link>
        </div>
        <div className="topnav-right">
          <Link to="/register" className="btn btn-primary btn-sm">Open Account →</Link>
        </div>
      </nav>

      <div className="auth-container">
        <div className="auth-box slide-up">
          <div className="auth-logo">
            <div className="brand-icon">N</div>
            <span className="brand-name">NexusBank</span>
          </div>
          <div className="auth-title">Welcome back</div>
          <div className="auth-sub" style={{ marginBottom: '1.5rem' }}>Sign in to access your account</div>

          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="username">Username</label>
              <input
                id="username" type="text" className="form-input"
                placeholder="Enter your username"
                value={form.username}
                onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                required autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password" type="password" className="form-input"
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                required
              />
            </div>
            <button id="login-submit" type="submit" className="btn btn-primary btn-full mt-3" disabled={loading}>
              {loading ? <><span className="spin" style={{ width: 14, height: 14, border: '2px solid #0a0e14', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block' }} /> Signing in…</> : 'Sign In →'}
            </button>
          </form>

          <div className="divider-text" style={{ margin: '1.2rem 0' }}>Quick Login</div>

          {/* Seed credential shortcuts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem' }}>
            {[
              { u: 'admin',   p: 'admin123',   label: 'Admin',   role: 'admin' },
              { u: 'alice',   p: 'alice123',   label: 'Alice',   role: 'user'  },
              { u: 'bob',     p: 'bob123',     label: 'Bob',     role: 'user'  },
              { u: 'charlie', p: 'charlie123', label: 'Charlie', role: 'user'  },
            ].map(({ u, p, label, role }) => (
              <button
                key={u}
                className="btn btn-ghost btn-sm"
                style={{ justifyContent: 'flex-start', gap: '.5rem' }}
                onClick={() => quickLogin(u, p)}
              >
                <div className="avatar avatar-sm">{label[0]}</div>
                <div style={{ textAlign: 'left', lineHeight: 1.3 }}>
                  <div style={{ fontSize: '.78rem', fontWeight: 600 }}>{label}</div>
                  <div style={{ fontSize: '.65rem', color: role === 'admin' ? 'var(--orange)' : 'var(--mt)' }}>{role}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="text-center mt-3">
            <span className="text-muted text-sm">No account? </span>
            <Link to="/register" style={{ color: 'var(--g)', fontSize: '.84rem', fontWeight: 600 }}>Register here</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
