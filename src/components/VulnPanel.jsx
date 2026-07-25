const VULNS = [
  { id: 'BAC-1', endpoint: '/api/account/:id',      desc: 'IDOR — no auth, read any account balance'   },
  { id: 'BAC-2', endpoint: 'POST /api/auth/register',desc: 'Priv escalation — send role=admin in body'  },
  { id: 'BAC-3', endpoint: 'POST /api/admin/transfer',desc: 'JWT role forgeable with weak secret'        },
  { id: 'BAC-4', endpoint: '/api/transactions/:id',  desc: 'IDOR — full TX history, no auth'            },
  { id: 'BAC-5', endpoint: '/api/documents/../env',  desc: 'Path traversal — env var leakage'           },
]

export default function VulnPanel({ highlight }) {
  return (
    <div className="vuln-panel">
      <div className="vuln-panel-title">
        🐛 Active Vulnerabilities
      </div>
      {VULNS.map(v => (
        <div className="vuln-item" key={v.id} style={highlight === v.id ? { opacity: 1 } : { opacity: .75 }}>
          <span className="vuln-tag">[{v.id}]</span>
          <div>
            <div style={{ fontSize: '.73rem', color: 'var(--orange)', marginBottom: 1 }}>
              <code style={{ fontSize: '.7rem' }}>{v.endpoint}</code>
            </div>
            <div className="vuln-desc">{v.desc}</div>
          </div>
        </div>
      ))}
      <div style={{ marginTop: '.8rem', paddingTop: '.8rem', borderTop: '1px solid var(--red-bdr)' }}>
        <a
          href="/api/vulns"
          target="_blank"
          style={{ fontSize: '.73rem', color: 'var(--red)', display: 'flex', alignItems: 'center', gap: '.3rem' }}
        >
          🔗 Full exploit map: /api/vulns
        </a>
      </div>
    </div>
  )
}
