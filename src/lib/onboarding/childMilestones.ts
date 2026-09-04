import { reportChildOnboardingMilestone } from '@/lib/api/bonding';
import { ensureAnonymousChildAuth } from '@/lib/game/anonymousChildAuth';
import { publishOnboardingChildProgress } from '@/lib/onboarding/childProgress';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('ChildMilestones');

export type ChildOnboardingMilestone =
  | 'link_opened'
  | 'welcome_reached'
  | 'dori_revealed'
  | 'egg_complete'
  | 'mission_ready'
  | 'change_selected'
  | 'parent_change_accepted'
  | 'parent_change_declined'
  | 'selfie_mission_done';

/** Signal parent waiting screens — RTDB + Firestore invite. */
export async function signalChildOnboardingMilestone(
  parentId: string,
  milestone: ChildOnboardingMilestone,
  payload?: { changeText?: string }
): Promise<void> {
  await ensureAnonymousChildAuth();

  const now = new Date().toISOString();
  const rtdbPatch =
    milestone === 'link_opened'
      ? { linkOpened: true, linkOpenedAt: now }
      : milestone === 'welcome_reached'
        ? { welcomeReached: true, welcomeReachedAt: now }
        : milestone === 'dori_revealed'
          ? { doriRevealed: true, doriRevealedAt: now }
          : milestone === 'mission_ready'
            ? { missionReady: true, missionReadyAt: now }
            : milestone === 'change_selected'
              ? {
                  changeSelected: true,
                  changeSelectedAt: now,
                  ...(payload?.changeText
                    ? { changeSelectedText: payload.changeText }
                    : {}),
                }
              : milestone === 'parent_change_accepted'
                ? {
                    parentChangeAccepted: true,
                    parentChangeDeclined: false,
                    parentChangeRespondedAt: now,
                  }
                : milestone === 'parent_change_declined'
                  ? {
                      parentChangeAccepted: false,
                      parentChangeDeclined: true,
                      parentChangeRespondedAt: now,
                    }
                  : milestone === 'selfie_mission_done'
                    ? { selfieMissionDone: true, selfieMissionDoneAt: now }
                    : { eggComplete: true, eggCompleteAt: now };

  try {
    await publishOnboardingChildProgress(parentId, rtdbPatch);
  } catch (error) {
    logger.warn('RTDB milestone failed', { milestone, error });
  }

  try {
    const result = await reportChildOnboardingMilestone({ parentId, milestone });
    if (!result.ok && result.reason !== 'no_invite') {
      logger.warn('Firestore milestone not recorded', { milestone, result });
    }
  } catch (error) {
    logger.warn('Firestore milestone callable failed', { milestone, error });
  }
  // Funnel Analytics is parent-device only — parent observes RTDB milestones.
}

/** Persist cooperative win on child progress so resume does not treat a deleted room as an active match. */
export async function signalOnboardingGameWon(parentId: string): Promise<void> {
  try {
    await publishOnboardingChildProgress(parentId, {
      gameWon: true,
      gameWonAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.warn('RTDB gameWon milestone failed', error);
  }
}
