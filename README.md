# NexusBank — Broken Access Control Exploitation Guide

> **For Security Research & Education Only**  
> All exploits below are demonstrated entirely through the website browser interface.

**Live URL:** https://bac-project.vercel.app  
**Test Credentials:** See [CREDENTIALS.md](../CREDENTIALS.md)

---

## 🔍 How to Find Account UUIDs

Account UUIDs are required for testing IDOR vulnerabilities (**BAC-1** and **BAC-4**). You can retrieve them in **3 easy ways**:

### Method 1: Via the Public Vulnerability & Directory API (`/api/vulns`)
1. Open your browser and go to: `https://bac-project.vercel.app/api/vulns`
2. Look for the `"sample_account_uuids"` array in the JSON output.
3. You will see all accounts with their `account_id` (UUID), `owner`, and `balance`:
   ```json
   "sample_account_uuids": [
     {
       "account_id": "550e8400-e29b-41d4-a716-446655440000",
       "account_no": "NXS-100001",
       "balance": 100000,
       "owner": "admin",
       "role": "admin"
     },
     {
       "account_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
       "account_no": "NXS-100002",
       "balance": 5000,
       "owner": "alice",
       "role": "user"
     }
   ]
   ```

### Method 2: From the UI (Dashboard / Profile)
1. Log in as any user (e.g. `alice` / `alice123`).
2. On your **Dashboard**, look under your clear balance in the Account Card.
3. You will see: `Account ID: 6ba7b810-9dad-11d1-80b4-00c04fd430c8`.

### Method 3: From the Admin Panel Directory (Branch Console)
1. Register/log in as an administrator.
2. Go to **Branch Console** (`/admin`).
3. The **Customer Accounts Directory** table lists every user's Account ID / UUID.

---

## 🔴 Vulnerability 1 — IDOR: Read Any Account Balance Without Logging In

### Plain English Explanation
When you load the Dashboard, the browser fetches your account details from:
```
/api/account/YOUR-UUID
```
The server returns your balance, name, and email. **The problem:** the server never checks who is asking. So if you know someone else's UUID, you can read their account too — even without logging in.

### How to Test It (Step by Step)

**Step 1 — Get the target account UUID**
1. Open your browser and go to: `https://bac-project.vercel.app/api/vulns`
2. Locate the `account_id` for the user named `admin` (e.g., `550e8400-e29b-41d4-a716-446655440000`)

**Step 2 — Access admin's account without any login**
1. Open a private/incognito browser window (so you're completely logged out)
2. In the address bar, type:
   ```
   https://bac-project.vercel.app/api/account/550e8400-e29b-41d4-a716-446655440000
   ```
3. Press Enter

**What you will see:**
```json
{
  "account_id": "550e8400-e29b-41d4-a716-446655440000",
  "balance": 100000.00,
  "owner": {
    "username": "admin",
    "email": "admin@nexusbank.com",
    "role": "admin"
  }
}
```

✅ **Result:** You have just read the admin's balance and email address with zero authentication.

---

## 🔴 Vulnerability 2 — Privilege Escalation: Register as Administrator

### Plain English Explanation
The registration form has a dropdown called "Account Category." When you submit the form, whatever you pick is sent directly to the server as the `role` field. The server saves it without any validation. So if you pick "Branch Officer (Admin)," you become an admin.

### How to Test It (Step by Step)

**Step 1 — Open Registration**
1. Go to: `https://bac-project.vercel.app/register`
2. You see the standard account opening form

**Step 2 — Choose Admin Role**
1. Fill in: **User ID** → `my_admin_account`
2. Fill in: **Password** → `password123`
3. Find the **"Account Category"** dropdown
4. Change it from `Retail Customer (Savings)` → **`Branch Officer (Admin)`**
5. Click **"Complete Online Opening"**

**Step 3 — Verify Admin Access**
1. You are logged in automatically
2. Look at the left sidebar — you now see **"Branch Console"** at the bottom
3. Click it — you can see every customer's account, balance, and UUID
4. Use the "Branch Override Transfer" to move money between any accounts

✅ **Result:** A normal user just gave themselves full admin access in under 30 seconds.

---

## 🔴 Vulnerability 3 — Missing Access Control: Execute Forced Transfers via Weak JWT

### Plain English Explanation
The `/api/admin/transfer` endpoint checks if your login token (JWT) says `role: admin`. But the secret used to sign tokens is hardcoded as `nexusbank_weak_jwt_2026`. This means anyone who knows this secret can create their own fake "admin" token.

### How to Test It Using the Website

**The easiest route — use Vulnerability 2 first:**
1. Register as admin using the steps in Vulnerability 2 above
2. Log in with your new admin account
3. Go to **Branch Console** (Admin Panel) in the sidebar
4. Copy **Alice's Account UUID** and **Bob's Account UUID** from the Customer Directory table
5. In the **"Branch Override Transfer"** form on the right:
   - Source Account ID → Alice's UUID
   - Destination Account ID → Bob's UUID
   - Amount → 500
   - Click **"Execute Settlement →"**

✅ **Result:** $500 was moved from Alice's account to Bob's account WITHOUT Alice's consent or notification.

---

## 🔴 Vulnerability 4 — IDOR: Read Anyone's Full Transaction History

### Plain English Explanation
The `/api/transactions/{uuid}` endpoint returns ALL transactions for any account UUID. No login required. No ownership check.

### How to Test It (Step by Step)

**Method A — Through the Website:**
1. Log in as alice (alice / alice123)
2. Click **"Passbook / Statement"** in the sidebar
3. You see the "Account Statement Lookup" box — your own UUID is pre-filled
4. Clear the field and paste **admin's UUID** (get it from `/api/vulns`)
5. Click **"Fetch Statement →"**
6. You now see admin's entire transaction history

**Method B — Direct API (no login needed):**
1. Open any browser tab (no login required)
2. Go to: `https://bac-project.vercel.app/api/transactions/550e8400-e29b-41d4-a716-446655440000`
3. You will see all admin transactions in raw JSON

✅ **Result:** Full financial history of any account — deposits, withdrawals, transfers — all exposed without authentication.

---

## 🔴 Vulnerability 5 — Path Traversal: Steal the Server's Secret Keys

### Plain English Explanation
The Document Vault page lets you request files like `statement_alice_q1.txt`. The server builds a file path and returns the file content. **The problem:** it never blocks `../` (go up a folder) in the path. So you can navigate up to the server's own configuration folder and read environment variables — including the database password and JWT secret.

### How to Test It (Step by Step)

**Step 1 — Open the Document Vault**
1. Log in as any user (alice / alice123)
2. Click **"e-Documents"** in the left sidebar

**Step 2 — Request the Server's Environment**
1. In the "Document Reference Path" field, clear the text
2. Type: `../env`
3. Click **"Retrieve Statement →"**

**OR — click the preset:**
- Find and click the button labeled **"Server System Environment Record"** in the Quick Select list

**What you will see in the response:**
```json
{
  "_server_secrets": {
    "SUPABASE_SERVICE_ROLE_KEY": "eyJhbGci...",
    "JWT_SECRET": "nexusbank_weak_jwt_2026",
    "SUPABASE_URL": "https://..."
  }
}
```

✅ **Result:** The server's most sensitive secrets are fully exposed including the database admin key and the JWT signing secret.

---

## Quick Reference Table

| # | What You Can Do | Where on Website | Auth Needed? |
|---|---|---|---|
| 1 | Read any user's balance & email | `/api/account/{uuid}` in URL bar | ❌ None |
| 2 | Register as admin | `/register` — pick Admin in dropdown | ❌ None |
| 3 | Forcibly transfer money from any account | Admin Panel → Branch Override Transfer | Vuln 2 first |
| 4 | Read any account's full transaction log | Passbook page → paste any UUID | ✅ Any login |
| 5 | Read server database passwords | e-Documents → `../env` | ✅ Any login |

---

## Credentials Reference

| Username | Password | Role |
|---|---|---|
| alice | alice123 | Regular User |
| bob | bob123 | Regular User |
| admin | admin123 | Administrator |
| charlie | charlie123 | Regular User |
