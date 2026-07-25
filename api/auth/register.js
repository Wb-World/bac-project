// api/auth/register.js
// POST /api/auth/register — BAC-2 vulnerable endpoint

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
    role = 'user',
  } = req.body || {}

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' })
  }

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

  const { data: user, error: userErr } = await supabase
    .from('users')
    .insert({ username: username.trim(), email, password: passwordHash, role })
    .select()
    .single()

  if (userErr) {
    return res.status(500).json({ error: 'Failed to create user', detail: userErr.message })
  }

  const { data: account, error: acctErr } = await supabase
    .from('accounts')
    .insert({ user_id: user.id, account_no: accountNo, balance: parseFloat(initialDeposit) || 0 })
    .select()
    .single()

  if (acctErr) {
    return res.status(500).json({ error: 'Failed to create account' })
  }

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
    role:      user.role,
    accountId: account.id,
  })

  return res.status(201).json({
    token,
    user: { id: user.id, username: user.username, email: user.email, role: user.role },
    account,
  })
}
