'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { OnboardingBadNewsStep } from '@/components/onboarding/bad-news/OnboardingBadNewsStep';
import { OnboardingGoodNewsStep } from '@/components/onboarding/good-news/OnboardingGoodNewsStep';
import { OnboardingRealDataStep } from '@/components/onboarding/real-data/OnboardingRealDataStep';
import { OnboardingBackButton } from '@/components/onboarding/OnboardingBackButton';
import { OnboardingBlurFooter } from '@/components/onboarding/OnboardingBlurFooter';
import { OnboardingNewsStep } from '@/components/onboarding/news/OnboardingNewsStep';
import { useOnboardingLightFunnel } from '@/lib/onboarding/useOnboardingLightFunnel';

export const dynamic = 'force-dynamic';

type RevealStep = 'intro' | 'badNews' | 'goodNews' | 'realData';

/** Light funnel — intro → bad news → good news → real data → setup. */
export default function OnboardingRevealPage() {
  const router = useRouter();
  const [step, setStep] = useState<RevealStep>('intro');
  useOnboardingLightFunnel();

  const handleContinue = () => {
    if (step === 'intro') {
      setStep('badNews');
      return;
    }
    if (step === 'badNews') {
      setStep('goodNews');
      return;
    }
    if (step === 'goodNews') {
      setStep('realData');
      return;
    }
    router.push('/onboarding/signup');
  };

  const handleBack = () => {
    if (step === 'realData') {
      setStep('goodNews');
      return;
    }
    if (step === 'goodNews') {
      setStep('badNews');
      return;
    }
    if (step === 'badNews') {
      setStep('intro');
      return;
    }
    router.push('/onboarding/parent');
  };

  const footerFadeClass =
    step === 'intro'
      ? 'v03-fade-in-seq-3'
      : step === 'badNews'
        ? 'v03-fade-in-seq-6'
        : step === 'goodNews'
          ? 'v03-fade-in-seq-4'
          : 'v03-fade-in-seq-3';

  return (
    <>
      <div
        className="v03-funnel-surface-light pointer-events-none absolute inset-0 z-0"
        aria-hidden
      />
      <OnboardingBackButton tone="light" onClick={handleBack} />
      {step === 'intro' && <OnboardingNewsStep />}
      {step === 'badNews' && <OnboardingBadNewsStep />}
      {step === 'goodNews' && <OnboardingGoodNewsStep />}
      {step === 'realData' && <OnboardingRealDataStep />}
      <OnboardingBlurFooter
        key={step}
        className={footerFadeClass}
        onClick={handleContinue}
      >
        המשך
      </OnboardingBlurFooter>
    </>
  );
}
