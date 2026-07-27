import PublicNavbar from '../components/PublicNavbar'
import PublicFooter from '../components/PublicFooter'
import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div className="public-page-layout">
      <PublicNavbar />

      <section className="page-hero">
        <div className="page-hero-container">
          <h1 className="page-hero-title">About NexusBank</h1>
          <p className="page-hero-sub">Pioneering Financial Security, Trust, and Technological Excellence Since 1998.</p>
        </div>
      </section>

      <section className="public-section">
        <div className="section-container">
          <div className="grid-2 gap-4 items-center">
            <div>
              <span className="section-subtitle">OUR HERITAGE & VISION</span>
              <h2 className="section-title">Empowering Individuals & Businesses Globally</h2>
              <p className="text-muted mb-3">
                NexusBank was founded with a singular purpose: to deliver secure, accessible, and transparent banking solutions to millions of retail and corporate customers worldwide.
              </p>
              <p className="text-muted mb-4">
                Today, our netbanking portal processes millions of transactions daily with 99.99% system uptime, powered by state-of-the-art encryption and cloud-native architecture.
              </p>

              <div className="grid-2 gap-3 mt-4">
                <div className="card text-center p-3">
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--sbi-blue)' }}>25+ Years</div>
                  <div className="text-muted text-sm">Banking Excellence</div>
                </div>
                <div className="card text-center p-3">
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)' }}>500+</div>
                  <div className="text-muted text-sm">Global Branches</div>
                </div>
              </div>
            </div>

            <div className="card p-4" style={{ background: '#f8fafc', borderLeft: '5px solid var(--sbi-gold)' }}>
              <h3 className="card-title mb-3" style={{ fontSize: '1.2rem' }}>Corporate Governance & Values</h3>
              <ul className="flex flex-col gap-3">
                <li>
                  <strong>🔒 Integrity & Security:</strong> We uphold strict regulatory standards to safeguard customer capital and sensitive credentials.
                </li>
                <li>
                  <strong>⚡ Innovation:</strong> Continuous technological deployment for instant transfers, e-KYC onboarding, and real-time passbooks.
                </li>
                <li>
                  <strong>🤝 Customer First:</strong> 24/7 dedicated support teams ensuring instant resolution for all banking inquiries.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="public-section bg-light">
        <div className="section-container">
          <div className="section-header text-center">
            <span className="section-subtitle">OUR LEADERSHIP</span>
            <h2 className="section-title">Governed by Financial Industry Experts</h2>
          </div>

          <div className="grid-3 gap-4">
            {[
              { name: 'Dr. Arthur Vance', role: 'Chief Executive Officer', desc: 'Over 30 years leading international banking institutions and risk management frameworks.' },
              { name: 'Elena Rostova', role: 'Head of Cyber Security', desc: 'Former lead advisor on cryptographic security and PCI-DSS compliance frameworks.' },
              { name: 'David K. Chen', role: 'Director of Digital Banking', desc: 'Pioneer of high-throughput real-time payment gateways and automated passbook tech.' }
            ].map(m => (
              <div key={m.name} className="card p-4 text-center">
                <div className="avatar mx-auto mb-3" style={{ width: 56, height: 56, fontSize: '1.4rem', background: 'var(--sbi-blue)', color: '#fff', margin: '0 auto 1rem' }}>
                  {m.name[0]}
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0a2540' }}>{m.name}</h3>
                <div style={{ fontSize: '.78rem', color: 'var(--sbi-gold-dark)', fontWeight: 700, marginBottom: '.6rem' }}>{m.role}</div>
                <p style={{ fontSize: '.84rem', color: '#64748b' }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-banner">
        <div className="cta-container text-center">
          <h2 className="cta-title">Join NexusBank Today</h2>
          <p className="cta-desc">Open an account in 3 simple steps with instant e-KYC verification.</p>
          <div className="mt-4">
            <Link to="/register" className="btn btn-accent btn-lg">Open Savings Account Now</Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
