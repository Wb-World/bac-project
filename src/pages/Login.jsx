import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import PublicNavbar from '../components/PublicNavbar'
import PublicFooter from '../components/PublicFooter'

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
      setError(err.response?.data?.error || 'Invalid Customer User ID or password. Please verify credentials.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (u, p) => {
    setUsername(u)
    setPassword(p)
  }

  return (
    <div className="public-page-layout">
      <PublicNavbar />

      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-card-header">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="NexusBank Logo" style={{ height: 38, width: 38, objectFit: 'contain', borderRadius: 4 }} />
                <div>
                  <h2 className="auth-card-title">NetBanking Login</h2>
                  <div className="auth-card-sub">Retail & Corporate Secure Access</div>
                </div>
              </div>
              <span className="badge badge-green">256-BIT SSL</span>
            </div>
          </div>

          <div className="auth-card-body">
            {error && (
              <div className="alert alert-error">
                <span>⚠</span>
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="login-username">
                  Customer User ID / Username
                </label>
                <input
                  id="login-username"
                  name="username"
                  type="text"
                  required
                  autoFocus
                  className="form-input"
                  placeholder="Enter User ID"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="form-group">
                <div className="flex justify-between items-center mb-1">
                  <label className="form-label mb-0" htmlFor="login-password">
                    Password
                  </label>
                </div>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  required
                  className="form-input"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-full btn-lg mt-2"
              >
                {loading ? 'Authenticating Credentials...' : 'Sign In to NetBanking →'}
              </button>
            </form>


            <div className="auth-footer-link">
              Don't have an online banking profile?{' '}
              <Link to="/register">Open an Account Online</Link>
            </div>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}
