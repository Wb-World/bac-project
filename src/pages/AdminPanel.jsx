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
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="page-header flex items-center justify-between">
          <div>
            <h1 className="page-title">Admin Management Console</h1>
            <p className="page-sub">Function-level Access Control Bypasses <span className="badge badge-vuln">BAC-3</span></p>
          </div>
          <span className="badge badge-orange">Privileged Context</span>
        </div>

        {msg.text && (
          <div className={`alert alert-${msg.type}`}>
            <span className="alert-icon">{msg.type === 'success' ? '✓' : '⚠'}</span>
            {msg.text}
          </div>
        )}

        <div className="alert alert-vuln mb-4" style={{ fontSize: '.78rem' }}>
          <div><strong>[BAC-3 Vulnerability Alert]</strong> Function <code>/api/admin/transfer</code> only verifies the JWT's <code>role</code> property!</div>
          <div className="mt-1">
            Since the JWT secret key is hardcoded (<code>nexusbank_weak_jwt_2026</code>), any user can issue an admin token client-side and trigger forced transfers.
          </div>
        </div>

        <div className="grid-3 mb-4">
          <div className="card">
            <div className="text-xs text-muted">Total Registered Users</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--g)', marginTop: 4 }}>
              {stats.totalUsers || 0}
            </div>
          </div>
          <div className="card">
            <div className="text-xs text-muted">Total Bank Assets</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--blue)', marginTop: 4 }}>
              ${parseFloat(stats.totalAssets || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="card">
            <div className="text-xs text-muted">Total Processed Transactions</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--purple)', marginTop: 4 }}>
              {stats.totalTx || 0}
            </div>
          </div>
        </div>

        <div className="grid-3 mb-4">
          <div className="card" style={{ gridColumn: 'span 2' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem' }}>User Accounts Directory</h3>
            {loading ? (
              <div className="py-4 text-center text-muted">Loading directory...</div>
            ) : (
              <div className="table-wrap">
                <table className="nxs-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Account No / ID</th>
                      <th style={{ textAlign: 'right' }}>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => {
                      const acc = u.accounts?.[0]
                      return (
                        <tr key={u.id}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{u.username}</div>
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
                          <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--g)' }}>
                            ${parseFloat(acc?.balance || 0).toFixed(2)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Force Transfer Form */}
          <div className="card" style={{ borderColor: 'var(--orange)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--orange)', marginBottom: '.5rem' }}>
              ⚡ Forced Administrative Transfer
            </h3>
            <p className="text-xs text-muted mb-3">Execute transfers without owner consent</p>

            <form onSubmit={handleForceTransfer}>
              <div className="form-group">
                <label className="form-label">Source Account UUID</label>
                <input
                  type="text" className="form-input" required
                  placeholder="From Account UUID"
                  value={form.fromAccount}
                  onChange={e => setForm(p => ({ ...p, fromAccount: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Destination Account UUID</label>
                <input
                  type="text" className="form-input" required
                  placeholder="To Account UUID"
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
                <label className="form-label">Memo</label>
                <input
                  type="text" className="form-input"
                  placeholder="Admin Override Transfer"
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-full mt-2" style={{ background: 'var(--orange)', color: '#000' }}>
                Execute Transfer →
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
