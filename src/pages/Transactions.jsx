import { useState, useEffect, useCallback } from 'react'
import Sidebar from '../components/Navbar'
import TransactionRow from '../components/TransactionRow'
import { useAuth } from '../contexts/AuthContext'
import { getTransactions } from '../lib/api'

export default function Transactions() {
  const { account } = useAuth()
  const [txs, setTxs] = useState([])
  const [filterType, setFilterType] = useState('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchStatement = useCallback(async () => {
    if (!account?.id) return
    setLoading(true)
    setError('')
    try {
      const { data } = await getTransactions(account.id)
      setTxs(data.transactions || [])
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch account statement.')
    } finally {
      setLoading(false)
    }
  }, [account?.id])

  useEffect(() => {
    fetchStatement()
  }, [fetchStatement])

  const filteredTxs = txs.filter(t => {
    if (filterType === 'deposit') return t.type === 'deposit'
    if (filterType === 'withdrawal') return t.type === 'withdrawal' || t.type === 'transfer'
    return true
  })

  return (
    <div className="portal-page-wrapper">
      <div className="bank-ticker-bar">
        <div className="bank-ticker-left">
          <span className="ticker-badge">E-PASSBOOK</span>
          <span>Official Account Statement & Ledger Activity Portal.</span>
        </div>
        <div style={{ fontSize: '.72rem', color: '#cbd5e1' }}>
          Account No: <strong>{account?.account_no || '—'}</strong>
        </div>
      </div>

      <div className="app-shell">
        <Sidebar />
        <main className="main-content">
          <div className="page-header flex items-center justify-between mb-4">
            <div>
              <h1 className="page-title">Account Statement & Passbook</h1>
              <p className="page-sub">View, filter, and review your official transaction history</p>
            </div>
            <button
              className="btn btn-primary"
              onClick={fetchStatement}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : '🔄 Refresh Statement'}
            </button>
          </div>

          {/* Account Overview Header Card */}
          <div className="card mb-4 border-top-blue">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <div>
                <div className="text-xs text-muted font-bold uppercase">ACCOUNT HOLDER</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0a2540' }}>
                  {account?.account_no} ({account?.account_type || 'Savings'})
                </div>
              </div>

              <div>
                <div className="text-xs text-muted font-bold uppercase">CURRENT BALANCE</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)' }}>
                  ₹{parseFloat(account?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  className={`btn btn-sm ${filterType === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setFilterType('all')}
                >
                  All History ({txs.length})
                </button>
                <button
                  className={`btn btn-sm ${filterType === 'deposit' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setFilterType('deposit')}
                >
                  Credits Only
                </button>
                <button
                  className={`btn btn-sm ${filterType === 'withdrawal' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setFilterType('withdrawal')}
                >
                  Debits / Transfers
                </button>
              </div>
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {/* Transactions Ledger Card */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Transaction Ledger Log</span>
              <span className="text-xs text-muted">Showing {filteredTxs.length} records</span>
            </div>

            {loading ? (
              <div className="text-center py-5 text-muted">Loading account statement...</div>
            ) : filteredTxs.length === 0 ? (
              <div className="text-center py-5 text-muted">No transactions found for this selection.</div>
            ) : (
              <div className="table-wrap">
                <table className="nxs-table">
                  <thead>
                    <tr>
                      <th>Transaction Type</th>
                      <th>Narration</th>
                      <th>Reference ID</th>
                      <th>Date & Time</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTxs.map(tx => (
                      <TransactionRow key={tx.id} tx={tx} myAccountId={account?.id} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
