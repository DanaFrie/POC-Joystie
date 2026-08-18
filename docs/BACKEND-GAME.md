# Backend — ball game (`feat/v03-ball-game`)

Realtime parent–child ping-pong via **Firebase Realtime Database** (not Firestore).

## Onboarding flow (planned)

1. Parent and child each have their own onboarding screen/route.
2. Mid-funnel both enter the shared game (parent creates room, child joins via link).
3. Cooperative **10 paddle hits** (`GAME_WIN_SCORE`) → `phase: finished`, `winner: shared`.
4. Parent calls `completeGameOnboarding` → `onboardingAdvanced: true`.
5. Onboarding UI polls `getGameOnboardingStatus` and navigates to the **next step** (not the game).

## Data model (`gameRooms/{roomId}`)

| Field | Description |
|-------|-------------|
| `parentId` | Firebase Auth uid (parent) |
| `childUid` | Set when child joins via `joinGameRoom` |
| `joinCode` | 6-char code for child join |
| `phase` | `waiting_child` → `playing` → `finished` |
| `ball` | `{ x, y, vx, vy, updatedBy, updatedAt }` normalized 0–1 |
| `paddles` | `{ parentX, childX, width }` |
| `score` | `{ shared }` — cooperative rally count |
| `winner` | `shared` on win, `null` on miss |
| `gameOutcome` | `won` \| `missed` \| `null` |
| `onboardingContext` | Optional `{ childId, challengeId, bondingInviteId, parentStepId, childStepId }` |
| `onboardingAdvanced` | `true` after cooperative win confirmed |
| `onboardingAdvancedAt` | ISO timestamp |

Win target: **10** (`GAME_WIN_SCORE` in `src/constants/game.ts` and `functions/src/game/constants.ts`).

## Callables

| Function | Who | Role |
|----------|-----|------|
| `createGameRoom` | Authenticated parent | Creates RTDB room; accepts onboarding context |
| `joinGameRoom` | Authenticated user (child: anonymous OK) | Validates `joinCode`, starts ball |
| `getGameOnboardingStatus` | Parent or child in room | Poll win / advance readiness |
| `completeGameOnboarding` | Parent only | Idempotent mark after cooperative win |

Client: `src/lib/api/game.ts`, live updates: `src/lib/game/rooms.ts`, reusable UI: `src/components/game/GameArena.tsx`, session hook: `src/hooks/useGameSession.ts`.

## Rules

`firebase/database.rules.json` — read/write only if `auth.uid` is `parentId` or `childUid`. Ball `vx`/`vy` and onboarding fields validated.

## Prereqs (Firebase Console)

1. Enable **Realtime Database** (default instance).
2. Enable **Anonymous** auth (child join).
3. Optional: `NEXT_PUBLIC_FIREBASE_DATABASE_URL`.

## Deploy (intgr)

```bash
firebase use intgr
firebase deploy --only database
firebase deploy --only functions:createGameRoom,functions:joinGameRoom,functions:getGameOnboardingStatus,functions:completeGameOnboarding
```

## Branch

Merged into **`intgrV03-design-tokens`** for onboarding UI wiring. Game work originates on **`feat/v03-ball-game`**.
