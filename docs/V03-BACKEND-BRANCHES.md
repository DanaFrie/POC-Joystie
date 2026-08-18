# v0.3 backend — branch split

| Branch | Scope | Doc |
|--------|--------|-----|
| `feat/v03-bonding` | Google/Apple auth, WhatsApp share, bonding reminders | `BACKEND-BONDING.md` |
| `feat/v03-payment-gate` | Cardcom trial checkout + webhook | `CARDCOM-SETUP.md` |
| `feat/v03-ball-game` | RTDB ball game | `BACKEND-GAME.md` |
| `feat/v03-design-tokens` | S0 tokens (stashed: `s0-design-tokens-wip`) | `v03-design-alignment.md` |

## Commit order (recommended)

1. **Bonding** — on `feat/v03-bonding`, stage only bonding/auth/share files (not `functions/src/billing/`).
2. **Payment** — merge or rebase bonding into `intgrV0.3`, branch `feat/v03-payment-gate`, add Cardcom exports to `functions/src/index.ts` (see `CARDCOM-SETUP.md`), stage `billing/` + `src/lib/api/billing.ts` only.

`functions/src/index.ts` differs per branch — do not merge both export blocks until integration on `intgrV0.3`.

## Payment branch `index.ts` snippet

```ts
import { createCardcomTrialCheckout, cardcomWebhook } from './billing/cardcom/handlers';
export { createCardcomTrialCheckout, cardcomWebhook };
```

(Replace bonding exports when working on payment gate only.)
