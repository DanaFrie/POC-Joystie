'use client';

import { FunnelRouteLoading } from '@/components/onboarding/FunnelRouteLoading';

/** Instant paint while `/onboarding` chunks resolve. */
export default function OnboardingLoading() {
  return <FunnelRouteLoading />;
}
