import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="auth-page flex items-center justify-center">
      <div className="text-center p-4">
        <h1 style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--g)' }}>404</h1>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '.5rem' }}>Page Not Found</h2>
        <p className="text-muted text-sm mb-4">The path you requested does not exist on NexusBank.</p>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
      </div>
    </div>
  )
}
