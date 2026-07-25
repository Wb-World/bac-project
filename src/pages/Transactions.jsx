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
      setError(err.response?.data?.error || 'Failed to fetch statement records.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchData(targetAccountId)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7fa' }}>
      <div className="bank-ticker-bar">
        <div className="bank-ticker-left">
          <span className="ticker-badge">PASSBOOK SERVICE</span>
          <span>Official Statement Audit and Transaction Records Portal.</span>
        </div>
      </div>

      <div className="app-shell">
        <Sidebar />
        <main className="main-content">
          <div className="page-header">
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0a2540' }}>Passbook & Account Statement</h1>
            <p className="page-sub">View detailed transaction history and account audit ledger</p>
          </div>

          <div className="card mb-4" style={{ borderTop: '4px solid #005691' }}>
            <div className="card-header">
              <span className="card-title">Account Statement Lookup</span>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text" className="form-input" style={{ flex: 1 }}
                placeholder="Account Identifier"
                value={targetAccountId}
                onChange={e => setTargetAccountId(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">Fetch Statement →</button>
            </form>

            {targetAccount && (
              <div className="mt-3 p-3" style={{ background: '#f8fafc', borderRadius: 4, border: '1px solid #e2e8f0' }}>
                <div className="text-xs text-muted">Account Holder:</div>
                <div style={{ fontWeight: 700, color: '#0a2540' }}>
                  {targetAccount.owner?.username || 'Unknown'} ({targetAccount.owner?.email || 'N/A'})
                </div>
                <div className="text-xs text-muted mt-1">
                  Account No: <code>{targetAccount.account_no}</code> | Balance: <strong>₹{parseFloat(targetAccount.balance || 0).toFixed(2)}</strong>
                </div>
              </div>
            )}
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="card">
            <div className="card-header">
              <span className="card-title">Transaction Ledger Log</span>
              <span className="text-xs text-muted">Records: {txs.length} entries</span>
            </div>

            {loading ? (
              <div className="text-center py-4 text-muted">Fetching records...</div>
            ) : txs.length === 0 ? (
              <div className="text-center py-4 text-muted">No transaction logs available for this Account ID.</div>
            ) : (
              <div className="table-wrap">
                <table className="nxs-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Description</th>
                      <th>Reference ID</th>
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
    </div>
  )
}
