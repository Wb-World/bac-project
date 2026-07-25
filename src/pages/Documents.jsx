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
    <div style={{ minHeight: '100vh', background: '#f4f7fa' }}>
      <div className="bank-ticker-bar">
        <div className="bank-ticker-left">
          <span className="ticker-badge">DIGITAL VAULT</span>
          <span>E-Statements and Account Certificates Retrieval System.</span>
        </div>
      </div>

      <div className="app-shell">
        <Sidebar />
        <main className="main-content">
          <div className="page-header">
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0a2540' }}>E-Statements & Document Vault</h1>
            <p className="page-sub">Retrieve official quarterly account statements and certificates</p>
          </div>

          <div className="grid-3 mb-4">
            <div className="card" style={{ gridColumn: 'span 1', borderTop: '4px solid #005691' }}>
              <div className="card-header">
                <span className="card-title">Document Lookup</span>
              </div>

              <form onSubmit={handleFetch}>
                <div className="form-group">
                  <label className="form-label">Document Reference Path</label>
                  <input
                    type="text" className="form-input" required
                    value={filename}
                    onChange={e => setFilename(e.target.value)}
                    placeholder="e.g. statement_alice_q1.txt"
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-full mt-2" disabled={loading}>
                  {loading ? 'Fetching...' : 'Retrieve Statement →'}
                </button>
              </form>

              <div style={{ margin: '1.2rem 0 .6rem', fontSize: '.75rem', fontWeight: 700, color: '#64748b' }}>Quick Select Presets</div>

              <div className="flex flex-col gap-1">
                {[
                  { name: 'statement_alice_q1.txt', label: 'Q1 Statement — Alice' },
                  { name: 'statement_bob_q1.txt', label: 'Q1 Statement — Bob' },
                  { name: 'internal_config.txt', label: 'Branch Configuration Certificate' },
                  { name: '../env', label: 'Server System Environment Record' }
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
              <div className="card-header">
                <span className="card-title">Statement Document Viewer</span>
              </div>

              {error && <div className="alert alert-error">{error}</div>}

              {result ? (
                <div>
                  <div className="form-group">
                    <label className="form-label">Document Metadata</label>
                    <pre style={{
                      background: '#f8fafc', padding: '1rem', borderRadius: 4,
                      overflowX: 'auto', fontSize: '.8rem', color: '#0a2540',
                      border: '1px solid #cbd5e1'
                    }}>
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>

                  {result.content && (
                    <div className="form-group mt-3">
                      <label className="form-label">Rendered Content</label>
                      <div style={{
                        background: '#ffffff', padding: '1rem', borderRadius: 4,
                        fontFamily: 'monospace', fontSize: '.85rem', whiteSpace: 'pre-wrap',
                        border: '1px solid #cbd5e1'
                      }}>
                        {result.content}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-5 text-muted">Select a document to render contents.</div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
