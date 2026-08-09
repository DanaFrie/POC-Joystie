# Auth QA — what to do (simple walkthrough)

Follow these steps in order on a **phone or laptop browser** (Chrome or Safari).  
Do **not** test Google/Apple inside Cursor’s preview.

**Base URL:** your running app (e.g. `http://localhost:3000` or the intgr site).

For each step: do the actions → check **You should see** → mark **Pass / Fail**.

---

## Before you start

1. Open the app in a **normal browser** (not Cursor).
2. Have ready:
   - A **new email** you can use for password signup (or a throwaway).
   - Access to that inbox (password reset).
   - A **Google** account.
   - An **Apple ID** (iPhone/Mac Sign in with Apple).
3. Keep a notes app open for Pass/Fail and any error text in Hebrew.

**Tip:** Use **Incognito / Private** windows when the steps say so, so old logins don’t confuse you.

---

## Part 1 — Password: new parent, finish later

### 1.1 Sign up with email + password (new user)

1. Go to onboarding / signup (from the landing “join” / signup flow).
2. Enter a **new** email + password and finish account creation.
3. Continue a bit into onboarding (e.g. enter kids info) but **do not** finish everything if you want a “mid” account — or finish fully if you want a “done” account.

| Path | You should see | Pass? |
|------|----------------|-------|
| Mid (stopped early) | Still in onboarding screens | ☐ |
| Done (finished) | Parent dashboard | ☐ |

**Write down:** email + whether Mid or Done → you’ll reuse this account.

---

### 1.2 Log out, then log in again (same password account)

1. Log out from the menu (if on dashboard) or clear the session / open a fresh private window.
2. Go to `/login`.
3. Enter the **same** email + password → Submit.

| If account was… | You should see | Pass? |
|-----------------|----------------|-------|
| Done | Parent `/dashboard` | ☐ |
| Mid / not finished | Back in `/onboarding` (not stuck on login) | ☐ |

---

### 1.3 Wrong password / unknown email

1. On `/login`, correct email + **wrong** password.  
   **You should see:** Hebrew error; stay on login. ☐  
2. Completely **unknown** email + any password.  
   **You should see:** Hebrew error; stay on login. ☐  

---

### 1.4 Signup with an email that already exists

1. Start signup again with the **same** email you already registered.
2. Try to continue as if creating a new account.

**You should see:**  
Redirect to login, email filled in, and a banner like:  
“התחלת את התהליך ועוד לא סיימנו…”  

Pass? ☐  

3. Sign in with the correct password.

**You should see:** dashboard if Done, or onboarding if Mid. ☐  

---

### 1.5 Forgot password

1. `/login` → forgot password → enter your email → send reset.
2. Open the email link → set a **new** password.
3. Log in with the new password.

**You should see:** login works with the new password. ☐  

---

## Part 2 — Google

Use a **Google account that never used Joystie** for the “unknown login” step.  
Use a **different** Google account for signup if you already used one.

### 2.1 Sign up with Google (new)

1. Open signup / onboarding in a normal browser.
2. Tap **המשך עם Google**.
3. Complete Google account picker.

**You should see:** return to the app and continue onboarding (not an empty error). ☐  

Optional: finish onboarding → dashboard. ☐  

---

### 2.2 Log in with Google (account that already signed up)

1. Log out / private window → `/login`.
2. Tap **המשך עם Google** → choose the **same** Google account.

| If that Google user… | You should see | Pass? |
|----------------------|----------------|-------|
| Finished onboarding | `/dashboard` | ☐ |
| Didn’t finish | `/onboarding` | ☐ |

---

### 2.3 Log in with Google — never signed up in Joystie

1. `/login` → Google → pick a Google account that **never** went through Joystie signup.

**You should see:**  
Message like “לא נמצא חשבון רשום. אנא הירשמו תחילה.”  
You should **not** land on the dashboard. ☐  

---

### 2.4 Google blocked in Cursor (optional)

1. Open the app **inside Cursor’s browser preview**.
2. Try Google.

**You should see:** message that Google/Apple don’t work in an embedded browser. ☐  

---

## Part 3 — Apple

Same idea as Google. Use Safari or Chrome on a device with Apple ID.

### 3.1 Button is usable

1. Open `/login` and signup.
2. Look at **המשך עם Apple**.

**You should see:** button is clickable (not permanently disabled “feature off”). ☐  
(If you see the embedded-browser warning, switch to Chrome/Safari.)

---

### 3.2 Sign up with Apple (new)

1. Signup → **המשך עם Apple**.
2. Complete Apple sheet (you may use Hide My Email).

**You should see:** back in app, continue onboarding. ☐  

Optional: finish → dashboard. ☐  

---

### 3.3 Log in with Apple (same Apple ID, already registered)

1. Log out → `/login` → Apple → same Apple ID.

| If that user… | You should see | Pass? |
|---------------|----------------|-------|
| Finished | `/dashboard` | ☐ |
| Mid | `/onboarding` | ☐ |

---

### 3.4 Log in with Apple — never signed up

1. `/login` → Apple → Apple ID that never signed up in Joystie.

**You should see:** same “register first” message as Google unknown login. ☐  

---

## Part 4 — After login, where do I go? (routing)

Do this once per method you care about (password / Google / Apple).

| Situation | How to create it | After login you should land on |
|-----------|------------------|--------------------------------|
| Finished parent | Complete full onboarding | `/dashboard` |
| Started kids, didn’t finish | Stop mid-funnel, log out, log in again | `/onboarding` (resume) |
| Brand-new Auth user, almost nothing filled | Create account and leave ASAP, log out, log in | `/onboarding` (start / landing) |

Pass for password? ☐ Google? ☐ Apple? ☐  

---

## Part 5 — Child (no parent login)

You need a **parent who already has a child** and can share a link (from bonding / dashboard share).

### 5.1 Child dashboard link

1. As parent, copy the child dashboard share link (`/dashboard/child?token=…`).
2. Open it in a **private window** (not logged in as parent).

**You should see:** child dashboard (not parent login). ☐  

3. Break the token (delete some characters) or use an old expired link if you have one.

**You should see:** Hebrew error (invalid or expired). ☐  

---

### 5.2 Child bonding invite (onboarding)

1. As parent, get a bonding invite link (`/onboarding/child?invite=…`).
2. Open in private window.

**You should see:** child onboarding / game path starts. ☐  

---

### 5.3 Parent logged out — child link still works

1. Log parent out.
2. Open the **same** child `token` link again.

**You should see:** child dashboard still works (child link ≠ parent session). ☐  

---

## Part 6 — Stay logged in / log out

1. Log in as parent → refresh the page.  
   **You should see:** still logged in. ☐  
2. Log out from the menu → try `/dashboard`.  
   **You should see:** sent to `/login` (or cannot use dashboard). ☐  

---

## Short path (about 15–20 minutes)

If you only have a short slot, do only this:

1. **Password:** signup new → logout → login → dashboard or onboarding. ☐  
2. **Password:** signup again with same email → see resume banner → login. ☐  
3. **Google:** signup new → logout → login same Google → OK. ☐  
4. **Google:** login with a Google that never signed up → “register first”. ☐  
5. **Apple:** signup new (or login if you already did) → OK. ☐  
6. **Apple:** login with Apple that never signed up → “register first”. ☐  
7. **Child:** open `token` link in private window. ☐  
8. **Logout** parent → dashboard blocked. ☐  

---

## When something fails

Copy into your notes:

- Which part/step number  
- URL you were on  
- Exact Hebrew (or English) error  
- Password / Google / Apple  
- Browser (Chrome / Safari / Cursor)

Common fixes (for you or eng):

- Google/Apple inside Cursor → use real Chrome/Safari  
- Popup blocked → allow popups  
- Domain error → tell eng; authorized domains in Firebase  
- Apple fails after sheet → tell eng; Services ID / return URL
