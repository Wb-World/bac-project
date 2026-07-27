import { useState } from 'react'
import Sidebar from '../components/Navbar'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'

export default function Transfer() {
  const { account, refreshAccount } = useAuth()
  const [form, setForm] = useState({ toAccount: '', amount: '', description: '' })
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMsg({ type: '', text: '' })
    setLoading(true)
    try {
      const res = await api.post('/api/banking/transfer', {
        fromAccount: account.id,
        toAccount: form.toAccount,
        amount: form.amount,
        description: form.description || 'Instant Transfer'
      })
      setMsg({ type: 'success', text: res.data.message || 'Transfer completed successfully!' })
      setForm({ toAccount: '', amount: '', description: '' })
      refreshAccount()
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Transfer failed. Please check recipient account ID.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="portal-page-wrapper">
      <div className="bank-ticker-bar">
        <div className="bank-ticker-left">
          <span className="ticker-badge">INSTANT TRANSFER</span>
          <span>NEFT / RTGS / IMPS 24x7 Fund Transfer Facility.</span>
        </div>
      </div>

      <div className="app-shell">
        <Sidebar />
        <main className="main-content">
          <div className="page-header mb-4">
            <h1 className="page-title">Fund Transfer (NEFT / IMPS)</h1>
            <p className="page-sub">Move funds securely to any registered account</p>
          </div>

          {msg.text && (
            <div className={`alert alert-${msg.type}`}>
              <span>{msg.type === 'success' ? '✓' : '⚠'}</span>
              <div>{msg.text}</div>
            </div>
          )}

          <div className="grid-3 gap-4">
            <div className="card" style={{ gridColumn: 'span 2' }}>
              <div className="card-header">
                <span className="card-title">Transfer Payment Form</span>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Source Account</label>
                  <input
                    type="text"
                    className="form-input"
                    disabled
                    value={`${account?.account_no || 'Savings'} — Clear Balance: ₹${parseFloat(account?.balance || 0).toFixed(2)}`}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Recipient Account ID / Number *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="Enter Recipient Account Identifier"
                    value={form.toAccount}
                    onChange={e => setForm(p => ({ ...p, toAccount: e.target.value }))}
                  />
                  <span className="text-xs text-muted">Enter the recipient's Account ID or Number.</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Transfer Amount (₹) *</label>
                  <input
                    type="number"
                    className="form-input"
                    required
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Remarks / Payment Narration</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Rent, Invoice #102, Gift"
                    value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-full btn-lg mt-3" disabled={loading}>
                  {loading ? 'Processing Transfer...' : 'Confirm Fund Transfer →'}
                </button>
              </form>
            </div>

            <div className="card border-top-gold" style={{ gridColumn: 'span 1' }}>
              <div className="card-header">
                <span className="card-title">Transfer Guidelines</span>
              </div>
              <ul className="text-xs text-muted flex flex-col gap-2">
                <li>⚡ <strong>IMPS Instant:</strong> Processed within 5 seconds 24x7.</li>
                <li>🔒 <strong>Security:</strong> All transfers require active session validation.</li>
                <li>📜 <strong>Passbook:</strong> Transaction reference IDs are logged immediately to your passbook ledger.</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
