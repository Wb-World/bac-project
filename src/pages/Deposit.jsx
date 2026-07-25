import { useState } from 'react'
import Sidebar from '../components/Navbar'
import { useAuth } from '../contexts/AuthContext'

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
      const api = (await import('../lib/api')).default
      const res = await api.post('/api/banking/deposit', {
        accountId: account.id,
        amount: amount,
        description: 'Manual Deposit'
      })
      setMsg({ type: 'success', text: res.data.message })
      setAmount('')
      refreshAccount()
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Deposit failed.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Deposit Funds</h1>
          <p className="page-sub">Add money to your checking account instantly</p>
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
              <label className="form-label">Target Account</label>
              <input type="text" className="form-input" disabled value={`${account?.account_no} ($${parseFloat(account?.balance || 0).toFixed(2)})`} />
            </div>

            <div className="form-group">
              <label className="form-label">Amount ($)</label>
              <input
                type="number" className="form-input" required min="0.01" step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full mt-3" disabled={loading}>
              {loading ? 'Processing...' : 'Deposit Funds →'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
