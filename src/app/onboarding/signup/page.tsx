'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { OnboardingAccentFooter } from '@/components/onboarding/OnboardingAccentFooter';
import { OnboardingBackButton } from '@/components/onboarding/OnboardingBackButton';
import {
  ONBOARDING_BLUR_FOOTER_HEIGHT_PX,
  OnboardingBlurFooter,
} from '@/components/onboarding/OnboardingBlurFooter';
import { OnboardingFooterCta } from '@/components/onboarding/OnboardingFooterCta';
import { OnboardingGrid } from '@/components/onboarding/OnboardingGrid';
import { OnboardingMintGlow } from '@/components/onboarding/OnboardingMintGlow';
import { PickFirstChildStep } from '@/components/onboarding/pick-child/PickFirstChildStep';
import { SignupChildInviteIntroStep } from '@/components/onboarding/signup/SignupChildInviteIntroStep';
import { SignupChildInviteRemindFooter } from '@/components/onboarding/signup/SignupChildInviteRemindFooter';
import { SignupChildInviteShareStep } from '@/components/onboarding/signup/SignupChildInviteShareStep';
import {
  OnboardingSignupForm,
  type SignupFormValues,
} from '@/components/onboarding/signup/OnboardingSignupForm';
import { SignupHeroFrame } from '@/components/onboarding/signup/SignupHeroFrame';
import { SignupHowItWorksPill } from '@/components/onboarding/signup/SignupHowItWorksPill';
import { SignupIntroStep } from '@/components/onboarding/signup/SignupIntroStep';
import { SIGNUP_CONTENT_PULL_UP_PX } from '@/constants/signup-layout';
import {
  SIGNUP_JOURNEY_STAGE_COUNT,
  type SignupJourneyStageIndex,
} from '@/constants/signup-journey';
import {
  getSignupPickChildOptions,
  setOnboardingFirstChildIndex,
  type PickFirstChildOption,
} from '@/lib/onboarding/pickFirstChild';
import { V03_SCREEN_HEIGHT } from '@/constants/v03-screen';

export const dynamic = 'force-dynamic';

type SignupStep =
  | 'form'
  | 'intro'
  | 'pickChild'
  | 'childInviteIntro'
  | 'childInviteShare';

/** /onboarding/signup — form → intro → pick child → invite intro → invite share. */
export default function OnboardingSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<SignupStep>('form');
  const [journeyStage, setJourneyStage] = useState<SignupJourneyStageIndex>(0);
  const [pickOptions, setPickOptions] = useState<PickFirstChildOption[]>([]);
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [values, setValues] = useState<SignupFormValues>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedChildName = useMemo(
    () => pickOptions[selectedChildIndex]?.name?.trim() || 'יואב',
    [pickOptions, selectedChildIndex]
  );

  useEffect(() => {
    if (step !== 'pickChild') return;
    setPickOptions(getSignupPickChildOptions());
    setSelectedChildIndex(0);
  }, [step]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleOAuthUnavailable = () => {
    setErrors((prev) => ({
      ...prev,
      _general: 'התחברות עם Google או Apple תהיה זמינה בקרוב',
    }));
  };

  const handleBack = () => {
    if (step === 'childInviteShare') {
      setStep('childInviteIntro');
      return;
    }
    if (step === 'childInviteIntro') {
      setStep('pickChild');
      return;
    }
    if (step === 'pickChild') {
      setStep('intro');
      setJourneyStage(2);
      return;
    }
    if (step === 'intro') {
      if (journeyStage > 0) {
        setJourneyStage((s) => (s - 1) as SignupJourneyStageIndex);
        return;
      }
      setStep('form');
      return;
    }
    router.back();
  };

  const handleRegister = () => {
    setJourneyStage(0);
    setStep('intro');
  };

  const handleIntroContinue = () => {
    if (journeyStage < SIGNUP_JOURNEY_STAGE_COUNT - 1) {
      setJourneyStage((s) => (s + 1) as SignupJourneyStageIndex);
      return;
    }
    setStep('pickChild');
  };

  const handlePickChildContinue = () => {
    setOnboardingFirstChildIndex(selectedChildIndex);
    setStep('childInviteIntro');
  };

  const handleInviteComplete = () => {
    router.push('/onboarding/setup');
  };

  if (step === 'childInviteShare') {
    return (
      <>
        <OnboardingMintGlow />
        <OnboardingBackButton onClick={handleBack} />
        <div
          className="absolute inset-x-0 top-0 z-[10] overflow-hidden"
          style={{ height: V03_SCREEN_HEIGHT }}
        >
          <SignupChildInviteShareStep childName={selectedChildName} />
        </div>
        <SignupChildInviteRemindFooter onRemindLater={handleInviteComplete} />
      </>
    );
  }

  if (step === 'childInviteIntro') {
    return (
      <>
        <OnboardingMintGlow />
        <OnboardingBackButton onClick={handleBack} />
        <div
          className="absolute inset-x-0 top-0 z-[10] overflow-hidden"
          style={{ height: V03_SCREEN_HEIGHT }}
        >
          <SignupChildInviteIntroStep
            childName={selectedChildName}
            onTogetherNow={() => setStep('childInviteShare')}
            onRemindLater={handleInviteComplete}
          />
        </div>
      </>
    );
  }

  if (step === 'pickChild') {
    return (
      <>
        <OnboardingMintGlow />
        <OnboardingBackButton onClick={handleBack} />
        <div
          className="absolute inset-x-0 top-0 z-[10] overflow-hidden"
          style={{ height: V03_SCREEN_HEIGHT }}
        >
          <PickFirstChildStep
            options={pickOptions}
            selectedIndex={selectedChildIndex}
            onSelectIndex={setSelectedChildIndex}
          />
        </div>
        <OnboardingFooterCta variant="secondary" onClick={handlePickChildContinue}>
          המשך
        </OnboardingFooterCta>
      </>
    );
  }

  if (step === 'intro') {
    return (
      <>
        <OnboardingGrid />
        <OnboardingMintGlow />
        <OnboardingBackButton onClick={handleBack} />
        <SignupHowItWorksPill />
        <div
          className="absolute inset-x-0 top-0 z-[10] overflow-hidden"
          style={{ bottom: ONBOARDING_BLUR_FOOTER_HEIGHT_PX }}
        >
          <SignupIntroStep
            stage={journeyStage}
            onStageChange={setJourneyStage}
          />
        </div>
        <OnboardingBlurFooter onClick={handleIntroContinue}>
          המשך
        </OnboardingBlurFooter>
      </>
    );
  }

  return (
    <>
      <OnboardingMintGlow />
      <OnboardingBackButton onClick={handleBack} />
      <div
        dir="rtl"
        className="absolute inset-x-0 top-0 z-[10] overflow-y-auto overflow-x-hidden v03-scroll-hidden"
        style={{ bottom: ONBOARDING_BLUR_FOOTER_HEIGHT_PX }}
      >
        <SignupHeroFrame />
        <div
          className="relative z-[12] flex flex-col items-center gap-5 px-v03-gutter pb-8"
          style={{ marginTop: SIGNUP_CONTENT_PULL_UP_PX }}
        >
          <OnboardingSignupForm
            values={values}
            errors={errors}
            onChange={handleChange}
            onOAuthGoogle={handleOAuthUnavailable}
            onOAuthApple={handleOAuthUnavailable}
            oauthDisabled={false}
          />
        </div>
      </div>
      <OnboardingAccentFooter type="button" onClick={handleRegister}>
        הרשמה
      </OnboardingAccentFooter>
    </>
  );
}
