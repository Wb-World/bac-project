import PublicNavbar from '../components/PublicNavbar'
import PublicFooter from '../components/PublicFooter'
import { Link } from 'react-router-dom'

export default function Security() {
  return (
    <div className="public-page-layout">
      <PublicNavbar />

      <section className="page-hero" style={{ background: 'linear-gradient(135deg, #001730 0%, #0a2540 100%)' }}>
        <div className="page-hero-container text-center">
          <span className="ticker-badge mb-2">SECURITY CENTER</span>
          <h1 className="page-hero-title">Your Financial Protection is Our Top Priority</h1>
          <p className="page-hero-sub">Learn how NexusBank protects your accounts with multi-layer encryption and continuous monitoring.</p>
        </div>
      </section>

      <section className="public-section">
        <div className="section-container">
          <div className="grid-2 gap-4">
            <div className="card p-4">
              <h3 className="card-title mb-2" style={{ fontSize: '1.2rem', color: '#0a2540' }}>
                🛡️ Multi-Layer Security Architecture
              </h3>
              <p className="text-muted text-sm mb-4">
                Our Internet Banking system is protected by military-grade security controls designed to safeguard your money and identity at all times.
              </p>

              <div className="flex flex-col gap-3">
                <div className="p-3" style={{ background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                  <strong>256-Bit SSL Encryption:</strong> All data transmitted between your browser and our banking servers is encrypted using industry-standard TLS 1.3 protocols.
                </div>
                <div className="p-3" style={{ background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                  <strong>Tokenized Session Expiration:</strong> Active banking sessions automatically expire after periods of inactivity or token expiration, preventing unauthorized access.
                </div>
                <div className="p-3" style={{ background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                  <strong>Real-Time Transaction Alerts:</strong> Receive instant SMS and email notifications whenever funds move into or out of your account.
                </div>
              </div>
            </div>

            <div className="card p-4" style={{ background: '#fffbe6', border: '1px solid #ffe58f' }}>
              <h3 className="card-title mb-2" style={{ fontSize: '1.2rem', color: '#8c6b00' }}>
                ⚠️ Important Security Advisory
              </h3>
              <p style={{ fontSize: '.88rem', color: '#714b00', lineHeight: 1.6, marginBottom: '1rem' }}>
                NexusBank officers or customer support agents will <strong>NEVER</strong> ask for your NetBanking Password, One Time Password (OTP), or CVV number over email, phone call, or SMS.
              </p>

              <div className="flex flex-col gap-2 text-xs" style={{ color: '#593b00' }}>
                <div>✓ Always verify that the address bar displays <code>https://</code> with official domain.</div>
                <div>✓ Never share your NetBanking login credentials with anyone.</div>
                <div>✓ Regularly update your NetBanking password.</div>
                <div>✓ If you suspect suspicious activity, block your account immediately.</div>
              </div>

              <div className="mt-4">
                <Link to="/contact" className="btn btn-danger btn-sm">
                  🚨 Report Suspicious Activity Immediately
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
