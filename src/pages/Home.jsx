import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div style={{ background: '#f4f7fa', minHeight: '100vh', fontFamily: "'Open Sans', sans-serif" }}>

      {/* Ticker */}
      <div style={{ background: '#001730', borderBottom: '2px solid #ff9900', padding: '.3rem 1.5rem', fontSize: '.72rem', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between' }}>
        <span>📢 NexusBank NetBanking is now available 24×7. Safe. Secure. Simple.</span>
        <span>📞 1800-11-2211 (Toll Free)</span>
      </div>

      {/* Header */}
      <header style={{ background: '#0a2540', borderBottom: '3px solid #ff9900', padding: '0 2rem', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '.7rem', textDecoration: 'none' }}>
          <img src="/logo.png" alt="NexusBank" style={{ height: 38, width: 38, objectFit: 'contain', borderRadius: 4 }} />
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-.3px' }}>NexusBank</div>
            <div style={{ color: '#ff9900', fontSize: '.6rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Online Banking</div>
          </div>
        </Link>
        <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
          {user ? (
            <button onClick={() => navigate('/dashboard')} style={{ background: '#ff9900', color: '#001730', border: 'none', borderRadius: 4, padding: '.5rem 1.2rem', fontWeight: 800, fontSize: '.85rem', cursor: 'pointer' }}>
              Go to Dashboard →
            </button>
          ) : (
            <>
              <Link to="/login" style={{ color: '#cbd5e1', fontSize: '.85rem', fontWeight: 600, textDecoration: 'none' }}>Login</Link>
              <Link to="/register" style={{ background: '#ff9900', color: '#001730', borderRadius: 4, padding: '.5rem 1.2rem', fontWeight: 800, fontSize: '.85rem', textDecoration: 'none' }}>
                Open Account
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #0a2540 0%, #003366 60%, #004d8a 100%)', padding: '3.5rem 2rem 3rem', color: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '3rem', alignItems: 'center' }}>
          <div>
            <div style={{ background: 'rgba(255,153,0,.15)', border: '1px solid rgba(255,153,0,.3)', borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: '.5rem', padding: '.25rem .75rem', marginBottom: '1rem', fontSize: '.75rem', color: '#ff9900', fontWeight: 700, letterSpacing: '.5px' }}>
              🔒 SECURE BANKING PORTAL
            </div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '.9rem' }}>
              Banking that works<br />
              <span style={{ color: '#ff9900' }}>the way you do</span>
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.7, maxWidth: 480, marginBottom: '1.8rem' }}>
              Instant fund transfers, real-time passbook, and complete account management — all from your browser. No branch visits. No waiting.
            </p>
            <div style={{ display: 'flex', gap: '.75rem' }}>
              {user ? (
                <button onClick={() => navigate('/dashboard')} style={{ background: '#ff9900', color: '#001730', border: 'none', borderRadius: 4, padding: '.75rem 1.8rem', fontWeight: 800, fontSize: '.95rem', cursor: 'pointer' }}>
                  Open Dashboard →
                </button>
              ) : (
                <>
                  <Link to="/login" style={{ background: '#ff9900', color: '#001730', borderRadius: 4, padding: '.75rem 1.8rem', fontWeight: 800, fontSize: '.95rem', textDecoration: 'none' }}>
                    Login to NetBanking
                  </Link>
                  <Link to="/register" style={{ background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,.4)', borderRadius: 4, padding: '.75rem 1.4rem', fontWeight: 600, fontSize: '.9rem', textDecoration: 'none' }}>
                    New Registration
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Login Card */}
          <div style={{ background: '#fff', borderRadius: 8, padding: '1.8rem', boxShadow: '0 12px 30px rgba(0,0,0,.25)', borderTop: '4px solid #ff9900' }}>
            <img src="/logo.png" alt="NexusBank" style={{ height: 32, marginBottom: '.6rem', objectFit: 'contain' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0a2540', marginBottom: '.25rem' }}>NetBanking Login</h3>
            <p style={{ fontSize: '.75rem', color: '#64748b', marginBottom: '1.2rem' }}>Enter your credentials below</p>
            <div style={{ marginBottom: '.7rem' }}>
              <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 700, color: '#374151', marginBottom: '.3rem' }}>User ID</label>
              <input readOnly placeholder="Customer User ID" style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 4, padding: '.55rem .8rem', fontSize: '.85rem', background: '#f9fafb', color: '#9ca3af' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 700, color: '#374151', marginBottom: '.3rem' }}>Password</label>
              <input type="password" readOnly placeholder="••••••••" style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 4, padding: '.55rem .8rem', fontSize: '.85rem', background: '#f9fafb' }} />
            </div>
            <Link to="/login" style={{ display: 'block', width: '100%', background: '#005691', color: '#fff', border: 'none', borderRadius: 4, padding: '.65rem', fontWeight: 700, fontSize: '.88rem', cursor: 'pointer', textAlign: 'center', textDecoration: 'none' }}>
              Login →
            </Link>
            <div style={{ textAlign: 'center', marginTop: '.8rem', fontSize: '.74rem', color: '#64748b' }}>
              New user? <Link to="/register" style={{ color: '#005691', fontWeight: 700 }}>Register here</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '2.5rem 2rem', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0a2540', marginBottom: '.3rem' }}>Why customers choose NexusBank</h2>
        <p style={{ color: '#64748b', fontSize: '.85rem', marginBottom: '1.8rem' }}>Everything you need, nothing you don't.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {[
            { icon: '⚡', title: 'Instant NEFT/IMPS', desc: 'Send money in seconds. 24×7, no branch cutoffs or delays.' },
            { icon: '📊', title: 'Live Passbook', desc: 'Every debit and credit reflected instantly. Download as PDF too.' },
            { icon: '🔒', title: 'Multi-layer Security', desc: '256-bit TLS + 2-factor OTP authentication on every login.' },
            { icon: '📂', title: 'e-Statements', desc: 'Get quarterly and annual statements without visiting the branch.' },
          ].map(f => (
            <div key={f.title} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '1.3rem', borderLeft: '3px solid #005691' }}>
              <div style={{ fontSize: '1.6rem', marginBottom: '.5rem' }}>{f.icon}</div>
              <h3 style={{ fontSize: '.95rem', fontWeight: 700, color: '#0a2540', marginBottom: '.3rem' }}>{f.title}</h3>
              <p style={{ fontSize: '.82rem', color: '#64748b', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#001730', color: '#64748b', padding: '1.2rem 2rem', fontSize: '.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '.5rem', borderTop: '1px solid rgba(255,255,255,.06)' }}>
        <span>© 2026 NexusBank Ltd. All Rights Reserved.</span>
        <span>RBI Regulated · FDIC Member · ISO 27001 Certified</span>
        <span>Privacy Policy · Terms of Service · Contact Us</span>
      </footer>
    </div>
  )
}
