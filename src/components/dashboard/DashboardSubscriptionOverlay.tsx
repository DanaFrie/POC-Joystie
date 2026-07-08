'use client';

import { useState } from 'react';
import { ParentSubscriptionStep } from '@/components/onboarding/parent/ParentSubscriptionStep';
import { FunnelViewport } from '@/components/ui/FunnelViewport';
import type { OnboardingSubscriptionPlan } from '@/constants/onboarding-subscription-layout';

type DashboardSubscriptionOverlayProps = {
  visible: boolean;
  onClose: () => void;
  onContinue?: () => void;
};

/** Full-screen subscription gate over the parent dashboard. */
export function DashboardSubscriptionOverlay({
  visible,
  onClose,
  onContinue,
}: DashboardSubscriptionOverlayProps) {
  const [selectedPlan, setSelectedPlan] = useState<OnboardingSubscriptionPlan | null>(null);

  if (!visible) return null;

  return (
    <div className="absolute inset-0 z-[70] overflow-hidden" role="dialog" aria-modal="true">
      <FunnelViewport surface="dark" scaleMode="scroll" className="font-simpler text-v03-text-on-dark">
        <div className="relative h-full w-full">
          <ParentSubscriptionStep
            selectedPlan={selectedPlan}
            onPlanChange={setSelectedPlan}
            onClose={onClose}
            onContinue={onContinue ?? onClose}
          />
        </div>
      </FunnelViewport>
    </div>
  );
}
