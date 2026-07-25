import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexus_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auth
export const login    = (body) => api.post('/api/auth/login', body)
export const register = (body) => api.post('/api/auth/register', body)
export const getMe    = ()     => api.get('/api/auth/me')

// Account (BAC-1 — no auth required by server)
export const getAccount = (id) => api.get(`/api/account/${id}`)

// Transactions (BAC-4 — no auth required by server)
export const getTransactions = (accountId, params) =>
  api.get(`/api/transactions/${accountId}`, { params })

// Banking
export const deposit  = (body) => api.post('/api/banking/deposit', body)
export const withdraw = (body) => api.post('/api/banking/withdraw', body)
export const transfer = (body) => api.post('/api/banking/transfer', body)

// Admin
export const getAdminUsers    = ()     => api.get('/api/admin/users')
export const adminTransfer    = (body) => api.post('/api/admin/transfer', body)

// Documents (BAC-5)
export const getDocument = (path) => api.get(`/api/documents/${path}`)

// Vuln info
export const getVulns = () => api.get('/api/vulns')

export default api
