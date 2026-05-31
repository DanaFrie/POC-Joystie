import { redirect } from 'next/navigation';

/** @deprecated — use /onboarding/reveal */
export default function OnboardingNewsRedirectPage() {
  redirect('/onboarding/reveal');
}
