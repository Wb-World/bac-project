import Sidebar from '../components/Navbar'
import { useAuth } from '../contexts/AuthContext'

export default function Profile() {
  const { user, account } = useAuth()

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">User Profile</h1>
          <p className="page-sub">Identity & Account Credentials</p>
        </div>

        <div className="grid-2 max-w-lg">
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem' }}>User Information</h3>

            <div className="form-group">
              <label className="form-label">User ID</label>
              <input type="text" className="form-input" disabled value={user?.id || ''} />
            </div>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input type="text" className="form-input" disabled value={user?.username || ''} />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="text" className="form-input" disabled value={user?.email || 'N/A'} />
            </div>
            <div className="form-group">
              <label className="form-label">System Role</label>
              <input type="text" className="form-input" disabled value={user?.role || ''} />
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem' }}>Account Details</h3>

            <div className="form-group">
              <label className="form-label">Account UUID</label>
              <input type="text" className="form-input" disabled value={account?.id || ''} />
            </div>
            <div className="form-group">
              <label className="form-label">Account Number</label>
              <input type="text" className="form-input" disabled value={account?.account_no || ''} />
            </div>
            <div className="form-group">
              <label className="form-label">Account Type</label>
              <input type="text" className="form-input" disabled value={account?.account_type || ''} />
            </div>
            <div className="form-group">
              <label className="form-label">Current Balance</label>
              <input type="text" className="form-input" disabled value={`$${parseFloat(account?.balance || 0).toFixed(2)}`} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
