// api/banking/transfer.js
// POST /api/banking/transfer — Authenticated peer transfer

import { supabase } from '../_lib/supabase.js'
import { requireAuth, cors } from '../_lib/auth.js'

export default requireAuth(async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { fromAccount, toAccount, amount, description = 'Peer transfer' } = req.body || {}
  const amt = parseFloat(amount)

  if (!fromAccount || !toAccount || isNaN(amt) || amt <= 0) {
    return res.status(400).json({ error: 'fromAccount, toAccount, and positive amount required' })
  }

  if (fromAccount === toAccount) {
    return res.status(400).json({ error: 'Cannot transfer to same account' })
  }

  // Verify ownership of source account
  const { data: src } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', fromAccount)
    .eq('user_id', req.user.userId)
    .single()

  if (!src) return res.status(403).json({ error: 'Source account not found or access denied' })
  if (src.balance < amt) return res.status(400).json({ error: 'Insufficient funds' })

  const { data: dst } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', toAccount)
    .single()

  if (!dst) return res.status(404).json({ error: 'Destination account not found' })

  await supabase.from('accounts').update({ balance: src.balance - amt }).eq('id', fromAccount)
  await supabase.from('accounts').update({ balance: dst.balance + amt }).eq('id', toAccount)

  const { data: tx } = await supabase.from('transactions')
    .insert({ from_account: fromAccount, to_account: toAccount, amount: amt, description, type: 'transfer' })
    .select()
    .single()

  return res.status(200).json({
    message:         `Transferred $${amt.toFixed(2)} successfully`,
    new_balance:     src.balance - amt,
    transaction:     tx,
  })
})
