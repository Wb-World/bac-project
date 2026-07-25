// api/_lib/auth.js
// JWT helpers — weak secret intentionally hardcoded for BAC-3 demonstration

import jwt from 'jsonwebtoken'

// [VULN] Weak, hardcoded JWT secret — exposed in /api/vulns
// Attacker uses this to forge admin tokens: jwt.sign({role:'admin'}, 'nexusbank_weak_jwt_2026')
const JWT_SECRET = process.env.JWT_SECRET || 'nexusbank_weak_jwt_2026'

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

export function extractToken(req) {
  const auth = req.headers.authorization || ''
  if (auth.startsWith('Bearer ')) return auth.slice(7)
  return null
}

// Middleware: verifies JWT and attaches decoded payload to req.user
// Used ONLY on properly secured endpoints (deposit, withdraw, transfer)
// The vulnerable endpoints (BAC-1, BAC-3, BAC-4) deliberately skip this
export function requireAuth(handler) {
  return async (req, res) => {
    const token = extractToken(req)
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    const decoded = verifyToken(token)
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }
    req.user = decoded
    return handler(req, res)
  }
}

// CORS helper
export function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
}
