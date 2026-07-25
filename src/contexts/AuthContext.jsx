import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { login as apiLogin, register as apiRegister, getMe } from '../lib/api'

const AuthContext = createContext(null)

// Decode JWT payload without verification (used as UI fallback only)
function decodeJWT(token) {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadMe = useCallback(async () => {
    const token = localStorage.getItem('nexus_token')
    if (!token) { setLoading(false); return }

    // Immediately show user from JWT so page never blanks
    const decoded = decodeJWT(token)
    if (decoded) {
      setUser({ id: decoded.userId, username: decoded.username, email: decoded.email, role: decoded.role })
      setAccount(decoded.accountId ? { id: decoded.accountId } : null)
    }

    // Then try to get fresh data from server
    try {
      const { data } = await getMe()
      setUser(data.user)
      setAccount(data.account)
    } catch {
      // If server fails, keep the JWT-decoded state instead of logging out
      if (!decoded) {
        localStorage.removeItem('nexus_token')
        setUser(null)
        setAccount(null)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadMe() }, [loadMe])

  const login = async (credentials) => {
    const { data } = await apiLogin(credentials)
    localStorage.setItem('nexus_token', data.token)
    setUser(data.user)
    setAccount(data.account)
    return data
  }

  const register = async (payload) => {
    const { data } = await apiRegister(payload)
    localStorage.setItem('nexus_token', data.token)
    setUser(data.user)
    setAccount(data.account)
    return data
  }

  const logout = () => {
    localStorage.removeItem('nexus_token')
    setUser(null)
    setAccount(null)
  }

  const refreshAccount = loadMe

  return (
    <AuthContext.Provider value={{ user, account, loading, login, register, logout, refreshAccount }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
