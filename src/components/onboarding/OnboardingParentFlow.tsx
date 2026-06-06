'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChildrenPhoneCountStep } from '@/components/onboarding/children-count/ChildrenPhoneCountStep';
import { ChildrenDetailsStep } from '@/components/onboarding/children-details/ChildrenDetailsStep';
import { ChildrenScreenTimeStep } from '@/components/onboarding/screen-time/ChildrenScreenTimeStep';
import { ScreenTimeCalculatingStep } from '@/components/onboarding/screen-time/ScreenTimeCalculatingStep';
import { OnboardingAccentFooter } from '@/components/onboarding/OnboardingAccentFooter';
import { OnboardingBackButton } from '@/components/onboarding/OnboardingBackButton';
import {
  ONBOARDING_BLUR_FOOTER_HEIGHT_PX,
  OnboardingBlurFooter,
} from '@/components/onboarding/OnboardingBlurFooter';
import { OnboardingFooterCta } from '@/components/onboarding/OnboardingFooterCta';
import { OnboardingFunnelStepSlot } from '@/components/onboarding/OnboardingFunnelStepSlot';
import { OnboardingGrid } from '@/components/onboarding/OnboardingGrid';
import { OnboardingMintGlow } from '@/components/onboarding/OnboardingMintGlow';
import { ParentRoleCard } from '@/components/onboarding/parent-role/ParentRoleCard';
import { PickFirstChildStep } from '@/components/onboarding/pick-child/PickFirstChildStep';
import {
  OnboardingRevealStepContent,
  type RevealFlowStep,
} from '@/components/onboarding/OnboardingRevealStepContent';
import { SignupChildInviteIntroStep } from '@/components/onboarding/signup/SignupChildInviteIntroStep';
import { SignupChildInviteShareStep } from '@/components/onboarding/signup/SignupChildInviteShareStep';
import { SignupChildInviteWaitingMarquee } from '@/components/onboarding/signup/SignupChildInviteWaitingMarquee';
import { SignupChildInviteWaitingStep } from '@/components/onboarding/signup/SignupChildInviteWaitingStep';
import {
  OnboardingSignupForm,
  type SignupFormValues,
} from '@/components/onboarding/signup/OnboardingSignupForm';
import { SignupHeroFrame } from '@/components/onboarding/signup/SignupHeroFrame';
import { SignupHowItWorksPill } from '@/components/onboarding/signup/SignupHowItWorksPill';
import { SignupIntroStep } from '@/components/onboarding/signup/SignupIntroStep';
import { ONBOARDING_PARENT_IMAGES } from '@/constants/onboarding-figma';
import { SIGNUP_FORM_CONTENT_MARGIN_TOP_PX } from '@/constants/signup-layout';
import {
  SIGNUP_JOURNEY_STAGE_COUNT,
  type SignupJourneyStageIndex,
} from '@/constants/signup-journey';
import {
  SIGNUP_CHILD_INVITE_WAITING_LINK_OPEN_MS,
  SIGNUP_CHILD_INVITE_WAITING_MARQUEE_BOTTOM_PX,
} from '@/constants/signup-child-invite-layout';
import { V03_SCREEN_HEIGHT } from '@/constants/v03-screen';
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
  getSignupPickChildOptions,
  setOnboardingFirstChildIndex,
  type PickFirstChildOption,
} from '@/lib/onboarding/pickFirstChild';
import {
  setOnboardingParentRole,
  type OnboardingParentRole,
} from '@/lib/onboarding/parentRole';
import { useOnboardingLightFunnel } from '@/lib/onboarding/useOnboardingLightFunnel';
import { prepareBondingInvite } from '@/lib/onboarding/bondingShare';
import {
  isOnboardingAccountCreated,
  persistOnboardingAccountAfterAuth,
} from '@/lib/onboarding/persistOnboardingAccount';
import { validateOnboardingSignupForm } from '@/lib/onboarding/validateSignupForm';
import { signUp } from '@/utils/auth';
import {
  completeOAuthRedirectIfNeeded,
  signInWithApple,
  signInWithGoogle,
} from '@/utils/auth-oauth';
import { getAuthErrorFromUnknown } from '@/utils/auth-errors';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('OnboardingParentFlow');

const FLOW_STEP_STORAGE_KEY = 'onboardingParentFlowStep';
const OAUTH_PENDING_KEY = 'onboardingOAuthPending';

const POST_SIGNUP_STEPS: ParentFlowStep[] = [
  'signupIntro',
  'pickChild',
  'childInviteIntro',
  'childInviteShare',
  'childInviteWaiting',
  'childInviteWaitingCompanion',
];

function isPostSignupStep(step: ParentFlowStep) {
  return POST_SIGNUP_STEPS.includes(step);
}

function readStoredFlowStep(): ParentFlowStep | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(FLOW_STEP_STORAGE_KEY);
  if (!raw) return null;
  return raw as ParentFlowStep;
}

type ParentFlowStep =
  | 'role'
  | 'phoneCount'
  | 'details'
  | 'screenTime'
  | 'calculating'
  | 'revealIntro'
  | 'badNews'
  | 'goodNews'
  | 'realData'
  | 'signupForm'
  | 'signupIntro'
  | 'pickChild'
  | 'childInviteIntro'
  | 'childInviteShare'
  | 'childInviteWaiting'
  | 'childInviteWaitingCompanion';

const REVEAL_STEPS: ParentFlowStep[] = [
  'revealIntro',
  'badNews',
  'goodNews',
  'realData',
];

function isRevealStep(step: ParentFlowStep) {
  return REVEAL_STEPS.includes(step);
}

/** Unified funnel — parent → reveal → signup on /onboarding/parent. */
export function OnboardingParentFlow() {
  const router = useRouter();
  const [step, setStep] = useState<ParentFlowStep>(() => {
    if (typeof window === 'undefined') return 'role';
    if (isOnboardingAccountCreated()) {
      const saved = readStoredFlowStep();
      if (saved && isPostSignupStep(saved)) return saved;
      return 'signupIntro';
    }
    return 'role';
  });
  const [accountCreated, setAccountCreated] = useState(() =>
    isOnboardingAccountCreated()
  );
  const [isRegistering, setIsRegistering] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(
    null
  );
  const [role, setRole] = useState<OnboardingParentRole | null>(null);
  const [count, setCount] = useState(ONBOARDING_CHILDREN_PHONE_MIN);
  const [children, setChildren] = useState<OnboardingChildDraft[]>(() =>
    createEmptyChildren(ONBOARDING_CHILDREN_PHONE_MIN)
  );
  const [screenTimes, setScreenTimes] = useState<OnboardingChildScreenTime[]>(
    []
  );
  const [journeyStage, setJourneyStage] = useState<SignupJourneyStageIndex>(0);
  const [pickOptions, setPickOptions] = useState<PickFirstChildOption[]>([]);
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [values, setValues] = useState<SignupFormValues>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedChildName = useMemo(
    () => pickOptions[selectedChildIndex]?.name?.trim() || 'יואב',
    [pickOptions, selectedChildIndex]
  );
  const selectedChildGender = useMemo(
    () => pickOptions[selectedChildIndex]?.gender ?? 'boy',
    [pickOptions, selectedChildIndex]
  );

  useOnboardingLightFunnel(isRevealStep(step));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(FLOW_STEP_STORAGE_KEY, step);
  }, [step]);

  const finishAccountSetup = useCallback(
    async (params: {
      uid: string;
      email: string;
      displayName?: string;
      firstName?: string;
      lastName?: string;
    }) => {
      await persistOnboardingAccountAfterAuth(params);
      setAccountCreated(true);
      setJourneyStage(0);
      setStep('signupIntro');
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (typeof window === 'undefined') return;
      if (sessionStorage.getItem(OAUTH_PENDING_KEY) !== '1') return;

      const result = await completeOAuthRedirectIfNeeded();
      sessionStorage.removeItem(OAUTH_PENDING_KEY);

      if (cancelled || !result) return;
      if (!result.ok) {
        setErrors({ _general: result.errorMessage });
        setStep('signupForm');
        return;
      }

      try {
        setOauthLoading('google');
        await finishAccountSetup({
          uid: result.user.uid,
          email: result.user.email ?? '',
          displayName: result.user.displayName ?? undefined,
        });
      } catch (error) {
        logger.error('OAuth redirect persist failed:', error);
        setErrors({
          _general: getAuthErrorFromUnknown(error),
        });
        setStep('signupForm');
      } finally {
        if (!cancelled) setOauthLoading(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [finishAccountSetup]);

  useEffect(() => {
    if (accountCreated && step === 'signupForm') {
      setStep('signupIntro');
    }
  }, [accountCreated, step]);

  useEffect(() => {
    if (step !== 'pickChild') return;
    setPickOptions(getSignupPickChildOptions());
    setSelectedChildIndex(0);
  }, [step]);

  useEffect(() => {
    if (step !== 'childInviteWaiting') return;
    const timer = window.setTimeout(
      () => setStep('childInviteWaitingCompanion'),
      SIGNUP_CHILD_INVITE_WAITING_LINK_OPEN_MS
    );
    return () => window.clearTimeout(timer);
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

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setErrors({});
    setOauthLoading(provider);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(OAUTH_PENDING_KEY, '1');
      sessionStorage.setItem(FLOW_STEP_STORAGE_KEY, 'signupForm');
    }

    try {
      const result =
        provider === 'google'
          ? await signInWithGoogle()
          : await signInWithApple();

      if (result.ok && 'redirecting' in result) return;

      if (!result.ok) {
        sessionStorage.removeItem(OAUTH_PENDING_KEY);
        setErrors({ _general: result.errorMessage });
        return;
      }

      sessionStorage.removeItem(OAUTH_PENDING_KEY);
      await finishAccountSetup({
        uid: result.user.uid,
        email: result.user.email ?? '',
        displayName: result.user.displayName ?? undefined,
      });
    } catch (error) {
      sessionStorage.removeItem(OAUTH_PENDING_KEY);
      logger.error('OAuth signup failed:', error);
      setErrors({ _general: getAuthErrorFromUnknown(error) });
    } finally {
      setOauthLoading(null);
    }
  };

  const handleRegister = async () => {
    const nextErrors = validateOnboardingSignupForm(values);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setIsRegistering(true);
    setErrors({});

    try {
      const displayName = [values.firstName.trim(), values.lastName.trim()]
        .filter(Boolean)
        .join(' ');
      const user = await signUp(
        values.email.trim(),
        values.password,
        displayName
      );

      await finishAccountSetup({
        uid: user.uid,
        email: values.email.trim(),
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
      });
    } catch (error) {
      logger.error('Email signup failed:', error);
      const message = getAuthErrorFromUnknown(error);
      if (message.includes('אימייל')) {
        setErrors({ email: message });
      } else if (message.includes('סיסמה')) {
        setErrors({ password: message });
      } else {
        setErrors({ _general: message });
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const handleParentContinue = () => {
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
      const times = createScreenTimesFromChildren(children);
      setOnboardingChildrenDetails(children);
      setScreenTimes(times);
      setOnboardingChildrenScreenTime(times);
      setStep('screenTime');
      return;
    }
    setOnboardingChildrenScreenTime(screenTimes);
    setStep('calculating');
  };

  const handleRevealContinue = () => {
    if (step === 'revealIntro') {
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
    setStep('signupForm');
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

  const handleInviteComplete = async () => {
    try {
      await prepareBondingInvite({
        childName: selectedChildName,
        shareMode: 'remind_later',
      });
    } catch (error) {
      logger.warn('Remind-later bonding invite failed:', error);
    }
    router.push('/onboarding/setup');
  };

  const handleBack = () => {
    if (accountCreated && step === 'signupForm') {
      return;
    }

    if (step === 'childInviteWaitingCompanion') {
      setStep('childInviteWaiting');
      return;
    }
    if (step === 'childInviteWaiting') {
      setStep('childInviteShare');
      return;
    }
    if (step === 'childInviteShare') {
      setStep('childInviteIntro');
      return;
    }
    if (step === 'childInviteIntro') {
      setStep('pickChild');
      return;
    }
    if (step === 'pickChild') {
      setStep('signupIntro');
      setJourneyStage(2);
      return;
    }
    if (step === 'signupIntro') {
      if (journeyStage > 0) {
        setJourneyStage((s) => (s - 1) as SignupJourneyStageIndex);
        return;
      }
      if (!accountCreated) {
        setStep('signupForm');
      }
      return;
    }
    if (step === 'signupForm') {
      setStep('realData');
      return;
    }
    if (step === 'realData') {
      setStep('goodNews');
      return;
    }
    if (step === 'goodNews') {
      setStep('badNews');
      return;
    }
    if (step === 'badNews') {
      setStep('revealIntro');
      return;
    }
    if (step === 'revealIntro') {
      setStep('role');
      return;
    }
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

  const revealFooterFadeClass =
    step === 'revealIntro'
      ? 'v03-funnel-enter-reveal-3'
      : step === 'badNews'
        ? 'v03-funnel-enter-reveal-6'
        : step === 'goodNews'
          ? 'v03-funnel-enter-reveal-3'
          : 'v03-funnel-enter-reveal-3';

  const showBackButton =
    !(accountCreated && step === 'signupForm') &&
    !(accountCreated && step === 'signupIntro' && journeyStage === 0);

  if (step === 'childInviteWaiting' || step === 'childInviteWaitingCompanion') {
    return (
      <>
        <OnboardingGrid />
        <OnboardingMintGlow />
        {showBackButton && <OnboardingBackButton onClick={handleBack} />}
        <div
          key={step}
          className="v03-funnel-screen absolute inset-x-0 top-0 z-[10] overflow-hidden"
          style={{ height: V03_SCREEN_HEIGHT }}
        >
          <SignupChildInviteWaitingStep
            childName={selectedChildName}
            childGender={selectedChildGender}
            variant={
              step === 'childInviteWaiting' ? 'linkOpen' : 'companionPick'
            }
          />
          <div
            className="pointer-events-none absolute inset-x-0 z-0"
            style={{ bottom: SIGNUP_CHILD_INVITE_WAITING_MARQUEE_BOTTOM_PX }}
          >
            <SignupChildInviteWaitingMarquee />
          </div>
        </div>
      </>
    );
  }

  if (step === 'childInviteShare') {
    return (
      <>
        <OnboardingMintGlow />
        {showBackButton && <OnboardingBackButton onClick={handleBack} />}
        <div
          key={step}
          className="v03-funnel-screen absolute inset-x-0 top-0 z-[10] overflow-hidden"
          style={{ height: V03_SCREEN_HEIGHT }}
        >
          <SignupChildInviteShareStep
            childName={selectedChildName}
            onShared={() => setStep('childInviteWaiting')}
          />
        </div>
      </>
    );
  }

  if (step === 'childInviteIntro') {
    return (
      <>
        <OnboardingMintGlow />
        {showBackButton && <OnboardingBackButton onClick={handleBack} />}
        <div
          key={step}
          className="v03-funnel-screen absolute inset-x-0 top-0 z-[10] overflow-hidden"
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
        {showBackButton && <OnboardingBackButton onClick={handleBack} />}
        <div
          key={step}
          className="v03-funnel-screen absolute inset-x-0 top-0 z-[10] overflow-hidden"
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

  if (step === 'signupIntro') {
    return (
      <>
        <OnboardingGrid />
        <OnboardingMintGlow />
        {showBackButton && <OnboardingBackButton onClick={handleBack} />}
        <SignupHowItWorksPill />
        <div
          key={step}
          className="v03-funnel-screen absolute inset-x-0 top-0 z-[10] overflow-hidden"
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

  if (step === 'signupForm') {
    return (
      <>
        <OnboardingMintGlow />
        {showBackButton && <OnboardingBackButton onClick={handleBack} />}
        <div
          key={step}
          dir="rtl"
          className="v03-funnel-screen absolute inset-x-0 top-0 z-[10] overflow-y-auto overflow-x-hidden v03-scroll-hidden"
          style={{ bottom: ONBOARDING_BLUR_FOOTER_HEIGHT_PX }}
        >
          <div className="v03-funnel-enter-0">
            <SignupHeroFrame />
          </div>
          <div
            className="relative z-[12] flex flex-col items-center gap-5 px-v03-gutter pb-8"
            style={{ marginTop: SIGNUP_FORM_CONTENT_MARGIN_TOP_PX }}
          >
            <OnboardingSignupForm
              values={values}
              errors={errors}
              onChange={handleChange}
              onOAuthGoogle={() => handleOAuth('google')}
              onOAuthApple={() => handleOAuth('apple')}
              oauthDisabled={isRegistering}
              oauthLoading={oauthLoading}
            />
          </div>
        </div>
        <OnboardingAccentFooter
          type="button"
          onClick={handleRegister}
          disabled={isRegistering || oauthLoading !== null}
        >
          {isRegistering ? 'נרשמים...' : 'הרשמה'}
        </OnboardingAccentFooter>
      </>
    );
  }

  if (isRevealStep(step)) {
    return (
      <>
        <div
          className="v03-funnel-surface-light pointer-events-none absolute inset-0 z-0"
          aria-hidden
        />
        <OnboardingBackButton tone="light" onClick={handleBack} />
        <OnboardingFunnelStepSlot stepKey={step}>
          <OnboardingRevealStepContent step={step as RevealFlowStep} />
        </OnboardingFunnelStepSlot>
        <OnboardingBlurFooter
          key={step}
          className={revealFooterFadeClass}
          onClick={handleRevealContinue}
        >
          המשך
        </OnboardingBlurFooter>
      </>
    );
  }

  const useBlurFooter = step === 'details' || step === 'screenTime';
  const showChrome = step !== 'calculating';

  return (
    <>
      <OnboardingMintGlow />
      {showChrome && <OnboardingBackButton onClick={handleBack} />}

      <OnboardingFunnelStepSlot stepKey={step}>
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
        <ScreenTimeCalculatingStep onComplete={() => setStep('revealIntro')} />
      )}
      </OnboardingFunnelStepSlot>

      {showChrome &&
        (useBlurFooter ? (
          <OnboardingBlurFooter
            disabled={step === 'details' && !childrenDetailsComplete(children)}
            onClick={handleParentContinue}
          >
            המשך
          </OnboardingBlurFooter>
        ) : (
          <OnboardingFooterCta
            variant="secondary"
            disabled={step === 'role' && !role}
            onClick={handleParentContinue}
          >
            המשך
          </OnboardingFooterCta>
        ))}
    </>
  );
}
