'use client';

import { useRouter } from 'next/navigation';
import { useParentChildProgress } from '@/hooks/useParentChildProgress';
import { resetOnboardingChildProgress, readOnboardingChildProgress } from '@/lib/onboarding/childProgress';
import { flushSync } from 'react-dom';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { OnboardingFunnelScrollBody } from '@/components/onboarding/OnboardingFunnelScrollBody';
import { OnboardingFunnelStepSlot } from '@/components/onboarding/OnboardingFunnelStepSlot';
import { OnboardingGrid } from '@/components/onboarding/OnboardingGrid';
import { OnboardingMintGlow } from '@/components/onboarding/OnboardingMintGlow';
import { OnboardingRevealBleedBackground } from '@/components/onboarding/OnboardingRevealBleedBackground';
import { ParentOnboardingCompletionStep } from '@/components/onboarding/parent/ParentOnboardingCompletionStep';
import {
  ParentGamePostWinFlow,
  type ParentPostGamePhase,
} from '@/components/onboarding/parent/ParentGamePostWinFlow';
import { ParentRoleCard } from '@/components/onboarding/parent-role/ParentRoleCard';
import { ParentSubscriptionStep } from '@/components/onboarding/parent/ParentSubscriptionStep';
import { PickFirstChildStep } from '@/components/onboarding/pick-child/PickFirstChildStep';
import {
  OnboardingRevealStepContent,
  type RevealFlowStep,
} from '@/components/onboarding/OnboardingRevealStepContent';
import { SignupChildInviteIntroStep } from '@/components/onboarding/signup/SignupChildInviteIntroStep';
import { SignupChildInviteShareStep } from '@/components/onboarding/signup/SignupChildInviteShareStep';
import { OnboardingWaitingScreenShell } from '@/components/onboarding/OnboardingWaitingScreenShell';
import { OnboardingWaitingCenterContent } from '@/components/onboarding/signup/OnboardingWaitingCenterContent';
import { SignupChildInviteWaitingStep } from '@/components/onboarding/signup/SignupChildInviteWaitingStep';
import {
  OnboardingSignupForm,
  type SignupFormValues,
} from '@/components/onboarding/signup/OnboardingSignupForm';
import { SignupHeroFrame } from '@/components/onboarding/signup/SignupHeroFrame';
import { SignupHowItWorksPill } from '@/components/onboarding/signup/SignupHowItWorksPill';
import { SignupIntroStep } from '@/components/onboarding/signup/SignupIntroStep';
import { SignupOAuthTermsSheet } from '@/components/onboarding/signup/SignupOAuthTermsSheet';
import { ONBOARDING_PARENT_IMAGES } from '@/constants/onboarding-figma';
import { getBondingChildName, getBondingChildGender, getSelectedFirstChildGender, getSelectedFirstChildName, setBondingChildGender, setBondingChildName } from '@/lib/onboarding/bondingInvite';
import { ONBOARDING_PARENT_GAME_WON_KEY } from '@/constants/onboarding-game';
import type { OnboardingSubscriptionPlan } from '@/constants/onboarding-subscription-layout';
import type { SignupChildInviteWaitingVariant } from '@/constants/signup-child-invite-layout';
import { SIGNUP_FORM_CONTENT_MARGIN_TOP_PX } from '@/constants/signup-layout';
import {
  SIGNUP_JOURNEY_STAGE_COUNT,
  type SignupJourneyStageIndex,
} from '@/constants/signup-journey';
import { V03_SCREEN_HEIGHT } from '@/constants/v03-screen';
import {
  ONBOARDING_CHILDREN_PHONE_MIN,
  setOnboardingChildrenPhoneCount,
} from '@/lib/onboarding/childrenPhoneCount';
import {
  childrenDetailsComplete,
  createEmptyChildren,
  getChildrenHebrewNameErrors,
  getOnboardingChildrenDetails,
  isHebrewChildName,
  ONBOARDING_HEBREW_ONLY_ERROR,
  setOnboardingChildrenDetails,
  type OnboardingChildDraft,
} from '@/lib/onboarding/childrenDetails';
import {
  createScreenTimesFromChildren,
  getOnboardingChildrenScreenTime,
  setOnboardingChildrenScreenTime,
  type OnboardingChildScreenTime,
} from '@/lib/onboarding/childrenScreenTime';
import {
  getSignupPickChildOptions,
  setOnboardingFirstChildIndex,
  type PickFirstChildOption,
} from '@/lib/onboarding/pickFirstChild';
import {
  getOnboardingParentRole,
  parentRoleToGender,
  setOnboardingParentRole,
  type OnboardingParentRole,
} from '@/lib/onboarding/parentRole';
import { parentCourtLabel } from '@/lib/onboarding/childBondingLabels';
import { useOnboardingLightFunnel } from '@/lib/onboarding/useOnboardingLightFunnel';
import { openJoystieBondingCalendarReminder } from '@/lib/share/calendar';
import {
  clearOnboardingAccountCreated,
  isOnboardingAccountCreated,
  persistOnboardingAccountAfterAuth,
} from '@/lib/onboarding/persistOnboardingAccount';
import {
  clearOAuthSessionFlags,
  isFreshOAuthPending,
  isOAuthRedirectRecoverable,
  markOnboardingTermsAccepted,
  purgeStaleOAuthSessionFlags,
  readOAuthPending,
  readOAuthProvider,
} from '@/lib/onboarding/oauthSession';
import { recoverOAuthRedirectSignIn } from '@/lib/onboarding/oauthRedirectRecovery';
import { hydrateOnboardingChildrenFromUser } from '@/lib/onboarding/hydrateChildrenFromUser';
import { checkAuthEmailExists } from '@/lib/api/auth';
import { getUser } from '@/lib/api/users';
import {
  redirectToLoginForExistingAccount,
} from '@/lib/auth/postLoginNavigation';
import { validateOnboardingSignupForm } from '@/lib/onboarding/validateSignupForm';
import { getAuthInstance } from '@/lib/firebase';
import { signUp, getCurrentUserId as getCurrentUserIdAsync } from '@/utils/auth';
import {
  getRestrictedOAuthMessage,
  isLikelyOAuthRedirectReturn,
  isRestrictedOAuthEnvironment,
  getOAuthUserDisplayName,
  getOAuthUserEmail,
  prefersOAuthRedirect,
  signInWithOAuth,
  toOAuthProviderId,
  userHasOAuthProvider,
  userMatchesOAuthProvider,
} from '@/utils/auth-oauth';
import { getAuthErrorFromUnknown } from '@/utils/auth-errors';
import { createSession } from '@/utils/session';
import { useScrollOverflow } from '@/hooks/useScrollOverflow';
import {
  FLOW_STEP_STORAGE_KEY,
  LANDING_ACTIVE_KEY,
  clearOAuthSignupWelcomePending,
  clearParentFlowSession,
  consumeFreshParentFlowStart,
  markOAuthSignupWelcomePending,
  shouldShowOAuthSignupWelcome,
} from '@/lib/onboarding/parentFlowSession';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('OnboardingParentFlow');

function shouldAttemptOAuthRedirectRecovery(): boolean {
  return (
    isOAuthRedirectRecoverable() &&
    (isFreshOAuthPending() || isLikelyOAuthRedirectReturn())
  );
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
  | 'signupWelcome'
  | 'signupIntro'
  | 'pickChild'
  | 'childInviteIntro'
  | 'childInviteShare'
  | 'childInviteWaiting'
  | 'parentPostGame'
  | 'onboardingComplete'
  | 'subscription';

/** Parent funnel screens that show the fixed grid (Figma). */
const PARENT_FUNNEL_GRID_STEPS = new Set<ParentFlowStep>([
  'signupIntro',
  'calculating',
  'childInviteWaiting',
]);

const POST_SIGNUP_STEPS: ParentFlowStep[] = [
  'signupWelcome',
  'signupIntro',
  'pickChild',
  'childInviteIntro',
  'childInviteShare',
  'childInviteWaiting',
  'parentPostGame',
  'onboardingComplete',
  'subscription',
];

function isPostSignupStep(step: ParentFlowStep) {
  return POST_SIGNUP_STEPS.includes(step);
}

function normalizeStoredFlowStep(raw: string | null): ParentFlowStep | null {
  if (!raw) return null;
  if (raw === 'childInviteWaitingCompanion') return 'childInviteWaiting';
  return raw as ParentFlowStep;
}

function readStoredFlowStep(): ParentFlowStep | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(FLOW_STEP_STORAGE_KEY);
  return normalizeStoredFlowStep(raw);
}

const REVEAL_STEPS: ParentFlowStep[] = [
  'revealIntro',
  'badNews',
  'goodNews',
  'realData',
];

const ALL_FLOW_STEPS: ParentFlowStep[] = [
  'role',
  'phoneCount',
  'details',
  'screenTime',
  'calculating',
  ...REVEAL_STEPS,
  'signupForm',
  ...POST_SIGNUP_STEPS,
];

function isValidFlowStep(value: string | null): value is ParentFlowStep {
  return value != null && ALL_FLOW_STEPS.includes(value as ParentFlowStep);
}

function readInitialFlowStep(): ParentFlowStep {
  if (typeof window === 'undefined') return 'role';
  if (sessionStorage.getItem(ONBOARDING_PARENT_GAME_WON_KEY)) {
    sessionStorage.removeItem(ONBOARDING_PARENT_GAME_WON_KEY);
    return 'parentPostGame';
  }
  if (consumeFreshParentFlowStart()) return 'role';
  if (isOnboardingAccountCreated()) {
    const saved = readStoredFlowStep();
    if (saved && isPostSignupStep(saved)) return saved;
    if (shouldShowOAuthSignupWelcome()) return 'signupWelcome';
    return 'signupIntro';
  }
  if (readOAuthPending()) {
    return 'signupForm';
  }
  const saved = readStoredFlowStep();
  if (saved && saved !== 'role' && isValidFlowStep(saved)) {
    return saved;
  }
  return 'role';
}

function isRevealStep(step: ParentFlowStep) {
  return REVEAL_STEPS.includes(step);
}

/** Unified funnel — parent → reveal → signup on `/onboarding`. */
export function OnboardingParentFlow({
  onBackToLanding,
}: {
  onBackToLanding?: () => void;
} = {}) {
  const router = useRouter();
  const exitingToLandingRef = useRef(false);
  const [step, setStep] = useState<ParentFlowStep>(readInitialFlowStep);
  const stepRef = useRef(step);
  stepRef.current = step;
  const [accountCreated, setAccountCreated] = useState(() =>
    isOnboardingAccountCreated()
  );
  const [isRegistering, setIsRegistering] = useState(false);
  const oauthPopupInFlightRef = useRef(false);
  const postSignupIntroNavigatedRef = useRef(false);
  const funnelScrollRef = useRef<HTMLDivElement>(null);
  const signupScrollRef = useRef<HTMLDivElement>(null);
  const [signupScrollTop, setSignupScrollTop] = useState(0);
  const [oauthDialogOpen, setOauthDialogOpen] = useState<'google' | 'apple' | null>(
    null
  );
  const [oauthFinishing, setOauthFinishing] = useState<'google' | 'apple' | null>(
    () => {
      if (typeof window === 'undefined') return null;
      if (shouldAttemptOAuthRedirectRecovery()) {
        return readOAuthProvider();
      }
      return null;
    }
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
    termsAccepted: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [oauthTermsAccepted, setOauthTermsAccepted] = useState(false);
  const [oauthTermsError, setOauthTermsError] = useState('');
  const [childNameErrors, setChildNameErrors] = useState<Record<number, string>>(
    {}
  );
  const [subscriptionPlan, setSubscriptionPlan] =
    useState<OnboardingSubscriptionPlan | null>(null);
  const [childLinkOpenedWaiting, setChildLinkOpenedWaiting] = useState(false);
  const [waitingSessionStartedAt, setWaitingSessionStartedAt] = useState<string | null>(
    null
  );
  const [parentPostGamePhase, setParentPostGamePhase] =
    useState<ParentPostGamePhase>('waitingChildChange');

  const funnelScrollOverflows = useScrollOverflow(funnelScrollRef, [
    step,
    children,
    screenTimes,
    count,
    pickOptions,
  ]);

  const signupScrollOverflows = useScrollOverflow(signupScrollRef, [
    step,
    values,
    errors,
    oauthDialogOpen,
    isRegistering,
  ]);

  const selectedChildName = useMemo(() => {
    const bonded = getBondingChildName();
    if (bonded) return bonded;
    const fromPick = pickOptions[selectedChildIndex]?.name?.trim();
    if (fromPick) return fromPick;
    return getSelectedFirstChildName();
  }, [pickOptions, selectedChildIndex]);
  const selectedChildGender = useMemo(() => {
    const fromPick = pickOptions[selectedChildIndex]?.gender;
    if (fromPick) return fromPick;
    return getBondingChildGender() ?? getSelectedFirstChildGender();
  }, [pickOptions, selectedChildIndex]);
  const inviteWaitingVariant: SignupChildInviteWaitingVariant = childLinkOpenedWaiting
    ? 'companionPick'
    : 'linkOpen';

  useOnboardingLightFunnel(isRevealStep(step) || step === 'onboardingComplete');

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { isAuthenticated } = await import('@/utils/auth');
        if (!(await isAuthenticated())) return;

        const uid = await getCurrentUserIdAsync();
        if (!uid || cancelled) return;

        const user = await getUser(uid, false);
        if (!user || cancelled) return;
        if (!hydrateOnboardingChildrenFromUser(user)) return;

        const hydratedChildren = getOnboardingChildrenDetails();
        const hydratedTimes = getOnboardingChildrenScreenTime();
        if (!hydratedChildren?.length || cancelled) return;

        setCount(hydratedChildren.length);
        setChildren(hydratedChildren);
        setScreenTimes(
          hydratedTimes?.length
            ? hydratedTimes
            : createScreenTimesFromChildren(hydratedChildren)
        );
      } catch (error) {
        logger.warn('Could not sync children from Firestore user', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    purgeStaleOAuthSessionFlags();
    if (!shouldAttemptOAuthRedirectRecovery()) {
      if (readOAuthPending()) {
        clearOAuthSessionFlags();
      }
      setOauthFinishing(null);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || exitingToLandingRef.current) return;
    if (sessionStorage.getItem(LANDING_ACTIVE_KEY) === '1') return;
    sessionStorage.setItem(FLOW_STEP_STORAGE_KEY, step);
  }, [step]);

  useEffect(() => {
    if (step !== 'signupWelcome') return;
    setOauthTermsAccepted(false);
    setOauthTermsError('');
  }, [step]);

  const goToSignupWelcome = useCallback(() => {
    setAccountCreated(true);
    markOAuthSignupWelcomePending();
    setStep('signupWelcome');
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(FLOW_STEP_STORAGE_KEY, 'signupWelcome');
    }
  }, []);

  const goToSignupIntro = useCallback(() => {
    if (postSignupIntroNavigatedRef.current) return;
    postSignupIntroNavigatedRef.current = true;
    setAccountCreated(true);
    clearOAuthSignupWelcomePending();
    setJourneyStage(0);
    setStep('signupIntro');
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(FLOW_STEP_STORAGE_KEY, 'signupIntro');
    }
  }, []);

  const handleWelcomeContinue = useCallback(() => {
    if (!oauthTermsAccepted) {
      setOauthTermsError('אנא אשר את תנאי השימוש');
      return;
    }
    setOauthTermsError('');
    markOnboardingTermsAccepted();
    goToSignupIntro();
  }, [goToSignupIntro, oauthTermsAccepted]);

  const handleOAuthTermsAcceptedChange = useCallback((accepted: boolean) => {
    setOauthTermsAccepted(accepted);
    if (accepted) {
      setOauthTermsError('');
    }
  }, []);

  const finishAccountSetup = useCallback(
    async (params: {
      uid: string;
      email: string;
      displayName?: string;
      firstName?: string;
      lastName?: string;
      termsAccepted?: boolean;
      oauthProvider?: 'google' | 'apple';
    }) => {
      const auth = await getAuthInstance();
      const authUid = auth.currentUser?.uid ?? null;
      const projectId = auth.app.options.projectId ?? '';

      if (isOnboardingAccountCreated()) {
        if (authUid === params.uid) {
          logger.log('Account setup skip — session + Firebase Auth match', {
            uid: params.uid,
            projectId,
          });
          clearOAuthSessionFlags();
          if (params.oauthProvider) {
            goToSignupWelcome();
          } else {
            goToSignupIntro();
          }
          return;
        }
        logger.warn('Stale onboardingAccountCreated — clearing', {
          expectedUid: params.uid,
          authUid,
          projectId,
        });
        clearOnboardingAccountCreated();
      }

      if (authUid !== params.uid) {
        logger.error('Firebase Auth user missing after OAuth', {
          expectedUid: params.uid,
          authUid,
          projectId,
        });
        throw new Error('ההתחברות לא הושלמה. נסו שוב.');
      }

      await auth.currentUser!.getIdToken(true);
      const providerIds = auth.currentUser!.providerData.map((p) => p.providerId);
      if (params.oauthProvider) {
        const expected = toOAuthProviderId(params.oauthProvider);
        if (
          !userHasOAuthProvider(auth.currentUser!) ||
          !userMatchesOAuthProvider(auth.currentUser!, expected)
        ) {
          logger.error('OAuth signup rejected — not Google/Apple account', {
            expected,
            providerIds,
            email: auth.currentUser!.email,
          });
          throw new Error(
            'ההתחברות לא הושלמה עם Google/Apple. נסו שוב או השתמשו בדוא״ל וסיסמה.'
          );
        }
      }
      logger.log('Firebase Auth verified on server', {
        uid: params.uid,
        email: auth.currentUser!.email,
        projectId,
        authDomain: auth.app.options.authDomain,
        providerIds,
      });

      clearOAuthSessionFlags();
      await persistOnboardingAccountAfterAuth(params);
      const savedUser = await getUser(params.uid, false);
      if (savedUser && hydrateOnboardingChildrenFromUser(savedUser)) {
        const hydratedChildren = getOnboardingChildrenDetails();
        const hydratedTimes = getOnboardingChildrenScreenTime();
        if (hydratedChildren?.length) {
          setCount(hydratedChildren.length);
          setChildren(hydratedChildren);
          setScreenTimes(
            hydratedTimes?.length
              ? hydratedTimes
              : createScreenTimesFromChildren(hydratedChildren)
          );
        }
      }
      logger.log('Account setup complete', {
        uid: params.uid,
        projectId,
        authDomain: auth.app.options.authDomain,
      });
      if (params.oauthProvider) {
        goToSignupWelcome();
      } else {
        goToSignupIntro();
      }
    },
    [goToSignupIntro, goToSignupWelcome]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isOnboardingAccountCreated()) return;

    void (async () => {
      const auth = await getAuthInstance();
      if (!auth.currentUser || auth.currentUser.isAnonymous) {
        clearOnboardingAccountCreated();
        return;
      }
      setAccountCreated(true);
      const saved = readStoredFlowStep();
      if (saved === 'role') {
        return;
      }
      const targetStep =
        saved && isPostSignupStep(saved)
          ? saved
          : shouldShowOAuthSignupWelcome()
            ? ('signupWelcome' as const)
            : ('signupIntro' as const);
      if (targetStep === 'signupIntro' || targetStep === 'signupWelcome') {
        if (targetStep === 'signupIntro') {
          postSignupIntroNavigatedRef.current = true;
        }
      }
      setStep(targetStep);
    })();
  }, []);

  useEffect(() => {
    let active = true;

    (async () => {
      if (typeof window === 'undefined') return;
      if (!shouldAttemptOAuthRedirectRecovery()) {
        if (readOAuthPending()) {
          clearOAuthSessionFlags();
        }
        setOauthFinishing(null);
        return;
      }

      setOauthFinishing(readOAuthProvider());

      logger.log('OAuth recovery start');
      const outcome = await recoverOAuthRedirectSignIn();
      logger.log('OAuth recovery outcome', { status: outcome.status });
      if (!active || outcome.status === 'skipped') {
        if (active && outcome.status === 'skipped') {
          setOauthFinishing(null);
        }
        return;
      }

      if (outcome.status === 'error') {
        clearOAuthSessionFlags();
        setOauthFinishing(null);
        setStep('signupForm');
        setErrors({ _general: outcome.message });
        return;
      }

      if (!outcome.result.isNewUser) {
        clearOAuthSessionFlags();
        setOauthFinishing(null);
        createSession(outcome.result.user.uid);
        redirectToLoginForExistingAccount(
          router,
          getOAuthUserEmail(outcome.result.user)
        );
        return;
      }

      try {
        await finishAccountSetup({
          uid: outcome.result.user.uid,
          email: getOAuthUserEmail(outcome.result.user),
          displayName:
            outcome.result.displayName ||
            getOAuthUserDisplayName(outcome.result.user) ||
            undefined,
          termsAccepted: true,
          oauthProvider: readOAuthProvider(),
        });
      } catch (error) {
        logger.error('OAuth redirect persist failed:', error);
        setAccountCreated(false);
        setErrors({
          _general: getAuthErrorFromUnknown(error),
        });
        setStep('signupForm');
      } finally {
        if (active) setOauthFinishing(null);
      }
    })();

    return () => {
      active = false;
    };
  }, [finishAccountSetup, router]);

  useEffect(() => {
    if (step !== 'pickChild') return;
    setPickOptions(getSignupPickChildOptions());
    setSelectedChildIndex(0);
  }, [step]);

  useEffect(() => {
    if (step !== 'signupForm') return;
    setSignupScrollTop(0);
    signupScrollRef.current?.scrollTo(0, 0);
  }, [step]);

  useEffect(() => {
    if (step !== 'subscription') return;
    setSubscriptionPlan(null);
  }, [step]);

  const onChildLinkOpened = useCallback(() => {
    setChildLinkOpenedWaiting(true);
  }, []);

  const onMissionReady = useCallback(() => {
    if (stepRef.current === 'childInviteWaiting') {
      router.push('/game');
    }
  }, [router]);

  const parentWaitingStep = step === 'childInviteWaiting' ? step : null;

  const onInviteShared = useCallback(() => {
    const sessionStart = new Date().toISOString();
    setWaitingSessionStartedAt(sessionStart);
    void (async () => {
      const parentId = await getCurrentUserIdAsync();
      if (parentId) {
        try {
          await resetOnboardingChildProgress(parentId);
        } catch {
          // RTDB rules may block in some envs
        }
      }
      setChildLinkOpenedWaiting(false);
      setStep('childInviteWaiting');
    })();
  }, []);

  useParentChildProgress({
    enabled: parentWaitingStep !== null,
    parentStep: parentWaitingStep,
    waitingSessionStartedAt,
    onLinkOpened: onChildLinkOpened,
    onMissionReady,
  });

  useEffect(() => {
    if (step !== 'childInviteWaiting') return;
    void (async () => {
      const parentId = await getCurrentUserIdAsync();
      if (!parentId) return;
      try {
        const progress = await readOnboardingChildProgress(parentId);
        if (progress?.linkOpened) {
          setChildLinkOpenedWaiting(true);
        }
      } catch {
        // RTDB may be unavailable in some envs
      }
    })();
  }, [step, waitingSessionStartedAt]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const nextValue = type === 'checkbox' ? checked : value;
    setValues((prev) => ({
      ...prev,
      [name]: nextValue,
    }));

    if (name === 'firstName' || name === 'lastName') {
      const trimmed = String(nextValue).trim();
      setErrors((prev) => {
        const next = { ...prev };
        if (trimmed && !isHebrewChildName(trimmed)) {
          next[name] = ONBOARDING_HEBREW_ONLY_ERROR;
        } else {
          delete next[name];
        }
        return next;
      });
      return;
    }

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleTermsAcceptedChange = (accepted: boolean) => {
    setValues((prev) => ({ ...prev, termsAccepted: accepted }));
    if (accepted && errors.termsAccepted) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.termsAccepted;
        return next;
      });
    }
  };

  const handleOAuth = async (provider: 'google' | 'apple') => {
    if (isRestrictedOAuthEnvironment()) {
      logger.warn('OAuth blocked: restricted environment', { provider });
      setErrors({ _general: getRestrictedOAuthMessage() });
      return;
    }
    if (oauthPopupInFlightRef.current) return;

    setErrors({});
    setOauthDialogOpen(provider);
    oauthPopupInFlightRef.current = true;
    const useRedirect = prefersOAuthRedirect();
    logger.log('OAuth click', { provider, useRedirect });

    if (typeof window !== 'undefined') {
      sessionStorage.setItem(FLOW_STEP_STORAGE_KEY, 'signupForm');
      clearOAuthSessionFlags();
    }

    try {
      const result = await signInWithOAuth(provider, { useRedirect });

      if (result.ok && 'redirecting' in result) {
        logger.log('OAuth redirecting', { provider });
        setOauthDialogOpen(null);
        return;
      }

      if (!result.ok) {
        logger.warn('OAuth failed', {
          provider,
          code: result.errorCode,
          message: result.errorMessage,
        });
        clearOAuthSessionFlags();
        if (
          result.errorCode === 'auth/account-exists-with-different-credential' ||
          result.errorCode === 'auth/email-already-in-use'
        ) {
          redirectToLoginForExistingAccount(router, values.email.trim() || undefined);
          return;
        }
        setErrors({ _general: result.errorMessage });
        return;
      }

      if (!result.isNewUser) {
        logger.log('OAuth signup — existing account, redirecting to login', {
          provider,
          uid: result.user.uid,
        });
        clearOAuthSessionFlags();
        setOauthDialogOpen(null);
        createSession(result.user.uid);
        redirectToLoginForExistingAccount(router, getOAuthUserEmail(result.user));
        return;
      }

      logger.log('OAuth popup success', {
        provider,
        uid: result.user.uid,
        email: result.user.email,
      });
      clearOAuthSessionFlags();
      setOauthDialogOpen(null);
      setOauthFinishing(provider);
      await finishAccountSetup({
        uid: result.user.uid,
        email: getOAuthUserEmail(result.user),
        displayName:
          result.displayName ||
          getOAuthUserDisplayName(result.user) ||
          undefined,
        termsAccepted: values.termsAccepted,
        oauthProvider: provider,
      });
    } catch (error) {
      clearOAuthSessionFlags();
      logger.error('OAuth signup failed:', error);
      const code =
        typeof error === 'object' && error !== null && 'code' in error
          ? String((error as { code: string }).code)
          : '';
      if (
        code === 'auth/account-exists-with-different-credential' ||
        code === 'auth/email-already-in-use'
      ) {
        redirectToLoginForExistingAccount(router, values.email.trim() || undefined);
        return;
      }
      setErrors({ _general: getAuthErrorFromUnknown(error) });
    } finally {
      oauthPopupInFlightRef.current = false;
      setOauthDialogOpen(null);
      if (!readOAuthPending()) {
        setOauthFinishing(null);
      }
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
      const email = values.email.trim().toLowerCase();
      const alreadyExists = await checkAuthEmailExists(email);
      if (alreadyExists) {
        redirectToLoginForExistingAccount(router, email);
        return;
      }

      const displayName = [values.firstName.trim(), values.lastName.trim()]
        .filter(Boolean)
        .join(' ');
      const user = await signUp(
        email,
        values.password,
        displayName
      );

      await finishAccountSetup({
        uid: user.uid,
        email,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        termsAccepted: values.termsAccepted,
      });
    } catch (error) {
      logger.error('Email signup failed:', error);
      const message = getAuthErrorFromUnknown(error);
      if (message.includes('אימייל')) {
        redirectToLoginForExistingAccount(router, values.email.trim());
        return;
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
      const hebrewErrors = getChildrenHebrewNameErrors(children);
      if (Object.keys(hebrewErrors).length > 0) {
        setChildNameErrors(hebrewErrors);
        return;
      }
      if (!childrenDetailsComplete(children)) return;
      setChildNameErrors({});
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
    const picked = pickOptions[selectedChildIndex];
    if (picked?.name?.trim()) setBondingChildName(picked.name.trim());
    if (picked?.gender) setBondingChildGender(picked.gender);
    setStep('childInviteIntro');
  };

  const handleRemindLater = () => {
    openJoystieBondingCalendarReminder();
  };

  const handleBack = () => {
    if (accountCreated && step === 'signupForm') {
      return;
    }

    if (step === 'subscription') {
      setStep('onboardingComplete');
      return;
    }
    if (step === 'onboardingComplete') {
      setStep('parentPostGame');
      setParentPostGamePhase('onboardingComplete');
      return;
    }
    if (step === 'parentPostGame') {
      router.push('/game');
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
    if (step === 'signupWelcome') {
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
    if (step === 'role') {
      exitingToLandingRef.current = true;
      clearParentFlowSession();
      if (onBackToLanding) {
        flushSync(() => onBackToLanding());
      } else {
        router.replace('/onboarding');
      }
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
          ? 'v03-funnel-enter-reveal-4'
          : 'v03-funnel-enter-reveal-4';

  const showBackButton =
    !(accountCreated && step === 'signupForm') &&
    !(accountCreated && step === 'signupWelcome') &&
    !(accountCreated && step === 'signupIntro' && journeyStage === 0);

  const showParentFunnelGrid = PARENT_FUNNEL_GRID_STEPS.has(step);

  /** After Google/Apple auth returns — waiting layout until account persist finishes. */
  if (oauthFinishing !== null && !accountCreated && !isRegistering) {
    return (
      <>
        <OnboardingGrid />
        <OnboardingWaitingScreenShell zIndex={20} ariaBusy>
          <OnboardingWaitingCenterContent
            headline="מתחברים..."
            ariaLabel="מתחברים לחשבון"
          />
        </OnboardingWaitingScreenShell>
      </>
    );
  }

  if (step === 'subscription') {
    const handleSubscriptionClose = () => {
      exitingToLandingRef.current = true;
      clearParentFlowSession();
      if (onBackToLanding) {
        flushSync(() => onBackToLanding());
      } else {
        router.replace('/onboarding');
      }
    };

    return (
      <>
        {showBackButton && <OnboardingBackButton onClick={handleBack} />}
        <div
          key={step}
          className="v03-funnel-screen absolute inset-0 z-[10] overflow-x-hidden overflow-y-visible"
        >
          <ParentSubscriptionStep
            selectedPlan={subscriptionPlan}
            onPlanChange={setSubscriptionPlan}
            onClose={handleSubscriptionClose}
          />
        </div>
      </>
    );
  }

  if (step === 'parentPostGame') {
    const parentGender = parentRoleToGender(getOnboardingParentRole() ?? 'father');
    return (
      <ParentGamePostWinFlow
        phase={parentPostGamePhase}
        onPhaseChange={setParentPostGamePhase}
        room={null}
        roomId={null}
        childName={selectedChildName}
        childGender={selectedChildGender}
        parentName={parentCourtLabel(parentGender)}
        parentGender={parentGender}
        onArenaPointer={() => {}}
        onConfirmReady={() => {}}
        onRetry={() => {}}
        onFlowComplete={() => setStep('subscription')}
      />
    );
  }

  if (step === 'onboardingComplete') {
    return (
      <>
        {showBackButton && (
          <OnboardingBackButton tone="light" onClick={handleBack} />
        )}
        <OnboardingFunnelStepSlot stepKey={step}>
          <ParentOnboardingCompletionStep />
        </OnboardingFunnelStepSlot>
        <OnboardingBlurFooter
          blur={false}
          onClick={() => setStep('subscription')}
        >
          המשך
        </OnboardingBlurFooter>
      </>
    );
  }

  if (step === 'childInviteWaiting') {
    return (
      <>
        {showParentFunnelGrid && <OnboardingGrid />}
        <OnboardingWaitingScreenShell
          showBackButton={
            showBackButton ? <OnboardingBackButton onClick={handleBack} /> : undefined
          }
        >
          <SignupChildInviteWaitingStep
            childName={selectedChildName}
            childGender={selectedChildGender}
            variant={inviteWaitingVariant}
          />
        </OnboardingWaitingScreenShell>
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
            childGender={selectedChildGender}
            onShared={onInviteShared}
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
            onRemindLater={handleRemindLater}
          />
        </div>
      </>
    );
  }

  if (step === 'pickChild') {
    return (
      <>
        <OnboardingMintGlow />
        <OnboardingFunnelScrollBody scrollRef={funnelScrollRef}>
          {showBackButton && (
            <OnboardingBackButton scrollWithContent onClick={handleBack} />
          )}
          <PickFirstChildStep
            options={pickOptions}
            selectedIndex={selectedChildIndex}
            onSelectIndex={setSelectedChildIndex}
          />
        </OnboardingFunnelScrollBody>
        <OnboardingBlurFooter
          blur={funnelScrollOverflows}
          onClick={handlePickChildContinue}
        >
          המשך
        </OnboardingBlurFooter>
      </>
    );
  }

  if (step === 'signupWelcome') {
    return (
      <>
        <OnboardingMintGlow />
        <div
          key={step}
          className="v03-funnel-screen absolute inset-x-0 top-0 z-[10] overflow-visible"
          style={{ height: V03_SCREEN_HEIGHT }}
        >
          <SignupHeroFrame scrollTop={0} />
          <SignupOAuthTermsSheet
            termsAccepted={oauthTermsAccepted}
            onTermsAcceptedChange={handleOAuthTermsAcceptedChange}
            termsError={oauthTermsError}
            onContinue={handleWelcomeContinue}
          />
        </div>
      </>
    );
  }

  if (step === 'signupIntro') {
    return (
      <>
        {showParentFunnelGrid && <OnboardingGrid />}
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
        <OnboardingBlurFooter blur={false} onClick={handleIntroContinue}>
          המשך
        </OnboardingBlurFooter>
      </>
    );
  }

  if (step === 'signupForm') {
    return (
      <>
        <OnboardingMintGlow />
        <div
          key={step}
          dir="rtl"
          className="v03-funnel-screen absolute inset-x-0 top-0 z-[10] overflow-visible"
          style={{ bottom: ONBOARDING_BLUR_FOOTER_HEIGHT_PX }}
        >
          <div
            ref={signupScrollRef}
            className="absolute inset-0 isolate overflow-y-auto v03-scroll-hidden"
            onScroll={() =>
              setSignupScrollTop(signupScrollRef.current?.scrollTop ?? 0)
            }
          >
            {showBackButton && (
              <OnboardingBackButton scrollWithContent onClick={handleBack} />
            )}
            <SignupHeroFrame scrollTop={signupScrollTop} />
            <div
              className="relative z-[20] mx-auto flex w-v03-content flex-col items-stretch gap-5 pb-8"
              style={{ marginTop: SIGNUP_FORM_CONTENT_MARGIN_TOP_PX }}
            >
              <OnboardingSignupForm
                values={values}
                errors={errors}
                onChange={handleChange}
                onTermsAcceptedChange={handleTermsAcceptedChange}
                onOAuthGoogle={() => handleOAuth('google')}
                onOAuthApple={() => handleOAuth('apple')}
                oauthDisabled={isRegistering}
                oauthPickerOpen={oauthDialogOpen}
              />
            </div>
          </div>
        </div>
        <OnboardingAccentFooter
          type="button"
          onClick={handleRegister}
          disabled={isRegistering || oauthDialogOpen !== null}
          showLoginLink
          blur={signupScrollOverflows}
        >
          {isRegistering ? 'נרשמים...' : 'הרשמה'}
        </OnboardingAccentFooter>
      </>
    );
  }

  if (isRevealStep(step)) {
    return (
      <>
        <OnboardingRevealBleedBackground />
        <OnboardingBackButton tone="light" onClick={handleBack} />
        <OnboardingFunnelStepSlot
          stepKey={step}
          innerClassName={
            step === 'revealIntro' ? 'v03-reveal-intro-scope' : ''
          }
        >
          <OnboardingRevealStepContent step={step as RevealFlowStep} />
        </OnboardingFunnelStepSlot>
        <OnboardingBlurFooter
          key={step}
          blur={false}
          className={revealFooterFadeClass}
          onClick={handleRevealContinue}
        >
          המשך
        </OnboardingBlurFooter>
      </>
    );
  }

  const scrollableParentStep = step === 'details' || step === 'screenTime';
  const useBlurFooter = scrollableParentStep;
  const showChrome = step !== 'calculating';

  const parentStepContent = (
    <>
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
        <ChildrenDetailsStep
          children={children}
          nameErrors={childNameErrors}
          onChildrenChange={(next) => {
            setChildren(next);
            setChildNameErrors(getChildrenHebrewNameErrors(next));
          }}
        />
      )}

      {step === 'screenTime' && (
        <ChildrenScreenTimeStep
          children={children}
          entries={screenTimes}
          onEntriesChange={setScreenTimes}
        />
      )}

      {step === 'calculating' && (
        <ScreenTimeCalculatingStep onComplete={() => setStep('revealIntro')} />
      )}
    </>
  );

  return (
    <>
      {showParentFunnelGrid && <OnboardingGrid />}
      <OnboardingMintGlow />

      {scrollableParentStep ? (
        <OnboardingFunnelScrollBody scrollRef={funnelScrollRef}>
          {showChrome && (
            <OnboardingBackButton scrollWithContent onClick={handleBack} />
          )}
          {parentStepContent}
        </OnboardingFunnelScrollBody>
      ) : (
        <>
          <OnboardingFunnelStepSlot stepKey={step}>
            {parentStepContent}
          </OnboardingFunnelStepSlot>
          {showChrome && <OnboardingBackButton onClick={handleBack} />}
        </>
      )}

      {showChrome &&
        (useBlurFooter ? (
          <OnboardingBlurFooter
            blur={funnelScrollOverflows}
            disabled={step === 'details' && !childrenDetailsComplete(children)}
            onClick={handleParentContinue}
          >
            המשך
          </OnboardingBlurFooter>
        ) : (
          <OnboardingFooterCta
            variant="secondary"
            layout={step === 'role' ? 'landing' : 'stacked'}
            disabled={step === 'role' && !role}
            showLoginLink={step === 'role'}
            onClick={handleParentContinue}
          >
            המשך
          </OnboardingFooterCta>
        ))}
    </>
  );
}
