/**
 * Finalize parent child docs + fetch short-lived agreement image URL.
 * Used before showing Screen 66 so the completion page never waits on load.
 */

import { getChildrenByParent } from '@/lib/api/children';
import { getChildShareCardAccess } from '@/lib/api/shareCard';
import {
  getBondingChildGender,
  getSelectedFirstChildGender,
} from '@/lib/onboarding/bondingInvite';
import { defaultSelfieAssetForChild } from '@/lib/onboarding/defaultSelfieAsset';
import { finalizeParentOnboardingOnCompletionAppear } from '@/lib/onboarding/finalizeParentOnboardingCompletion';
import { getCurrentUserId } from '@/utils/auth';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('PrefetchCompletionAgreement');

const ACCESS_RETRY_MS = [0, 400, 900, 1600] as const;

export type PrefetchedCompletionAgreement = {
  parentId: string | null;
  childId: string | null;
  /** Signed / data URL when Storage card exists; gender default when skipped. */
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

async function readChildShareCard(
  parentId: string,
  childId: string | null
): Promise<{ source: 'ai' | 'default' | null; gender?: string | null }> {
  try {
    const children = await getChildrenByParent(parentId);
    const child = childId ? children.find((c) => c.id === childId) : children[0];
    return {
      source: child?.shareCard?.source ?? null,
      gender: child?.gender,
    };
  } catch (error) {
    logger.warn('Could not read child share card:', error);
    return { source: null };
  }
}

function sessionChildGender(): string {
  return getBondingChildGender() ?? getSelectedFirstChildGender();
}

async function genderDefaultAgreementUrl(genderHint?: string | null): Promise<string> {
  const url = defaultSelfieAssetForChild(genderHint || sessionChildGender());
  await preloadImage(url);
  return url;
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
      if (access.source === 'default') {
        const { gender } = await readChildShareCard(parentId, childId);
        return {
          parentId,
          childId,
          agreementImageUrl: await genderDefaultAgreementUrl(gender),
        };
      }
    } catch (error) {
      logger.warn('getChildShareCardAccess attempt failed:', error);
      const { source, gender } = await readChildShareCard(parentId, childId);
      if (source === 'default') {
        return {
          parentId,
          childId,
          agreementImageUrl: await genderDefaultAgreementUrl(gender),
        };
      }
    }
  }

  const { source, gender } = await readChildShareCard(parentId, childId);
  if (source === 'default') {
    return {
      parentId,
      childId,
      agreementImageUrl: await genderDefaultAgreementUrl(gender),
    };
  }

  return { parentId, childId, agreementImageUrl: null };
}
