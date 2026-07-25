import { useState } from 'react'
import Sidebar from '../components/Navbar'
import { getDocument } from '../lib/api'

export default function Documents() {
  const [filename, setFilename] = useState('statement_alice_q1.txt')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFetch = async (e) => {
    e?.preventDefault()
    if (!filename) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const { data } = await getDocument(filename)
      setResult(data)
    } catch (err) {
      if (err.response?.data) {
        setResult(err.response.data)
      } else {
        setError('Failed to fetch document.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Document Vault & File Access</h1>
          <p className="page-sub">Path Traversal & Unrestricted Access <span className="badge badge-vuln">BAC-5</span></p>
        </div>

        <div className="alert alert-vuln mb-4">
          <div><strong>[BAC-5 Vulnerability Alert]</strong> The endpoint <code>/api/documents/*</code> does not sanitize file paths!</div>
          <div className="mt-1">
            Try accessing relative paths like <code>../env</code> or <code>statement_bob_q1.txt</code> to read unauthorized documents and server secrets.
          </div>
        </div>

        <div className="grid-3 mb-4">
          <div className="card" style={{ gridColumn: 'span 1' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Fetch File</h3>

            <form onSubmit={handleFetch}>
              <div className="form-group">
                <label className="form-label">Filename or Path</label>
                <input
                  type="text" className="form-input" required
                  value={filename}
                  onChange={e => setFilename(e.target.value)}
                  placeholder="e.g. statement_alice_q1.txt or ../env"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full mt-2" disabled={loading}>
                {loading ? 'Fetching...' : 'Request File →'}
              </button>
            </form>

            <div className="divider-text" style={{ margin: '1.5rem 0 1rem' }}>Presets</div>

            <div className="flex flex-col gap-1">
              {[
                { name: 'statement_alice_q1.txt', label: 'Alice Statement (Public)' },
                { name: 'statement_bob_q1.txt', label: 'Bob Statement (Private IDOR)' },
                { name: 'internal_config.txt', label: 'Internal Bank Secrets' },
                { name: '../env', label: '⚡ Exploit: ../env (Path Traversal)' }
              ].map(p => (
                <button
                  key={p.name}
                  className="btn btn-ghost btn-sm"
                  style={{ justifyContent: 'flex-start', textAlign: 'left', fontSize: '.78rem' }}
                  onClick={() => { setFilename(p.name); setTimeout(handleFetch, 50) }}
                >
                  📄 {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="card" style={{ gridColumn: 'span 2' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Server Response</h3>

            {error && <div className="alert alert-error">{error}</div>}

            {result ? (
              <div>
                {result._vulnerability && (
                  <div className="alert alert-vuln" style={{ fontSize: '.75rem', marginBottom: '1rem' }}>
                    <strong>Exploit Triggered:</strong> {result._vulnerability}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">JSON Response Payload</label>
                  <pre style={{
                    background: 'var(--c2)', padding: '1rem', borderRadius: 8,
                    overflowX: 'auto', fontSize: '.8rem', color: 'var(--g)',
                    border: '1px solid var(--bdr)'
                  }}>
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>

                {result.content && (
                  <div className="form-group mt-3">
                    <label className="form-label">Rendered Document Content</label>
                    <div style={{
                      background: 'rgba(255,255,255,.03)', padding: '1rem', borderRadius: 8,
                      fontFamily: 'monospace', fontSize: '.85rem', whiteSpace: 'pre-wrap',
                      border: '1px solid var(--bdr2)'
                    }}>
                      {result.content}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-5 text-muted">Submit a request to inspect the raw file output.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
