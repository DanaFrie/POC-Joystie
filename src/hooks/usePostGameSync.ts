'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  clearChildParentChangeResponse,
  readOnboardingChildProgress,
  subscribeOnboardingChildProgress,
  type OnboardingChildProgress,
} from '@/lib/onboarding/childProgress';
import {
  readOnboardingParentProgress,
  subscribeOnboardingParentProgress,
  type OnboardingParentProgress,
} from '@/lib/onboarding/parentProgress';
import { signalChildOnboardingMilestone } from '@/lib/onboarding/childMilestones';
import {
  clearParentAdditionalChangeProposal,
  signalParentPostGameMilestone,
} from '@/lib/onboarding/parentPostGameMilestones';
import {
  deriveChildPostGameStep,
  deriveParentPostGamePhase,
  mergePostGameProgress,
  postGameAgreedChangeText,
  postGameChildChangeText,
  postGameParentSuggestedChangeText,
  type PostGameChildSyncStep,
  type PostGameMergedProgress,
} from '@/lib/onboarding/postGameSync';
import type { ParentPostGamePhase } from '@/components/onboarding/parent/ParentGamePostWinFlow';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('PostGameSync');
const POLL_MS = 2000;

type UsePostGameSyncOptions = {
  parentId: string | null | undefined;
  role: 'parent' | 'child';
  enabled?: boolean;
};

export function usePostGameSync({
  parentId,
  role,
  enabled = true,
}: UsePostGameSyncOptions) {
  const [merged, setMerged] = useState<PostGameMergedProgress>({
    child: null,
    parent: null,
  });
  const declineHandledRef = useRef<number | null>(null);
  const childClearHandledRef = useRef(false);

  useEffect(() => {
    if (!enabled || !parentId) {
      setMerged({ child: null, parent: null });
      return;
    }

    let disposed = false;
    let childUnsub: (() => void) | undefined;
    let parentUnsub: (() => void) | undefined;
    let pollId: number | undefined;
    let childProgress: OnboardingChildProgress | null = null;
    let parentProgress: OnboardingParentProgress | null = null;

    const publish = () => {
      if (disposed) return;
      setMerged(mergePostGameProgress(childProgress, parentProgress));
    };

    childUnsub = subscribeOnboardingChildProgress(parentId, (progress) => {
      childProgress = progress;
      publish();
    });

    parentUnsub = subscribeOnboardingParentProgress(parentId, (progress) => {
      parentProgress = progress;
      publish();
    });

    void (async () => {
      try {
        const [child, parent] = await Promise.all([
          readOnboardingChildProgress(parentId),
          readOnboardingParentProgress(parentId),
        ]);
        if (disposed) return;
        childProgress = child;
        parentProgress = parent;
        publish();
      } catch (error) {
        logger.warn('initial post-game read failed', error);
      }
    })();

    pollId = window.setInterval(() => {
      void (async () => {
        try {
          const [child, parent] = await Promise.all([
            readOnboardingChildProgress(parentId),
            readOnboardingParentProgress(parentId),
          ]);
          if (disposed) return;
          childProgress = child;
          parentProgress = parent;
          publish();
        } catch (error) {
          logger.warn('post-game poll failed', error);
        }
      })();
    }, POLL_MS);

    return () => {
      disposed = true;
      childUnsub?.();
      parentUnsub?.();
      if (pollId) window.clearInterval(pollId);
    };
  }, [enabled, parentId]);

  const acceptHandledRef = useRef<number | null>(null);

  // Parent clears additional proposal when child declines or accepts (current round only).
  useEffect(() => {
    if (!enabled || !parentId || role !== 'parent') return;
    if (!merged.parent?.additionalChangeText) return;

    const respondedAt = merged.child?.parentChangeRespondedAt;
    const proposedAt = merged.parent.additionalChangeProposedAt;
    const declineIsCurrent =
      merged.child?.parentChangeDeclined &&
      (!proposedAt || !respondedAt || respondedAt >= proposedAt);

    if (declineIsCurrent) {
      if (respondedAt && declineHandledRef.current === Date.parse(respondedAt)) return;
      if (respondedAt) declineHandledRef.current = Date.parse(respondedAt);
      void clearParentAdditionalChangeProposal(parentId);
      return;
    }

    if (merged.child?.parentChangeAccepted) {
      if (respondedAt && acceptHandledRef.current === Date.parse(respondedAt)) return;
      if (respondedAt) acceptHandledRef.current = Date.parse(respondedAt);
      void clearParentAdditionalChangeProposal(parentId);
    }
  }, [enabled, parentId, role, merged.child, merged.parent]);

  // Child clears stale decline/accept when parent sends a newer proposal.
  useEffect(() => {
    if (!enabled || !parentId || role !== 'child') return;
    if (!merged.parent?.additionalChangeText) return;
    if (!merged.child?.parentChangeDeclined && !merged.child?.parentChangeAccepted) return;

    const proposedAt = merged.parent.additionalChangeProposedAt;
    const respondedAt = merged.child.parentChangeRespondedAt;
    if (proposedAt && respondedAt && proposedAt > respondedAt) {
      void clearChildParentChangeResponse(parentId);
    }
  }, [enabled, parentId, role, merged.child, merged.parent]);

  // Child clears decline flag once parent cleared the proposal.
  useEffect(() => {
    if (!enabled || !parentId || role !== 'child') return;
    if (!merged.child?.parentChangeDeclined) return;
    if (merged.parent?.additionalChangeText) return;

    if (childClearHandledRef.current) return;
    childClearHandledRef.current = true;
    void clearChildParentChangeResponse(parentId).finally(() => {
      childClearHandledRef.current = false;
    });
  }, [enabled, parentId, role, merged.child, merged.parent]);

  const approveChildChange = useCallback(async () => {
    if (!parentId) return;
    await signalParentPostGameMilestone(parentId, 'child_change_approved');
  }, [parentId]);

  const proposeAdditionalChange = useCallback(
    async (additionalChangeText: string) => {
      if (!parentId || !additionalChangeText.trim()) return;
      await signalParentPostGameMilestone(parentId, 'additional_change_proposed', {
        additionalChangeText: additionalChangeText.trim(),
      });
    },
    [parentId]
  );

  const acceptParentChange = useCallback(async () => {
    if (!parentId) return;
    await signalChildOnboardingMilestone(parentId, 'parent_change_accepted');
  }, [parentId]);

  const declineParentChange = useCallback(async () => {
    if (!parentId) return;
    await signalChildOnboardingMilestone(parentId, 'parent_change_declined');
  }, [parentId]);

  const signalChangeSelected = useCallback(
    async (changeText: string) => {
      if (!parentId || !changeText.trim()) return;
      await signalChildOnboardingMilestone(parentId, 'change_selected', {
        changeText: changeText.trim(),
      });
    },
    [parentId]
  );

  const signalSelfieMissionDone = useCallback(async () => {
    if (!parentId) return;
    await signalChildOnboardingMilestone(parentId, 'selfie_mission_done');
  }, [parentId]);

  const parentPhase = enabled && parentId ? deriveParentPostGamePhase(merged) : null;
  const childStep = enabled && parentId ? deriveChildPostGameStep(merged) : null;

  return {
    merged,
    parentPhase,
    childStep,
    childChangeText: postGameChildChangeText(merged),
    parentSuggestedChangeText: postGameParentSuggestedChangeText(merged),
    agreedChangeText: postGameAgreedChangeText(merged),
    approveChildChange,
    proposeAdditionalChange,
    acceptParentChange,
    declineParentChange,
    signalChangeSelected,
    signalSelfieMissionDone,
  };
}

export type { PostGameChildSyncStep, ParentPostGamePhase };
