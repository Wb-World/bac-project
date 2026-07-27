import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { login as apiLogin, register as apiRegister, getMe } from '../lib/api'

const AuthContext = createContext(null)

// Decode JWT payload & check expiration
function decodeJWT(token) {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    // Check if token has expired
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return null
    }
    return decoded
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    localStorage.removeItem('nexus_token')
    localStorage.removeItem('nexus_session_time')
    setUser(null)
    setAccount(null)
  }, [])

  const loadMe = useCallback(async () => {
    const token = localStorage.getItem('nexus_token')
    if (!token) { 
      setUser(null)
      setAccount(null)
      setLoading(false)
      return 
    }

    // Check token expiration & decoding
    const decoded = decodeJWT(token)
    if (!decoded) {
      // Token is invalid or expired
      logout()
      setLoading(false)
      return
    }

    setUser({ id: decoded.userId, username: decoded.username, email: decoded.email, role: decoded.role })
    setAccount(decoded.accountId ? { id: decoded.accountId } : null)

    // Validate with backend server
    try {
      const { data } = await getMe()
      setUser(data.user)
      setAccount(data.account)
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout()
      }
    } finally {
      setLoading(false)
    }
  }, [logout])

  useEffect(() => { loadMe() }, [loadMe])

  const login = async (credentials) => {
    const { data } = await apiLogin(credentials)
    localStorage.setItem('nexus_token', data.token)
    localStorage.setItem('nexus_session_time', Date.now().toString())
    setUser(data.user)
    setAccount(data.account)
    return data
  }

  const register = async (payload) => {
    const { data } = await apiRegister(payload)
    localStorage.setItem('nexus_token', data.token)
    localStorage.setItem('nexus_session_time', Date.now().toString())
    setUser(data.user)
    setAccount(data.account)
    return data
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

