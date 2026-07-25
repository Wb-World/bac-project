import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Sidebar() {
  const { user, account, logout } = useAuth()
  const loc = useLocation()

  const is = (p) => loc.pathname === p

  const mainNav = [
    { path: '/dashboard',    icon: '🏠', label: 'My Accounts' },
    { path: '/transactions', icon: '📜', label: 'Passbook / Statement' },
    { path: '/transfer',     icon: '↗️',  label: 'Fund Transfer' },
    { path: '/deposit',      icon: '💳',  label: 'Deposit' },
    { path: '/documents',    icon: '📂',  label: 'e-Documents' },
    { path: '/profile',      icon: '👤',  label: 'My Profile' },
  ]

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <img src="/logo.png" alt="NexusBank Logo" style={{ height: 36, width: 36, objectFit: 'contain', borderRadius: 4 }} />
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff', letterSpacing: '-.3px' }}>NexusBank</div>
          <div style={{ fontSize: '.6rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.6px' }}>Net Banking</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Services</div>
        {mainNav.map(n => (
          <Link key={n.path} to={n.path}
            className={`nav-item${is(n.path) ? ' active' : ''}`}>
            <span className="nav-icon">{n.icon}</span>
            <span>{n.label}</span>
          </Link>
        ))}

        {user?.role === 'admin' && (
          <>
            <div className="nav-section-label" style={{ marginTop: '.5rem' }}>Management</div>
            <Link to="/admin"
              className={`nav-item${is('/admin') ? ' active' : ''}`}>
              <span className="nav-icon">⚙️</span>
              <span>Branch Console</span>
            </Link>
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '.6rem' }}>
          <div className="avatar" style={{ background: 'linear-gradient(135deg, #005691, #00a8cc)' }}>
            {(user?.username || 'U')[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '.84rem', color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.username}
            </div>
            <div style={{ fontSize: '.68rem', color: '#94a3b8' }}>
              {account?.account_no || 'Standard Savings'}
            </div>
          </div>
        </div>
        <button onClick={logout} style={{
          width: '100%', padding: '.45rem .75rem', background: 'rgba(239,68,68,.1)',
          border: '1px solid rgba(239,68,68,.25)', borderRadius: 4, color: '#f87171',
          fontSize: '.78rem', fontWeight: 700, cursor: 'pointer', textAlign: 'center',
        }}>
          🔒 Logout
        </button>
      </div>
    </aside>
  )
}
