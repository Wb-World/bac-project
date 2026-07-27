import { useState } from 'react'
import Sidebar from '../components/Navbar'
import { getDocument } from '../lib/api'

export default function Documents() {
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const docPresets = [
    { id: 'statement_alice_q1.txt', title: 'Q1 Account Statement — Alice', category: 'Quarterly Statement', date: '2026-03-31' },
    { id: 'statement_bob_q1.txt', title: 'Q1 Account Statement — Bob', category: 'Quarterly Statement', date: '2026-03-31' },
    { id: 'internal_config.txt', title: 'Branch Audit Certificate', category: 'Official Certificate', date: '2026-01-15' }
  ]

  const handleFetchDoc = async (docId) => {
    setLoading(true)
    setError('')
    setSelectedDoc(null)
    try {
      const { data } = await getDocument(docId)
      setSelectedDoc(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to retrieve document.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="portal-page-wrapper">
      <div className="bank-ticker-bar">
        <div className="bank-ticker-left">
          <span className="ticker-badge">DIGITAL VAULT</span>
          <span>Official E-Statements & Verified Account Certificates.</span>
        </div>
      </div>

      <div className="app-shell">
        <Sidebar />
        <main className="main-content">
          <div className="page-header mb-4">
            <h1 className="page-title">E-Statements & Document Vault</h1>
            <p className="page-sub">Access official stamped statements and financial certificates</p>
          </div>

          <div className="grid-3 gap-4">
            <div className="card" style={{ gridColumn: 'span 1' }}>
              <div className="card-header">
                <span className="card-title">Available E-Documents</span>
              </div>

              <div className="flex flex-col gap-2">
                {docPresets.map(preset => (
                  <div
                    key={preset.id}
                    className="p-3 bg-light rounded hover-border cursor-pointer flex flex-col gap-1"
                    onClick={() => handleFetchDoc(preset.id)}
                    style={{ border: '1px solid var(--card-bdr)', transition: 'all .15s' }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="badge badge-blue">{preset.category}</span>
                      <span className="text-xs text-muted">{preset.date}</span>
                    </div>
                    <strong style={{ fontSize: '.88rem', color: '#0a2540' }}>{preset.title}</strong>
                    <button
                      className="btn btn-ghost btn-sm mt-1"
                      style={{ justifyContent: 'center' }}
                      disabled={loading}
                    >
                      📄 Retrieve Document
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ gridColumn: 'span 2' }}>
              <div className="card-header">
                <span className="card-title">Document Preview Window</span>
              </div>

              {error && <div className="alert alert-error">{error}</div>}

              {loading ? (
                <div className="text-center py-5 text-muted">Retrieving document from digital vault...</div>
              ) : selectedDoc ? (
                <div className="document-preview-pane">
                  <div className="p-3 bg-light rounded mb-3 border">
                    <div className="text-xs text-muted font-bold uppercase mb-1">DOCUMENT METADATA</div>
                    <div className="grid-2 gap-2 text-xs">
                      <div><strong>Filename:</strong> {selectedDoc.filename || selectedDoc.name || 'Official Statement'}</div>
                      <div><strong>Status:</strong> <span className="text-green">Verified & Stamped</span></div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Document Text Content</label>
                    <div className="p-3 bg-white rounded border font-mono text-sm whitespace-pre-wrap">
                      {selectedDoc.content || JSON.stringify(selectedDoc, null, 2)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-5 text-muted">
                  Select an e-document from the list on the left to display its contents.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
