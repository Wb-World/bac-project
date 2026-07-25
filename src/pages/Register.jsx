import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    initialDeposit: 100,
    role: 'user'
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
      <div className="bank-ticker-bar">
        <div className="bank-ticker-left">
          <span className="ticker-badge">ONLINE REGISTRATION</span>
          <span>Open a Instant Savings Account online with e-KYC.</span>
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
          <Link to="/login" className="btn btn-ghost btn-sm" style={{ color: '#fff' }}>Login NetBanking</Link>
        </div>
      </nav>

      <div className="auth-container">
        <div className="auth-box">
          <div className="auth-logo">
            <div className="brand-icon">N</div>
            <div>
              <div className="auth-title">Customer Account Registration</div>
              <div style={{ fontSize: '.72rem', color: '#64748b' }}>Instant Online Account Opening</div>
            </div>
          </div>

          {error && (
            <div className="alert alert-error">
              <span>⚠</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-username">User ID / Username</label>
              <input
                id="reg-username" type="text" className="form-input"
                placeholder="Choose Customer User ID"
                value={form.username}
                onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                required autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email Address</label>
              <input
                id="reg-email" type="email" className="form-input"
                placeholder="customer@email.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <input
                id="reg-password" type="password" className="form-input"
                placeholder="Set Account Password"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                required
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-deposit">Opening Deposit ($)</label>
                <input
                  id="reg-deposit" type="number" className="form-input"
                  min="0" step="10"
                  value={form.initialDeposit}
                  onChange={e => setForm(p => ({ ...p, initialDeposit: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-role">Account Category</label>
                <select
                  id="reg-role"
                  className="form-select"
                  value={form.role}
                  onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                >
                  <option value="user">Retail Customer (Savings)</option>
                  <option value="admin">Branch Officer (Admin)</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full mt-2" disabled={loading}>
              {loading ? 'Processing...' : 'Complete Online Opening →'}
            </button>
          </form>

          <div className="text-center mt-3">
            <span className="text-muted text-sm">Already registered? </span>
            <Link to="/login" style={{ color: '#005691', fontSize: '.84rem', fontWeight: 700 }}>Log in here</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
