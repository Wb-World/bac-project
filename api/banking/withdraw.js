// api/banking/withdraw.js
// POST /api/banking/withdraw — Authenticated, proper ownership check

import { supabase } from '../_lib/supabase.js'
import { requireAuth, cors } from '../_lib/auth.js'

export default requireAuth(async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { accountId, amount, description = 'Withdrawal' } = req.body || {}
  const amt = parseFloat(amount)

  if (!accountId || isNaN(amt) || amt <= 0) {
    return res.status(400).json({ error: 'Valid accountId and positive amount required' })
  }

  const { data: account } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', accountId)
    .eq('user_id', req.user.userId)
    .single()

  if (!account) {
    return res.status(403).json({ error: 'Account not found or access denied' })
  }

  if (account.balance < amt) {
    return res.status(400).json({ error: 'Insufficient funds', balance: account.balance })
  }

  await supabase.from('accounts')
    .update({ balance: account.balance - amt })
    .eq('id', accountId)

  const { data: tx } = await supabase.from('transactions')
    .insert({ from_account: accountId, amount: amt, description, type: 'withdrawal' })
    .select()
    .single()

  return res.status(200).json({
    message:     `Withdrawn $${amt.toFixed(2)} successfully`,
    new_balance: account.balance - amt,
    transaction: tx,
  })
})
