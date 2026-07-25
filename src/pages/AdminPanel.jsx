import { useState, useEffect } from 'react'
import Sidebar from '../components/Navbar'
import { getAdminUsers, adminTransfer } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

export default function AdminPanel() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ fromAccount: '', toAccount: '', amount: '', description: '' })
  const [msg, setMsg] = useState({ type: '', text: '' })

  const loadData = async () => {
    try {
      const { data } = await getAdminUsers()
      setUsers(data.users || [])
      setStats({
        totalUsers: data.total_users,
        totalAssets: data.total_assets,
        totalTx: data.total_transactions
      })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleForceTransfer = async (e) => {
    e.preventDefault()
    setMsg({ type: '', text: '' })
    try {
      const res = await adminTransfer(form)
      setMsg({ type: 'success', text: res.data.message })
      setForm({ fromAccount: '', toAccount: '', amount: '', description: '' })
      loadData()
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Transfer failed.' })
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7fa' }}>
      <div className="bank-ticker-bar">
        <div className="bank-ticker-left">
          <span className="ticker-badge">BRANCH AUDIT</span>
          <span>Official Managerial Administrative Console.</span>
        </div>
      </div>

      <div className="app-shell">
        <Sidebar />
        <main className="main-content">
          <div className="page-header flex items-center justify-between">
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0a2540' }}>Branch Audit Console</h1>
              <p className="page-sub">Central Customer Directory & Inter-Branch Management</p>
            </div>
            <span className="badge badge-orange">Privileged Access</span>
          </div>

          {msg.text && (
            <div className={`alert alert-${msg.type}`}>
              <span>{msg.type === 'success' ? '✓' : '⚠'}</span>
              {msg.text}
            </div>
          )}

          <div className="grid-3 mb-4">
            <div className="card">
              <div className="text-xs text-muted">Total Customer Accounts</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#005691', marginTop: 4 }}>
                {stats.totalUsers || 0}
              </div>
            </div>
            <div className="card">
              <div className="text-xs text-muted">Total Branch Liquidity</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669', marginTop: 4 }}>
                ₹{parseFloat(stats.totalAssets || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="card">
              <div className="text-xs text-muted">Processed Ledger Operations</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#8b5cf6', marginTop: 4 }}>
                {stats.totalTx || 0}
              </div>
            </div>
          </div>

          <div className="grid-3 mb-4">
            <div className="card" style={{ gridColumn: 'span 2' }}>
              <div className="card-header">
                <span className="card-title">Customer Accounts Directory</span>
              </div>
              {loading ? (
                <div className="py-4 text-center text-muted">Loading customer records...</div>
              ) : (
                <div className="table-wrap">
                  <table className="nxs-table">
                    <thead>
                      <tr>
                        <th>Customer Name</th>
                        <th>Access Role</th>
                        <th>Account No / Identifier</th>
                        <th style={{ textAlign: 'right' }}>Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => {
                        const acc = u.accounts?.[0]
                        return (
                          <tr key={u.id}>
                            <td>
                              <div style={{ fontWeight: 700, color: '#0a2540' }}>{u.username}</div>
                              <div className="text-xs text-muted">{u.email}</div>
                            </td>
                            <td>
                              <span className={`badge ${u.role === 'admin' ? 'badge-orange' : 'badge-green'}`}>
                                {u.role}
                              </span>
                            </td>
                            <td>
                              <div style={{ fontSize: '.84rem' }}>{acc?.account_no || '—'}</div>
                              <div className="text-xs text-muted"><code>{acc?.id}</code></div>
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                              ₹{parseFloat(acc?.balance || 0).toFixed(2)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Manager Override Transfer */}
            <div className="card" style={{ borderTop: '4px solid #ff9900' }}>
              <div className="card-header">
                <span className="card-title">Branch Override Transfer</span>
              </div>
              <p className="text-xs text-muted mb-3">Execute administrative fund adjustment</p>

              <form onSubmit={handleForceTransfer}>
                <div className="form-group">
                  <label className="form-label">Source Account ID</label>
                  <input
                    type="text" className="form-input" required
                    placeholder="From Account Identifier"
                    value={form.fromAccount}
                    onChange={e => setForm(p => ({ ...p, fromAccount: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Destination Account ID</label>
                  <input
                    type="text" className="form-input" required
                    placeholder="To Account Identifier"
                    value={form.toAccount}
                    onChange={e => setForm(p => ({ ...p, toAccount: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Transfer Amount ($)</label>
                  <input
                    type="number" className="form-input" required min="0.01" step="0.01"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Audit Remarks</label>
                  <input
                    type="text" className="form-input"
                    placeholder="Branch Adjustment Note"
                    value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  />
                </div>

                <button type="submit" className="btn btn-accent btn-full mt-2">
                  Execute Settlement →
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
