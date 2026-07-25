// api/transactions/[id].js
// GET /api/transactions/:id — BAC-4 IDOR vulnerable endpoint

import { supabase } from '../_lib/supabase.js'
import { cors } from '../_lib/auth.js'

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { id } = req.query
  const page  = parseInt(req.query.page  || '1')
  const limit = parseInt(req.query.limit || '50')
  const from  = (page - 1) * limit

  const { data: transactions, error, count } = await supabase
    .from('transactions')
    .select('*', { count: 'exact' })
    .or(`from_account.eq.${id},to_account.eq.${id}`)
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1)

  if (error) {
    return res.status(500).json({ error: 'Database error', detail: error.message })
  }

  return res.status(200).json({
    account_id:   id,
    total:        count,
    page,
    limit,
    transactions: transactions || [],
  })
}
