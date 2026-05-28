/** Realtime Database ball-game room (v0.3 S3) */

export type GameRoomPhase = 'waiting_child' | 'playing' | 'finished';

export type GamePlayerRole = 'parent' | 'child';

export interface GameBallState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  updatedBy: GamePlayerRole;
  updatedAt: string;
}

export interface GamePaddlesState {
  parentX: number;
  childX: number;
  width: number;
}

export interface GameScoreState {
  shared: number;
}

export type GameWinner = GamePlayerRole | 'shared' | null;

export interface GameRoomState {
  roomId: string;
  parentId: string;
  childUid: string | null;
  joinCode: string;
  phase: GameRoomPhase;
  challengeId?: string;
  childId?: string;
  bondingInviteId?: string;
  ball: GameBallState;
  paddles: GamePaddlesState;
  score: GameScoreState;
  /** Which screen currently owns the ball physics step */
  activeSide: GamePlayerRole;
  winner: GameWinner;
  createdAt: string;
  updatedAt: string;
}
