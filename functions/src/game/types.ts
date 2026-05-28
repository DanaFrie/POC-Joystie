export type GameRoomPhase = 'waiting_child' | 'playing' | 'finished';

export interface GameRoomRecord {
  parentId: string;
  childUid: string | null;
  joinCode: string;
  phase: GameRoomPhase;
  challengeId?: string;
  childId?: string;
  bondingInviteId?: string;
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
