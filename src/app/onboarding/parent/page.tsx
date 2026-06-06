'use client';

import { OnboardingParentFlow } from '@/components/onboarding/OnboardingParentFlow';

export const dynamic = 'force-dynamic';

/** /onboarding/parent — full funnel: parent → reveal → signup. */
export default function OnboardingParentPage() {
  return <OnboardingParentFlow />;
}
