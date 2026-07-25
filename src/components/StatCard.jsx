export default function StatCard({ icon, label, value, change, changeType = 'up', color = 'green' }) {
  const colors = {
    green:  { bg: 'var(--gg)', color: 'var(--g)' },
    red:    { bg: 'var(--red-bg)', color: 'var(--red)' },
    blue:   { bg: 'var(--blue-bg)', color: 'var(--blue)' },
    orange: { bg: 'var(--orange-bg)', color: 'var(--orange)' },
    purple: { bg: 'var(--purple-bg)', color: 'var(--purple)' },
  }
  const c = colors[color] || colors.green

  return (
    <div className="stat-card fade-in">
      <div className="stat-icon" style={{ background: c.bg }}>
        <span style={{ color: c.color, fontSize: '1.1rem' }}>{icon}</span>
      </div>
      <div className="stat-body">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {change && (
          <div className={`stat-change stat-${changeType}`}>
            {changeType === 'up' ? '▲' : '▼'} {change}
          </div>
        )}
      </div>
    </div>
  )
}
