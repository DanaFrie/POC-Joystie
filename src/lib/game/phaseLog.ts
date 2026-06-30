import { GAME_WIN_SCORE } from '@/constants/game';
import type { GamePlayerRole, GameRoomPhase, GameRoomState } from '@/types/game';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('GamePhase');

const PHASE_LABELS: Record<GameRoomPhase, string> = {
  waiting_child: 'ממתין לילד — הכדור במרכז עד הצטרפות',
  waiting_ready: 'שני הצדדים מאשרים מוכנות לפני תחילת משחק',
  countdown: 'ספירה לאחור לפני תחילת משחק ראשון',
  playing: 'משחק פעיל — מנוע פיזיקה על מסך ההורה',
  finished: 'סיום סיבוב',
};

export function logGamePhase(
  phase: GameRoomPhase,
  detail?: Record<string, unknown>
): void {
  logger.log(PHASE_LABELS[phase] ?? phase, { phase, ...detail });
}

export function logGameRoomSnapshot(
  room: GameRoomState,
  role: GamePlayerRole | null
): void {
  logger.log('room snapshot', {
    roomId: room.roomId,
    role,
    phase: room.phase,
    phaseLabel: PHASE_LABELS[room.phase],
    score: room.score.shared,
    winScore: GAME_WIN_SCORE,
    winner: room.winner,
    onboardingAdvanced: room.onboardingAdvanced ?? false,
    childUid: room.childUid,
  });
}

export function logGameTransition(
  from: GameRoomPhase,
  to: GameRoomPhase,
  detail?: Record<string, unknown>
): void {
  logger.log('phase transition', {
    from,
    to,
    fromLabel: PHASE_LABELS[from],
    toLabel: PHASE_LABELS[to],
    ...detail,
  });
}

export function logOnboardingAdvanceReady(room: GameRoomState): void {
  logger.log('onboarding advance ready', {
    roomId: room.roomId,
    score: room.score.shared,
    winScore: GAME_WIN_SCORE,
    nextParentStep: room.onboardingContext?.parentStepId,
    nextChildStep: room.onboardingContext?.childStepId,
  });
}
