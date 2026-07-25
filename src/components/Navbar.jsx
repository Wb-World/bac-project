import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Sidebar() {
  const { user, account, logout } = useAuth()
  const location = useLocation()

  const navs = [
    { path: '/dashboard',    label: 'Accounts Summary', icon: '🏛️' },
    { path: '/transactions', label: 'Passbook & Statement', icon: '📋' },
    { path: '/transfer',     label: 'Fund Transfer (NEFT/RTGS)', icon: '💸' },
    { path: '/deposit',      label: 'Instant E-Deposit', icon: '💳' },
    { path: '/documents',    label: 'E-Statements & Vault', icon: '📁' },
    { path: '/profile',      label: 'Customer Profile', icon: '👤' },
  ]

  if (user?.role === 'admin') {
    navs.push({ path: '/admin', label: 'Branch Audit Console', icon: '⚙️' })
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">N</div>
        <div>
          <div className="brand-name">NexusBank</div>
          <div style={{ fontSize: '.62rem', color: '#94a3b8', letterSpacing: '.5px' }}>OFFICIAL CORPORATE BANKING</div>
        </div>
      </div>

      <div className="sidebar-nav">
        <div className="nav-section-label">MAIN SERVICES</div>
        {navs.map(n => (
          <Link
            key={n.path}
            to={n.path}
            className={`nav-item ${location.pathname === n.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{n.icon}</span>
            <span>{n.label}</span>
          </Link>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-user mb-2">
          <div className="avatar">{(user?.username || 'U')[0].toUpperCase()}</div>
          <div className="user-info">
            <div className="user-name">{user?.username}</div>
            <div className="user-role">A/C: {account?.account_no || 'Standard'}</div>
          </div>
        </div>
        <button onClick={logout} className="btn btn-ghost btn-sm btn-full" style={{ color: '#f87171', borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)' }}>
          🔒 Logout NetBanking
        </button>
      </div>
    </aside>
  )
}
