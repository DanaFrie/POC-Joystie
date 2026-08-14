/**
 * Finalize parent child docs + fetch short-lived agreement image URL.
 * Used before showing Screen 66 so the completion page never waits on load.
 */

import { getChildShareCardAccess } from '@/lib/api/shareCard';
import { finalizeParentOnboardingOnCompletionAppear } from '@/lib/onboarding/finalizeParentOnboardingCompletion';
import { getCurrentUserId } from '@/utils/auth';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('PrefetchCompletionAgreement');

const ACCESS_RETRY_MS = [0, 400, 900, 1600] as const;

export type PrefetchedCompletionAgreement = {
  parentId: string | null;
  childId: string | null;
  /** Signed / data URL when Storage card exists; null → use static fallback. */
  agreementImageUrl: string | null;
};

function preloadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = url;
  });
}

export async function prefetchParentCompletionAgreement(
  parentIdHint?: string | null
): Promise<PrefetchedCompletionAgreement> {
  let childId: string | null = null;
  try {
    const finalized = await finalizeParentOnboardingOnCompletionAppear();
    childId = finalized.childId;
  } catch (error) {
    logger.warn('Finalize before completion failed:', error);
  }

  const parentId = parentIdHint?.trim() || (await getCurrentUserId());
  if (!parentId) {
    return { parentId: null, childId, agreementImageUrl: null };
  }

  for (let i = 0; i < ACCESS_RETRY_MS.length; i++) {
    const wait = ACCESS_RETRY_MS[i]!;
    if (wait > 0) {
      await new Promise((r) => window.setTimeout(r, wait));
    }
    try {
      const access = await getChildShareCardAccess({
        parentId,
        childId,
      });
      if (access.url) {
        await preloadImage(access.url);
        return { parentId, childId, agreementImageUrl: access.url };
      }
    } catch (error) {
      logger.warn('getChildShareCardAccess attempt failed:', error);
    }
  }

  return { parentId, childId, agreementImageUrl: null };
}
