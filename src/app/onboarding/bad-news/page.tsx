import { redirect } from 'next/navigation';

/** @deprecated — use /onboarding/reveal */
export default function OnboardingBadNewsRedirectPage() {
  redirect('/onboarding/parent');
}
