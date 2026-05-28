# Remove this folder after RTDB game testing

Delete the entire `src/app/game/test/` directory when the ball game is wired into the real child bonding flow.

Also remove:
- `scripts/test-game-rtdb.mjs` (optional CLI smoke test)

Keep:
- `src/lib/game/`, `src/lib/api/game.ts`, `src/types/game.ts`
- `functions/src/game/`, `firebase/database.rules.json`
