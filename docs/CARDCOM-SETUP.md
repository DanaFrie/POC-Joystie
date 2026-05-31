# Backend — payment gate (`feat/v03-payment-gate`)

Cardcom LowProfile API v11: token capture + 30-day trial before challenge unlock.

## Secrets (Firebase Functions)

```bash
firebase use intgr
firebase functions:secrets:set CARDCOM_TERMINAL_NUMBER
firebase functions:secrets:set CARDCOM_API_NAME
firebase functions:secrets:set CARDCOM_API_PASSWORD
firebase functions:secrets:set SERVICE_FUNCTION_BASE_URL
```

`SERVICE_FUNCTION_BASE_URL` — public app URL for success/fail redirects (e.g. `https://intgr.joystie.com`).

## Webhook

Cardcom server-to-server POST goes to the **Cloud Function** URL (not Next.js):

`https://us-central1-<PROJECT_ID>.cloudfunctions.net/cardcomWebhook`

The handler always verifies with `GetLpResult` before updating Firestore.

## Callable

| Function | Role |
|----------|------|
| `createCardcomTrialCheckout` | Creates LowProfile deal (`CreateTokenOnly`, ₪1), stores `subscription.checkout_pending` |
| `cardcomWebhook` | On success → `trialing`, `challengeUnlocked: true`; on failure → `payment_failed` |

Client: `src/lib/api/billing.ts` → `createCardcomTrialCheckout()`.

## Firestore (`users/{uid}.subscription`)

| Field | Meaning |
|-------|---------|
| `status` | `checkout_pending` → `trialing` / `payment_failed` |
| `trialEndsAt` | ISO end of 30-day trial (set at checkout, kept after webhook) |
| `lowProfileId` | Cardcom LowProfile id |

## Deploy (intgr)

```bash
npm run build
cd functions && npm run build && cd ..
firebase deploy --only functions:createCardcomTrialCheckout,functions:cardcomWebhook
```

## Branch scope

Commit **only** on `feat/v03-payment-gate`: `functions/src/billing/`, billing exports in `functions/src/index.ts`, `src/lib/api/billing.ts`, this doc.

OAuth / WhatsApp / bonding reminders live on `feat/v03-bonding` — see `docs/BACKEND-BONDING.md`.
