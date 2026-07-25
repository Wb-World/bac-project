// api/transactions/[id].js
// GET /api/transactions/:id  (id = account UUID)
//
// ══════════════════════════════════════════════════════════
// [BAC-4] INSECURE DIRECT OBJECT REFERENCE — Transactions
// ══════════════════════════════════════════════════════════
// Returns the FULL transaction history for any account ID
// passed in the URL. No authentication, no ownership check.
//
// EXPLOIT:
//   # View admin's $100k transaction history
//   curl https://nexusbank.vercel.app/api/transactions/<admin-account-uuid>
//
//   # View any user's full financial history
//   curl https://nexusbank.vercel.app/api/transactions/<any-uuid>
//
// IMPACT: Complete financial surveillance of any account
//         Reveals transaction partners, amounts, timing
//
// FIX: 1) Require JWT authentication
//      2) Validate account ownership: account.user_id === token.userId
//      3) Return 403 Forbidden on mismatch
// ══════════════════════════════════════════════════════════

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

  // ── NO AUTHENTICATION CHECK ── intentional vulnerability ──

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
    _vulnerability:  'BAC-4: IDOR — Full transaction history, no authentication',
    _attack_vector:  `GET /api/transactions/${id}`,
    _note:           'Enumerate account UUIDs from BAC-1 to harvest all transactions',
    account_id:      id,
    total:           count,
    page,
    limit,
    transactions:    transactions || [],
  })
}
