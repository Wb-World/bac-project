// api/admin/transfer.js
// POST /api/admin/transfer — BAC-3 vulnerable endpoint

import { supabase } from '../_lib/supabase.js'
import { verifyToken, extractToken, cors } from '../_lib/auth.js'

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const token = extractToken(req)
  if (!token) {
    return res.status(401).json({ error: 'Authorization token required' })
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }

  if (decoded.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }

  const { fromAccount, toAccount, amount, description = 'Admin forced transfer' } = req.body || {}

  if (!fromAccount || !toAccount || !amount || parseFloat(amount) <= 0) {
    return res.status(400).json({ error: 'fromAccount, toAccount, and amount are required' })
  }

  const { data: src } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', fromAccount)
    .single()

  if (!src) return res.status(404).json({ error: 'Source account not found' })
  if (src.balance < parseFloat(amount)) {
    return res.status(400).json({ error: 'Insufficient funds in source account' })
  }

  const { data: dst } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', toAccount)
    .single()

  if (!dst) return res.status(404).json({ error: 'Destination account not found' })

  await supabase.from('accounts')
    .update({ balance: src.balance - parseFloat(amount) })
    .eq('id', fromAccount)

  await supabase.from('accounts')
    .update({ balance: dst.balance + parseFloat(amount) })
    .eq('id', toAccount)

  const { data: tx } = await supabase.from('transactions')
    .insert({
      from_account: fromAccount,
      to_account:   toAccount,
      amount:       parseFloat(amount),
      description,
      type:         'transfer',
    })
    .select()
    .single()

  return res.status(200).json({
    message:       `Admin transfer of $${parseFloat(amount).toFixed(2)} completed`,
    transaction:   tx,
    executed_by:   decoded.username,
    executed_role: decoded.role,
  })
}
