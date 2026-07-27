import { useState } from 'react'
import PublicNavbar from '../components/PublicNavbar'
import PublicFooter from '../components/PublicFooter'

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="public-page-layout">
      <PublicNavbar />

      <section className="page-hero">
        <div className="page-hero-container">
          <h1 className="page-hero-title">Customer Care & Support</h1>
          <p className="page-hero-sub">We are available 24 hours a day, 7 days a week to assist with your banking needs.</p>
        </div>
      </section>

      <section className="public-section">
        <div className="section-container">
          <div className="grid-3 gap-4 mb-4">
            <div className="card p-4 text-center">
              <div className="service-icon mb-2">📞</div>
              <h3 className="card-title mb-1">Toll Free Support</h3>
              <p className="text-muted text-sm mb-2">Available 24x7 across all regions</p>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--sbi-blue)' }}>1800-11-2211</div>
            </div>

            <div className="card p-4 text-center">
              <div className="service-icon mb-2">🚨</div>
              <h3 className="card-title mb-1">Emergency Card Block</h3>
              <p className="text-muted text-sm mb-2">Instant hotline for card/account freeze</p>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--danger)' }}>1800-22-9900</div>
            </div>

            <div className="card p-4 text-center">
              <div className="service-icon mb-2">✉</div>
              <h3 className="card-title mb-1">Email Desk</h3>
              <p className="text-muted text-sm mb-2">Written support inquiries</p>
              <div style={{ fontWeight: 800, fontSize: '.95rem', color: '#0a2540' }}>care@nexusbank.com</div>
            </div>
          </div>

          <div className="grid-2 gap-4">
            <div className="card p-4">
              <h3 className="card-title mb-3">Send Customer Support Message</h3>

              {submitted ? (
                <div className="alert alert-success">
                  ✓ Thank you! Your support ticket has been registered. An agent will respond to {form.email} within 2 hours.
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">Your Full Name</label>
                    <input
                      type="text" className="form-input" required
                      placeholder="e.g. John Doe"
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email" className="form-input" required
                      placeholder="customer@email.com"
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Inquiry Subject</label>
                    <select
                      className="form-select"
                      value={form.subject}
                      onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                    >
                      <option value="">General NetBanking Query</option>
                      <option value="transfer">Fund Transfer Issue</option>
                      <option value="account">Account Opening Status</option>
                      <option value="statement">E-Statement Request</option>
                      <option value="security">Security Alert / Fraud</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Message / Details</label>
                    <textarea
                      className="form-input" rows="4" required
                      placeholder="Describe your inquiry..."
                      value={form.message}
                      onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary btn-full">
                    Send Inquiry →
                  </button>
                </form>
              )}
            </div>

            <div className="card p-4">
              <h3 className="card-title mb-3">Global Headquarters & Main Branch</h3>
              <div className="flex flex-col gap-3 text-sm text-muted">
                <div>
                  <strong>📍 Physical Address:</strong><br />
                  NexusBank Central Tower, Financial Center Blvd,<br />
                  Suite 1200, Financial District
                </div>
                <div>
                  <strong>⏰ Branch Banking Hours:</strong><br />
                  Monday – Friday: 9:30 AM – 4:30 PM<br />
                  Saturday (1st & 3rd): 9:30 AM – 1:30 PM
                </div>
                <div>
                  <strong>🌐 NetBanking Availability:</strong><br />
                  Digital Portal Available 24×7×365
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
