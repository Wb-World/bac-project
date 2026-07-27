import { useState } from 'react'
import Sidebar from '../components/Navbar'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'

export default function Deposit() {
  const { account, refreshAccount } = useAuth()
  const [amount, setAmount] = useState('')
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMsg({ type: '', text: '' })
    setLoading(true)
    try {
      const res = await api.post('/api/banking/deposit', {
        accountId: account.id,
        amount: amount,
        description: 'Online Deposit'
      })
      setMsg({ type: 'success', text: res.data.message || 'Deposit processed successfully!' })
      setAmount('')
      refreshAccount()
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Deposit failed.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="portal-page-wrapper">
      <div className="bank-ticker-bar">
        <div className="bank-ticker-left">
          <span className="ticker-badge">INSTANT DEPOSIT</span>
          <span>Online Deposit Portal — Credit Funds Directly to Account.</span>
        </div>
      </div>

      <div className="app-shell">
        <Sidebar />
        <main className="main-content">
          <div className="page-header mb-4">
            <h1 className="page-title">Deposit Funds</h1>
            <p className="page-sub">Credit money to your savings account instantly</p>
          </div>

          {msg.text && (
            <div className={`alert alert-${msg.type}`}>
              <span>{msg.type === 'success' ? '✓' : '⚠'}</span>
              <div>{msg.text}</div>
            </div>
          )}

          <div className="card max-w-lg border-top-blue">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Destination Account</label>
                <input
                  type="text"
                  className="form-input"
                  disabled
                  value={`${account?.account_no || 'Savings'} (Balance: ₹${parseFloat(account?.balance || 0).toFixed(2)})`}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Deposit Amount (₹) *</label>
                <input
                  type="number"
                  className="form-input"
                  required
                  min="0.01"
                  step="0.01"
                  placeholder="Enter amount to deposit"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
              </div>

              <div className="quick-deposit-presets flex gap-2 mb-3">
                {[500, 1000, 5000, 10000].map(val => (
                  <button
                    key={val}
                    type="button"
                    className="btn btn-ghost btn-sm flex-1"
                    onClick={() => setAmount(val.toString())}
                  >
                    +₹{val}
                  </button>
                ))}
              </div>

              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? 'Processing Deposit...' : 'Confirm Instant Deposit →'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
