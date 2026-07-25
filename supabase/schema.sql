-- ================================================================
-- NexusBank — Supabase PostgreSQL Schema
-- Run this in the Supabase SQL Editor
-- RLS is intentionally DISABLED for vulnerability demonstration
-- ================================================================

-- Drop existing tables (clean slate)
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ────────────────────────────────────────────────────────────────
-- USERS TABLE
-- ────────────────────────────────────────────────────────────────
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username    TEXT UNIQUE NOT NULL,
  email       TEXT UNIQUE,
  password    TEXT NOT NULL,   -- MD5 hash [VULN: weak hashing]
  role        TEXT NOT NULL DEFAULT 'user',  -- [BAC-2] exploitable via register
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Intentionally disable RLS for vulnerability demonstration
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────────
-- ACCOUNTS TABLE
-- ────────────────────────────────────────────────────────────────
CREATE TABLE accounts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  account_no    TEXT UNIQUE NOT NULL,
  balance       DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  account_type  TEXT NOT NULL DEFAULT 'checking',  -- 'checking' | 'savings'
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE accounts DISABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────────
-- TRANSACTIONS TABLE
-- ────────────────────────────────────────────────────────────────
CREATE TABLE transactions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_account  UUID REFERENCES accounts(id),
  to_account    UUID REFERENCES accounts(id),
  amount        DECIMAL(15, 2) NOT NULL,
  description   TEXT,
  type          TEXT NOT NULL,  -- 'deposit' | 'withdrawal' | 'transfer'
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────────
-- DOCUMENTS TABLE (used for BAC-5 path traversal simulation)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE documents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  filename    TEXT NOT NULL,
  content     TEXT,
  is_private  BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE documents DISABLE ROW LEVEL SECURITY;

-- ================================================================
-- SEED DATA
-- Passwords are MD5 hashed:
--   md5('admin123')   = 0192023a7bbd73250516f069df18b500
--   md5('alice123')   = 8d1b34c768fa7ced7d98fbceb8b2a3a0  
--   md5('bob123')     = 0d1e7f92a3bfad4e6e6cf248e9d6d03a
--   md5('charlie123') = 5e7ba22cce2e28a5ab47ec3a65571a9e
--   md5('dave123')    = 6d0cfb46a07ee0c5b7db0e7d0d4e1a3c
-- NOTE: Use actual MD5 values — the ones below are illustrative.
-- Run in Node: require('md5')('admin123') to get real values.
-- The server will use md5() on login to compare.
-- ================================================================

-- Insert users (passwords are md5 hashed by the app on registration)
-- For seed, we store raw md5 values directly
INSERT INTO users (username, email, password, role) VALUES
  ('admin',   'admin@nexusbank.com',   md5('admin123'),   'admin'),
  ('alice',   'alice@example.com',     md5('alice123'),   'user'),
  ('bob',     'bob@example.com',       md5('bob123'),     'user'),
  ('charlie', 'charlie@example.com',   md5('charlie123'), 'user'),
  ('dave',    'dave@example.com',      md5('dave123'),    'user');

-- Insert accounts
INSERT INTO accounts (user_id, account_no, balance, account_type)
SELECT id, 'NXS-0001-ADMIN', 100000.00, 'savings'  FROM users WHERE username='admin';
INSERT INTO accounts (user_id, account_no, balance, account_type)
SELECT id, 'NXS-0002-ALIC',    5000.00, 'checking' FROM users WHERE username='alice';
INSERT INTO accounts (user_id, account_no, balance, account_type)
SELECT id, 'NXS-0003-BOB',     2500.00, 'checking' FROM users WHERE username='bob';
INSERT INTO accounts (user_id, account_no, balance, account_type)
SELECT id, 'NXS-0004-CHAR',    1200.00, 'checking' FROM users WHERE username='charlie';
INSERT INTO accounts (user_id, account_no, balance, account_type)
SELECT id, 'NXS-0005-DAVE',     800.00, 'savings'  FROM users WHERE username='dave';

-- Insert sample transactions (using sub-selects for UUIDs)
INSERT INTO transactions (from_account, to_account, amount, description, type, created_at)
SELECT
  (SELECT id FROM accounts WHERE account_no='NXS-0001-ADMIN'),
  (SELECT id FROM accounts WHERE account_no='NXS-0002-ALIC'),
  500.00, 'Welcome bonus', 'transfer', NOW() - INTERVAL '80 days';

INSERT INTO transactions (from_account, to_account, amount, description, type, created_at)
SELECT
  (SELECT id FROM accounts WHERE account_no='NXS-0002-ALIC'),
  (SELECT id FROM accounts WHERE account_no='NXS-0003-BOB'),
  200.00, 'Lunch split', 'transfer', NOW() - INTERVAL '60 days';

INSERT INTO transactions (from_account, to_account, amount, description, type, created_at)
SELECT
  (SELECT id FROM accounts WHERE account_no='NXS-0003-BOB'),
  (SELECT id FROM accounts WHERE account_no='NXS-0004-CHAR'),
  75.50, 'Book club dues', 'transfer', NOW() - INTERVAL '55 days';

INSERT INTO transactions (from_account, to_account, amount, description, type, created_at)
SELECT
  (SELECT id FROM accounts WHERE account_no='NXS-0004-CHAR'),
  (SELECT id FROM accounts WHERE account_no='NXS-0005-DAVE'),
  100.00, 'Gift', 'transfer', NOW() - INTERVAL '45 days';

INSERT INTO transactions (from_account, to_account, amount, description, type, created_at)
SELECT
  (SELECT id FROM accounts WHERE account_no='NXS-0001-ADMIN'),
  (SELECT id FROM accounts WHERE account_no='NXS-0003-BOB'),
  1000.00, 'Loan repayment', 'transfer', NOW() - INTERVAL '40 days';

INSERT INTO transactions (from_account, to_account, amount, description, type, created_at)
SELECT NULL,
  (SELECT id FROM accounts WHERE account_no='NXS-0001-ADMIN'),
  50000.00, 'Monthly salary credit', 'deposit', NOW() - INTERVAL '30 days';

INSERT INTO transactions (from_account, to_account, amount, description, type, created_at)
SELECT NULL,
  (SELECT id FROM accounts WHERE account_no='NXS-0002-ALIC'),
  2000.00, 'Freelance payment', 'deposit', NOW() - INTERVAL '25 days';

INSERT INTO transactions (from_account, to_account, amount, description, type, created_at)
SELECT NULL,
  (SELECT id FROM accounts WHERE account_no='NXS-0003-BOB'),
  500.00, 'ATM deposit', 'deposit', NOW() - INTERVAL '20 days';

INSERT INTO transactions (from_account, to_account, amount, description, type, created_at)
SELECT
  (SELECT id FROM accounts WHERE account_no='NXS-0002-ALIC'),
  NULL, 300.00, 'Electricity bill', 'withdrawal', NOW() - INTERVAL '15 days';

INSERT INTO transactions (from_account, to_account, amount, description, type, created_at)
SELECT
  (SELECT id FROM accounts WHERE account_no='NXS-0003-BOB'),
  NULL, 150.00, 'Grocery store', 'withdrawal', NOW() - INTERVAL '12 days';

INSERT INTO transactions (from_account, to_account, amount, description, type, created_at)
SELECT
  (SELECT id FROM accounts WHERE account_no='NXS-0004-CHAR'),
  NULL, 50.00, 'Netflix subscription', 'withdrawal', NOW() - INTERVAL '10 days';

INSERT INTO transactions (from_account, to_account, amount, description, type, created_at)
SELECT
  (SELECT id FROM accounts WHERE account_no='NXS-0005-DAVE'),
  NULL, 80.00, 'Fuel', 'withdrawal', NOW() - INTERVAL '5 days';

-- Insert sample documents [BAC-5 targets]
INSERT INTO documents (user_id, filename, content, is_private) VALUES
  ((SELECT id FROM users WHERE username='alice'),
   'statement_alice_q1.txt',
   'NEXUSBANK ACCOUNT STATEMENT - ALICE\nPeriod: Q1 2026\nOpening Balance: $3000.00\nClosing Balance: $5000.00\nTransactions: 5\nStatus: Active',
   TRUE),
  ((SELECT id FROM users WHERE username='bob'),
   'statement_bob_q1.txt',
   'NEXUSBANK ACCOUNT STATEMENT - BOB\nPeriod: Q1 2026\nOpening Balance: $2000.00\nClosing Balance: $2500.00\nTransactions: 3\nStatus: Active',
   TRUE),
  ((SELECT id FROM users WHERE username='admin'),
   'internal_config.txt',
   'NexusBank Internal Configuration\nDB_HOST: db.internal\nSMTP_PASS: smtp_admin_pass_2026\nADMIN_PIN: 9821\nNote: DO NOT SHARE',
   TRUE),
  (NULL,
   'public_notice.txt',
   'NexusBank Public Notice:\nInterest rates have been updated effective 2026-04-01.\nSavings: 3.5% APY\nChecking: 0.5% APY',
   FALSE);
