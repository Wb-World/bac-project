// api/account/[id].js
// GET /api/account/:id — BAC-1 IDOR vulnerable endpoint

import { supabase } from '../_lib/supabase.js'
import { cors } from '../_lib/auth.js'

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { id } = req.query

  const { data: account, error } = await supabase
    .from('accounts')
    .select('*, users(id, username, email, role, created_at)')
    .eq('id', id)
    .single()

  if (error || !account) {
    return res.status(404).json({ error: 'Account not found' })
  }

  return res.status(200).json({
    account_id:   account.id,
    account_no:   account.account_no,
    account_type: account.account_type,
    balance:      account.balance,
    created_at:   account.created_at,
    owner: account.users ? {
      user_id:  account.users.id,
      username: account.users.username,
      email:    account.users.email,
      role:     account.users.role,
      joined:   account.users.created_at,
    } : null,
  })
}
