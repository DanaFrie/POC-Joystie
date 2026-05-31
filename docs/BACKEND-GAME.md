# Backend — ball game (`feat/v03-ball-game`)

Realtime parent–child ball sync via **Firebase Realtime Database** (not Firestore).

## Data model (`gameRooms/{roomId}`)

| Field | Description |
|-------|-------------|
| `parentId` | Firebase Auth uid (parent) |
| `childUid` | Set when child joins via `joinGameRoom` |
| `joinCode` | 6-char code for child join |
| `phase` | `waiting_child` → `playing` → `finished` |
| `ball` | `{ x, y, updatedBy, updatedAt }` normalized 0–1 |

## Callables

| Function | Who | Role |
|----------|-----|------|
| `createGameRoom` | Authenticated parent | Creates RTDB room |
| `joinGameRoom` | Authenticated user (child: anonymous OK) | Validates `joinCode`, sets `childUid` |

Client: `src/lib/api/game.ts`, live updates: `src/lib/game/rooms.ts`.

## Rules

`firebase/database.rules.json` — read/write only if `auth.uid` is `parentId` or `childUid`.

## Prereqs (Firebase Console)

1. Enable **Realtime Database** (default instance).
2. Enable **Anonymous** auth (for child test/join flow).
3. Optional env: `NEXT_PUBLIC_FIREBASE_DATABASE_URL` (defaults to `https://{projectId}-default-rtdb.firebaseio.com`).

## Deploy (intgr)

```bash
firebase use intgr
firebase deploy --only database
firebase deploy --only functions:createGameRoom,functions:joinGameRoom
```

## Dev test (remove after QA)

Browser: `/game/test` — see `src/app/game/test/DELETE_AFTER_TEST.md`.

## Branch

Commit on **`feat/v03-ball-game`** only. Merge to `intgrV0.3` after bonding/payment branches as planned.
