import { useState, useEffect, useCallback } from 'react'
import Sidebar from '../components/Navbar'
import AccountCard from '../components/AccountCard'
import StatCard from '../components/StatCard'
import TransactionRow from '../components/TransactionRow'
import VulnPanel from '../components/VulnPanel'
import { useAuth } from '../contexts/AuthContext'
import { getTransactions, deposit, withdraw, transfer } from '../lib/api'

export default function Dashboard() {
  const { user, account, refreshAccount } = useAuth()
  const [txs, setTxs] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeModal, setActiveModal] = useState(null) // 'deposit' | 'withdraw' | 'transfer'
  const [form, setForm] = useState({ amount: '', toAccount: '', description: '' })
  const [msg, setMsg] = useState({ type: '', text: '' })

  const loadTxs = useCallback(async () => {
    if (!account?.id) {
      setLoading(false)
      return
    }
    try {
      const { data } = await getTransactions(account.id, { limit: 8 })
      setTxs(data.transactions || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [account?.id])

  useEffect(() => { loadTxs() }, [loadTxs])

  const handleAction = async (e) => {
    e.preventDefault()
    setMsg({ type: '', text: '' })
    try {
      if (activeModal === 'deposit') {
        await deposit({ accountId: account.id, amount: form.amount, description: form.description || 'User Deposit' })
        setMsg({ type: 'success', text: `Deposited $${form.amount} successfully!` })
      } else if (activeModal === 'withdraw') {
        await withdraw({ accountId: account.id, amount: form.amount, description: form.description || 'User Withdrawal' })
        setMsg({ type: 'success', text: `Withdrew $${form.amount} successfully!` })
      } else if (activeModal === 'transfer') {
        await transfer({ fromAccount: account.id, toAccount: form.toAccount, amount: form.amount, description: form.description || 'Peer Transfer' })
        setMsg({ type: 'success', text: `Transferred $${form.amount} successfully!` })
      }
      setActiveModal(null)
      setForm({ amount: '', toAccount: '', description: '' })
      await refreshAccount()
      await loadTxs()
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Action failed.' })
    }
  }

  const totalBalance = parseFloat(account?.balance || 0)
  const totalDeposits = txs.filter(t => t.type === 'deposit').reduce((s, t) => s + parseFloat(t.amount), 0)
  const totalWithdrawals = txs.filter(t => t.type === 'withdrawal').reduce((s, t) => s + parseFloat(t.amount), 0)

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="page-header flex items-center justify-between">
          <div>
            <h1 className="page-title">Welcome back, {user?.username} 👋</h1>
            <p className="page-sub">Account Overview & Transaction Monitor</p>
          </div>
          {user?.role === 'admin' && (
            <span className="badge badge-orange" style={{ padding: '.4rem .8rem', fontSize: '.8rem' }}>
              ⚡ Administrator Role Active
            </span>
          )}
        </div>

        {msg.text && (
          <div className={`alert alert-${msg.type}`}>
            <span className="alert-icon">{msg.type === 'success' ? '✓' : '⚠'}</span>
            {msg.text}
          </div>
        )}

        <div className="grid-3 mb-4">
          <div style={{ gridColumn: 'span 2' }}>
            {account ? (
              <AccountCard
                account={account}
                onDeposit={() => setActiveModal('deposit')}
                onWithdraw={() => setActiveModal('withdraw')}
                onTransfer={() => setActiveModal('transfer')}
              />
            ) : (
              <div className="card text-center p-4">No account found.</div>
            )}
          </div>
          <VulnPanel />
        </div>

        <div className="grid-4 mb-4">
          <StatCard icon="💰" label="Available Balance" value={`$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} color="green" />
          <StatCard icon="⬇" label="Recent Deposits" value={`$${totalDeposits.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} color="blue" />
          <StatCard icon="⬆" label="Recent Withdrawals" value={`$${totalWithdrawals.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} color="red" />
          <StatCard icon="⇄" label="Total Transactions" value={txs.length} color="purple" />
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Recent Transactions</h3>
            <a href={`/api/transactions/${account?.id}`} target="_blank" rel="noreferrer" className="text-xs text-red" style={{ fontWeight: 600 }}>
              🐛 [BAC-4] IDOR API Access
            </a>
          </div>

          {loading ? (
            <div className="text-center py-4 text-muted">Loading transactions...</div>
          ) : txs.length === 0 ? (
            <div className="text-center py-4 text-muted">No transactions found.</div>
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

        {/* Action Modal */}
        {activeModal && (
          <div className="modal-overlay" onClick={() => setActiveModal(null)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <div className="modal-title" style={{ textTransform: 'capitalize' }}>
                {activeModal} Funds
              </div>
              <div className="modal-sub">Perform instant transaction for {account?.account_no}</div>

              <form onSubmit={handleAction}>
                {activeModal === 'transfer' && (
                  <div className="form-group">
                    <label className="form-label">Destination Account UUID</label>
                    <input
                      type="text" className="form-input" required
                      placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                      value={form.toAccount}
                      onChange={e => setForm(p => ({ ...p, toAccount: e.target.value }))}
                    />
                  </div>
                )}
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
                  <label className="form-label">Description (Optional)</label>
                  <input
                    type="text" className="form-input"
                    placeholder="Note..."
                    value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  />
                </div>

                <div className="flex gap-2 mt-4">
                  <button type="button" className="btn btn-ghost flex-1" onClick={() => setActiveModal(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary flex-1">Confirm {activeModal}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
