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
  | 'mission_ready';

/** Signal parent waiting screens — RTDB + Firestore invite. */
export async function signalChildOnboardingMilestone(
  parentId: string,
  milestone: ChildOnboardingMilestone
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
}
