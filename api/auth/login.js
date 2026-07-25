// api/auth/login.js
// POST /api/auth/login
// Returns JWT on success. No rate limiting [VULN].

import { supabase } from '../_lib/supabase.js'
import { signToken, cors } from '../_lib/auth.js'
import md5 from 'md5'

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { username, password } = req.body || {}
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' })
  }

  const passwordHash = md5(password) // [VULN] MD5 — weak password hashing

  const { data: user, error } = await supabase
    .from('users')
    .select('id, username, email, role')
    .eq('username', username.trim())
    .eq('password', passwordHash)
    .single()

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid username or password' })
  }

  // Fetch account
  const { data: account } = await supabase
    .from('accounts')
    .select('id, account_no, balance, account_type')
    .eq('user_id', user.id)
    .single()

  const token = signToken({
    userId:    user.id,
    username:  user.username,
    email:     user.email,
    role:      user.role,          // [BAC-3] role embedded in JWT — forgeable
    accountId: account?.id || null,
  })

  return res.status(200).json({
    token,
    user: {
      id:        user.id,
      username:  user.username,
      email:     user.email,
      role:      user.role,
    },
    account: account || null,
  })
}
