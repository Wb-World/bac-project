export default function AccountCard({ account, onDeposit, onWithdraw, onTransfer }) {
  const bal = parseFloat(account?.balance || 0)
  const isAdmin = account?.account_type === 'savings'

  return (
    <div className="balance-card fade-in">
      <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
        <div>
          <div className="balance-label">{account?.account_type?.toUpperCase()} ACCOUNT</div>
          <div style={{ fontSize: '.76rem', color: 'var(--mt)', marginTop: 2 }}>{account?.account_no}</div>
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'rgba(0,208,132,.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.2rem'
        }}>💳</div>
      </div>

      <div className="balance-label">Available Balance</div>
      <div className="balance-amount">
        ${bal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </div>
      <div className="balance-sub">Account ID: <code style={{ fontSize: '.7rem' }}>{account?.id?.slice(0, 16)}…</code></div>

      <div style={{ borderTop: '1px solid rgba(0,208,132,.15)', margin: '1.2rem 0 1rem' }} />

      <div className="flex gap-2">
        <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => onDeposit?.(account)}>
          + Deposit
        </button>
        <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => onWithdraw?.(account)}>
          − Withdraw
        </button>
        <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => onTransfer?.(account)}>
          ⇄ Transfer
        </button>
      </div>

      {/* BAC-1 IDOR link */}
      <a
        href={`/api/account/${account?.id}`}
        target="_blank"
        rel="noreferrer"
        style={{
          display: 'block', marginTop: '.8rem', textAlign: 'center',
          fontSize: '.68rem', color: 'rgba(239,68,68,.7)',
        }}
      >
        🐛 [BAC-1] IDOR: /api/account/{account?.id?.slice(0, 8)}…
      </a>
    </div>
  )
}
