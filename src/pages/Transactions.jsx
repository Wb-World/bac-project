import { useState, useEffect } from 'react'
import Sidebar from '../components/Navbar'
import TransactionRow from '../components/TransactionRow'
import { useAuth } from '../contexts/AuthContext'
import { getTransactions, getAccount } from '../lib/api'

export default function Transactions() {
  const { account } = useAuth()
  const [targetAccountId, setTargetAccountId] = useState('')
  const [txs, setTxs] = useState([])
  const [targetAccount, setTargetAccount] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (account?.id) {
      setTargetAccountId(account.id)
      fetchData(account.id)
    }
  }, [account?.id])

  const fetchData = async (accId) => {
    if (!accId) return
    setLoading(true)
    setError('')
    try {
      const [txRes, accRes] = await Promise.all([
        getTransactions(accId),
        getAccount(accId).catch(() => null)
      ])
      setTxs(txRes.data.transactions || [])
      setTargetAccount(accRes?.data || null)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch transactions.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchData(targetAccountId)
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Transaction Audit & History</h1>
          <p className="page-sub">View transactions for any account via IDOR vulnerability <span className="badge badge-vuln">BAC-4</span></p>
        </div>

        {/* BAC-4 IDOR Controls */}
        <div className="card mb-4" style={{ borderColor: 'var(--red-bdr)' }}>
          <div className="flex items-center justify-between mb-2">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--red)' }}>
              🐛 [BAC-4] IDOR Account Inspector
            </h3>
            <span className="text-xs text-muted">No auth check performed on API</span>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text" className="form-input" style={{ flex: 1 }}
              placeholder="Target Account UUID (e.g. paste any UUID from DB)"
              value={targetAccountId}
              onChange={e => setTargetAccountId(e.target.value)}
            />
            <button type="submit" className="btn btn-danger">Inspect Account →</button>
          </form>

          {targetAccount && (
            <div className="mt-3 p-3" style={{ background: 'rgba(255,255,255,.03)', borderRadius: 8 }}>
              <div className="text-xs text-muted">Inspecting Owner:</div>
              <div style={{ fontWeight: 600, color: 'var(--g)' }}>
                {targetAccount.owner?.username || 'Unknown'} ({targetAccount.owner?.email || 'N/A'})
              </div>
              <div className="text-xs text-muted mt-1">
                Account No: <code>{targetAccount.account_no}</code> | Balance: <strong>${parseFloat(targetAccount.balance || 0).toFixed(2)}</strong>
              </div>
            </div>
          )}
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Transaction Logs</h3>
            <span className="text-xs text-muted">Total: {txs.length} records</span>
          </div>

          {loading ? (
            <div className="text-center py-4 text-muted">Fetching records...</div>
          ) : txs.length === 0 ? (
            <div className="text-center py-4 text-muted">No transactions found for this Account ID.</div>
          ) : (
            <div className="table-wrap">
              <table className="nxs-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Description</th>
                    <th>ID</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {txs.map(tx => (
                    <TransactionRow key={tx.id} tx={tx} myAccountId={account?.id} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
