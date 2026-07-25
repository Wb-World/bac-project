export default function TransactionRow({ tx, myAccountId }) {
  const isCredit = tx.to_account === myAccountId
  const isDebit  = tx.from_account === myAccountId

  const typeLabel = tx.type === 'deposit'
    ? 'Deposit' : tx.type === 'withdrawal'
    ? 'Withdrawal' : 'Transfer'

  const badgeClass = tx.type === 'deposit'
    ? 'badge-green' : tx.type === 'withdrawal'
    ? 'badge-red' : 'badge-blue'

  const amtColor = isCredit || tx.type === 'deposit'
    ? 'var(--g)' : '#ef4444'

  const amtSign = isCredit || tx.type === 'deposit' ? '+' : '-'

  const dateStr = new Date(tx.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
  const timeStr = new Date(tx.created_at).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <tr>
      <td>
        <span className={`badge ${badgeClass}`}>{typeLabel}</span>
      </td>
      <td>{tx.description || '—'}</td>
      <td style={{ fontFamily: 'monospace', fontSize: '.78rem', color: 'var(--mt)' }}>
        {tx.id?.slice(0, 8)}…
      </td>
      <td>
        <div style={{ fontSize: '.84rem' }}>{dateStr}</div>
        <div style={{ fontSize: '.72rem', color: 'var(--mt)' }}>{timeStr}</div>
      </td>
      <td style={{ fontWeight: 700, color: amtColor, textAlign: 'right' }}>
        {amtSign}${parseFloat(tx.amount).toFixed(2)}
      </td>
    </tr>
  )
}
