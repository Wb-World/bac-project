import { useState } from 'react'
import Sidebar from '../components/Navbar'
import { useAuth } from '../contexts/AuthContext'

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
      const api = (await import('../lib/api')).default
      const res = await api.post('/api/banking/transfer', {
        fromAccount: account.id,
        toAccount: form.toAccount,
        amount: form.amount,
        description: form.description
      })
      setMsg({ type: 'success', text: res.data.message })
      setForm({ toAccount: '', amount: '', description: '' })
      refreshAccount()
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Transfer failed.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Transfer Funds</h1>
          <p className="page-sub">Move funds securely to any registered account</p>
        </div>

        {msg.text && (
          <div className={`alert alert-${msg.type}`}>
            <span className="alert-icon">{msg.type === 'success' ? '✓' : '⚠'}</span>
            {msg.text}
          </div>
        )}

        <div className="action-card card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Source Account</label>
              <input type="text" className="form-input" disabled value={`${account?.account_no} ($${parseFloat(account?.balance || 0).toFixed(2)})`} />
            </div>

            <div className="form-group">
              <label className="form-label">Destination Account UUID</label>
              <input
                type="text" className="form-input" required
                placeholder="Target Account UUID"
                value={form.toAccount}
                onChange={e => setForm(p => ({ ...p, toAccount: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Amount ($)</label>
              <input
                type="number" className="form-input" required min="0.01" step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <input
                type="text" className="form-input"
                placeholder="Memo / reference"
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full mt-3" disabled={loading}>
              {loading ? 'Processing...' : 'Confirm Transfer →'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
