#!/usr/bin/env node
/**
 * Optional CLI smoke test for game callables (requires deployed functions + credentials).
 * DELETE this file with src/app/game/test/ when done.
 *
 * Usage: node scripts/test-game-rtdb.mjs
 */
console.log(`
Joystie game RTDB test — use the browser instead:
  1. Log in as parent → open /game/test → create room
  2. Open child link in incognito (anonymous auth) → join → click arena

Deploy first:
  firebase use intgr
  firebase deploy --only database,functions:createGameRoom,functions:joinGameRoom
`);
