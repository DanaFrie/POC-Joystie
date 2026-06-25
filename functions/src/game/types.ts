export type GameRoomPhase = 'waiting_child' | 'playing' | 'finished';

export type GameOutcome = 'won' | 'missed' | null;

export interface GameOnboardingContextRecord {
  childId?: string;
  challengeId?: string;
  bondingInviteId?: string;
  parentStepId?: string;
  childStepId?: string;
}

export interface GameRoomRecord {
  parentId: string;
  childUid: string | null;
  joinCode: string;
  phase: GameRoomPhase;
  challengeId?: string;
  childId?: string;
  bondingInviteId?: string;
  onboardingContext?: GameOnboardingContextRecord;
  onboardingAdvanced?: boolean;
  onboardingAdvancedAt?: string | null;
  gameOutcome?: GameOutcome;
  ball: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    updatedBy: 'parent' | 'child';
    updatedAt: string;
  };
  paddles: {
    parentX: number;
    childX: number;
    width: number;
  };
  score: {
    shared: number;
  };
  activeSide: 'parent' | 'child';
  winner: 'parent' | 'child' | 'shared' | null;
  createdAt: string;
  updatedAt: string;
}
