import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'

const STATS_DATA = [
  { v: 82000 }, { v: 87500 }, { v: 85000 }, { v: 91000 },
  { v: 88000 }, { v: 95000 }, { v: 99000 }, { v: 109500 },
]

const FEATURES = [
  { icon: '🔒', title: 'Bank-Grade Security', desc: 'Military-grade TLS encryption on every transaction', color: 'var(--g)' },
  { icon: '⚡', title: 'Instant Transfers',   desc: 'Money moves in milliseconds, not days', color: 'var(--blue)' },
  { icon: '📊', title: 'Smart Analytics',     desc: 'Real-time insights into your spending patterns', color: 'var(--orange)' },
  { icon: '🌍', title: 'Global Reach',        desc: 'Send money to 150+ countries with zero hidden fees', color: 'var(--purple)' },
]

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="hero">
      {/* Navbar */}
      <nav className="topnav">
        <div className="flex items-center gap-2">
          <div className="brand-icon">N</div>
          <span className="brand-name">NexusBank</span>
        </div>
        <div className="topnav-right">
          {user ? (
            <>
              <Link to="/dashboard" className="btn btn-ghost btn-sm">Dashboard</Link>
              <Link to="/dashboard" className="btn btn-primary btn-sm">Go to Account →</Link>
            </>
          ) : (
            <>
              <Link to="/login"    className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Open Account →</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div className="hero-content">
        <div className="hero-text slide-in">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '.5rem',
            background: 'var(--gg-sm)', border: '1px solid var(--bdr)',
            borderRadius: 20, padding: '.3rem .9rem',
            fontSize: '.75rem', color: 'var(--g)', fontWeight: 600,
            marginBottom: '1.2rem',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--g)', display: 'inline-block' }} />
            Security Research — Intentionally Vulnerable App
          </div>
          <h1 className="hero-title">
            Banking for<br />the <span>Digital Age</span>
          </h1>
          <p className="hero-sub">
            NexusBank is a full-featured digital bank demonstrating OWASP Broken Access Control
            vulnerabilities. Research, explore, and learn how BAC attacks work in a realistic environment.
          </p>
          <div className="hero-cta">
            {user ? (
              <button className="btn btn-primary btn-lg pulse" onClick={() => navigate('/dashboard')}>
                Go to Dashboard →
              </button>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg pulse">Open Account →</Link>
                <Link to="/login"    className="btn btn-outline btn-lg">Sign In</Link>
              </>
            )}
          </div>

          {/* Vuln strip */}
          <div style={{
            marginTop: '2rem',
            background: 'rgba(239,68,68,.07)', border: '1px solid rgba(239,68,68,.22)',
            borderRadius: 12, padding: '1rem 1.2rem',
            fontSize: '.8rem',
          }}>
            <div style={{ color: '#fca5a5', fontWeight: 700, marginBottom: '.5rem', fontSize: '.74rem', letterSpacing: 1, textTransform: 'uppercase' }}>
              🐛 Active Vulnerabilities
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
              {['BAC-1 IDOR Account', 'BAC-2 Role Escalation', 'BAC-3 JWT Forgery', 'BAC-4 IDOR Transactions', 'BAC-5 Path Traversal'].map(v => (
                <span key={v} style={{
                  background: 'rgba(239,68,68,.12)', color: '#fca5a5',
                  border: '1px solid rgba(239,68,68,.25)',
                  borderRadius: 20, padding: '.2rem .7rem', fontSize: '.7rem', fontWeight: 600,
                }}>{v}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="hero-card float">
          <div style={{
            background: 'var(--c1)', border: '1px solid var(--bdr)',
            borderRadius: 24, padding: '1.8rem', minWidth: 340,
          }}>
            <div style={{ marginBottom: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--mt)', fontSize: '.8rem' }}>NexusBank Premier</span>
              <span style={{ fontSize: '1.2rem' }}>💳</span>
            </div>
            <div className="balance-label">Total Bank Assets</div>
            <div className="balance-amount">$109,500.00</div>
            <div className="balance-sub" style={{ marginBottom: '1.2rem' }}>Across 5 accounts</div>

            <div style={{ height: 80 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={STATS_DATA}>
                  <defs>
                    <linearGradient id="gGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#00d084" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#00d084" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke="#00d084" strokeWidth={2} fill="url(#gGrad)" dot={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--c2)', border: '1px solid var(--bdr)', borderRadius: 8 }}
                    formatter={v => [`$${v.toLocaleString()}`, 'Balance']}
                    labelFormatter={() => ''}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div style={{ borderTop: '1px solid var(--bdr)', paddingTop: '1rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {[['5', 'Users'], ['12+', 'Transactions'], ['5', 'Vulns']].map(([v, l]) => (
                  <div key={l} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--g)' }}>{v}</div>
                    <div style={{ fontSize: '.72rem', color: 'var(--mt)' }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: '0 5% 4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {FEATURES.map(({ icon, title, desc, color }) => (
            <div key={title} className="card card-sm" style={{ transition: 'all .2s' }}>
              <div style={{ fontSize: '1.6rem', marginBottom: '.7rem' }}>{icon}</div>
              <div style={{ fontWeight: 700, marginBottom: '.35rem', fontSize: '.95rem' }}>{title}</div>
              <p style={{ color: 'var(--mt)', fontSize: '.82rem', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <footer style={{ padding: '1.2rem 5%', borderTop: '1px solid var(--bdr)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '.78rem' }}>
        <span style={{ color: 'var(--g)', fontWeight: 700 }}>NexusBank</span>
        <span style={{ color: 'var(--mt)' }}>© 2026 — Security Research Only · Do Not Deploy to Production</span>
        <a href="/api/vulns" target="_blank" style={{ color: 'var(--red)', fontSize: '.72rem' }}>🐛 /api/vulns</a>
      </footer>
    </div>
  )
}
