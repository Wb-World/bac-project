import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div style={{ background: '#f4f7fa', minHeight: '100vh' }}>
      <div className="bank-ticker-bar">
        <div className="bank-ticker-left">
          <span className="ticker-badge">ANNOUNCEMENT</span>
          <span>Welcome to NexusBank Corporate Internet Banking Portal. Enjoy 24x7 NEFT & RTGS services.</span>
        </div>
        <div>Customer Care: 1800-11-2211 (Toll Free)</div>
      </div>

      <nav className="topnav">
        <div className="flex items-center gap-2">
          <div className="brand-icon">N</div>
          <span className="brand-name">NexusBank</span>
        </div>
        <div className="topnav-right">
          {user ? (
            <Link to="/dashboard" className="btn btn-accent btn-sm">NetBanking Dashboard →</Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm" style={{ color: '#fff' }}>Login</Link>
              <Link to="/register" className="btn btn-accent btn-sm">Register NetBanking</Link>
            </>
          )}
        </div>
      </nav>

      <div style={{ background: 'linear-gradient(135deg, #0a2540 0%, #001730 100%)', color: '#fff', padding: '4rem 5%', borderBottom: '4px solid var(--sbi-gold)' }}>
        <div style={{ maxWdith: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '3rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 320 }}>
            <span className="badge badge-orange mb-2">OFFICIAL ONLINE BANKING PORTAL</span>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, margin: '.6rem 0' }}>
              Corporate Internet Banking & Digital Passbook
            </h1>
            <p style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.8rem' }}>
              Manage accounts, initiate fund transfers, download e-statements, and track passbook transactions securely with NexusBank.
            </p>
            <div>
              {user ? (
                <button className="btn btn-accent btn-lg" onClick={() => navigate('/dashboard')}>
                  Go to NetBanking Portal →
                </button>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login" className="btn btn-accent btn-lg">Login to Account →</Link>
                  <Link to="/register" className="btn btn-outline btn-lg" style={{ color: '#fff', borderColor: '#fff' }}>New User Registration</Link>
                </div>
              )}
            </div>
          </div>

          <div style={{ background: '#fff', color: '#1e293b', borderRadius: 8, padding: '1.8rem', width: 340, boxShadow: '0 10px 30px rgba(0,0,0,0.3)', borderTop: '4px solid var(--sbi-blue)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0a2540', marginBottom: '.4rem' }}>Quick Login</h3>
            <p style={{ fontSize: '.78rem', color: '#64748b', marginBottom: '1.2rem' }}>Access your savings and checking accounts</p>
            <div className="flex flex-col gap-2">
              <Link to="/login" className="btn btn-primary btn-full">Personal NetBanking</Link>
              <Link to="/login" className="btn btn-ghost btn-full">Corporate NetBanking</Link>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '3rem 5%', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0a2540', marginBottom: '1.5rem', textAlign: 'center' }}>
          Banking Features & Digital Services
        </h2>

        <div className="grid-3">
          <div className="card">
            <div style={{ fontSize: '1.8rem', marginBottom: '.5rem' }}>🏛️</div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0a2540', marginBottom: '.3rem' }}>Account Management</h3>
            <p className="text-muted text-sm">View real-time balance, account details, and branch information anytime.</p>
          </div>

          <div className="card">
            <div style={{ fontSize: '1.8rem', marginBottom: '.5rem' }}>💸</div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0a2540', marginBottom: '.3rem' }}>Instant Transfers</h3>
            <p className="text-muted text-sm">Transfer money across accounts instantly via NEFT, RTGS, and IMPS.</p>
          </div>

          <div className="card">
            <div style={{ fontSize: '1.8rem', marginBottom: '.5rem' }}>📄</div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0a2540', marginBottom: '.3rem' }}>Digital E-Statements</h3>
            <p className="text-muted text-sm">Download quarterly account statements and document passbooks online.</p>
          </div>
        </div>
      </div>

      <footer style={{ background: '#001730', color: '#94a3b8', padding: '1.5rem 5%', textAlign: 'center', fontSize: '.78rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        © 2026 NexusBank India Limited. All Rights Reserved. | Privacy Policy | Terms of Service
      </footer>
    </div>
  )
}
