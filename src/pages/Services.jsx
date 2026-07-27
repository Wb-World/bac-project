import PublicNavbar from '../components/PublicNavbar'
import PublicFooter from '../components/PublicFooter'
import { Link } from 'react-router-dom'

export default function Services() {
  return (
    <div className="public-page-layout">
      <PublicNavbar />

      <section className="page-hero">
        <div className="page-hero-container">
          <h1 className="page-hero-title">Banking Services & Financial Products</h1>
          <p className="page-hero-sub">Tailored internet banking solutions built for personal wealth, commerce, and enterprise needs.</p>
        </div>
      </section>

      <section className="public-section">
        <div className="section-container">
          <div className="grid-3 gap-4">
            <div className="card p-4 border-top-blue">
              <div className="service-icon mb-2">💳</div>
              <h3 className="card-title mb-2">Retail Savings Accounts</h3>
              <p className="text-muted text-sm mb-3">
                High-interest personal savings accounts featuring instant debit cards, free unlimited online transfers, and zero minimum hidden balance penalties.
              </p>
              <ul className="text-xs text-muted mb-4 flex flex-col gap-1">
                <li>✓ Earn up to 7.25% annual interest</li>
                <li>✓ Instant virtual card generation</li>
                <li>✓ Automated bill payments</li>
              </ul>
              <Link to="/register" className="btn btn-primary btn-sm btn-full">Apply Online →</Link>
            </div>

            <div className="card p-4 border-top-gold">
              <div className="service-icon mb-2">🏢</div>
              <h3 className="card-title mb-2">Corporate & Business Accounts</h3>
              <p className="text-muted text-sm mb-3">
                Institutional current accounts with multi-user approval workflows, payroll disburser tools, and dedicated branch account managers.
              </p>
              <ul className="text-xs text-muted mb-4 flex flex-col gap-1">
                <li>✓ Bulk salary transfers (NEFT/RTGS)</li>
                <li>✓ Multi-tier authorization roles</li>
                <li>✓ Priority treasury exchange rates</li>
              </ul>
              <Link to="/register" className="btn btn-accent btn-sm btn-full">Open Business Account →</Link>
            </div>

            <div className="card p-4 border-top-blue">
              <div className="service-icon mb-2">📈</div>
              <h3 className="card-title mb-2">Fixed & Recurring Deposits</h3>
              <p className="text-muted text-sm mb-3">
                Grow your wealth risk-free with flexible term deposits, auto-rollover preferences, and competitive fixed yields up to 8.10% p.a.
              </p>
              <ul className="text-xs text-muted mb-4 flex flex-col gap-1">
                <li>✓ Flexible tenure (7 days to 10 years)</li>
                <li>✓ Premature withdrawal flexibility</li>
                <li>✓ Auto reinvestment options</li>
              </ul>
              <Link to="/login" className="btn btn-outline btn-sm btn-full">Book Term Deposit →</Link>
            </div>

            <div className="card p-4 border-top-blue">
              <div className="service-icon mb-2">📂</div>
              <h3 className="card-title mb-2">Digital Passbook & Vault</h3>
              <p className="text-muted text-sm mb-3">
                Real-time digital transaction passbook combined with instant stamped e-statement downloads for financial auditing and tax filings.
              </p>
              <ul className="text-xs text-muted mb-4 flex flex-col gap-1">
                <li>✓ Quarterly PDF statement export</li>
                <li>✓ Instant search & filtering</li>
                <li>✓ Verified digital bank stamps</li>
              </ul>
              <Link to="/login" className="btn btn-ghost btn-sm btn-full">Access Vault →</Link>
            </div>

            <div className="card p-4 border-top-gold">
              <div className="service-icon mb-2">⚡</div>
              <h3 className="card-title mb-2">Instant Fund Transfers</h3>
              <p className="text-muted text-sm mb-3">
                Seamless peer-to-peer and inter-bank transfers using instant IMPS, NEFT, and RTGS networks with 24x7 real-time settlement.
              </p>
              <ul className="text-xs text-muted mb-4 flex flex-col gap-1">
                <li>✓ 24x7x365 instant transfer</li>
                <li>✓ Beneficiary quick-add</li>
                <li>✓ Zero hidden commission</li>
              </ul>
              <Link to="/login" className="btn btn-ghost btn-sm btn-full">Make Transfer →</Link>
            </div>

            <div className="card p-4 border-top-blue">
              <div className="service-icon mb-2">🛡️</div>
              <h3 className="card-title mb-2">24x7 Security & Fraud Shield</h3>
              <p className="text-muted text-sm mb-3">
                State-of-the-art tokenized session management, SMS transaction alerts, and instant card block tools built directly into NetBanking.
              </p>
              <ul className="text-xs text-muted mb-4 flex flex-col gap-1">
                <li>✓ Instant SMS/email notifications</li>
                <li>✓ Tokenized session timeouts</li>
                <li>✓ Single-click emergency block</li>
              </ul>
              <Link to="/security" className="btn btn-ghost btn-sm btn-full">Security Details →</Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
