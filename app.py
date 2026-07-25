"""
NexusBank - Intentionally Vulnerable Banking Application
=========================================================
PURPOSE: Security research & education only.
         Demonstrates OWASP Broken Access Control vulnerabilities.

VULNERABILITIES PRESENT:
  [BAC-1] IDOR on /api/account/<account_id>          - No ownership check
  [BAC-2] Privilege Escalation via /register          - Hidden 'role' parameter
  [BAC-3] Missing Function-Level Access Control       - /admin/transfer trivially bypassed
  [BAC-4] IDOR on /api/transactions/<account_id>      - No ownership check
  [BAC-5] Path Traversal on /documents/<filename>     - No path sanitisation

DO NOT DEPLOY TO PRODUCTION.
"""

import os
import sqlite3
import hashlib
import json
import datetime
import jwt                      # pip install PyJWT
from flask import (
    Flask, request, session, redirect, url_for,
    render_template_string, jsonify, send_file, abort, g, flash
)
from functools import wraps

# ─────────────────────────────────────────────
#  App & Config
# ─────────────────────────────────────────────
app = Flask(__name__)
app.secret_key = "supersecretkey123"          # [VULN] Weak hardcoded secret key
DATABASE = "bank.db"
UPLOAD_DIR = "documents"                      # [BAC-5] unsanitised base dir
JWT_SECRET = "jwt_weak_secret_do_not_use"     # [VULN] Weak JWT secret


# ─────────────────────────────────────────────
#  Database helpers
# ─────────────────────────────────────────────
def get_db():
    db = getattr(g, "_database", None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row
    return db


@app.teardown_appcontext
def close_db(exception):
    db = getattr(g, "_database", None)
    if db is not None:
        db.close()


def query_db(query, args=(), one=False):
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv


def execute_db(query, args=()):
    db = get_db()
    db.execute(query, args)
    db.commit()


def hash_password(password):
    return hashlib.md5(password.encode()).hexdigest()   # [VULN] MD5 hashing


def make_jwt(user_id, username, role):
    payload = {
        "user_id": user_id,
        "username": username,
        "role": role,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


# ─────────────────────────────────────────────
#  Database initialisation & seeding
# ─────────────────────────────────────────────
SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    username    TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    role        TEXT NOT NULL DEFAULT 'user',
    email       TEXT,
    created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS accounts (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    account_no  TEXT UNIQUE NOT NULL,
    balance     REAL NOT NULL DEFAULT 0.0,
    account_type TEXT DEFAULT 'checking',
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS transactions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    from_account    INTEGER,
    to_account      INTEGER,
    amount          REAL NOT NULL,
    description     TEXT,
    type            TEXT NOT NULL,
    created_at      TEXT DEFAULT (datetime('now'))
);
"""

SEED_USERS = [
    ("admin",   "admin123",   "admin",  "admin@nexusbank.com"),
    ("alice",   "alice123",   "user",   "alice@example.com"),
    ("bob",     "bob123",     "user",   "bob@example.com"),
    ("charlie", "charlie123", "user",   "charlie@example.com"),
    ("dave",    "dave123",    "user",   "dave@example.com"),
]

SEED_ACCOUNTS = [
    (1, "NXS-0001-ADMIN", 100000.00, "savings"),
    (2, "NXS-0002-ALICE",   5000.00, "checking"),
    (3, "NXS-0003-BOB",     2500.00, "checking"),
    (4, "NXS-0004-CHAR",    1200.00, "checking"),
    (5, "NXS-0005-DAVE",     800.00, "savings"),
]

SEED_TRANSACTIONS = [
    (1, 2,  500.00, "Welcome bonus",           "transfer",   "2026-01-05 10:00:00"),
    (2, 3,  200.00, "Lunch split",              "transfer",   "2026-02-14 12:30:00"),
    (3, 4,   75.50, "Book club dues",           "transfer",   "2026-02-20 09:15:00"),
    (4, 5,  100.00, "Gift",                     "transfer",   "2026-03-01 17:45:00"),
    (1, 3, 1000.00, "Loan repayment",           "transfer",   "2026-03-10 11:00:00"),
    (None, 1, 50000.00, "Monthly salary credit","deposit",    "2026-04-01 08:00:00"),
    (None, 2, 2000.00, "Freelance payment",     "deposit",    "2026-04-05 14:00:00"),
    (None, 3,  500.00, "ATM deposit",           "deposit",    "2026-04-08 16:30:00"),
    (2, None,  300.00, "Electricity bill",      "withdrawal", "2026-04-10 10:00:00"),
    (3, None,  150.00, "Grocery store",         "withdrawal", "2026-04-12 13:00:00"),
    (4, None,   50.00, "Netflix subscription",  "withdrawal", "2026-04-15 20:00:00"),
    (5, None,   80.00, "Fuel",                  "withdrawal", "2026-04-18 07:30:00"),
]


def init_db():
    with app.app_context():
        db = get_db()
        db.executescript(SCHEMA)
        db.commit()

        row = db.execute("SELECT COUNT(*) as cnt FROM users").fetchone()
        if row["cnt"] == 0:
            for uname, pwd, role, email in SEED_USERS:
                db.execute(
                    "INSERT INTO users (username, password, role, email) VALUES (?,?,?,?)",
                    (uname, hash_password(pwd), role, email),
                )
            db.commit()

            for uid, acno, bal, atype in SEED_ACCOUNTS:
                db.execute(
                    "INSERT INTO accounts (user_id, account_no, balance, account_type) VALUES (?,?,?,?)",
                    (uid, acno, bal, atype),
                )
            db.commit()

            for tx in SEED_TRANSACTIONS:
                db.execute(
                    "INSERT INTO transactions (from_account, to_account, amount, description, type, created_at)"
                    " VALUES (?,?,?,?,?,?)",
                    tx,
                )
            db.commit()

        os.makedirs(UPLOAD_DIR, exist_ok=True)
        for fname, content in [
            ("statement_alice.txt",   "Alice Q1 2026 Statement\nBalance: $5000.00\nTransactions: 3\n"),
            ("statement_bob.txt",     "Bob Q1 2026 Statement\nBalance: $2500.00\nTransactions: 2\n"),
            ("statement_charlie.txt", "Charlie Q1 2026 Statement\nBalance: $1200.00\nTransactions: 2\n"),
            ("notice.txt",            "NexusBank Important Notice:\nInterest rates updated as of 2026-04-01.\n"),
        ]:
            path = os.path.join(UPLOAD_DIR, fname)
            if not os.path.exists(path):
                with open(path, "w") as f:
                    f.write(content)


# ─────────────────────────────────────────────
#  Auth decorators
# ─────────────────────────────────────────────
def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get("user_id"):
            return redirect(url_for("home") + "?login=1")
        return f(*args, **kwargs)
    return decorated


def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get("user_id"):
            return redirect(url_for("home") + "?login=1")
        if not session.get("is_admin"):
            abort(403)
        return f(*args, **kwargs)
    return decorated


# ─────────────────────────────────────────────
#  HTML Base Template
# ─────────────────────────────────────────────
BASE_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>NexusBank{% if page_title %} — {{ page_title }}{% endif %}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css"/>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"/>
<style>
:root{
  --g:#00d084;--gd:#00a866;--gg:rgba(0,208,132,.22);
  --bg:#0a0e14;--c1:#111720;--c2:#161e2a;
  --bdr:rgba(0,208,132,.18);--mt:#8899aa;--tx:#e8f0f8;
}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--tx);min-height:100vh;}

.nxs-navbar{background:rgba(10,14,20,.92);border-bottom:1px solid var(--bdr);
  backdrop-filter:blur(12px);padding:.9rem 0;position:sticky;top:0;z-index:1000;}
.nxs-brand{font-size:1.45rem;font-weight:800;color:var(--g)!important;
  letter-spacing:-.5px;text-decoration:none;display:flex;align-items:center;gap:.45rem;}
.logo-box{width:34px;height:34px;background:var(--g);border-radius:8px;
  display:flex;align-items:center;justify-content:center;}
.logo-box i{color:#0a0e14;font-size:1.05rem;}
.navbar-nav .nav-link{color:var(--mt)!important;font-weight:500;transition:color .2s;padding:.4rem .85rem!important;}
.navbar-nav .nav-link:hover{color:var(--g)!important;}
.btn-login{background:transparent;border:1.5px solid var(--g);color:var(--g);
  border-radius:8px;padding:.4rem 1.1rem;font-weight:600;transition:all .2s;cursor:pointer;}
.btn-login:hover{background:var(--g);color:#0a0e14;}

.card-nxs{background:var(--c1);border:1px solid var(--bdr);border-radius:16px;
  padding:1.6rem;transition:box-shadow .25s,transform .25s;}
.card-nxs:hover{box-shadow:0 0 24px var(--gg);transform:translateY(-2px);}

.balance-card{background:linear-gradient(135deg,#0d2118 0%,#0a1a0f 100%);
  border:1px solid var(--g);border-radius:20px;padding:2rem;position:relative;overflow:hidden;}
.balance-card::before{content:'';position:absolute;top:-60px;right:-60px;
  width:180px;height:180px;background:var(--gg);border-radius:50%;}
.bal-amt{font-size:2.3rem;font-weight:800;color:var(--g);letter-spacing:-1px;}
.bal-lbl{font-size:.75rem;letter-spacing:1.5px;text-transform:uppercase;color:var(--mt);}

.btn-nxs{background:var(--g);color:#0a0e14;border:none;border-radius:10px;
  font-weight:700;padding:.55rem 1.4rem;transition:all .2s;cursor:pointer;}
.btn-nxs:hover{background:var(--gd);color:#0a0e14;transform:translateY(-1px);box-shadow:0 4px 14px var(--gg);}
.btn-out{background:transparent;border:1.5px solid var(--g);color:var(--g);
  border-radius:10px;font-weight:600;padding:.5rem 1.3rem;transition:all .2s;cursor:pointer;}
.btn-out:hover{background:var(--g);color:#0a0e14;}
.btn-red{background:#e53935;color:#fff;border:none;border-radius:10px;
  font-weight:600;padding:.5rem 1.3rem;transition:all .2s;cursor:pointer;}
.btn-red:hover{background:#c62828;}

.nxs-table{color:var(--tx);width:100%;border-collapse:separate;border-spacing:0 4px;}
.nxs-table thead th{color:var(--mt);font-size:.72rem;letter-spacing:1.2px;text-transform:uppercase;
  padding:.8rem 1rem;border-bottom:1px solid var(--bdr);font-weight:600;}
.nxs-table tbody tr{background:var(--c2);transition:background .2s;}
.nxs-table tbody tr:hover{background:rgba(0,208,132,.06);}
.nxs-table tbody td{padding:.85rem 1rem;border-top:1px solid rgba(255,255,255,.04);}

.bdg-dep{background:rgba(0,208,132,.15);color:var(--g);border-radius:6px;padding:.2rem .6rem;font-size:.7rem;font-weight:600;}
.bdg-wth{background:rgba(229,57,53,.15);color:#ef9a9a;border-radius:6px;padding:.2rem .6rem;font-size:.7rem;font-weight:600;}
.bdg-trn{background:rgba(33,150,243,.15);color:#90caf9;border-radius:6px;padding:.2rem .6rem;font-size:.7rem;font-weight:600;}
.bdg-adm{background:rgba(255,183,77,.15);color:#ffb74d;border-radius:6px;padding:.2rem .6rem;font-size:.7rem;font-weight:600;}
.bdg-usr{background:rgba(0,208,132,.12);color:var(--g);border-radius:6px;padding:.2rem .6rem;font-size:.7rem;font-weight:600;}
.vtag{display:inline-block;background:rgba(229,57,53,.15);color:#ef9a9a;
  border:1px solid rgba(229,57,53,.35);border-radius:6px;font-size:.62rem;font-weight:700;
  letter-spacing:.8px;padding:.12rem .5rem;text-transform:uppercase;margin-left:.4rem;vertical-align:middle;}

.modal-content{background:var(--c1);border:1px solid var(--bdr);border-radius:20px;}
.modal-header,.modal-footer{border-color:var(--bdr)!important;}
.modal-title{color:var(--g);font-weight:700;}
.btn-close{filter:invert(1);}

.inp{background:rgba(255,255,255,.05);border:1px solid var(--bdr);color:var(--tx);
  border-radius:10px;padding:.7rem 1rem;transition:border-color .2s,box-shadow .2s;width:100%;}
.inp:focus{outline:none;border-color:var(--g);box-shadow:0 0 0 3px var(--gg);
  background:rgba(255,255,255,.07);color:var(--tx);}
.flbl{color:var(--mt);font-size:.83rem;font-weight:500;display:block;margin-bottom:.35rem;}

.stat-ico{width:46px;height:46px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;}
.ico-g{background:rgba(0,208,132,.15);color:var(--g);}
.ico-b{background:rgba(33,150,243,.15);color:#90caf9;}
.ico-o{background:rgba(255,183,77,.15);color:#ffb74d;}
.ico-r{background:rgba(229,57,53,.15);color:#ef9a9a;}

.sec-ttl{font-size:1.05rem;font-weight:700;color:var(--tx);margin-bottom:1.1rem;
  display:flex;align-items:center;gap:.45rem;}
.sec-ttl i{color:var(--g);}
.divider{border-color:var(--bdr)!important;}
.al-vuln{background:rgba(229,57,53,.1);border:1px solid rgba(229,57,53,.28);
  color:#ef9a9a;border-radius:10px;padding:.75rem 1rem;}
.fade-in{animation:fadeIn .4s ease;}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
@keyframes floatCard{0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);}}
@keyframes pulse-g{0%,100%{box-shadow:0 0 0 0 var(--gg);}50%{box-shadow:0 0 0 8px transparent;}}
.pulse{animation:pulse-g 2s infinite;}
::-webkit-scrollbar{width:6px;height:6px;}
::-webkit-scrollbar-track{background:var(--bg);}
::-webkit-scrollbar-thumb{background:var(--bdr);border-radius:3px;}
</style>
</head>
<body>

<nav class="nxs-navbar">
  <div class="container">
    <div class="d-flex align-items-center justify-content-between w-100">
      <a class="nxs-brand" href="/">
        <div class="logo-box"><i class="bi bi-bank2"></i></div>NexusBank
      </a>
      <div class="d-flex align-items-center gap-2">
        {% if session.user_id %}
          <span style="color:var(--mt);font-size:.85rem;" class="me-1">
            <i class="bi bi-person-circle me-1"></i>{{ session.username }}
            {% if session.is_admin %}<span class="vtag">admin</span>{% endif %}
          </span>
          <a href="/dashboard" class="btn btn-sm btn-out">
            <i class="bi bi-speedometer2 me-1"></i>Dashboard
          </a>
          {% if session.is_admin %}
          <a href="/admin/panel" class="btn btn-sm" style="background:rgba(255,183,77,.13);color:#ffb74d;border:1.5px solid rgba(255,183,77,.28);border-radius:8px;font-weight:600;">
            <i class="bi bi-shield-lock me-1"></i>Admin
          </a>
          {% endif %}
          <a href="/logout" class="btn btn-sm btn-red">
            <i class="bi bi-box-arrow-right me-1"></i>Logout
          </a>
        {% else %}
          <button class="btn-login" data-bs-toggle="modal" data-bs-target="#loginModal">
            <i class="bi bi-box-arrow-in-right me-1"></i>Login
          </button>
          <a href="/register" class="btn btn-sm btn-nxs ms-1">
            <i class="bi bi-person-plus me-1"></i>Register
          </a>
        {% endif %}
      </div>
    </div>
  </div>
</nav>

{% with messages = get_flashed_messages(with_categories=true) %}
  {% if messages %}
  <div class="container mt-3">
    {% for cat, msg in messages %}
    <div class="alert alert-dismissible fade show mb-2" style="border-radius:10px;background:{% if cat=='error' %}rgba(229,57,53,.14){% elif cat=='success' %}rgba(0,208,132,.12){% else %}rgba(33,150,243,.12){% endif %};border:1px solid {% if cat=='error' %}rgba(229,57,53,.28){% elif cat=='success' %}var(--bdr){% else %}rgba(33,150,243,.28){% endif %};color:var(--tx);">
      {{ msg }}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
    {% endfor %}
  </div>
  {% endif %}
{% endwith %}

{{ page_content | safe }}

<div class="modal fade" id="loginModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header px-4 pt-4 pb-3">
        <h5 class="modal-title"><i class="bi bi-shield-lock me-2"></i>Secure Login</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body px-4 pb-2">
        <form action="/login" method="POST">
          <div class="mb-3">
            <label class="flbl" for="ml-user">Username</label>
            <input type="text" id="ml-user" name="username" class="inp" placeholder="Enter username" required/>
          </div>
          <div class="mb-3">
            <label class="flbl" for="ml-pass">Password</label>
            <input type="password" id="ml-pass" name="password" class="inp" placeholder="Enter password" required/>
          </div>
          <button type="submit" class="btn-nxs btn w-100 mb-3" id="loginBtn">
            <i class="bi bi-box-arrow-in-right me-2"></i>Login
          </button>
        </form>
      </div>
      <div class="modal-footer px-4 pb-4 pt-0 border-0">
        <small style="color:var(--mt);">Don't have an account? <a href="/register" style="color:var(--g);">Register here</a></small>
      </div>
    </div>
  </div>
</div>

<footer class="mt-5 py-4" style="border-top:1px solid var(--bdr);background:rgba(10,14,20,.7);">
  <div class="container">
    <div class="row align-items-center">
      <div class="col-md-6">
        <span style="color:var(--g);font-weight:700;">NexusBank</span>
        <span style="color:var(--mt);" class="ms-2 small">© 2026 — Intentionally Vulnerable App. Educational Use Only.</span>
      </div>
      <div class="col-md-6 text-md-end mt-2 mt-md-0">
        <small style="color:var(--mt);">
          <i class="bi bi-bug-fill me-1" style="color:#ef9a9a;"></i>
          BAC-1 · BAC-2 · BAC-3 · BAC-4 · BAC-5
        </small>
      </div>
    </div>
  </div>
</footer>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script>
if(new URLSearchParams(window.location.search).get('login')==='1'){
  new bootstrap.Modal(document.getElementById('loginModal')).show();
}
document.querySelectorAll('.count-up').forEach(el=>{
  const target=parseFloat(el.dataset.target);
  const dur=900,step=20;let cur=0,inc=target/(dur/step);
  const t=setInterval(()=>{
    cur=Math.min(cur+inc,target);
    el.textContent='$'+cur.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
    if(cur>=target)clearInterval(t);
  },step);
});
</script>
{{ extra_scripts | safe }}
</body>
</html>"""


def render_page(page_title, content, extra_scripts=""):
    return render_template_string(
        BASE_HTML,
        page_title=page_title,
        page_content=content,
        extra_scripts=extra_scripts,
    )


# ─────────────────────────────────────────────
#  PAGE: Home
# ─────────────────────────────────────────────
HOME_CONTENT = """
<section style="background:radial-gradient(ellipse at 30% 50%,rgba(0,208,132,.08) 0%,transparent 70%);
  padding:5rem 0 4rem;min-height:520px;display:flex;align-items:center;">
  <div class="container">
    <div class="row align-items-center g-5">
      <div class="col-lg-6 fade-in">
        <p style="color:var(--g);font-weight:600;font-size:.8rem;letter-spacing:2px;text-transform:uppercase;margin-bottom:.6rem;">
          <i class="bi bi-circle-fill me-2" style="font-size:.45rem;"></i>Next-Gen Banking
        </p>
        <h1 style="font-size:3.1rem;font-weight:800;line-height:1.1;letter-spacing:-1.5px;" class="mb-3">
          Banking for the<br/><span style="color:var(--g);">Digital Age</span>
        </h1>
        <p style="color:var(--mt);font-size:1.05rem;max-width:440px;line-height:1.65;" class="mb-4">
          NexusBank delivers enterprise-grade financial services with cutting-edge technology.
          Fast, secure, and always available.
        </p>
        <div class="d-flex gap-3 flex-wrap">
          {% if session.user_id %}
          <a href="/dashboard" class="btn btn-lg btn-nxs">
            <i class="bi bi-speedometer2 me-2"></i>Go to Dashboard
          </a>
          {% else %}
          <button class="btn btn-lg btn-nxs pulse" data-bs-toggle="modal" data-bs-target="#loginModal">
            <i class="bi bi-box-arrow-in-right me-2"></i>Get Started
          </button>
          <a href="/register" class="btn btn-lg btn-out">
            <i class="bi bi-person-plus me-1"></i>Open Account
          </a>
          {% endif %}
        </div>
        <div class="al-vuln mt-4 d-flex align-items-start gap-2" style="font-size:.81rem;">
          <i class="bi bi-bug-fill mt-1" style="color:#ef9a9a;flex-shrink:0;"></i>
          <span><strong style="color:#ef9a9a;">Security Research App:</strong> Contains intentional OWASP Broken Access Control
          vulnerabilities (BAC-1 thru BAC-5). <strong>Never deploy to production.</strong>
          See <a href="/api/vulns" style="color:#ef9a9a;">/api/vulns</a> for full summary.</span>
        </div>
      </div>
      <div class="col-lg-6 fade-in">
        <div style="background:var(--c1);border:1px solid var(--bdr);border-radius:20px;padding:2rem;
          animation:floatCard 3.5s ease-in-out infinite;">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <span style="color:var(--mt);font-size:.82rem;">NexusBank Premier</span>
            <i class="bi bi-bank2" style="color:var(--g);font-size:1.4rem;"></i>
          </div>
          <div class="bal-lbl mb-1">Total System Balance</div>
          <div class="bal-amt mb-3">$109,500.00</div>
          <hr class="divider my-3"/>
          <div class="row g-3 mb-3">
            <div class="col-6">
              <div class="card-nxs p-3">
                <div class="d-flex align-items-center gap-2 mb-1">
                  <div class="stat-ico ico-g" style="width:34px;height:34px;font-size:.9rem;"><i class="bi bi-arrow-down-circle"></i></div>
                  <span style="color:var(--mt);font-size:.75rem;">Deposits</span>
                </div>
                <span style="font-size:1.15rem;font-weight:700;color:var(--g);">$52,500</span>
              </div>
            </div>
            <div class="col-6">
              <div class="card-nxs p-3">
                <div class="d-flex align-items-center gap-2 mb-1">
                  <div class="stat-ico ico-r" style="width:34px;height:34px;font-size:.9rem;"><i class="bi bi-arrow-up-circle"></i></div>
                  <span style="color:var(--mt);font-size:.75rem;">Withdrawals</span>
                </div>
                <span style="font-size:1.15rem;font-weight:700;color:#ef9a9a;">$580</span>
              </div>
            </div>
          </div>
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span style="color:var(--mt);font-size:.79rem;">Monthly spend limit</span>
            <span style="color:var(--g);font-size:.79rem;font-weight:600;">72%</span>
          </div>
          <div class="progress" style="height:6px;background:rgba(255,255,255,.08);border-radius:10px;">
            <div class="progress-bar" style="width:72%;background:var(--g);border-radius:10px;"></div>
          </div>
        </div>
        <div class="d-flex flex-wrap gap-2 mt-3 justify-content-center">
          {% for lbl in ['256-bit SSL','Instant Transfers','Smart Analytics','Mobile Banking'] %}
          <span class="px-3 py-1 rounded-pill" style="background:rgba(0,208,132,.07);border:1px solid var(--bdr);
            color:var(--mt);font-size:.76rem;font-weight:500;">{{ lbl }}</span>
          {% endfor %}
        </div>
      </div>
    </div>
  </div>
</section>

<div class="container my-5">
  <div class="row g-4">
    {% set features = [
      ('bi-shield-lock-fill','Zero-Knowledge Security','Military-grade encryption on every transaction.','ico-g'),
      ('bi-lightning-charge-fill','Real-Time Processing','Transfers processed in under 2 seconds, 24/7.','ico-b'),
      ('bi-graph-up-arrow','AI Portfolio Insights','Smart analytics to grow your wealth over time.','ico-o'),
      ('bi-globe2','Global Access','Send money to 150+ countries with zero hidden fees.','ico-r'),
    ] %}
    {% for icon, title, desc, cls in features %}
    <div class="col-md-3 col-sm-6">
      <div class="card-nxs h-100">
        <div class="stat-ico {{ cls }} mb-3"><i class="{{ icon }}"></i></div>
        <h6 style="font-weight:700;font-size:.92rem;" class="mb-1">{{ title }}</h6>
        <p style="color:var(--mt);font-size:.81rem;" class="mb-0">{{ desc }}</p>
      </div>
    </div>
    {% endfor %}
  </div>
</div>
"""

# ─────────────────────────────────────────────
#  PAGE: Register
# ─────────────────────────────────────────────
REGISTER_CONTENT = """
<div class="container py-5">
  <div class="row justify-content-center">
    <div class="col-md-6 col-lg-5">
      <div class="card-nxs fade-in">
        <div class="text-center mb-4">
          <div style="width:54px;height:54px;background:var(--g);border-radius:14px;
            display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;">
            <i class="bi bi-person-plus-fill" style="font-size:1.5rem;color:#0a0e14;"></i>
          </div>
          <h4 style="font-weight:700;">Create Account <span class="vtag">BAC-2</span></h4>
          <p style="color:var(--mt);font-size:.83rem;" class="mt-1">Join NexusBank in seconds</p>
        </div>
        <form action="/register" method="POST">
          <div class="mb-3">
            <label class="flbl" for="ru">Username</label>
            <input type="text" id="ru" name="username" class="inp" placeholder="Choose a username" required/>
          </div>
          <div class="mb-3">
            <label class="flbl" for="re">Email</label>
            <input type="email" id="re" name="email" class="inp" placeholder="your@email.com"/>
          </div>
          <div class="mb-3">
            <label class="flbl" for="rp">Password</label>
            <input type="password" id="rp" name="password" class="inp" placeholder="Create a password" required/>
          </div>
          <div class="mb-3">
            <label class="flbl" for="ri">Initial Deposit ($)</label>
            <input type="number" id="ri" name="initial_deposit" class="inp" placeholder="e.g. 500" min="0" value="100"/>
          </div>
          <!-- [BAC-2] VULNERABILITY: hidden role field — send role=admin via Burp/curl -->
          <input type="hidden" name="role" value="user"/>
          <div class="al-vuln mb-3" style="font-size:.74rem;">
            <i class="bi bi-exclamation-triangle-fill me-1"></i>
            <strong>[BAC-2]</strong> Hidden <code style="color:#ffb74d;">role</code> param accepted from POST body.
            Send <code style="color:#ffb74d;">role=admin</code> via Burp/curl to escalate privileges!
          </div>
          <button type="submit" class="btn-nxs btn w-100" id="regBtn">
            <i class="bi bi-person-check me-2"></i>Create Account
          </button>
        </form>
        <div class="text-center mt-3">
          <small style="color:var(--mt);">Already have an account?
            <a href="/?login=1" style="color:var(--g);">Login here</a>
          </small>
        </div>
      </div>
    </div>
  </div>
</div>
"""

# ─────────────────────────────────────────────
#  PAGE: Dashboard (built dynamically)
# ─────────────────────────────────────────────
DASH_CONTENT = """
<div class="container py-4 fade-in">
  <div class="row mb-4 align-items-center">
    <div class="col">
      <h2 style="font-weight:800;" class="mb-0">Welcome, {{ username }} 👋</h2>
      <p style="color:var(--mt);" class="small mb-0">{{ now }}</p>
    </div>
  </div>

  <div class="row g-4 mb-4">
    {% for acct in accounts %}
    <div class="col-md-6 col-lg-4">
      <div class="balance-card">
        <div class="d-flex justify-content-between align-items-start mb-3">
          <div>
            <div class="bal-lbl">{{ acct['account_type']|upper }} ACCOUNT</div>
            <div style="font-size:.76rem;color:var(--mt);margin-top:2px;">{{ acct['account_no'] }}</div>
          </div>
          <i class="bi bi-credit-card-2-front" style="color:var(--g);font-size:1.5rem;"></i>
        </div>
        <div class="bal-amt count-up" data-target="{{ acct['balance'] }}">
          ${{ '{:,.2f}'.format(acct['balance']) }}
        </div>
        <div class="bal-lbl mt-1">Available Balance</div>
        <hr class="divider my-3"/>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-nxs flex-fill" onclick="openDep({{ acct['id'] }})">
            <i class="bi bi-plus-circle me-1"></i>Deposit
          </button>
          <button class="btn btn-sm btn-out flex-fill" onclick="openWth({{ acct['id'] }})">
            <i class="bi bi-dash-circle me-1"></i>Withdraw
          </button>
        </div>
        <div class="mt-2 text-center">
          <small>
            <a href="/api/account/{{ acct['id'] }}" target="_blank"
              style="color:rgba(229,57,53,.75);font-size:.69rem;">
              <i class="bi bi-bug me-1"></i>[BAC-1] IDOR: /api/account/{{ acct['id'] }}
            </a>
          </small>
        </div>
      </div>
    </div>
    {% endfor %}
  </div>

  <div class="row g-3 mb-4">
    {% for icon, lbl, val, cls in stats %}
    <div class="col-6 col-md-3">
      <div class="card-nxs p-3">
        <div class="d-flex align-items-center gap-3">
          <div class="stat-ico {{ cls }}"><i class="{{ icon }}"></i></div>
          <div>
            <div style="color:var(--mt);font-size:.7rem;letter-spacing:.8px;text-transform:uppercase;">{{ lbl }}</div>
            <div style="font-size:.98rem;font-weight:700;">{{ val }}</div>
          </div>
        </div>
      </div>
    </div>
    {% endfor %}
  </div>

  <div class="row g-4">
    <div class="col-lg-8">
      <div class="card-nxs">
        <div class="sec-ttl">
          <i class="bi bi-list-ul"></i>Recent Transactions
          <span class="vtag">BAC-4</span>
          <a href="/api/transactions/{{ accounts[0]['id'] if accounts else 1 }}" target="_blank"
            style="color:rgba(229,57,53,.75);font-size:.65rem;margin-left:.3rem;">
            <i class="bi bi-bug me-1"></i>IDOR API
          </a>
        </div>
        {% if transactions %}
        <div class="table-responsive">
          <table class="nxs-table">
            <thead><tr>
              <th>#</th><th>Date</th><th>Description</th><th>Type</th><th>Amount</th>
            </tr></thead>
            <tbody>
              {% for tx in transactions %}
              <tr>
                <td style="color:var(--mt);font-size:.79rem;">{{ tx['id'] }}</td>
                <td style="font-size:.81rem;">{{ tx['created_at'][:10] }}</td>
                <td>{{ tx['description'] or '—' }}</td>
                <td>
                  {% if tx['type']=='deposit' %}<span class="bdg-dep">Deposit</span>
                  {% elif tx['type']=='withdrawal' %}<span class="bdg-wth">Withdrawal</span>
                  {% else %}<span class="bdg-trn">Transfer</span>{% endif %}
                </td>
                <td style="font-weight:700;">
                  <span style="color:{% if tx['type']=='deposit' %}var(--g){% elif tx['type']=='withdrawal' %}#ef9a9a{% else %}#90caf9{% endif %};">
                    {% if tx['type']=='deposit' %}+{% elif tx['type']=='withdrawal' %}-{% endif %} ${{ '%.2f'|format(tx['amount']) }}
                  </span>
                </td>
              </tr>
              {% endfor %}
            </tbody>
          </table>
        </div>
        {% else %}
        <p style="color:var(--mt);" class="text-center py-4 mb-0">No transactions yet.</p>
        {% endif %}
      </div>
    </div>

    <div class="col-lg-4">
      <div class="card-nxs mb-3">
        <div class="sec-ttl"><i class="bi bi-send-fill"></i>Transfer Funds</div>
        {% if accounts %}
        <form action="/transfer" method="POST">
          <div class="mb-2">
            <label class="flbl" for="df">From</label>
            <select id="df" name="from_account" class="inp">
              {% for a in accounts %}
              <option value="{{ a['id'] }}">{{ a['account_no'] }}</option>
              {% endfor %}
            </select>
          </div>
          <div class="mb-2">
            <label class="flbl" for="dt">To Account ID</label>
            <input type="number" id="dt" name="to_account" class="inp" placeholder="e.g. 3"/>
          </div>
          <div class="mb-3">
            <label class="flbl" for="da">Amount ($)</label>
            <input type="number" id="da" name="amount" class="inp" placeholder="0.00" step="0.01" min="0.01"/>
          </div>
          <button type="submit" class="btn-nxs btn w-100">
            <i class="bi bi-send me-1"></i>Transfer
          </button>
        </form>
        {% endif %}
      </div>

      <div class="card-nxs" style="border-color:rgba(229,57,53,.28);">
        <div class="sec-ttl"><i class="bi bi-bug-fill" style="color:#ef9a9a;"></i>Vulnerabilities</div>
        <div style="font-size:.76rem;line-height:1.7;">
          {% for tag, desc in [
            ('BAC-1','IDOR: /api/account/{id}'),
            ('BAC-2','/register: send role=admin'),
            ('BAC-3','/admin/transfer: session flag'),
            ('BAC-4','IDOR: /api/transactions/{id}'),
            ('BAC-5','/documents/../app.py'),
          ] %}
          <div class="d-flex gap-2 mb-2 align-items-start">
            <span class="vtag" style="margin:2px 0 0;">{{ tag }}</span>
            <span style="color:var(--mt);">{{ desc }}</span>
          </div>
          {% endfor %}
          <a href="/api/vulns" target="_blank" style="color:var(--g);font-size:.73rem;">
            <i class="bi bi-arrow-up-right me-1"></i>Full vuln API
          </a>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="modal fade" id="depModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header px-4 pt-4">
        <h5 class="modal-title"><i class="bi bi-plus-circle me-2"></i>Deposit Funds</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body px-4">
        <form action="/deposit" method="POST">
          <input type="hidden" name="account_id" id="depAcct"/>
          <div class="mb-3">
            <label class="flbl" for="depAmt">Amount ($)</label>
            <input type="number" id="depAmt" name="amount" class="inp" min="0.01" step="0.01" required/>
          </div>
          <button type="submit" class="btn-nxs btn w-100">Confirm Deposit</button>
        </form>
      </div>
    </div>
  </div>
</div>

<div class="modal fade" id="wthModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header px-4 pt-4">
        <h5 class="modal-title"><i class="bi bi-dash-circle me-2"></i>Withdraw Funds</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body px-4">
        <form action="/withdraw" method="POST">
          <input type="hidden" name="account_id" id="wthAcct"/>
          <div class="mb-3">
            <label class="flbl" for="wthAmt">Amount ($)</label>
            <input type="number" id="wthAmt" name="amount" class="inp" min="0.01" step="0.01" required/>
          </div>
          <button type="submit" class="btn-nxs btn w-100">Confirm Withdrawal</button>
        </form>
      </div>
    </div>
  </div>
</div>
"""

DASH_SCRIPTS = """<script>
function openDep(id){document.getElementById('depAcct').value=id;new bootstrap.Modal(document.getElementById('depModal')).show();}
function openWth(id){document.getElementById('wthAcct').value=id;new bootstrap.Modal(document.getElementById('wthModal')).show();}
</script>"""

# ─────────────────────────────────────────────
#  PAGE: Admin Panel (built dynamically)
# ─────────────────────────────────────────────
ADMIN_CONTENT = """
<div class="container py-4 fade-in">
  <div class="d-flex align-items-center gap-3 mb-4">
    <div class="stat-ico ico-o" style="width:50px;height:50px;font-size:1.3rem;flex-shrink:0;">
      <i class="bi bi-shield-lock-fill"></i>
    </div>
    <div>
      <h2 style="font-weight:800;" class="mb-0">Admin Panel <span class="vtag">BAC-2</span><span class="vtag">BAC-3</span></h2>
      <p style="color:var(--mt);" class="small mb-0">Full system access — user management & forced transfers</p>
    </div>
  </div>

  <div class="row g-3 mb-4">
    {% for icon, lbl, val, cls in admin_stats %}
    <div class="col-6 col-md-3">
      <div class="card-nxs p-3">
        <div class="d-flex align-items-center gap-3">
          <div class="stat-ico {{ cls }}"><i class="{{ icon }}"></i></div>
          <div>
            <div style="color:var(--mt);font-size:.7rem;text-transform:uppercase;letter-spacing:.8px;">{{ lbl }}</div>
            <div style="font-size:1.05rem;font-weight:700;">{{ val }}</div>
          </div>
        </div>
      </div>
    </div>
    {% endfor %}
  </div>

  <div class="row g-4">
    <div class="col-lg-8">
      <div class="card-nxs">
        <div class="sec-ttl"><i class="bi bi-people-fill"></i>All User Accounts</div>
        <div class="table-responsive">
          <table class="nxs-table">
            <thead><tr>
              <th>ID</th><th>Username</th><th>Email</th><th>Role</th>
              <th>Account No</th><th>Balance</th><th>Joined</th>
            </tr></thead>
            <tbody>
              {% for u in all_users %}
              <tr>
                <td style="color:var(--mt);font-size:.79rem;">{{ u['id'] }}</td>
                <td style="font-weight:600;">{{ u['username'] }}</td>
                <td style="color:var(--mt);font-size:.81rem;">{{ u['email'] or '—' }}</td>
                <td>
                  {% if u['role']=='admin' %}<span class="bdg-adm">Admin</span>
                  {% else %}<span class="bdg-usr">User</span>{% endif %}
                </td>
                <td><code style="color:var(--g);font-size:.76rem;">{{ u['account_no'] or '—' }}</code></td>
                <td style="font-weight:700;color:var(--g);">${{ '%.2f'|format(u['balance'] or 0) }}</td>
                <td style="color:var(--mt);font-size:.76rem;">{{ (u['created_at'] or '')[:10] }}</td>
              </tr>
              {% endfor %}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="col-lg-4">
      <div class="card-nxs mb-3" style="border-color:rgba(255,183,77,.28);">
        <div class="sec-ttl">
          <i class="bi bi-arrow-left-right" style="color:#ffb74d;"></i>Force Transfer
          <span class="vtag" style="background:rgba(255,183,77,.13);color:#ffb74d;border-color:rgba(255,183,77,.3);">BAC-3</span>
        </div>
        <form action="/admin/transfer" method="POST">
          <div class="mb-2">
            <label class="flbl" for="atf">From Account ID</label>
            <input type="number" id="atf" name="from_account" class="inp" placeholder="e.g. 2" required/>
          </div>
          <div class="mb-2">
            <label class="flbl" for="att">To Account ID</label>
            <input type="number" id="att" name="to_account" class="inp" placeholder="e.g. 1" required/>
          </div>
          <div class="mb-2">
            <label class="flbl" for="ata">Amount ($)</label>
            <input type="number" id="ata" name="amount" class="inp" placeholder="0.00" step="0.01" min="0.01" required/>
          </div>
          <div class="mb-3">
            <label class="flbl" for="atd">Description</label>
            <input type="text" id="atd" name="description" class="inp" placeholder="Admin override transfer"/>
          </div>
          <button type="submit" class="btn w-100"
            style="background:rgba(255,183,77,.18);color:#ffb74d;border:1.5px solid rgba(255,183,77,.35);
              border-radius:10px;font-weight:600;padding:.55rem;">
            <i class="bi bi-send-fill me-2"></i>Execute Transfer
          </button>
        </form>
        <div class="al-vuln mt-3" style="font-size:.72rem;">
          <i class="bi bi-info-circle me-1"></i>
          [BAC-3] Only checks <code style="color:#ffb74d;">session['is_admin']</code> — forge session cookie with weak secret to bypass.
        </div>
      </div>

      <div class="card-nxs" style="border-color:rgba(229,57,53,.28);">
        <div class="sec-ttl">
          <i class="bi bi-folder-symlink" style="color:#ef9a9a;"></i>File Access
          <span class="vtag">BAC-5</span>
        </div>
        <div class="mb-2">
          <label class="flbl" for="ptf">Filename</label>
          <input type="text" id="ptf" class="inp" value="notice.txt" placeholder="../app.py"/>
        </div>
        <button type="button" class="btn w-100 mb-2"
          style="background:rgba(229,57,53,.13);color:#ef9a9a;border:1.5px solid rgba(229,57,53,.28);
            border-radius:10px;font-weight:600;padding:.5rem;"
          onclick="window.open('/documents/'+document.getElementById('ptf').value,'_blank')">
          <i class="bi bi-folder-open me-1"></i>Open File
        </button>
        <div class="al-vuln" style="font-size:.71rem;">
          <i class="bi bi-exclamation-triangle me-1"></i>
          Try: <code style="color:#ffb74d;">../app.py</code> or <code style="color:#ffb74d;">../../etc/passwd</code>
        </div>
      </div>
    </div>
  </div>
</div>
"""

ERR_403 = """
<div class="container py-5 text-center fade-in">
  <div style="width:80px;height:80px;background:rgba(229,57,53,.13);border-radius:20px;
    display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem;">
    <i class="bi bi-shield-x" style="font-size:2.4rem;color:#ef9a9a;"></i>
  </div>
  <h2 style="font-weight:800;color:#ef9a9a;">403 — Forbidden</h2>
  <p style="color:var(--mt);" class="mt-2">You don't have permission to access this resource.</p>
  <a href="/" class="btn btn-nxs mt-3">Go Home</a>
</div>
"""

ERR_404 = """
<div class="container py-5 text-center fade-in">
  <div style="width:80px;height:80px;background:rgba(0,208,132,.09);border-radius:20px;
    display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem;">
    <i class="bi bi-question-lg" style="font-size:2.4rem;color:var(--g);"></i>
  </div>
  <h2 style="font-weight:800;">404 — Page Not Found</h2>
  <p style="color:var(--mt);" class="mt-2">The page you're looking for doesn't exist.</p>
  <a href="/" class="btn btn-nxs mt-3">Go Home</a>
</div>
"""


# ─────────────────────────────────────────────
#  Routes
# ─────────────────────────────────────────────

@app.route("/")
def home():
    return render_page("Home", render_template_string(HOME_CONTENT))


@app.route("/register", methods=["GET", "POST"])
def register_page():
    if request.method == "GET":
        return render_page("Register", REGISTER_CONTENT)

    username = request.form.get("username", "").strip()
    password = request.form.get("password", "").strip()
    email    = request.form.get("email", "").strip()
    initial  = float(request.form.get("initial_deposit", 0) or 0)

    # ─────────────────────────────────────────────────────────────
    # [BAC-2] VULNERABILITY: 'role' param accepted from POST body
    #   Attacker: curl -X POST /register -d "username=hax&password=hax&role=admin"
    # ─────────────────────────────────────────────────────────────
    role = request.form.get("role", "user")   # <── VULNERABLE LINE — no server-side validation

    if not username or not password:
        flash("Username and password are required.", "error")
        return redirect("/register")

    existing = query_db("SELECT id FROM users WHERE username=?", (username,), one=True)
    if existing:
        flash("Username already taken.", "error")
        return redirect("/register")

    db = get_db()
    cur = db.execute(
        "INSERT INTO users (username, password, role, email) VALUES (?,?,?,?)",
        (username, hash_password(password), role, email),
    )
    user_id = cur.lastrowid
    acct_no = f"NXS-{user_id:04d}-{username[:4].upper()}"
    db.execute(
        "INSERT INTO accounts (user_id, account_no, balance, account_type) VALUES (?,?,?,?)",
        (user_id, acct_no, initial, "checking"),
    )
    if initial > 0:
        acct = db.execute("SELECT id FROM accounts WHERE user_id=?", (user_id,)).fetchone()
        if acct:
            db.execute(
                "INSERT INTO transactions (to_account, amount, description, type) VALUES (?,?,?,?)",
                (acct["id"], initial, "Account opening deposit", "deposit"),
            )
    db.commit()
    flash(f"Account created! Role: {role}", "success")
    return redirect("/?login=1")


@app.route("/login", methods=["POST"])
def login():
    username = request.form.get("username", "").strip()
    password = request.form.get("password", "").strip()
    user = query_db(
        "SELECT * FROM users WHERE username=? AND password=?",
        (username, hash_password(password)),
        one=True,
    )
    if not user:
        flash("Invalid username or password.", "error")
        return redirect("/?login=1")

    account = query_db("SELECT * FROM accounts WHERE user_id=?", (user["id"],), one=True)
    session.clear()
    session["user_id"]    = user["id"]
    session["username"]   = user["username"]
    session["role"]       = user["role"]
    session["is_admin"]   = (user["role"] == "admin")
    session["account_id"] = account["id"] if account else None

    token = make_jwt(user["id"], user["username"], user["role"])
    resp  = redirect("/dashboard")
    resp.set_cookie("nexus_jwt", token, httponly=False, samesite=None)  # [VULN] httponly=False, unvalidated
    return resp


@app.route("/logout")
def logout():
    session.clear()
    resp = redirect("/")
    resp.delete_cookie("nexus_jwt")
    return resp


@app.route("/dashboard")
@login_required
def dashboard():
    user_id  = session["user_id"]
    accounts = query_db("SELECT * FROM accounts WHERE user_id=?", (user_id,))
    acct_ids = [a["id"] for a in accounts]

    transactions = []
    if acct_ids:
        ph = ",".join("?" * len(acct_ids))
        transactions = query_db(
            f"SELECT * FROM transactions WHERE from_account IN ({ph}) OR to_account IN ({ph})"
            " ORDER BY created_at DESC LIMIT 15",
            acct_ids + acct_ids,
        )

    total_balance  = sum(a["balance"] for a in accounts)
    deposits_total = sum(t["amount"] for t in transactions if t["type"] == "deposit")
    withdrawals    = sum(t["amount"] for t in transactions if t["type"] == "withdrawal")

    stats = [
        ("bi-wallet2",           "Total Balance", f"${total_balance:,.2f}",    "ico-g"),
        ("bi-arrow-down-circle", "Deposits",      f"${deposits_total:,.2f}",   "ico-b"),
        ("bi-arrow-up-circle",   "Withdrawals",   f"${withdrawals:,.2f}",      "ico-r"),
        ("bi-list-ul",           "Transactions",  str(len(transactions)),       "ico-o"),
    ]
    now_str = datetime.datetime.now().strftime("%A, %B %d %Y · %H:%M")
    content = render_template_string(
        DASH_CONTENT,
        username=session["username"],
        accounts=accounts,
        transactions=transactions,
        stats=stats,
        now=now_str,
    )
    return render_page("Dashboard", content, DASH_SCRIPTS)


@app.route("/admin/panel")
@admin_required
def admin_panel():
    all_users = query_db(
        """SELECT u.id, u.username, u.email, u.role, u.created_at,
                  a.account_no, a.balance
           FROM users u LEFT JOIN accounts a ON a.user_id=u.id"""
    )
    total   = sum((u["balance"] or 0) for u in all_users)
    uc      = len(all_users)
    ac      = sum(1 for u in all_users if u["role"] == "admin")
    txcount = query_db("SELECT COUNT(*) as cnt FROM transactions", one=True)["cnt"]

    admin_stats = [
        ("bi-people-fill",  "Total Users",  str(uc),           "ico-b"),
        ("bi-shield-fill",  "Admins",       str(ac),           "ico-o"),
        ("bi-cash-stack",   "Bank Assets",  f"${total:,.2f}",  "ico-g"),
        ("bi-arrow-repeat", "Transactions", str(txcount),      "ico-r"),
    ]
    content = render_template_string(
        ADMIN_CONTENT,
        all_users=all_users,
        admin_stats=admin_stats,
    )
    return render_page("Admin Panel", content)


@app.route("/admin/transfer", methods=["POST"])
def admin_transfer():
    """
    [BAC-3] MISSING FUNCTION-LEVEL ACCESS CONTROL
    ──────────────────────────────────────────────
    Only checks session.is_admin which is trivially set.
    Attacker can forge Flask session cookie (weak secret = supersecretkey123)
    using flask-unsign tool to set is_admin=True.
    """
    # ─────────────────────────────────────────────────────────────────────
    # [BAC-3] VULNERABILITY: trivial session flag check, no server-side
    #         role verification against DB, no CSRF protection.
    # ─────────────────────────────────────────────────────────────────────
    if not session.get("is_admin"):    # <── ONLY CHECK — can be forged
        abort(403)

    from_account = int(request.form.get("from_account", 0))
    to_account   = int(request.form.get("to_account", 0))
    amount       = float(request.form.get("amount", 0))
    description  = request.form.get("description", "Admin forced transfer")

    if amount <= 0:
        flash("Invalid transfer amount.", "error")
        return redirect("/admin/panel")

    src = query_db("SELECT * FROM accounts WHERE id=?", (from_account,), one=True)
    dst = query_db("SELECT * FROM accounts WHERE id=?", (to_account,), one=True)

    if not src or not dst:
        flash("Invalid account IDs.", "error")
        return redirect("/admin/panel")
    if src["balance"] < amount:
        flash("Insufficient funds in source account.", "error")
        return redirect("/admin/panel")

    execute_db("UPDATE accounts SET balance = balance - ? WHERE id=?", (amount, from_account))
    execute_db("UPDATE accounts SET balance = balance + ? WHERE id=?", (amount, to_account))
    execute_db(
        "INSERT INTO transactions (from_account, to_account, amount, description, type) VALUES (?,?,?,?,?)",
        (from_account, to_account, amount, description, "transfer"),
    )
    flash(f"Admin transfer of ${amount:,.2f} executed.", "success")
    return redirect("/admin/panel")


@app.route("/deposit", methods=["POST"])
@login_required
def deposit():
    account_id = int(request.form.get("account_id", 0))
    amount     = float(request.form.get("amount", 0))
    if amount <= 0:
        flash("Amount must be positive.", "error")
        return redirect("/dashboard")
    # Proper ownership check (for contrast with vulnerable endpoints)
    acct = query_db(
        "SELECT * FROM accounts WHERE id=? AND user_id=?",
        (account_id, session["user_id"]), one=True,
    )
    if not acct:
        abort(403)
    execute_db("UPDATE accounts SET balance = balance + ? WHERE id=?", (amount, account_id))
    execute_db(
        "INSERT INTO transactions (to_account, amount, description, type) VALUES (?,?,?,?)",
        (account_id, amount, "User deposit", "deposit"),
    )
    flash(f"Deposited ${amount:,.2f} successfully.", "success")
    return redirect("/dashboard")


@app.route("/withdraw", methods=["POST"])
@login_required
def withdraw():
    account_id = int(request.form.get("account_id", 0))
    amount     = float(request.form.get("amount", 0))
    if amount <= 0:
        flash("Amount must be positive.", "error")
        return redirect("/dashboard")
    acct = query_db(
        "SELECT * FROM accounts WHERE id=? AND user_id=?",
        (account_id, session["user_id"]), one=True,
    )
    if not acct:
        abort(403)
    if acct["balance"] < amount:
        flash("Insufficient funds.", "error")
        return redirect("/dashboard")
    execute_db("UPDATE accounts SET balance = balance - ? WHERE id=?", (amount, account_id))
    execute_db(
        "INSERT INTO transactions (from_account, amount, description, type) VALUES (?,?,?,?)",
        (account_id, amount, "User withdrawal", "withdrawal"),
    )
    flash(f"Withdrawn ${amount:,.2f} successfully.", "success")
    return redirect("/dashboard")


@app.route("/transfer", methods=["POST"])
@login_required
def transfer():
    from_account = int(request.form.get("from_account", 0))
    to_account   = int(request.form.get("to_account", 0))
    amount       = float(request.form.get("amount", 0))
    if amount <= 0:
        flash("Amount must be positive.", "error")
        return redirect("/dashboard")
    src = query_db(
        "SELECT * FROM accounts WHERE id=? AND user_id=?",
        (from_account, session["user_id"]), one=True,
    )
    if not src:
        abort(403)
    dst = query_db("SELECT * FROM accounts WHERE id=?", (to_account,), one=True)
    if not dst:
        flash("Destination account not found.", "error")
        return redirect("/dashboard")
    if src["balance"] < amount:
        flash("Insufficient funds.", "error")
        return redirect("/dashboard")
    execute_db("UPDATE accounts SET balance = balance - ? WHERE id=?", (amount, from_account))
    execute_db("UPDATE accounts SET balance = balance + ? WHERE id=?", (amount, to_account))
    execute_db(
        "INSERT INTO transactions (from_account, to_account, amount, description, type) VALUES (?,?,?,?,?)",
        (from_account, to_account, amount, "Peer transfer", "transfer"),
    )
    flash(f"Transferred ${amount:,.2f} successfully.", "success")
    return redirect("/dashboard")


# ══════════════════════════════════════════════════════════════
#  VULNERABLE API ENDPOINTS
# ══════════════════════════════════════════════════════════════

@app.route("/api/account/<int:account_id>", methods=["GET"])
def api_account(account_id):
    """
    [BAC-1] INSECURE DIRECT OBJECT REFERENCE — Account Details
    ─────────────────────────────────────────────────────────────
    No authentication check. No ownership verification.
    No JWT validation despite JWT cookie being set on login.

    Attack examples:
      curl http://localhost:5000/api/account/1   # Admin account
      curl http://localhost:5000/api/account/2   # Alice (while logged as Bob)
      for i in $(seq 1 10); do curl /api/account/$i; done  # Enumerate all
    """
    # ── NO AUTH CHECK — intentional vulnerability ──
    account = query_db("SELECT * FROM accounts WHERE id=?", (account_id,), one=True)
    if not account:
        return jsonify({"error": "Account not found"}), 404

    user = query_db(
        "SELECT id, username, email, role FROM users WHERE id=?",
        (account["user_id"],), one=True,
    )
    return jsonify({
        "_vulnerability":  "BAC-1: IDOR — No ownership check, no authentication required",
        "_attack_vector":  f"GET /api/account/{account_id}",
        "_note":           "JWT cookie ignored. Any unauthenticated request can read any account.",
        "account_id":      account["id"],
        "account_no":      account["account_no"],
        "account_type":    account["account_type"],
        "balance":         account["balance"],
        "owner": {
            "user_id":  user["id"],
            "username": user["username"],
            "email":    user["email"],
            "role":     user["role"],
        } if user else None,
    })


@app.route("/api/transactions/<int:account_id>", methods=["GET"])
def api_transactions(account_id):
    """
    [BAC-4] INSECURE DIRECT OBJECT REFERENCE — Transactions
    ──────────────────────────────────────────────────────────
    Returns ALL transactions for any account_id.
    No authentication or ownership check.

    Attack: GET /api/transactions/1  →  Admin's full transaction history
    """
    # ── NO AUTH CHECK — intentional vulnerability ──
    transactions = query_db(
        "SELECT * FROM transactions WHERE from_account=? OR to_account=? ORDER BY created_at DESC",
        (account_id, account_id),
    )
    return jsonify({
        "_vulnerability":  "BAC-4: IDOR — Transaction history exposed without authentication",
        "_attack_vector":  f"GET /api/transactions/{account_id}",
        "_note":           "Enumerate account IDs to harvest all transactions in the system.",
        "account_id":      account_id,
        "total_records":   len(transactions),
        "transactions": [
            {
                "id":           tx["id"],
                "from_account": tx["from_account"],
                "to_account":   tx["to_account"],
                "amount":       tx["amount"],
                "description":  tx["description"],
                "type":         tx["type"],
                "created_at":   tx["created_at"],
            }
            for tx in transactions
        ],
    })


@app.route("/documents/<path:filename>")
def serve_document(filename):
    """
    [BAC-5] PATH TRAVERSAL — Arbitrary File Read
    ─────────────────────────────────────────────
    No sanitisation on filename parameter.
    os.path.join allows directory traversal with ../ sequences.

    Attack examples:
      GET /documents/../app.py                   → read source code
      GET /documents/../../etc/passwd            → read /etc/passwd (Linux)
      GET /documents/../../Windows/win.ini       → read Windows system files
      GET /documents/../../etc/shadow            → read password hashes
      GET /documents/../bank.db                  → read SQLite database
    """
    # ── NO PATH SANITISATION — intentional vulnerability ──
    # Secure fix would be: os.path.realpath() + check startswith(UPLOAD_DIR)
    target_path = os.path.join(UPLOAD_DIR, filename)   # <── VULNERABLE LINE

    if not os.path.exists(target_path):
        return jsonify({
            "_vulnerability": "BAC-5: Path Traversal",
            "error":  f"File not found: {target_path}",
            "hint":   "Try: /documents/../app.py  or  /documents/../bank.db",
            "cwd":    os.getcwd(),
        }), 404

    if os.path.isdir(target_path):
        return jsonify({
            "_vulnerability": "BAC-5: Path Traversal — Directory listing",
            "path":  os.path.abspath(target_path),
            "files": os.listdir(target_path),
        })

    try:
        with open(target_path, "r", errors="replace") as f:
            content = f.read()
        return jsonify({
            "_vulnerability": "BAC-5: Path Traversal — Arbitrary file read",
            "_attack_vector": f"/documents/{filename}",
            "requested_file": filename,
            "resolved_path":  os.path.abspath(target_path),
            "size_bytes":     os.path.getsize(target_path),
            "content":        content,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/vulns")
def api_vulns():
    """Vulnerability summary endpoint — publicly accessible (no auth)."""
    return jsonify({
        "application":  "NexusBank",
        "version":      "1.0.0-INTENTIONALLY-VULNERABLE",
        "purpose":      "Security research & education — OWASP Broken Access Control",
        "credentials": {
            "admin":   "admin / admin123",
            "users":   ["alice/alice123", "bob/bob123", "charlie/charlie123", "dave/dave123"],
        },
        "secret_key":   app.secret_key,   # [VULN] Exposed for demonstration
        "jwt_secret":   JWT_SECRET,
        "vulnerabilities": [
            {
                "id":       "BAC-1",
                "name":     "IDOR on Account Balance",
                "endpoint": "/api/account/<account_id>",
                "method":   "GET",
                "auth":     "None required",
                "attack":   "curl http://localhost:5000/api/account/1",
                "impact":   "Read any user's full account details and balance",
                "fix":      "Verify session user_id matches account owner before returning data",
            },
            {
                "id":       "BAC-2",
                "name":     "Privilege Escalation via Role Parameter",
                "endpoint": "/register",
                "method":   "POST",
                "auth":     "None required",
                "attack":   "curl -X POST /register -d 'username=hax&password=hax&role=admin'",
                "impact":   "Create an account with admin role, access /admin/panel",
                "fix":      "Never accept role from user input; hardcode role='user' on registration",
            },
            {
                "id":       "BAC-3",
                "name":     "Missing Function-Level Access Control",
                "endpoint": "/admin/transfer",
                "method":   "POST",
                "auth":     "session.is_admin check only",
                "attack":   "flask-unsign --sign --secret supersecretkey123 --cookie '{...is_admin: True}'",
                "impact":   "Perform forced bank transfers from any account to any account",
                "fix":      "Re-validate role against DB on every sensitive request; use CSRF tokens",
            },
            {
                "id":       "BAC-4",
                "name":     "IDOR on Transaction History",
                "endpoint": "/api/transactions/<account_id>",
                "method":   "GET",
                "auth":     "None required",
                "attack":   "curl http://localhost:5000/api/transactions/1",
                "impact":   "Read full transaction history for any account",
                "fix":      "Require authentication and verify account ownership before returning transactions",
            },
            {
                "id":       "BAC-5",
                "name":     "Path Traversal in Document Access",
                "endpoint": "/documents/<filename>",
                "method":   "GET",
                "auth":     "None required",
                "attack":   "curl 'http://localhost:5000/documents/../app.py'",
                "impact":   "Read arbitrary files including source code, DB, /etc/passwd",
                "fix":      "Use os.path.realpath() and assert result starts with safe base directory",
            },
        ],
    })


# ─────────────────────────────────────────────
#  Error handlers
# ─────────────────────────────────────────────
@app.errorhandler(403)
def forbidden(e):
    return render_page("403 Forbidden", ERR_403), 403


@app.errorhandler(404)
def not_found(e):
    return render_page("404 Not Found", ERR_404), 404


# ─────────────────────────────────────────────
#  Entry point
# ─────────────────────────────────────────────
if __name__ == "__main__":
    init_db()
    print(
        "\n"
        "  NexusBank - Intentionally Vulnerable Banking Application\n"
        "  FOR SECURITY RESEARCH & EDUCATION ONLY\n"
        "  =========================================================\n"
        "  Running at: http://localhost:5000\n"
        "\n"
        "  Credentials:\n"
        "    admin   / admin123   (role=admin)\n"
        "    alice   / alice123   (role=user)\n"
        "    bob     / bob123     (role=user)\n"
        "    charlie / charlie123 (role=user)\n"
        "    dave    / dave123    (role=user)\n"
        "\n"
        "  Vulnerable Endpoints:\n"
        "    [BAC-1] GET  /api/account/<id>       IDOR - no auth\n"
        "    [BAC-2] POST /register               role=admin escalation\n"
        "    [BAC-3] POST /admin/transfer         trivial session bypass\n"
        "    [BAC-4] GET  /api/transactions/<id>  IDOR - no auth\n"
        "    [BAC-5] GET  /documents/../app.py    path traversal\n"
        "    [INFO]  GET  /api/vulns              full vulnerability map\n"
    )
    app.run(debug=True, host="0.0.0.0", port=5000)
