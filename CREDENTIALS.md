# NexusBank — System Account Credentials & Seed Data

This document contains pre-seeded credentials for testing and security research on NexusBank.

---

## 🔑 Demo & Test Accounts

| Role | Username | Password | Email | Initial Balance | Account Type |
|---|---|---|---|---|---|
| **System Administrator** | `admin` | `admin123` | `admin@nexusbank.com` | **$100,000.00** | Savings |
| **Standard User** | `alice` | `alice123` | `alice@example.com` | **$5,000.00** | Checking |
| **Standard User** | `bob` | `bob123` | `bob@example.com` | **$2,500.00** | Checking |
| **Standard User** | `charlie` | `charlie123` | `charlie@example.com` | **$1,200.00** | Checking |
| **Standard User** | `dave` | `dave123` | `dave@example.com` | **$800.00** | Savings |

---

## 🛠️ Exploit Helper Credentials & Secrets

- **Weak Hardcoded JWT Secret**: `nexusbank_weak_jwt_2026`
- **MD5 Hash Algorithm**: Passwords in database are hashed with standard MD5.
  - `md5("admin123")` = `0192023a7bbd73250516f069df18b500`
  - `md5("alice123")` = `8d1b34c768fa7ced7d98fbceb8b2a3a0`
  - `md5("bob123")`   = `0d1e7f92a3bfad4e6e6cf248e9d6d03a`
