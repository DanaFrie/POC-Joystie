'use client';

import { OnboardingBadNewsStep } from '@/components/onboarding/bad-news/OnboardingBadNewsStep';
import { OnboardingGoodNewsStep } from '@/components/onboarding/good-news/OnboardingGoodNewsStep';
import { OnboardingNewsStep } from '@/components/onboarding/news/OnboardingNewsStep';
import { OnboardingRealDataStep } from '@/components/onboarding/real-data/OnboardingRealDataStep';

export type RevealFlowStep = 'revealIntro' | 'badNews' | 'goodNews' | 'realData';

type OnboardingRevealStepContentProps = {
  step: RevealFlowStep;
};

/** Exactly one reveal screen — keyed subtree remounts on step change. */
export function OnboardingRevealStepContent({ step }: OnboardingRevealStepContentProps) {
  switch (step) {
    case 'revealIntro':
      return <OnboardingNewsStep />;
    case 'badNews':
      return <OnboardingBadNewsStep />;
    case 'goodNews':
      return <OnboardingGoodNewsStep />;
    case 'realData':
      return <OnboardingRealDataStep />;
    default:
      return null;
  }
}
