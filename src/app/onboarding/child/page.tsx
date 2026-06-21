'use client';

import { OnboardingChildFlow } from '@/components/onboarding/OnboardingChildFlow';

export const dynamic = 'force-dynamic';

/** `/onboarding/child` — kid onboarding funnel (no parent token yet). */
export default function OnboardingChildPage() {
  return <OnboardingChildFlow />;
}
