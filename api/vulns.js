// api/vulns.js
// GET /api/vulns — Publicly accessible vulnerability summary & account directory

import { cors } from './_lib/auth.js'
import { supabase } from './_lib/supabase.js'

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  let accounts = []
  try {
    const { data } = await supabase
      .from('accounts')
      .select('id, account_no, account_type, balance, user_id, users(username, email, role)')
    accounts = data || []
  } catch (e) {
    console.error('Error fetching accounts for vulns endpoint:', e)
  }

  return res.status(200).json({
    application:  'NexusBank v2',
    stack:        'React + Vite / Node.js Vercel Serverless / Supabase PostgreSQL',
    jwt_secret:   process.env.JWT_SECRET || 'nexusbank_weak_jwt_2026',
    credentials: {
      admin:   'admin / admin123',
      users: ['alice/alice123', 'bob/bob123', 'charlie/charlie123', 'dave/dave123'],
    },
    sample_account_uuids: accounts.map(a => ({
      account_id: a.id,
      account_no: a.account_no,
      balance: a.balance,
      owner: a.users?.username,
      email: a.users?.email,
      role: a.users?.role
    })),
    vulnerabilities: [
      {
        id:       'BAC-1',
        name:     'IDOR on Account Balance',
        endpoint: 'GET /api/account/:id',
        auth:     'None required',
        exploit:  'GET /api/account/<sample-account-id>',
        impact:   'Read balance, account number, owner details for any user',
      },
      {
        id:       'BAC-2',
        name:     'Privilege Escalation via Role Parameter',
        endpoint: 'POST /api/auth/register',
        auth:     'None required',
        exploit:  'POST /api/auth/register with body {"role":"admin"}',
        impact:   'Register an admin account, access /admin, perform forced transfers',
      },
      {
        id:       'BAC-3',
        name:     'Missing Function-Level Access Control',
        endpoint: 'POST /api/admin/transfer',
        auth:     'JWT with role=admin (forgeable)',
        exploit:  'POST /api/admin/transfer with forged JWT token',
        impact:   'Forced transfer from any account to any account',
      },
      {
        id:       'BAC-4',
        name:     'IDOR on Transaction History',
        endpoint: 'GET /api/transactions/:id',
        auth:     'None required',
        exploit:  'GET /api/transactions/<sample-account-id>',
        impact:   'Full financial history of any user exposed',
      },
      {
        id:       'BAC-5',
        name:     'Path Traversal & Env Var Leakage',
        endpoint: 'GET /api/documents/*',
        auth:     'None required',
        exploit:  'GET /api/documents/..%2Fenv',
        impact:   'Leaks SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET, server configs',
      },
    ],
  })
}
