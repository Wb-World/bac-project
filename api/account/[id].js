// api/account/[id].js
// GET /api/account/:id
//
// ══════════════════════════════════════════════════════════
// [BAC-1] INSECURE DIRECT OBJECT REFERENCE (IDOR)
//         Account Balance & Details
// ══════════════════════════════════════════════════════════
// This endpoint returns full account details for ANY account
// ID passed in the URL — no authentication required, no
// ownership check against the requesting user.
//
// EXPLOIT:
//   # No login needed — enumerate all accounts
//   curl https://nexusbank.vercel.app/api/account/<uuid>
//
//   # Find UUIDs from dashboard links or response bodies
//   # Then access any account including admin's $100,000 balance
//
// IMPACT: Full account details of any user exposed to anyone
//
// FIX: 1) Require authentication (verify JWT)
//      2) Check decoded.userId === account.user_id
//      3) Return 403 if mismatch
// ══════════════════════════════════════════════════════════

import { supabase } from '../_lib/supabase.js'
import { cors } from '../_lib/auth.js'

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { id } = req.query

  // ── NO AUTHENTICATION CHECK ── intentional vulnerability ──
  // No JWT verification. No session check. Completely open.

  const { data: account, error } = await supabase
    .from('accounts')
    .select('*, users(id, username, email, role, created_at)')
    .eq('id', id)
    .single()

  if (error || !account) {
    return res.status(404).json({
      _vulnerability: 'BAC-1: IDOR — Try other account UUIDs',
      error: 'Account not found',
      hint: 'Account UUIDs are visible in dashboard API responses and links',
    })
  }

  return res.status(200).json({
    _vulnerability:  'BAC-1: IDOR — No auth check, no ownership verification',
    _attack_vector:  `GET /api/account/${id}`,
    _note:           'Anyone can read any account. JWT cookie completely ignored.',
    account_id:      account.id,
    account_no:      account.account_no,
    account_type:    account.account_type,
    balance:         account.balance,
    created_at:      account.created_at,
    owner: account.users ? {
      user_id:  account.users.id,
      username: account.users.username,
      email:    account.users.email,
      role:     account.users.role,
      joined:   account.users.created_at,
    } : null,
  })
}
