export default function AccountCard({ account, onDeposit, onWithdraw, onTransfer }) {
  if (!account) return null

  return (
    <div className="account-passbook-card">
      <div className="flex justify-between items-center mb-2">
        <div>
          <span className="badge badge-orange" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
            {account.account_type || 'Savings'} Account
          </span>
          <div style={{ fontSize: '.8rem', color: '#cbd5e1', marginTop: '.3rem' }}>
            A/C No: <strong style={{ letterSpacing: '1px', color: '#fff' }}>{account.account_no}</strong>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '.68rem', color: '#94a3b8' }}>STATUS</div>
          <span className="badge badge-green">ACTIVE</span>
        </div>
      </div>

      <div className="balance-label">AVAILABLE CLEAR BALANCE</div>
      <div className="balance-amount">
        ₹{parseFloat(account.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </div>
      <div className="balance-sub">
        Account ID: <code>{account.id}</code>
      </div>

      <div className="flex gap-2 mt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '1rem' }}>
        <button className="btn btn-accent btn-sm" onClick={onTransfer}>
          ⇄ Fund Transfer
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onDeposit} style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)' }}>
          + Deposit
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onWithdraw} style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)' }}>
          - Withdraw
        </button>
      </div>
    </div>
  )
}
