import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const NAV = [
  { to: '/dashboard',    icon: '◈',  label: 'Dashboard'     },
  { to: '/transactions', icon: '↕',  label: 'Transactions'  },
  { to: '/transfer',     icon: '→',  label: 'Transfer'      },
  { to: '/deposit',      icon: '+',  label: 'Deposit'       },
  { to: '/documents',    icon: '📄', label: 'Documents',    badge: 'BAC-5' },
  { to: '/profile',      icon: '⚙',  label: 'Profile'       },
]
const ADMIN_NAV = [
  { to: '/admin',        icon: '🛡',  label: 'Admin Panel',  badge: 'BAC-3' },
]

export default function Sidebar() {
  const { user, account, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">N</div>
        <span className="brand-name">NexusBank</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Banking</div>
        {NAV.map(({ to, icon, label, badge }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <span className="nav-icon">{icon}</span>
            {label}
            {badge && <span className="nav-badge">{badge}</span>}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <>
            <div className="nav-section-label" style={{ marginTop: '.5rem' }}>Admin</div>
            {ADMIN_NAV.map(({ to, icon, label, badge }) => (
              <NavLink key={to} to={to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                <span className="nav-icon">{icon}</span>
                {label}
                {badge && <span className="nav-badge">{badge}</span>}
              </NavLink>
            ))}
          </>
        )}

        <div className="nav-section-label" style={{ marginTop: '.5rem' }}>Research</div>
        <a href="/api/vulns" target="_blank" className="nav-item">
          <span className="nav-icon">🐛</span>
          Vuln Map
          <span className="nav-badge-green nav-badge">API</span>
        </a>
        <NavLink to="/exploit-guide" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <span className="nav-icon">📖</span>
          Exploit Guide
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        {user && (
          <div className="sidebar-user" onClick={handleLogout} title="Click to logout">
            <div className="avatar">{user.username?.[0]?.toUpperCase()}</div>
            <div className="user-info">
              <div className="user-name">{user.username}</div>
              <div className="user-role">
                {user.role === 'admin'
                  ? '⚡ Admin · click to logout'
                  : account
                    ? `$${parseFloat(account.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                    : 'click to logout'}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
