import { Link } from 'react-router-dom'

export default function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="public-footer-container">
        <div className="footer-grid">
          <div className="footer-col brand-col">
            <div className="flex items-center gap-2 mb-2">
              <img src="/logo.png" alt="NexusBank Logo" style={{ height: 36, width: 36, objectFit: 'contain', borderRadius: 4 }} />
              <div>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.15rem' }}>NexusBank</div>
                <div style={{ color: 'var(--sbi-gold)', fontSize: '.65rem', fontWeight: 700, letterSpacing: '1px' }}>DIGITAL BANKING</div>
              </div>
            </div>
            <p className="footer-desc">
              Next-generation retail and corporate Internet Banking system delivering secure, instant, and seamless global financial services 24 hours a day.
            </p>
            <div className="footer-badges mt-3">
              <span className="badge badge-blue">ISO 27001 Certified</span>
              <span className="badge badge-green">256-Bit SSL Encrypted</span>
            </div>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home Landing</Link></li>
              <li><Link to="/about">About NexusBank</Link></li>
              <li><Link to="/services">Banking Services</Link></li>
              <li><Link to="/security">Security & Privacy</Link></li>
              <li><Link to="/contact">Support & Help</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Digital Banking</h4>
            <ul className="footer-links">
              <li><Link to="/login">NetBanking Portal Login</Link></li>
              <li><Link to="/register">Open Savings Account</Link></li>
              <li><Link to="/services">Corporate Banking</Link></li>
              <li><Link to="/services">Term Deposits & Rates</Link></li>
              <li><Link to="/security">Report Fraud / Fraud Desk</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Contact & Help Desk</h4>
            <div className="contact-item">📞 <strong>Toll Free:</strong> 1800-11-2211</div>
            <div className="contact-item">✉ <strong>Support:</strong> care@nexusbank.com</div>
            <div className="contact-item">🏢 <strong>Headquarters:</strong> Financial District, Tower 4, Mumbai</div>
            <div className="contact-item">⏱ <strong>Support Hours:</strong> 24×7 Instant Support</div>
          </div>
        </div>

        <div className="footer-bottom">
          <div>© {new Date().getFullYear()} NexusBank Ltd. All Rights Reserved. Member FDIC / RBI Compliant.</div>
          <div className="flex gap-3">
            <Link to="/security">Privacy Policy</Link>
            <Link to="/security">Terms of Service</Link>
            <Link to="/contact">Branch Directory</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
