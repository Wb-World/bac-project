import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import PublicNavbar from '../components/PublicNavbar'
import PublicFooter from '../components/PublicFooter'

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="public-page-layout">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="hero-banner">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-pill">
              <span>✨ NEXT-GEN INTERNET BANKING</span>
            </div>
            <h1 className="hero-title">
              Smarter Financial Services for Modern Living
            </h1>
            <p className="hero-sub">
              Experience ultra-fast fund transfers, live digital passbook, instant e-statements, and institutional-grade financial security — all under one unified platform.
            </p>

            <div className="hero-actions">
              {user ? (
                <button onClick={() => navigate('/dashboard')} className="btn btn-accent btn-lg">
                  Access NetBanking Dashboard →
                </button>
              ) : (
                <>
                  <Link to="/register" className="btn btn-accent btn-lg">
                    Open Digital Account in 3 Mins →
                  </Link>
                  <Link to="/login" className="btn btn-outline-light btn-lg">
                    Login to NetBanking 🔒
                  </Link>
                </>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="hero-stats">
              <div className="hero-stat-item">
                <div className="hero-stat-num">5M+</div>
                <div className="hero-stat-lbl">Active Account Holders</div>
              </div>
              <div className="hero-stat-item">
                <div className="hero-stat-num">₹99.9%</div>
                <div className="hero-stat-lbl">Uptime & Instant Processing</div>
              </div>
              <div className="hero-stat-item">
                <div className="hero-stat-num">256-bit</div>
                <div className="hero-stat-lbl">Military Grade Security</div>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-card-preview">
              <div className="preview-card-header">
                <div className="preview-chip"></div>
                <div className="preview-logo">NexusBank</div>
              </div>
              <div className="preview-card-num">•••• •••• •••• 8842</div>
              <div className="preview-card-footer">
                <div>
                  <div className="preview-lbl">ACCOUNT HOLDER</div>
                  <div className="preview-val">EXECUTIVE MEMBER</div>
                </div>
                <div>
                  <div className="preview-lbl">EXPIRES</div>
                  <div className="preview-val">12/30</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Financial Rates Ticker Bar */}
      <section className="rates-bar">
        <div className="rates-container">
          <div className="rate-item">
            <span className="rate-label">Savings APY:</span>
            <span className="rate-value text-green">7.25% p.a. ▲</span>
          </div>
          <div className="rate-item">
            <span className="rate-label">Fixed Deposit (1 Yr):</span>
            <span className="rate-value text-green">8.10% p.a. ▲</span>
          </div>
          <div className="rate-item">
            <span className="rate-label">Home Loans From:</span>
            <span className="rate-value text-blue">8.35% p.a.</span>
          </div>
          <div className="rate-item">
            <span className="rate-label">Personal Loans:</span>
            <span className="rate-value text-blue">10.49% p.a.</span>
          </div>
        </div>
      </section>

      {/* Services Showcase */}
      <section className="public-section bg-light">
        <div className="section-container">
          <div className="section-header text-center">
            <span className="section-subtitle">WHAT WE OFFER</span>
            <h2 className="section-title">Comprehensive Banking Built Around You</h2>
            <p className="section-desc">Explore tailored digital banking solutions engineered for high performance, ease, and total peace of mind.</p>
          </div>

          <div className="grid-3 gap-4">
            <div className="service-card">
              <div className="service-icon">⚡</div>
              <h3>Instant Money Transfer</h3>
              <p>Execute zero-fee NEFT, RTGS, and IMPS fund transfers 24x7 with immediate SMS & email transaction alerts.</p>
              <Link to="/services" className="service-link">Learn More →</Link>
            </div>

            <div className="service-card">
              <div className="service-icon">📊</div>
              <h3>Live Digital Passbook</h3>
              <p>Track incoming credits and outgoing debits in real time with automated categorizations and smart analytics.</p>
              <Link to="/services" className="service-link">Learn More →</Link>
            </div>

            <div className="service-card">
              <div className="service-icon">📂</div>
              <h3>Instant E-Statements</h3>
              <p>Retrieve official monthly and quarterly stamped PDF bank statements for tax verification and audits.</p>
              <Link to="/services" className="service-link">Learn More →</Link>
            </div>

            <div className="service-card">
              <div className="service-icon">💳</div>
              <h3>Smart Savings & Term Deposits</h3>
              <p>Earn high-yield returns with automated recurring deposits, flexible lock-in periods, and auto-renewals.</p>
              <Link to="/services" className="service-link">Learn More →</Link>
            </div>

            <div className="service-card">
              <div className="service-icon">🛡️</div>
              <h3>256-Bit Fraud Shield</h3>
              <p>Advanced real-time anomaly detection, encrypted session tokens, and instant card freeze tools.</p>
              <Link to="/security" className="service-link">Learn More →</Link>
            </div>

            <div className="service-card">
              <div className="service-icon">🎧</div>
              <h3>Dedicated 24x7 Priority Support</h3>
              <p>Reach out to expert relationship managers and support technicians around the clock without waiting lines.</p>
              <Link to="/contact" className="service-link">Learn More →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="public-section">
        <div className="section-container">
          <div className="grid-2 gap-4 items-center">
            <div>
              <span className="section-subtitle">TRUST & EXCELLENCE</span>
              <h2 className="section-title">Why Millions Trust NexusBank For Internet Banking</h2>
              <p className="text-muted mb-4">
                We combine traditional banking reliability with modern digital convenience. Whether you are managing personal wealth or managing corporate payrolls, our system delivers speed and clarity.
              </p>

              <div className="feature-list">
                <div className="feature-item">
                  <div className="feature-check">✓</div>
                  <div>
                    <strong>Zero Hide-Away Fees</strong>
                    <div className="text-muted text-sm">Transparent pricing structure with zero maintenance surcharges.</div>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-check">✓</div>
                  <div>
                    <strong>Instant Account Opening</strong>
                    <div className="text-muted text-sm">Paperless e-KYC onboarding process complete in under 3 minutes.</div>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-check">✓</div>
                  <div>
                    <strong>State-of-the-Art NetBanking Portal</strong>
                    <div className="text-muted text-sm">Streamlined UI for smooth transfers, deposits, and statement downloads.</div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <Link to="/register" className="btn btn-primary btn-lg">
                  Open Your Account Now →
                </Link>
              </div>
            </div>

            <div className="info-box-card">
              <h3 style={{ color: '#0a2540', fontWeight: 800, fontSize: '1.2rem', marginBottom: '1rem' }}>
                Bank Security Guarantee
              </h3>
              <p style={{ color: '#475569', fontSize: '.9rem', lineHeight: 1.6, marginBottom: '1.2rem' }}>
                All deposits are backed by national banking deposit insurance regulations. Your digital sessions are tokenized and protected by multi-factor security protocols.
              </p>
              <div className="badge-row flex gap-2">
                <span className="badge badge-blue">SSL Secure</span>
                <span className="badge badge-green">FDIC Insured</span>
                <span className="badge badge-orange">PCI-DSS Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <div className="cta-container text-center">
          <h2 className="cta-title">Ready to Experience Modern Digital Banking?</h2>
          <p className="cta-desc">Open an account in minutes or log into your existing NetBanking profile to get started.</p>
          <div className="flex gap-3 justify-center mt-4">
            <Link to="/register" className="btn btn-accent btn-lg">Get Started Online</Link>
            <Link to="/login" className="btn btn-outline-light btn-lg">Log In to NetBanking</Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
