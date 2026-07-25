// api/auth/me.js
// GET /api/auth/me — Returns current user profile (requires auth)

import { supabase } from '../_lib/supabase.js'
import { requireAuth, cors } from '../_lib/auth.js'

export default requireAuth(async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { data: user } = await supabase
    .from('users')
    .select('id, username, email, role, created_at')
    .eq('id', req.user.userId)
    .single()

  if (!user) return res.status(404).json({ error: 'User not found' })

  const { data: account } = await supabase
    .from('accounts')
    .select('id, account_no, balance, account_type, created_at')
    .eq('user_id', user.id)
    .single()

  return res.status(200).json({ user, account })
})
