// api/_lib/auth.js — JWT helpers with intentionally weak secret (BAC-3)
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'nexusbank_weak_jwt_2026'

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
}

export function verifyToken(token) {
  try { return jwt.verify(token, JWT_SECRET) }
  catch { return null }
}

export function extractToken(req) {
  const auth = req.headers.authorization || ''
  if (auth.startsWith('Bearer ')) return auth.slice(7)
  return null
}

export function requireAuth(handler) {
  return async (req, res) => {
    cors(res)
    if (req.method === 'OPTIONS') return res.status(200).end()
    const token = extractToken(req)
    if (!token) return res.status(401).json({ error: 'Authentication required' })
    const decoded = verifyToken(token)
    if (!decoded) return res.status(401).json({ error: 'Invalid or expired token' })
    req.user = decoded
    return handler(req, res)
  }
}

export function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
}
