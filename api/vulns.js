// api/vulns.js
// GET /api/vulns — Publicly accessible vulnerability summary

import { cors } from './_lib/auth.js'

export default function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  return res.status(200).json({
    application:  'NexusBank v2',
    stack:        'React + Vite / Node.js Vercel Serverless / Supabase PostgreSQL',
    purpose:      'OWASP Broken Access Control — Security Research & Education',
    jwt_secret:   process.env.JWT_SECRET || 'nexusbank_weak_jwt_2026',
    credentials: {
      admin:   'admin / admin123',
      users: ['alice/alice123', 'bob/bob123', 'charlie/charlie123', 'dave/dave123'],
    },
    vulnerabilities: [
      {
        id:       'BAC-1',
        name:     'IDOR on Account Balance',
        endpoint: 'GET /api/account/:id',
        auth:     'None required',
        exploit:  'curl https://YOUR_APP.vercel.app/api/account/<any-uuid>',
        impact:   'Read balance, account number, owner details for any user',
        fix:      'Verify JWT + check account.user_id === token.userId',
      },
      {
        id:       'BAC-2',
        name:     'Privilege Escalation via Role Parameter',
        endpoint: 'POST /api/auth/register',
        auth:     'None required',
        exploit:  'curl -X POST /api/auth/register -d \'{"username":"hax","password":"hax","role":"admin"}\'',
        impact:   'Register an admin account, access /admin/panel, perform forced transfers',
        fix:      'Hardcode role=\'user\' server-side; never accept from client',
      },
      {
        id:       'BAC-3',
        name:     'Missing Function-Level Access Control',
        endpoint: 'POST /api/admin/transfer',
        auth:     'JWT with role=admin (forgeable)',
        exploit:  'node -e "console.log(require(\'jsonwebtoken\').sign({role:\'admin\'},\'nexusbank_weak_jwt_2026\'))"',
        impact:   'Forced transfer from any account to any account',
        fix:      'Use strong random JWT secret; re-validate role against DB per request',
      },
      {
        id:       'BAC-4',
        name:     'IDOR on Transaction History',
        endpoint: 'GET /api/transactions/:id',
        auth:     'None required',
        exploit:  'curl https://YOUR_APP.vercel.app/api/transactions/<any-account-uuid>',
        impact:   'Full financial history of any user exposed',
        fix:      'Verify JWT + ownership check before returning transactions',
      },
      {
        id:       'BAC-5',
        name:     'Path Traversal & Env Var Leakage',
        endpoint: 'GET /api/documents/**',
        auth:     'None required',
        exploit:  'curl https://YOUR_APP.vercel.app/api/documents/..%2Fenv',
        impact:   'Leaks SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET, SMTP passwords',
        fix:      'Authenticate requests; validate ownership; never expose env vars via API',
      },
    ],
  })
}
