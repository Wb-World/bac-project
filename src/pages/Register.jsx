import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    initialDeposit: 100,
    role: 'user' // BAC-2: Client controls this field
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await register(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.')
    } finally {
      setLoading(false)
    }
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
          <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
        </div>
      </nav>

      <div className="auth-container">
        <div className="auth-box slide-up">
          <div className="auth-logo">
            <div className="brand-icon">N</div>
            <span className="brand-name">NexusBank</span>
          </div>
          <div className="auth-title">Create an Account</div>
          <div className="auth-sub" style={{ marginBottom: '1rem' }}>
            {/* Join NexusBank <span className="badge badge-vuln">BAC-2</span> */}
          </div>

          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠</span>
              {error}
            </div>
          )}

          {/* <div className="alert alert-vuln" style={{ fontSize: '.75rem', marginBottom: '1.2rem' }}>
            <div><strong>[BAC-2 Demo]</strong> Role parameter is accepted from request body.</div>
            <div style={{ color: 'var(--mt)', marginTop: 2 }}>You can register as an admin using the role selector below or via HTTP payload.</div>
          </div> */}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-username">Username</label>
              <input
                id="reg-username" type="text" className="form-input"
                placeholder="Choose username"
                value={form.username}
                onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                required autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email</label>
              <input
                id="reg-email" type="email" className="form-input"
                placeholder="your@email.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <input
                id="reg-password" type="password" className="form-input"
                placeholder="Choose password"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                required
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-deposit">Initial Deposit ($)</label>
                <input
                  id="reg-deposit" type="number" className="form-input"
                  min="0" step="10"
                  value={form.initialDeposit}
                  onChange={e => setForm(p => ({ ...p, initialDeposit: e.target.value }))}
                />
              </div>

              {/* BAC-2 Role Manipulator */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-role" style={{ color: 'var(--orange)' }}>
                  select user
                </label>
                <select
                  id="reg-role"
                  className="form-select"
                  value={form.role}
                  onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                  style={{ borderColor: form.role === 'admin' ? 'var(--orange)' : 'var(--bdr2)' }}
                >
                  <option value="user">User (Default)</option>
                  <option value="admin">Admin (Escalation!)</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full mt-2" disabled={loading}>
              {loading ? 'Creating Account…' : 'Complete Registration →'}
            </button>
          </form>

          <div className="text-center mt-3">
            <span className="text-muted text-sm">Already registered? </span>
            <Link to="/login" style={{ color: 'var(--g)', fontSize: '.84rem', fontWeight: 600 }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
