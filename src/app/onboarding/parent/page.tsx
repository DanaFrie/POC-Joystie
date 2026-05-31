'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ChildrenPhoneCountStep } from '@/components/onboarding/children-count/ChildrenPhoneCountStep';
import { ChildrenDetailsStep } from '@/components/onboarding/children-details/ChildrenDetailsStep';
import { ChildrenScreenTimeStep } from '@/components/onboarding/screen-time/ChildrenScreenTimeStep';
import { ScreenTimeCalculatingStep } from '@/components/onboarding/screen-time/ScreenTimeCalculatingStep';
import { OnboardingBackButton } from '@/components/onboarding/OnboardingBackButton';
import { OnboardingBlurFooter } from '@/components/onboarding/OnboardingBlurFooter';
import { OnboardingFooterCta } from '@/components/onboarding/OnboardingFooterCta';
import { OnboardingMintGlow } from '@/components/onboarding/OnboardingMintGlow';
import { ParentRoleCard } from '@/components/onboarding/parent-role/ParentRoleCard';
import { ONBOARDING_PARENT_IMAGES } from '@/constants/onboarding-figma';
import {
  ONBOARDING_CHILDREN_PHONE_MIN,
  setOnboardingChildrenPhoneCount,
} from '@/lib/onboarding/childrenPhoneCount';
import {
  childrenDetailsComplete,
  createEmptyChildren,
  setOnboardingChildrenDetails,
  type OnboardingChildDraft,
} from '@/lib/onboarding/childrenDetails';
import {
  createScreenTimesFromChildren,
  setOnboardingChildrenScreenTime,
  type OnboardingChildScreenTime,
} from '@/lib/onboarding/childrenScreenTime';
import {
  setOnboardingParentRole,
  type OnboardingParentRole,
} from '@/lib/onboarding/parentRole';

export const dynamic = 'force-dynamic';

type ParentStep =
  | 'role'
  | 'phoneCount'
  | 'details'
  | 'screenTime'
  | 'calculating';

/** /onboarding/parent — role → count → details → screen time. */
export default function OnboardingParentPage() {
  const router = useRouter();
  const [step, setStep] = useState<ParentStep>('role');
  const [role, setRole] = useState<OnboardingParentRole | null>(null);
  const [count, setCount] = useState(ONBOARDING_CHILDREN_PHONE_MIN);
  const [children, setChildren] = useState<OnboardingChildDraft[]>(() =>
    createEmptyChildren(ONBOARDING_CHILDREN_PHONE_MIN)
  );
  const [screenTimes, setScreenTimes] = useState<OnboardingChildScreenTime[]>(
    []
  );

  const handleContinue = () => {
    if (step === 'role') {
      if (!role) return;
      setOnboardingParentRole(role);
      setStep('phoneCount');
      return;
    }
    if (step === 'phoneCount') {
      setOnboardingChildrenPhoneCount(count);
      setChildren(createEmptyChildren(count));
      setStep('details');
      return;
    }
    if (step === 'details') {
      if (!childrenDetailsComplete(children)) return;
      setOnboardingChildrenDetails(children);
      setScreenTimes(createScreenTimesFromChildren(children));
      setStep('screenTime');
      return;
    }
    setOnboardingChildrenScreenTime(screenTimes);
    setStep('calculating');
  };

  const handleCalculatingComplete = () => {
    router.push('/onboarding/reveal');
  };

  const handleBack = () => {
    if (step === 'calculating') {
      setStep('screenTime');
      return;
    }
    if (step === 'screenTime') {
      setStep('details');
      return;
    }
    if (step === 'details') {
      setStep('phoneCount');
      return;
    }
    if (step === 'phoneCount') {
      setStep('role');
      return;
    }
    router.push('/onboarding');
  };

  const useBlurFooter = step === 'details' || step === 'screenTime';
  const showChrome = step !== 'calculating';

  return (
    <>
      <OnboardingMintGlow />
      {showChrome && <OnboardingBackButton onClick={handleBack} />}

      {step === 'role' && (
        <section
          className="absolute right-v03-gutter top-[97px] z-[10] flex w-v03-content flex-col items-end gap-[35px]"
          aria-label="בחירת תפקיד הורה"
        >
          <header className="flex w-full flex-col items-end justify-center gap-1 px-[15px]">
            <h1 className="w-full text-right font-simpler text-[40px] font-black leading-[44px] text-white">
              היי, נעים מאוד!
            </h1>
            <p className="w-[293px] text-right font-simpler text-[24px] font-normal leading-[30px] text-white">
              שמחים להכיר, עם מי אנחנו מדברים?
            </p>
          </header>

          <div className="flex w-full flex-col gap-[15px]">
            <ParentRoleCard
              label="אני האמא"
              imageSrc={ONBOARDING_PARENT_IMAGES.mother}
              imageAlt="אמא"
              selected={role === 'mother'}
              onSelect={() => setRole('mother')}
            />
            <ParentRoleCard
              label="אני האבא"
              imageSrc={ONBOARDING_PARENT_IMAGES.father}
              imageAlt="אבא"
              selected={role === 'father'}
              onSelect={() => setRole('father')}
            />
          </div>
        </section>
      )}

      {step === 'phoneCount' && (
        <ChildrenPhoneCountStep count={count} onCountChange={setCount} />
      )}

      {step === 'details' && (
        <ChildrenDetailsStep children={children} onChildrenChange={setChildren} />
      )}

      {step === 'screenTime' && (
        <ChildrenScreenTimeStep
          entries={screenTimes}
          onEntriesChange={setScreenTimes}
        />
      )}

      {step === 'calculating' && (
        <ScreenTimeCalculatingStep onComplete={handleCalculatingComplete} />
      )}

      {showChrome &&
        (useBlurFooter ? (
        <OnboardingBlurFooter
          disabled={step === 'details' && !childrenDetailsComplete(children)}
          onClick={handleContinue}
        >
          המשך
        </OnboardingBlurFooter>
        ) : (
          <OnboardingFooterCta
            variant="secondary"
            disabled={step === 'role' && !role}
            onClick={handleContinue}
          >
            המשך
          </OnboardingFooterCta>
        ))}
    </>
  );
}
