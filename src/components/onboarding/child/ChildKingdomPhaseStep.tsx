'use client';

import { ChildCompanionOverlay } from '@/components/onboarding/child/ChildCompanionOverlay';
import { ChildKingdomBackdrop } from '@/components/onboarding/child/ChildKingdomBackdrop';

type ChildKingdomPhaseStepProps = {
  showCompanionOverlay: boolean;
  showMintGlow: boolean;
  onCompanionContinue?: () => void;
};

/**
 * Screens 3–4 — kingdom backdrop stays mounted; overlay enters on screen 4 only.
 */
export function ChildKingdomPhaseStep({
  showCompanionOverlay,
  showMintGlow,
  onCompanionContinue,
}: ChildKingdomPhaseStepProps) {
  return (
    <div className="relative h-full w-full overflow-visible bg-transparent">
      <ChildKingdomBackdrop mintGlow={showMintGlow} />
      {showCompanionOverlay ? (
        <ChildCompanionOverlay onContinue={onCompanionContinue} />
      ) : null}
    </div>
  );
}
