/** Realtime Database ball-game room (v0.3 S3) */

import type { GameOnboardingContext } from '@/constants/game';

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

export type GameOutcome = 'won' | 'missed' | null;

export interface GameRoomState {
  roomId: string;
  parentId: string;
  childUid: string | null;
  joinCode: string;
  phase: GameRoomPhase;
  challengeId?: string;
  childId?: string;
  bondingInviteId?: string;
  /** Funnel context passed at room creation (onboarding). */
  onboardingContext?: GameOnboardingContext;
  /** Set when cooperative win is confirmed — onboarding may advance. */
  onboardingAdvanced?: boolean;
  onboardingAdvancedAt?: string | null;
  gameOutcome?: GameOutcome;
  ball: GameBallState;
  paddles: GamePaddlesState;
  score: GameScoreState;
  /** Legacy RTDB field — physics runs on parent only; kept for room schema compat */
  activeSide: GamePlayerRole;
  winner: GameWinner;
  createdAt: string;
  updatedAt: string;
}
