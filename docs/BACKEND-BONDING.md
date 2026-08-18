# Backend — bonding branch (`feat/v03-bonding`)

## 1. Google & Apple sign-in

| File | Role |
|------|------|
| `src/utils/auth-oauth.ts` | Popup + redirect fallback, Hebrew errors |
| `src/utils/auth-errors.ts` | Shared error map |
| `src/components/auth/AuthOAuthButtons.tsx` | UI for login/signup |
| `functions/src/auth/onUserCreate.ts` | Firestore `users/{uid}` on first Auth create |

**Firebase Console:** enable Google + Apple providers; add authorized domains (App Hosting URL).

## 2. WhatsApp child link

| File | Role |
|------|------|
| `src/constants/whatsapp.ts` | Message template |
| `src/lib/share/whatsapp.ts` | `buildWhatsAppShareUrl`, `openWhatsAppChildInvite` |

Pattern: `https://wa.me/?text={encoded Hebrew message + child URL}`

## 3. Share reminder (parent not with child)

**Channel: email only** — reminds the parent (not the child) when they chose to be together later.

| `shareMode` | Meaning | Reminder |
|-------------|---------|----------|
| `together_now` | Share via WhatsApp while with child | None |
| `remind_later` | Don't send link remotely; nudge parent at `remindAt` | Email to parent |

`recordBondingInvite({ shareMode: 'remind_later', remindAt: '<ISO>' })` → `status: remind_scheduled`. Do not encourage forwarding `childUrl` to the child while apart. Email CTA → `/bonding/share?inviteId=…`.

| Piece | Role |
|-------|------|
| `recordBondingInvite` | Saves invite; `remind_later` → `status: remind_scheduled` |
| `scheduledBondingShareReminders` | Every 30 min — email parent when `remind_scheduled` + time passed |
| `markBondingWhatsAppShared` | After in-person WhatsApp share |

Collection: `bonding_invites`

## Deploy (intgr)

```bash
firebase use intgr
firebase functions:secrets:set SERVICE_FUNCTION_BASE_URL
firebase deploy --only functions:authOnUserCreated,functions:recordBondingInvite,functions:markBondingWhatsAppShared,functions:markBondingChildLinkOpened,functions:scheduledBondingShareReminders
```

Add Firestore index: `bonding_invites` — `status` ASC, `shareReminderAt` ASC.

## Branch scope

Commit on **`feat/v03-bonding`** only: auth/OAuth, `bonding_invites`, WhatsApp share, reminder scheduler — not Cardcom (see `docs/CARDCOM-SETUP.md` on `feat/v03-payment-gate`).
