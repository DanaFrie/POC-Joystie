/** RTDB paths — single place for game tree layout */

export const GAME_ROOMS_PATH = 'gameRooms';

export function gameRoomPath(roomId: string): string {
  return `${GAME_ROOMS_PATH}/${roomId}`;
}
