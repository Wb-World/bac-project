import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Transfer from './pages/Transfer'
import Deposit from './pages/Deposit'
import AdminPanel from './pages/AdminPanel'
import Documents from './pages/Documents'
import Profile from './pages/Profile'
import ExploitGuide from './pages/ExploitGuide'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/dashboard"    element={<ProtectedRoute><ErrorBoundary><Dashboard /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute><ErrorBoundary><Transactions /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/transfer"     element={<ProtectedRoute><ErrorBoundary><Transfer /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/deposit"      element={<ProtectedRoute><ErrorBoundary><Deposit /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/documents"    element={<ProtectedRoute><ErrorBoundary><Documents /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/profile"      element={<ProtectedRoute><ErrorBoundary><Profile /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/exploit-guide" element={<ProtectedRoute><ErrorBoundary><ExploitGuide /></ErrorBoundary></ProtectedRoute>} />

            <Route path="/admin" element={<ProtectedRoute adminOnly><ErrorBoundary><AdminPanel /></ErrorBoundary></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  )
}
