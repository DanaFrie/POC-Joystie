'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ONBOARDING_PARENT_GAME_WON_KEY } from '@/constants/onboarding-game';
import {
  childPathWithInvite,
  childResumeAction,
  parentResumeAction,
  readPairingSnapshot,
} from '@/lib/onboarding/pairingResume';
import { FLOW_STEP_STORAGE_KEY } from '@/lib/onboarding/parentFlowSession';
import { writePersistedChildFlowStep } from '@/lib/onboarding/childFlowSession';
import { getCurrentUserId } from '@/utils/auth';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('PairingResume');

type ParentOptions = {
  role: 'parent';
  parentId?: string | null;
  currentPath: '/onboarding' | '/game';
  currentStep?: string | null;
  enabled?: boolean;
  onStep?: (step: 'childInviteWaiting' | 'parentPostGame') => void;
};

type ChildOptions = {
  role: 'child';
  parentId?: string | null;
  inviteId?: string | null;
  currentPath: '/onboarding/child' | '/game/child';
  enabled?: boolean;
  onFunnelStep?: (step: string) => void;
};

export function usePairingResume(options: ParentOptions | ChildOptions) {
  const router = useRouter();
  const appliedRef = useRef(false);
  const enabled = options.enabled !== false;
  const parentId = options.parentId;
  const role = options.role;
  const currentPath = options.currentPath;
  const currentStep = options.role === 'parent' ? options.currentStep : undefined;
  const onParentStep = options.role === 'parent' ? options.onStep : undefined;
  const onChildStep = options.role === 'child' ? options.onFunnelStep : undefined;
  const inviteId = options.role === 'child' ? options.inviteId : undefined;

  useEffect(() => {
    if (!enabled) return;
    appliedRef.current = false;

    let cancelled = false;
    let intervalId: number | undefined;

    const tick = async () => {
      if (cancelled) return;
      const uid =
        parentId?.trim() ||
        (role === 'parent' ? await getCurrentUserId() : null);
      if (!uid || cancelled) return;

      try {
        const snapshot = await readPairingSnapshot(uid);
        if (cancelled) return;

        if (role === 'parent') {
          const action = parentResumeAction(
            snapshot.stage,
            currentPath as '/onboarding' | '/game',
            currentStep
          );
          if (action.type === 'stay') return;
          if (appliedRef.current) return;
          appliedRef.current = true;
          logger.log('parent resume', { stage: snapshot.stage, action, currentPath, currentStep });

          if (action.type === 'route') {
            router.replace(action.path);
            return;
          }

          if (typeof window !== 'undefined') {
            sessionStorage.setItem(FLOW_STEP_STORAGE_KEY, action.step);
            if (action.step === 'parentPostGame') {
              sessionStorage.setItem(ONBOARDING_PARENT_GAME_WON_KEY, '1');
            }
          }
          if (currentPath === '/game') {
            router.replace('/onboarding');
            return;
          }
          onParentStep?.(action.step);
          return;
        }

        const action = childResumeAction(
          snapshot,
          currentPath as '/onboarding/child' | '/game/child'
        );
        if (action.type === 'stay') return;
        if (appliedRef.current) return;
        appliedRef.current = true;
        logger.log('child resume', { stage: snapshot.stage, action, currentPath });

        if (action.type === 'route') {
          router.replace(childPathWithInvite(action.path, inviteId));
          return;
        }

        writePersistedChildFlowStep(action.step);
        onChildStep?.(action.step);
      } catch (error) {
        logger.warn('pairing resume failed', error);
      }
    };

    void tick();
    intervalId = window.setInterval(() => void tick(), 2000);

    return () => {
      cancelled = true;
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [
    enabled,
    parentId,
    role,
    currentPath,
    currentStep,
    inviteId,
    onParentStep,
    onChildStep,
    router,
  ]);
}
