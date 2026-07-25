// api/auth/register.js
// POST /api/auth/register
//
// ══════════════════════════════════════════════════════════
// [BAC-2] PRIVILEGE ESCALATION VIA ROLE MANIPULATION
// ══════════════════════════════════════════════════════════
// The `role` field is accepted directly from the request body
// without server-side validation. Any user can register as
// admin by including role=admin in the POST body.
//
// EXPLOIT:
//   curl -X POST https://nexusbank.vercel.app/api/auth/register \
//     -H "Content-Type: application/json" \
//     -d '{"username":"hacker","password":"hax123","role":"admin"}'
//
// IMPACT: Attacker gains admin access, views all accounts,
//         performs forced transfers via /api/admin/transfer
//
// FIX: Hardcode role='user' — never accept from client input
// ══════════════════════════════════════════════════════════

import { supabase } from '../_lib/supabase.js'
import { signToken, cors } from '../_lib/auth.js'
import md5 from 'md5'

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const {
    username,
    password,
    email,
    initialDeposit = 100,
    // ─────────────────────────────────────────────────────────
    // [BAC-2] VULNERABLE LINE: role accepted from request body
    //         Should be hardcoded as 'user' on server side
    // ─────────────────────────────────────────────────────────
    role = 'user',  // <── VULNERABILITY: attacker sends role=admin
  } = req.body || {}

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' })
  }

  // Check existing
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('username', username.trim())
    .single()

  if (existing) {
    return res.status(409).json({ error: 'Username already taken' })
  }

  const passwordHash = md5(password)
  const userNo = Math.floor(Math.random() * 9000) + 1000
  const accountNo = `NXS-${userNo}-${username.slice(0, 4).toUpperCase()}`

  // Insert user — role comes from request body [BAC-2]
  const { data: user, error: userErr } = await supabase
    .from('users')
    .insert({ username: username.trim(), email, password: passwordHash, role })
    .select()
    .single()

  if (userErr) {
    return res.status(500).json({ error: 'Failed to create user', detail: userErr.message })
  }

  // Create account
  const { data: account, error: acctErr } = await supabase
    .from('accounts')
    .insert({ user_id: user.id, account_no: accountNo, balance: parseFloat(initialDeposit) || 0 })
    .select()
    .single()

  if (acctErr) {
    return res.status(500).json({ error: 'Failed to create account' })
  }

  // Seed initial deposit transaction
  if (parseFloat(initialDeposit) > 0) {
    await supabase.from('transactions').insert({
      to_account:  account.id,
      amount:      parseFloat(initialDeposit),
      description: 'Account opening deposit',
      type:        'deposit',
    })
  }

  const token = signToken({
    userId:    user.id,
    username:  user.username,
    email:     user.email,
    role:      user.role,    // BAC-2: role is whatever attacker sent
    accountId: account.id,
  })

  return res.status(201).json({
    _vulnerability: 'BAC-2: Role accepted from request body — send role=admin to escalate',
    token,
    user: { id: user.id, username: user.username, email: user.email, role: user.role },
    account,
  })
}
