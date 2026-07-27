import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import PublicNavbar from '../components/PublicNavbar'
import PublicFooter from '../components/PublicFooter'

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    initialDeposit: 500,
    role: 'user'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Account opening failed. Please try a different username.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="public-page-layout">
      <PublicNavbar />

      <div className="auth-wrapper">
        <div className="auth-card" style={{ maxWidth: 520 }}>
          <div className="auth-card-header">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="NexusBank Logo" style={{ height: 38, width: 38, objectFit: 'contain', borderRadius: 4 }} />
                <div>
                  <h2 className="auth-card-title">Online Savings Account Opening</h2>
                  <div className="auth-card-sub">Instant Digital Onboarding</div>
                </div>
              </div>
              <span className="badge badge-orange">INSTANT E-KYC</span>
            </div>
          </div>

          <div className="auth-card-body">
            {/* Step indicator */}
            <div className="flex justify-between items-center mb-4 p-2 bg-light rounded text-xs">
              <span className="font-bold text-blue">Step 1: Account Info</span>
              <span className="text-muted">Step 2: Deposit</span>
              <span className="text-muted">Step 3: Access Ready</span>
            </div>

            {error && (
              <div className="alert alert-error">
                <span>⚠</span>
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-username">
                  Desired User ID / Username *
                </label>
                <input
                  id="reg-username"
                  type="text"
                  className="form-input"
                  placeholder="e.g. john_doe"
                  value={form.username}
                  onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                  required
                  autoFocus
                />
                <span className="text-xs text-muted">This will be your NetBanking User ID for signing in.</span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">
                  Email Address *
                </label>
                <input
                  id="reg-email"
                  type="email"
                  className="form-input"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">
                  Account Password *
                </label>
                <input
                  id="reg-password"
                  type="password"
                  className="form-input"
                  placeholder="Set strong security password"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                />
              </div>

              <div className="grid-2 gap-3">
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-deposit">
                    Initial Deposit ($)
                  </label>
                  <input
                    id="reg-deposit"
                    type="number"
                    className="form-input"
                    min="0"
                    step="10"
                    value={form.initialDeposit}
                    onChange={e => setForm(p => ({ ...p, initialDeposit: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-role">
                    Account Category
                  </label>
                  <select
                    id="reg-role"
                    className="form-select"
                    value={form.role}
                    onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                  >
                    <option value="user">Retail Savings Customer</option>
                    <option value="admin">Branch Officer (Admin)</option>
                  </select>
                </div>
              </div>

              <div className="security-banner mt-2 mb-3">
                <span>🛡️</span>
                <span className="text-xs">
                  By clicking Open Account, you agree to NexusBank's Terms of Service & Electronic Statements disclosure.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-accent btn-full btn-lg"
              >
                {loading ? 'Opening Account...' : 'Complete Online Opening →'}
              </button>
            </form>

            <div className="auth-footer-link">
              Already have a NetBanking account?{' '}
              <Link to="/login">Sign In Here</Link>
            </div>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}
