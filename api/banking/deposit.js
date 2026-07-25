// api/banking/deposit.js
// POST /api/banking/deposit — Authenticated, proper ownership check

import { supabase } from '../_lib/supabase.js'
import { requireAuth, cors } from '../_lib/auth.js'

export default requireAuth(async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { accountId, amount, description = 'Deposit' } = req.body || {}
  const amt = parseFloat(amount)

  if (!accountId || isNaN(amt) || amt <= 0) {
    return res.status(400).json({ error: 'Valid accountId and positive amount required' })
  }

  // Ownership check — compare account.user_id with token.userId
  const { data: account } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', accountId)
    .eq('user_id', req.user.userId)  // ownership enforced
    .single()

  if (!account) {
    return res.status(403).json({ error: 'Account not found or access denied' })
  }

  await supabase.from('accounts')
    .update({ balance: account.balance + amt })
    .eq('id', accountId)

  const { data: tx } = await supabase.from('transactions')
    .insert({ to_account: accountId, amount: amt, description, type: 'deposit' })
    .select()
    .single()

  return res.status(200).json({
    message:     `Deposited $${amt.toFixed(2)} successfully`,
    new_balance: account.balance + amt,
    transaction: tx,
  })
})
