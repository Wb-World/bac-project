import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function PublicNavbar() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'About Us', path: '/about' },
    { label: 'Services', path: '/services' },
    { label: 'Security & Safety', path: '/security' },
    { label: 'Contact & Support', path: '/contact' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <header className="public-header-wrapper">
      {/* Top Security Ticker */}
      <div className="bank-ticker-bar">
        <div className="bank-ticker-left">
          <span className="ticker-badge">OFFICIAL PORTAL</span>
          <span>🔒 256-Bit SSL Encrypted Banking · 24x7 Customer Helpline: 1800-11-2211 (Toll Free)</span>
        </div>
        <div style={{ fontSize: '.72rem', color: '#cbd5e1', display: 'flex', gap: '1.2rem' }}>
          <span>Emergency Card Block: 1800-22-9900</span>
          <span>Branch Locator</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="public-nav">
        <div className="public-nav-container">
          <Link to="/" className="public-brand">
            <img src="/logo.png" alt="NexusBank Logo" className="brand-logo-img" style={{ height: 38, width: 38, objectFit: 'contain', borderRadius: 6 }} />
            <div>
              <div className="brand-title">NexusBank</div>
              <div className="brand-subtitle">GLOBAL DIGITAL BANKING</div>
            </div>
          </Link>

          <div className="public-nav-links">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`public-nav-link ${isActive(item.path) ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="public-nav-actions">
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="btn btn-accent btn-sm">
                Go to Dashboard →
              </button>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-light btn-sm">
                  NetBanking Login
                </Link>
                <Link to="/register" className="btn btn-accent btn-sm">
                  Open Account
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
