# Backend — payment gate (`feat/v03-payment-gate` → merged on `intgrV03-design-tokens`)

Cardcom LowProfile API v11: token capture + 30-day trial before challenge unlock.

## Secrets (Firebase Functions)

```bash
firebase use intgr
firebase functions:secrets:set CARDCOM_TERMINAL_NUMBER
firebase functions:secrets:set CARDCOM_API_NAME
firebase functions:secrets:set CARDCOM_API_PASSWORD
firebase functions:secrets:set SERVICE_FUNCTION_BASE_URL
```

| Secret | Source (Cardcom console) | Example |
|--------|--------------------------|---------|
| `CARDCOM_TERMINAL_NUMBER` | Terminal / מסוף (numeric) | `1000` |
| `CARDCOM_API_NAME` | API user name | from Low Profile + API subscription |
| `CARDCOM_API_PASSWORD` | API password | from Low Profile + API subscription |
| `SERVICE_FUNCTION_BASE_URL` | **Your public app URL** (homepage Cardcom + redirect base) | `https://intgr.joystie.com` or ngrok URL for local webhook testing |

`SERVICE_FUNCTION_BASE_URL` must match the domain Cardcom redirects to after checkout. For local dev, use a tunnel (ngrok / Cloudflare) — Cardcom cannot POST webhooks to `localhost`.

### Set each secret (interactive — paste value when prompted)

```bash
firebase use intgr
echo "Paste terminal number when prompted:"
firebase functions:secrets:set CARDCOM_TERMINAL_NUMBER
echo "Paste API name when prompted:"
firebase functions:secrets:set CARDCOM_API_NAME
echo "Paste API password when prompted:"
firebase functions:secrets:set CARDCOM_API_PASSWORD
echo "Paste public app URL (no trailing slash) when prompted:"
firebase functions:secrets:set SERVICE_FUNCTION_BASE_URL
```

## Cardcom console — homepage / redirect URLs

In the Cardcom merchant console, set the **site homepage** (and allowed redirect domain if required) to the same host as `SERVICE_FUNCTION_BASE_URL`.

After checkout, Cardcom redirects the parent to:

| Outcome | URL |
|---------|-----|
| Success | `{SERVICE_FUNCTION_BASE_URL}/dashboard/subscription/pay/success` |
| Failure | `{SERVICE_FUNCTION_BASE_URL}/dashboard/subscription/pay/failed` |

**Do not rely on redirect alone** — unlock is driven by the server webhook + `GetLpResult`.

## Webhook

Cardcom server-to-server POST goes to the **Cloud Function** URL (not Next.js):

`https://us-central1-<PROJECT_ID>.cloudfunctions.net/cardcomWebhook`

For `joystie-poc` (intgr):

`https://us-central1-joystie-poc.cloudfunctions.net/cardcomWebhook`

Register this URL in Cardcom Low Profile settings (`WebHookUrl` is also sent on each `Create` call).

The handler always verifies with `GetLpResult` before updating Firestore.

## Callable

| Function | Role |
|----------|------|
| `createCardcomTrialCheckout` | Creates LowProfile deal (`CreateTokenOnly`, ₪1), stores `subscription.checkout_pending` |
| `cardcomWebhook` | On success → `trialing`, `challengeUnlocked: true`; on failure → `payment_failed` |

Client: `src/lib/api/billing.ts` → `createCardcomTrialCheckout({ plan })`.

## Test route (frontend)

Requires a logged-in parent:

`/dashboard/subscription/test`

1. Pick annual / monthly plan  
2. Tap **התחלת 30 ימים ניסיון בחינם**  
3. Redirect to Cardcom hosted card form  
4. Return to success or failure routes above  

## Firestore (`users/{uid}.subscription`)

| Field | Meaning |
|-------|---------|
| `status` | `checkout_pending` → `trialing` / `payment_failed` |
| `plan` | `annual` \| `monthly` |
| `trialEndsAt` | ISO end of 30-day trial (set at checkout, kept after webhook) |
| `lowProfileId` | Cardcom LowProfile id |
| `hasStoredToken` | `true` when charge token saved (see `billing_tokens`) |
| `cardLast4` | Last 4 digits for UI only |

## `billing_tokens/{uid}` (server-only)

Written by `cardcomWebhook` on success. **Not readable from the client** — use Admin SDK in a future scheduled charge function.

| Field | Meaning |
|-------|---------|
| `token` | Cardcom token GUID — pass to Step 3 charge API |
| `tokenExDate` | `YYYYMMDD` token expiry |
| `cardMonth` / `cardYear` | Card expiry |
| `tokenApprovalNumber` | J5 approval code (if ever using hold + capture) |
| `last4` | Last 4 digits |
| `lowProfileId` | Source checkout deal |

Top-level `challengeUnlocked: true` after successful webhook.

## Deploy (intgr)

```bash
npm run build
cd functions && npm run build && cd ..
firebase deploy --only functions:createCardcomTrialCheckout,functions:cardcomWebhook
```

## Troubleshooting

### Browser: CORS / `FirebaseError: internal` on localhost

Callable endpoints need Cloud Run **`roles/run.invoker` for `allUsers`** so the browser OPTIONS preflight succeeds. Handlers set `invoker: 'public'`; redeploy after code changes.

If deploy logs **org policy** / `Failed to set invoker`, your GCP project blocks public Cloud Run access. Until an org admin fixes that, **localhost cannot call deployed functions** (CORS 403).

### `cardcomWebhook` returns 500 — `PERMISSION_DENIED` on Firestore

The default Compute service account (`…-compute@developer.gserviceaccount.com`) cannot read/write Firestore. Billing functions must run as the Firebase Admin SDK service account:

`firebase-adminsdk-fbsvc@joystie-poc.iam.gserviceaccount.com`

Code sets `serviceAccount: getServiceAccount()` on `createCardcomTrialCheckout` and `cardcomWebhook`. Redeploy both after pulling.

If it still fails, grant Firestore access explicitly:

```bash
gcloud projects add-iam-policy-binding joystie-poc \
  --member="serviceAccount:firebase-adminsdk-fbsvc@joystie-poc.iam.gserviceaccount.com" \
  --role="roles/datastore.user"
```

Then run a **new** checkout — Cardcom will not replay old webhooks reliably.

**Option A — org admin (production + localhost):**

```bash
gcloud run services add-iam-policy-binding createcardcomtrialcheckout \
  --region=us-central1 \
  --project=joystie-poc \
  --member="allUsers" \
  --role="roles/run.invoker"
```

Same for `cardcomwebhook` if webhooks should receive Cardcom POSTs.

**Option B — Functions emulator (local dev only):**

1. In `.env.local`: `NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR=true`
2. Terminal 1 — **functions + firestore together** (required; functions-only hits production Firestore and fails with `invalid_grant`):

   ```bash
   npm run emulators:billing
   ```

3. Terminal 2: `npm run dev`
4. Test `/dashboard/subscription/test`

The emulator loads Cardcom secrets from Secret Manager (needs `firebase login`). Cardcom API calls use real HTTPS from the emulator.

If you see `invalid_grant` in emulator logs → you started **functions-only**; restart with `npm run emulators:billing`.

The browser error can also mean **`createCardcomTrialCheckout` failed to start** (Secret Manager permissions).

Check `firebase-debug.log` after deploy. Common failure:

```
Permission denied on secret: .../SERVICE_FUNCTION_BASE_URL/versions/...
506217601121-compute@developer.gserviceaccount.com
```

**Fix** — grant Secret Manager access to the default compute service account:

```bash
gcloud secrets add-iam-policy-binding SERVICE_FUNCTION_BASE_URL \
  --project=joystie-poc \
  --member="serviceAccount:506217601121-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

Then redeploy:

```bash
firebase deploy --only functions:createCardcomTrialCheckout
```

Repeat for any other secrets the deploy log names (`CARDCOM_*`).

### `cardcomWebhook` IAM / org policy

If deploy logs `Failed to set invoker function cardcomWebhook` with org-policy errors, Cardcom cannot POST until the webhook URL is publicly reachable. Ask a GCP org admin to allow `allUsers` as Cloud Run invoker for that function, or set invoker manually in Cloud Console → Cloud Run → `cardcomwebhook` → Permissions.

### `SERVICE_FUNCTION_BASE_URL` value

Do **not** use `http://localhost:3000` for Cardcom redirects. Use your deployed intgr URL (or ngrok). Bonding invite links use the same secret.

## Branch scope

Billing: `functions/src/billing/`, exports in `functions/src/index.ts`, `src/lib/api/billing.ts`, pay routes under `src/app/dashboard/subscription/`.

OAuth / WhatsApp / bonding reminders live on `feat/v03-bonding` — see `docs/BACKEND-BONDING.md`.
