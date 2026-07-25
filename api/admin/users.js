// api/admin/users.js
// GET /api/admin/users — returns all users + account info

import { supabase } from '../_lib/supabase.js'
import { verifyToken, extractToken, cors } from '../_lib/auth.js'

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const token = extractToken(req)
  const decoded = token ? verifyToken(token) : null

  if (!decoded || decoded.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }

  const { data: users } = await supabase
    .from('users')
    .select('id, username, email, role, created_at, accounts(id, account_no, balance, account_type)')
    .order('created_at', { ascending: true })

  const { data: txStats } = await supabase
    .from('transactions')
    .select('id', { count: 'exact' })

  return res.status(200).json({
    users: users || [],
    total_users:        users?.length || 0,
    total_transactions: txStats?.length || 0,
    total_assets:       users?.reduce((sum, u) => sum + (u.accounts?.[0]?.balance || 0), 0) || 0,
  })
}
