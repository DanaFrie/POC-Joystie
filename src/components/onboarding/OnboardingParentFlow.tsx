'use client';

import { useRouter } from 'next/navigation';
import { useParentChildProgress } from '@/hooks/useParentChildProgress';
import { usePairingResume } from '@/hooks/usePairingResume';
import { flushSync } from 'react-dom';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SingleChildSetupStep } from '@/components/onboarding/children-setup/SingleChildSetupStep';
import { ScreenTimeCalculatingStep } from '@/components/onboarding/screen-time/ScreenTimeCalculatingStep';
import { OnboardingBackButton } from '@/components/onboarding/OnboardingBackButton';
import { useFunnelProportionalTopPx } from '@/components/ui/FunnelViewportContext';
import { OnboardingFunnelStepSlot } from '@/components/onboarding/OnboardingFunnelStepSlot';
import { OnboardingGrid } from '@/components/onboarding/OnboardingGrid';
import { OnboardingMintGridBackdrop } from '@/components/onboarding/OnboardingMintGridBackdrop';
import { OnboardingRevealBleedBackground } from '@/components/onboarding/OnboardingRevealBleedBackground';
import nextDynamic from 'next/dynamic';
import { FunnelRouteLoading } from '@/components/onboarding/FunnelRouteLoading';
import { ParentOnboardingCompletionStep } from '@/components/onboarding/parent/ParentOnboardingCompletionStep';
import type { ParentPostGamePhase } from '@/components/onboarding/parent/ParentGamePostWinFlow';
import { ParentWelcomeWhatAwaitsStep } from '@/components/onboarding/parent/ParentWelcomeWhatAwaitsStep';
import { ParentRoleStep } from '@/components/onboarding/parent-role/ParentRoleStep';
import {
  OnboardingRevealStepContent,
  type RevealFlowStep,
} from '@/components/onboarding/OnboardingRevealStepContent';
import { BAD_NEWS_FOOTER_REVEAL_MS } from '@/components/onboarding/bad-news/OnboardingBadNewsStep';
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
import { SignupIntroStep } from '@/components/onboarding/signup/SignupIntroStep';
import { SignupOAuthTermsSheet } from '@/components/onboarding/signup/SignupOAuthTermsSheet';

const ParentSubscriptionStep = nextDynamic(
  () =>
    import('@/components/onboarding/parent/ParentSubscriptionStep').then((m) => ({
      default: m.ParentSubscriptionStep,
    })),
  { loading: () => <FunnelRouteLoading />, ssr: false }
);

const ParentGamePostWinFlow = nextDynamic(
  () =>
    import('@/components/onboarding/parent/ParentGamePostWinFlow').then((m) => ({
      default: m.ParentGamePostWinFlow,
    })),
  { loading: () => <FunnelRouteLoading />, ssr: false }
);
import { getBondingChildName, getBondingChildGender, getSelectedFirstChildGender, getSelectedFirstChildName, setBondingChildGender, setBondingChildName, clearBondingChildUrl } from '@/lib/onboarding/bondingInvite';
import { clearOnboardingBondingInviteId } from '@/lib/onboarding/bondingShare';
import { ONBOARDING_PARENT_GAME_WON_KEY } from '@/constants/onboarding-game';
import { SIGNUP_CHILD_INVITE_WAITING_STALL_MS } from '@/constants/signup-child-invite-layout';
import type { OnboardingSubscriptionPlan } from '@/constants/onboarding-subscription-layout';
import {
  SIGNUP_FORM_SCROLL_PAD_TOP_PX,
} from '@/constants/signup-layout';
import {
  SIGNUP_JOURNEY_STAGE_COUNT,
  type SignupJourneyStageIndex,
} from '@/constants/signup-journey';
import { AnalyticsEvents, trackPreSignupCta } from '@/utils/analytics';
import { setOnboardingChildrenPhoneCount } from '@/lib/onboarding/childrenPhoneCount';
import {
  childrenDetailsComplete,
  createEmptyChildren,
  getChildrenHebrewNameErrors,
  getOnboardingChildrenDetails,
  isHebrewChildName,
  ONBOARDING_CHILD_DEFAULT_AGE,
  ONBOARDING_HEBREW_ONLY_ERROR,
  setOnboardingChildrenDetails,
  type OnboardingChildDraft,
} from '@/lib/onboarding/childrenDetails';
import {
  createScreenTimesFromChildren,
  DEFAULT_ONBOARDING_SCREEN_TIME_HOURS,
  getOnboardingChildrenScreenTime,
  setOnboardingChildrenScreenTime,
  type OnboardingChildScreenTime,
} from '@/lib/onboarding/childrenScreenTime';
import { setOnboardingFirstChildIndex } from '@/lib/onboarding/pickFirstChild';
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
  syncFunnelKidsAgesToUser,
} from '@/lib/onboarding/persistOnboardingAccount';
import {
  clearOAuthSessionFlags,
  clearOAuthTermsGateProvider,
  isFreshOAuthPending,
  isOAuthRedirectRecoverable,
  markOAuthTermsGateProvider,
  markOnboardingTermsAccepted,
  purgeStaleOAuthSessionFlags,
  readOAuthPending,
  readOAuthProvider,
  readOAuthTermsGateProvider,
  readOnboardingTermsAccepted,
} from '@/lib/onboarding/oauthSession';
import { recoverOAuthRedirectSignIn } from '@/lib/onboarding/oauthRedirectRecovery';
import { hydrateSessionChildrenFromAccount } from '@/lib/onboarding/hydrateChildrenFromUser';
import { getUser } from '@/lib/api/users';
import {
  finishAuthenticatedUserNavigation,
  getLoginPath,
  redirectToLoginForExistingAccount,
} from '@/lib/auth/postLoginNavigation';
import { resolveSignupEmailAccountStatus, isRegisteredJoystieAccount } from '@/lib/auth/signupAccountStatus';
import { validateOnboardingSignupForm } from '@/lib/onboarding/validateSignupForm';
import { getAuthInstance } from '@/lib/firebase';
import { signUp, signIn, getCurrentUserId as getCurrentUserIdAsync } from '@/utils/auth';
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
  IS_APPLE_OAUTH_ENABLED,
} from '@/utils/auth-oauth';
import { getAuthErrorFromUnknown } from '@/utils/auth-errors';
import { finishParentOnboardingAndGoToDashboard } from '@/lib/onboarding/finishParentOnboarding';
import { preloadSubscriptionHero } from '@/lib/onboarding/preloadSubscriptionHero';
import {
  FLOW_STEP_STORAGE_KEY,
  LANDING_ACTIVE_KEY,
  clearInviteWaitingTimedOut,
  clearOAuthSignupWelcomePending,
  clearParentFlowSession,
  consumeFreshParentFlowStart,
  markInviteWaitingTimedOut,
  markOAuthSignupWelcomePending,
  shouldShowOAuthSignupWelcome,
} from '@/lib/onboarding/parentFlowSession';
import { ONBOARDING_RESUME_KIND_KEY } from '@/lib/auth/userOnboardingStatus';
import { createContextLogger } from '@/utils/logger';
import {
  FunnelStepFooter,
  FunnelStepForeground,
  FunnelStepMain,
  FunnelStepRoot,
  FunnelStepSection,
} from '@/components/ui/funnel-layout';
import {
  FUNNEL_FOREGROUND_PAD_BOTTOM_PX,
  FUNNEL_FOOTER_HOME_INDICATOR_SPACER_PX,
} from '@/constants/funnel-vertical-layout';

const logger = createContextLogger('OnboardingParentFlow');

function shouldAttemptOAuthRedirectRecovery(): boolean {
  return (
    isOAuthRedirectRecoverable() &&
    (isFreshOAuthPending() || isLikelyOAuthRedirectReturn())
  );
}

type ParentFlowStep =
  | 'role'
  | 'whatAwaits'
  | 'childSetup'
  | 'calculating'
  | 'revealIntro'
  | 'badNews'
  | 'goodNews'
  | 'signupIntro'
  | 'signupForm'
  | 'signupWelcome'
  | 'childInviteIntro'
  | 'childInviteShare'
  | 'childInviteWaiting'
  | 'parentPostGame'
  | 'onboardingComplete'
  | 'subscription';

const POST_SIGNUP_STEPS: ParentFlowStep[] = [
  'signupWelcome',
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
  // Legacy multi-child / pick / real-data steps → new single-child flow.
  if (
    raw === 'phoneCount' ||
    raw === 'details' ||
    raw === 'screenTime' ||
    raw === 'childSetup'
  ) {
    return 'childSetup';
  }
  if (raw === 'realData') return 'goodNews';
  if (raw === 'pickChild') return 'childInviteIntro';
  return raw as ParentFlowStep;
}

function readStoredFlowStep(): ParentFlowStep | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(FLOW_STEP_STORAGE_KEY);
  return normalizeStoredFlowStep(raw);
}

/**
 * `router.push('/onboarding')` is a no-op when already on this page — React state
 * (e.g. signupForm) would stick. Apply the step that post-login navigation wrote.
 */
function resolveStoredResumeStep(): ParentFlowStep {
  const saved = readStoredFlowStep();
  if (saved && isValidFlowStep(saved) && saved !== 'signupForm' && saved !== 'role') {
    return saved;
  }
  if (typeof window !== 'undefined' && sessionStorage.getItem(LANDING_ACTIVE_KEY) === '1') {
    return 'role';
  }
  return 'signupIntro';
}

const REVEAL_STEPS: ParentFlowStep[] = ['revealIntro', 'badNews', 'goodNews'];

const ALL_FLOW_STEPS: ParentFlowStep[] = [
  'role',
  'whatAwaits',
  'childSetup',
  'calculating',
  ...REVEAL_STEPS,
  'signupIntro',
  'signupForm',
  ...POST_SIGNUP_STEPS,
];

function isValidFlowStep(value: string | null): value is ParentFlowStep {
  return value != null && ALL_FLOW_STEPS.includes(value as ParentFlowStep);
}

const KIDS_COLLECTION_STEPS: ParentFlowStep[] = [
  'role',
  'whatAwaits',
  'childSetup',
  'calculating',
  ...REVEAL_STEPS,
];

function isKidsCollectionStep(step: ParentFlowStep) {
  return KIDS_COLLECTION_STEPS.includes(step);
}

function isV02LegacyKidsResume(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(ONBOARDING_RESUME_KIND_KEY) === 'v02_legacy';
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
    // v0.2 login starts kids collection — do not restore a leftover pick-child/share step.
    if (saved && isPostSignupStep(saved) && !isV02LegacyKidsResume()) return saved;
    // Login as v02_legacy: collect kidsAges before post-signup carousel.
    if (isV02LegacyKidsResume() && saved && isValidFlowStep(saved) && isKidsCollectionStep(saved)) {
      return saved;
    }
    if (isV02LegacyKidsResume()) return 'childSetup';
    if (shouldShowOAuthSignupWelcome()) return 'signupWelcome';
    return 'childInviteIntro';
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
  const signupFormPadTopPx = useFunnelProportionalTopPx(SIGNUP_FORM_SCROLL_PAD_TOP_PX);
  const [oauthDialogOpen, setOauthDialogOpen] = useState<'google' | 'apple' | null>(
    null
  );
  const [oauthTermsGateProvider, setOauthTermsGateProvider] = useState<
    'google' | 'apple' | null
  >(() => (typeof window === 'undefined' ? null : readOAuthTermsGateProvider()));
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
  const [children, setChildren] = useState<OnboardingChildDraft[]>(() =>
    createEmptyChildren(1)
  );
  const [screenTimes, setScreenTimes] = useState<OnboardingChildScreenTime[]>(
    () => [
      {
        name: '',
        hours: DEFAULT_ONBOARDING_SCREEN_TIME_HOURS,
      },
    ]
  );
  const [journeyStage, setJourneyStage] = useState<SignupJourneyStageIndex>(0);
  const [badNewsFooterVisible, setBadNewsFooterVisible] = useState(false);
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
  const [waitingSessionStartedAt, setWaitingSessionStartedAt] = useState<string | null>(
    null
  );
  const [parentPostGamePhase, setParentPostGamePhase] =
    useState<ParentPostGamePhase>('postWinCoop');
  const [parentPostGameParentId, setParentPostGameParentId] = useState<string | null>(null);

  useEffect(() => {
    void getCurrentUserIdAsync().then((uid) => {
      if (uid) setParentPostGameParentId(uid);
    });
  }, []);

  const applyPairingResumeStep = useCallback(
    (next: 'childInviteWaiting' | 'parentPostGame') => {
      setAccountCreated(true);
      setStep(next);
    },
    []
  );

  usePairingResume({
    role: 'parent',
    parentId: parentPostGameParentId,
    currentPath: '/onboarding',
    currentStep: step,
    enabled: accountCreated && oauthFinishing === null,
    onStep: applyPairingResumeStep,
  });

  const selectedChildName = useMemo(() => {
    const fromDraft = children[0]?.name?.trim();
    if (fromDraft) return fromDraft;
    return getBondingChildName() || getSelectedFirstChildName();
  }, [children]);
  const selectedChildGender = useMemo(() => {
    const fromDraft = children[0]?.gender;
    if (fromDraft) return fromDraft;
    return getBondingChildGender() ?? getSelectedFirstChildGender();
  }, [children]);
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
        if (!(await hydrateSessionChildrenFromAccount(user))) return;

        const hydratedChildren = getOnboardingChildrenDetails();
        const hydratedTimes = getOnboardingChildrenScreenTime();
        if (!hydratedChildren?.length || cancelled) return;

        setChildren(hydratedChildren.slice(0, 1));
        setScreenTimes(
          (hydratedTimes?.length
            ? hydratedTimes
            : createScreenTimesFromChildren(hydratedChildren)
          ).slice(0, 1)
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

  /** After account create — skip re-showing signupIntro (already before form). */
  const goToChildInviteAfterAccount = useCallback(() => {
    setAccountCreated(true);
    clearOAuthSignupWelcomePending();
    setOnboardingFirstChildIndex(0);
    const draft = getOnboardingChildrenDetails()?.[0];
    clearBondingChildUrl();
    clearOnboardingBondingInviteId();
    if (draft?.name?.trim()) setBondingChildName(draft.name.trim());
    if (draft?.gender) setBondingChildGender(draft.gender);
    setStep('childInviteIntro');
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(FLOW_STEP_STORAGE_KEY, 'childInviteIntro');
    }
  }, []);

  /** After login routing while already on `/onboarding` (same-route push is a no-op). */
  const applySameRouteOnboardingResume = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (!window.location.pathname.startsWith('/onboarding')) return;

    const hydratedChildren = getOnboardingChildrenDetails();
    const hydratedTimes = getOnboardingChildrenScreenTime();
    if (hydratedChildren?.length) {
      setChildren(hydratedChildren.slice(0, 1));
      setScreenTimes(
        (hydratedTimes?.length
          ? hydratedTimes
          : createScreenTimesFromChildren(hydratedChildren)
        ).slice(0, 1)
      );
    }

    const next = resolveStoredResumeStep();
    setAccountCreated(true);
    if (next === 'signupIntro') {
      postSignupIntroNavigatedRef.current = true;
      clearOAuthSignupWelcomePending();
      setJourneyStage(0);
    }
    logger.log('Same-route onboarding resume', { next });
    setStep(next);
  }, []);

  const handleWelcomeContinue = useCallback(() => {
    if (!oauthTermsAccepted) {
      setOauthTermsError('אנא אשר את תנאי השימוש');
      return;
    }
    setOauthTermsError('');
    markOnboardingTermsAccepted();
    goToChildInviteAfterAccount();
  }, [goToChildInviteAfterAccount, oauthTermsAccepted]);

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
            // Terms already accepted before OAuth popup when gate was used.
            if (params.termsAccepted || readOnboardingTermsAccepted()) {
              goToChildInviteAfterAccount();
            } else {
              goToSignupWelcome();
            }
          } else {
            goToChildInviteAfterAccount();
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
      // Apple often hydrates providerData a tick late — reload before rejecting.
      if (
        params.oauthProvider &&
        (!userHasOAuthProvider(auth.currentUser!) ||
          auth.currentUser!.providerData.length === 0)
      ) {
        try {
          await auth.currentUser!.reload();
        } catch (reloadError) {
          logger.warn('OAuth provider reload failed', reloadError);
        }
      }
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
      if (savedUser && (await hydrateSessionChildrenFromAccount(savedUser))) {
        const hydratedChildren = getOnboardingChildrenDetails();
        const hydratedTimes = getOnboardingChildrenScreenTime();
        if (hydratedChildren?.length) {
          setChildren(hydratedChildren.slice(0, 1));
          setScreenTimes(
            (hydratedTimes?.length
              ? hydratedTimes
              : createScreenTimesFromChildren(hydratedChildren)
            ).slice(0, 1)
          );
        }
      }
      logger.log('Account setup complete', {
        uid: params.uid,
        projectId,
        authDomain: auth.app.options.authDomain,
      });
      if (params.oauthProvider) {
        if (params.termsAccepted || readOnboardingTermsAccepted()) {
          goToChildInviteAfterAccount();
        } else {
          goToSignupWelcome();
        }
      } else {
        goToChildInviteAfterAccount();
      }
    },
    [goToChildInviteAfterAccount, goToSignupWelcome]
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
      // v02_legacy login resume — stay on kids collection steps.
      if (
        isV02LegacyKidsResume() &&
        saved &&
        isValidFlowStep(saved) &&
        isKidsCollectionStep(saved)
      ) {
        setStep(saved);
        return;
      }
      const targetStep =
        saved && isPostSignupStep(saved) && !isV02LegacyKidsResume()
          ? saved
          : shouldShowOAuthSignupWelcome()
            ? ('signupWelcome' as const)
            : isV02LegacyKidsResume()
              ? ('childSetup' as const)
              : ('childInviteIntro' as const);
      if (targetStep === 'signupWelcome') {
        // keep welcome path
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
        setErrors({ _oauth: outcome.message });
        return;
      }

      if (!outcome.result.isNewUser) {
        clearOAuthSessionFlags();
        setOauthFinishing(null);
        try {
          const registered = await isRegisteredJoystieAccount(outcome.result.user.uid);
          if (registered) {
            const kind = await finishAuthenticatedUserNavigation(
              outcome.result.user.uid,
              router,
              { source: 'signup_existing' }
            );
            if (kind !== 'complete') {
              applySameRouteOnboardingResume();
            }
            return;
          }
          // Auth stub / incomplete Apple-Google retry — complete Joystie signup evidence.
          setOauthFinishing(readOAuthProvider());
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
          logger.error('OAuth existing-user routing failed:', error);
          setErrors({
            _oauth: getAuthErrorFromUnknown(error),
          });
          setStep('signupForm');
        } finally {
          if (active) setOauthFinishing(null);
        }
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
          _oauth: getAuthErrorFromUnknown(error),
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
    if (step !== 'signupForm') return;
    signupScrollRef.current?.scrollTo(0, 0);
  }, [step]);

  useEffect(() => {
    if (step !== 'subscription') return;
    setSubscriptionPlan(null);
  }, [step]);

  useEffect(() => {
    if (
      step === 'parentPostGame' ||
      step === 'onboardingComplete' ||
      step === 'subscription'
    ) {
      preloadSubscriptionHero();
      void import('@/components/onboarding/parent/ParentSubscriptionStep');
    }
  }, [step]);

  // Start waiting-session clock when invite is shown — before WhatsApp — so child
  // milestones after prepareBondingInvite are not treated as stale.
  useEffect(() => {
    if (step !== 'childInviteShare') return;
    setWaitingSessionStartedAt(new Date().toISOString());
  }, [step]);

  const onMissionReady = useCallback(() => {
    if (
      stepRef.current === 'childInviteWaiting' ||
      stepRef.current === 'childInviteShare'
    ) {
      clearInviteWaitingTimedOut();
      router.push('/game');
    }
  }, [router]);

  const onInviteShared = useCallback(() => {
    if (stepRef.current === 'childInviteWaiting') return;
    clearInviteWaitingTimedOut();
    setStep('childInviteWaiting');
  }, []);

  const parentProgressStep =
    step === 'childInviteWaiting' || step === 'childInviteShare' ? step : null;

  const { inviteWaitingVariant } = useParentChildProgress({
    enabled: parentProgressStep !== null,
    parentStep: parentProgressStep,
    waitingSessionStartedAt,
    onMissionReady,
    onLinkOpened: onInviteShared,
  });

  useEffect(() => {
    if (step !== 'childInviteWaiting') return;
    const id = window.setTimeout(() => {
      markInviteWaitingTimedOut();
      setStep('childInviteShare');
    }, SIGNUP_CHILD_INVITE_WAITING_STALL_MS);
    return () => window.clearTimeout(id);
  }, [step, inviteWaitingVariant]);

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

  const runOAuthSignIn = async (provider: 'google' | 'apple') => {
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
          redirectToLoginForExistingAccount(
            router,
            values.email.trim() || undefined,
            result.errorCode === 'auth/account-exists-with-different-credential'
              ? { reason: 'password_provider' }
              : { reason: 'resume' }
          );
          return;
        }
        setErrors({ _oauth: result.errorMessage });
        return;
      }

      if (!result.isNewUser) {
        logger.log('OAuth signup — existing Auth user', {
          provider,
          uid: result.user.uid,
        });
        clearOAuthSessionFlags();
        setOauthDialogOpen(null);
        setOauthFinishing(provider);
        try {
          const registered = await isRegisteredJoystieAccount(result.user.uid);
          if (registered) {
            const kind = await finishAuthenticatedUserNavigation(result.user.uid, router, {
              source: 'signup_existing',
            });
            if (kind !== 'complete') {
              applySameRouteOnboardingResume();
            }
            return;
          }
          // Same Apple/Google Auth uid as a prior incomplete attempt — persist signup.
          await finishAccountSetup({
            uid: result.user.uid,
            email: getOAuthUserEmail(result.user),
            displayName:
              result.displayName ||
              getOAuthUserDisplayName(result.user) ||
              undefined,
            termsAccepted: true,
            oauthProvider: provider,
          });
        } catch (error) {
          logger.error('OAuth existing-user routing failed:', error);
          setErrors({ _oauth: getAuthErrorFromUnknown(error) });
        } finally {
          setOauthFinishing(null);
        }
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
        termsAccepted: true,
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
        redirectToLoginForExistingAccount(
          router,
          values.email.trim() || undefined,
          code === 'auth/account-exists-with-different-credential'
            ? { reason: 'password_provider' }
            : { reason: 'resume' }
        );
        return;
      }
      setErrors({ _oauth: getAuthErrorFromUnknown(error) });
    } finally {
      oauthPopupInFlightRef.current = false;
      setOauthDialogOpen(null);
      if (!readOAuthPending()) {
        setOauthFinishing(null);
      }
    }
  };

  const handleOAuthTermsGateContinue = () => {
    if (!oauthTermsAccepted) {
      setOauthTermsError('אנא אשר את תנאי השימוש');
      return;
    }
    const provider = oauthTermsGateProvider;
    if (!provider) return;

    setOauthTermsError('');
    markOnboardingTermsAccepted();
    setValues((prev) => ({ ...prev, termsAccepted: true }));
    clearOAuthTermsGateProvider();
    setOauthTermsGateProvider(null);
    void runOAuthSignIn(provider);
  };

  /** Open terms sheet first; Google/Apple popup only after consent. */
  const handleOAuth = async (provider: 'google' | 'apple') => {
    if (provider === 'apple' && !IS_APPLE_OAUTH_ENABLED) {
      return;
    }
    if (isRestrictedOAuthEnvironment()) {
      logger.warn('OAuth blocked: restricted environment', { provider });
      setErrors({ _oauth: getRestrictedOAuthMessage() });
      return;
    }
    setErrors({});
    setOauthTermsAccepted(false);
    setOauthTermsError('');
    markOAuthTermsGateProvider(provider);
    setOauthTermsGateProvider(provider);
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
      const accountStatus = await resolveSignupEmailAccountStatus(email);
      if (accountStatus === 'incomplete' || accountStatus === 'legacy') {
        redirectToLoginForExistingAccount(router, email);
        return;
      }
      if (accountStatus === 'complete') {
        try {
          const existingUser = await signIn(email, values.password);
          const kind = await finishAuthenticatedUserNavigation(existingUser.uid, router, {
            source: 'signup_existing',
          });
          if (kind !== 'complete') {
            applySameRouteOnboardingResume();
          }
        } catch {
          router.push(getLoginPath({ email }));
        }
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

  const bindSingleChildForInvite = useCallback(() => {
    setOnboardingFirstChildIndex(0);
    const draft = children[0];
    clearBondingChildUrl();
    clearOnboardingBondingInviteId();
    if (draft?.name?.trim()) setBondingChildName(draft.name.trim());
    if (draft?.gender) setBondingChildGender(draft.gender);
  }, [children]);

  const handleParentContinue = () => {
    if (step === 'role') {
      if (!role) return;
      setOnboardingParentRole(role);
      trackPreSignupCta(AnalyticsEvents.PRE_SIGNUP_ROLE, { parent_role: role });
      setStep('whatAwaits');
      return;
    }
    if (step === 'whatAwaits') {
      trackPreSignupCta(AnalyticsEvents.PRE_SIGNUP_WHAT_AWAITS);
      setStep('childSetup');
      return;
    }
    if (step === 'childSetup') {
      const hebrewErrors = getChildrenHebrewNameErrors(children);
      if (Object.keys(hebrewErrors).length > 0) {
        setChildNameErrors(hebrewErrors);
        return;
      }
      if (!childrenDetailsComplete(children)) return;
      setChildNameErrors({});
      const single = children.slice(0, 1);
      const hours = screenTimes[0]?.hours ?? DEFAULT_ONBOARDING_SCREEN_TIME_HOURS;
      const times: OnboardingChildScreenTime[] = [
        { name: single[0]?.name.trim() ?? '', hours },
      ];
      setOnboardingChildrenPhoneCount(1);
      setOnboardingChildrenDetails(single);
      setOnboardingFirstChildIndex(0);
      setChildren(single);
      setScreenTimes(times);
      setOnboardingChildrenScreenTime(times);
      trackPreSignupCta(AnalyticsEvents.PRE_SIGNUP_CHILD_SETUP, {
        child_gender: single[0]?.gender ?? 'boy',
        child_age: single[0]?.age ?? ONBOARDING_CHILD_DEFAULT_AGE,
        screen_time_hours: hours,
      });
      setStep('calculating');
    }
  };

  const handleRevealContinue = () => {
    if (step === 'revealIntro') {
      trackPreSignupCta(AnalyticsEvents.PRE_SIGNUP_REVEAL_INTRO);
      setStep('badNews');
      return;
    }
    if (step === 'badNews') {
      trackPreSignupCta(AnalyticsEvents.PRE_SIGNUP_BAD_NEWS);
      setStep('goodNews');
      return;
    }
    if (step === 'goodNews') {
      trackPreSignupCta(AnalyticsEvents.PRE_SIGNUP_GOOD_NEWS);
      // Already authenticated — sync kids then invite (signupIntro runs before form for guests).
      if (accountCreated) {
        void (async () => {
          try {
            const auth = await getAuthInstance();
            const uid = auth.currentUser?.uid;
            if (uid) await syncFunnelKidsAgesToUser(uid);
          } catch (error) {
            logger.warn('Could not sync kidsAges after reveal', error);
          }
          bindSingleChildForInvite();
          setStep('childInviteIntro');
        })();
        return;
      }
      setJourneyStage(0);
      setStep('signupIntro');
      return;
    }
  };

  const handleIntroContinue = () => {
    if (journeyStage < SIGNUP_JOURNEY_STAGE_COUNT - 1) {
      setJourneyStage((s) => (s + 1) as SignupJourneyStageIndex);
      return;
    }
    trackPreSignupCta(AnalyticsEvents.PRE_SIGNUP_SIGNUP_INTRO);
    if (accountCreated) {
      bindSingleChildForInvite();
      setStep('childInviteIntro');
      return;
    }
    setStep('signupForm');
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
      if (accountCreated) {
        setJourneyStage((SIGNUP_JOURNEY_STAGE_COUNT - 1) as SignupJourneyStageIndex);
        setStep('signupIntro');
      } else {
        setStep('signupForm');
      }
      return;
    }
    if (step === 'signupIntro') {
      if (journeyStage > 0) {
        setJourneyStage((s) => (s - 1) as SignupJourneyStageIndex);
        return;
      }
      setStep('goodNews');
      return;
    }
    if (step === 'signupWelcome') {
      return;
    }
    if (step === 'signupForm') {
      setJourneyStage((SIGNUP_JOURNEY_STAGE_COUNT - 1) as SignupJourneyStageIndex);
      setStep('signupIntro');
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
      setStep('childSetup');
      return;
    }
    if (step === 'calculating') {
      setStep('childSetup');
      return;
    }
    if (step === 'childSetup') {
      setStep('whatAwaits');
      return;
    }
    if (step === 'whatAwaits') {
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
        ? badNewsFooterVisible
          ? 'v03-funnel-enter-reveal-0'
          : 'pointer-events-none opacity-0'
        : 'v03-funnel-enter-reveal-4';

  useEffect(() => {
    if (step !== 'badNews') {
      setBadNewsFooterVisible(false);
      return;
    }
    const timer = setTimeout(
      () => setBadNewsFooterVisible(true),
      BAD_NEWS_FOOTER_REVEAL_MS
    );
    return () => clearTimeout(timer);
  }, [step]);

  const showBackButton =
    !(accountCreated && step === 'signupForm') &&
    !(accountCreated && step === 'signupWelcome');

  /** After Google/Apple auth returns — waiting layout until account persist finishes. */
  if (oauthFinishing !== null && !accountCreated && !isRegistering) {
    return (
      <>
        <OnboardingGrid />
        <OnboardingWaitingScreenShell zIndex={20} ariaBusy>
          <OnboardingWaitingCenterContent
            headline="מתחברים"
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
        <div
          key={step}
          className="v03-funnel-screen absolute inset-0 z-[10] flex min-h-0 flex-col overflow-hidden"
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
        onFlowComplete={() => {
          void finishParentOnboardingAndGoToDashboard(router, { subscription: true }).catch(
            () => {
              window.alert('משהו השתבש בשמירת הפרופיל. נסו שוב.');
            }
          );
        }}
        parentId={parentPostGameParentId}
      />
    );
  }

  if (step === 'onboardingComplete') {
    return (
      <>
        <OnboardingFunnelStepSlot stepKey={step} clipOverflow={false}>
          <ParentOnboardingCompletionStep
            childGender={selectedChildGender}
            onContinue={() => {
              void finishParentOnboardingAndGoToDashboard(router, { subscription: true }).catch(
                () => {
                  window.alert('משהו השתבש בשמירת הפרופיל. נסו שוב.');
                }
              );
            }}
          />
        </OnboardingFunnelStepSlot>
      </>
    );
  }

  if (step === 'childInviteWaiting') {
    return (
      <>
        <OnboardingMintGridBackdrop showGrid />
        <OnboardingWaitingScreenShell skipMintGlow staticLayout>
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
        <OnboardingMintGridBackdrop showGrid={false} />
        <OnboardingBackButton onClick={handleBack} />
        <OnboardingFunnelStepSlot stepKey="childInviteShare" clipOverflow={false}>
          <FunnelStepRoot fitViewport aria-label="שיתוף הזמנה לילד">
            <FunnelStepForeground
              distribution="between"
              padTopPx={0}
              padBottomPx={0}
              fitViewport
            >
              <FunnelStepMain center className="relative min-h-0 w-full flex-1">
                <SignupChildInviteShareStep
                  flow
                  childName={selectedChildName}
                  childGender={selectedChildGender}
                  onShared={onInviteShared}
                />
              </FunnelStepMain>
              <div
                className="w-full shrink-0"
                style={{ height: 32 }}
                aria-hidden
              />
            </FunnelStepForeground>
          </FunnelStepRoot>
        </OnboardingFunnelStepSlot>
      </>
    );
  }

  if (step === 'childInviteIntro') {
    return (
      <>
        <OnboardingMintGridBackdrop showGrid={false} />
        <OnboardingFunnelStepSlot stepKey="childInviteIntro" clipOverflow={false}>
          <FunnelStepRoot fitViewport aria-label="הצטרפות ילד — התחלה">
            <FunnelStepForeground
              distribution="between"
              padTopPx={0}
              padBottomPx={FUNNEL_FOREGROUND_PAD_BOTTOM_PX}
              fitViewport
            >
              <FunnelStepMain className="min-h-0 w-full flex-1 overflow-hidden">
                <SignupChildInviteIntroStep
                  flow
                  childName={selectedChildName}
                  onTogetherNow={() => setStep('childInviteShare')}
                  onRemindLater={handleRemindLater}
                />
              </FunnelStepMain>
            </FunnelStepForeground>
          </FunnelStepRoot>
        </OnboardingFunnelStepSlot>
      </>
    );
  }

  if (step === 'signupWelcome') {
    return (
      <>
        <OnboardingFunnelStepSlot stepKey="signupWelcome" clipOverflow={false}>
          <FunnelStepRoot fitViewport aria-label="ברוכים הבאים">
            <SignupHeroFrame />
            <SignupOAuthTermsSheet
              termsAccepted={oauthTermsAccepted}
              onTermsAcceptedChange={handleOAuthTermsAcceptedChange}
              termsError={oauthTermsError}
              onContinue={handleWelcomeContinue}
            />
          </FunnelStepRoot>
        </OnboardingFunnelStepSlot>
      </>
    );
  }

  if (step === 'signupIntro') {
    return (
      <>
        <OnboardingMintGridBackdrop showGrid />
        {showBackButton && <OnboardingBackButton onClick={handleBack} />}
        <OnboardingFunnelStepSlot stepKey="signupIntro" clipOverflow={false}>
          <FunnelStepRoot fitViewport aria-label="איך מתחילים?">
            <FunnelStepForeground
              distribution="between"
              padTopPx={0}
              padBottomPx={0}
              fitViewport
            >
              <FunnelStepMain className="relative flex min-h-0 w-full flex-1 flex-col items-center overflow-hidden">
                <SignupIntroStep
                  flow
                  stage={journeyStage}
                  onStageChange={setJourneyStage}
                  childName={selectedChildName}
                />
              </FunnelStepMain>
              {journeyStage === 2 ? (
                <FunnelStepFooter
                  className="v03-funnel-enter-3"
                  blur={false}
                  customFooter={
                    <button
                      type="button"
                      onClick={handleIntroContinue}
                      className="inline-flex h-[55px] w-full items-center justify-center rounded-[22px] bg-[var(--turquoise-200,#00FFB3)] px-[15px] py-2 font-simpler text-[18px] font-bold leading-[1.2] tracking-[-0.36px] text-v03-green-900 shadow-[2px_2px_20px_0_rgba(109,109,109,0.15)] transition hover:brightness-95"
                    >
                      יצאנו לדרך!
                    </button>
                  }
                />
              ) : (
                <FunnelStepFooter
                  className="v03-funnel-enter-3"
                  variant="secondary"
                  blur={false}
                  onClick={handleIntroContinue}
                >
                  המשך
                </FunnelStepFooter>
              )}
            </FunnelStepForeground>
          </FunnelStepRoot>
        </OnboardingFunnelStepSlot>
      </>
    );
  }

  if (step === 'signupForm') {
    return (
      <>
        {showBackButton && <OnboardingBackButton onClick={handleBack} />}
        <OnboardingFunnelStepSlot stepKey="signupForm" clipOverflow={false}>
          <FunnelStepRoot fitViewport aria-label="הרשמה">
            <SignupHeroFrame />
            <FunnelStepForeground
              distribution="between"
              padTopPx={signupFormPadTopPx}
              padBottomPx={0}
              fitViewport
            >
              <FunnelStepMain
                scroll
                scrollRef={signupScrollRef}
                className="relative min-h-0 w-full flex-1"
                footerOverlayReservePx={FUNNEL_FOOTER_HOME_INDICATOR_SPACER_PX}
              >
                <div className="relative z-[20] mx-auto flex w-v03-content flex-col items-stretch gap-5">
                  <OnboardingSignupForm
                    values={values}
                    errors={errors}
                    onChange={handleChange}
                    onTermsAcceptedChange={handleTermsAcceptedChange}
                    onOAuthGoogle={() => handleOAuth('google')}
                    onOAuthApple={() => handleOAuth('apple')}
                    oauthDisabled={isRegistering}
                    oauthPickerOpen={oauthDialogOpen}
                    isRegistering={isRegistering}
                    onRegister={handleRegister}
                    ctaDisabled={
                      isRegistering ||
                      oauthDialogOpen !== null ||
                      oauthTermsGateProvider !== null
                    }
                  />
                </div>
              </FunnelStepMain>
            </FunnelStepForeground>
            {oauthTermsGateProvider ? (
              <SignupOAuthTermsSheet
                termsAccepted={oauthTermsAccepted}
                onTermsAcceptedChange={handleOAuthTermsAcceptedChange}
                termsError={oauthTermsError}
                onContinue={handleOAuthTermsGateContinue}
              />
            ) : null}
          </FunnelStepRoot>
        </OnboardingFunnelStepSlot>
      </>
    );
  }

  if (isRevealStep(step)) {
    return (
      <>
        <OnboardingRevealBleedBackground />
        <OnboardingFunnelStepSlot
          stepKey={step}
          clipOverflow={step !== 'goodNews'}
          innerClassName={step === 'revealIntro' ? 'v03-reveal-intro-scope' : ''}
        >
          <OnboardingBackButton onClick={handleBack} tone="light" />
          <FunnelStepRoot
            fitViewport
            className={`bg-transparent ${
              step === 'goodNews' ? 'overflow-visible' : 'overflow-hidden'
            }`}
          >
            <FunnelStepForeground
              distribution="between"
              padTopPx={0}
              padBottomPx={0}
              fitViewport
            >
              <FunnelStepMain
                className={`relative min-h-0 w-full flex-1 overflow-x-hidden ${
                  step === 'goodNews' ? 'overflow-y-visible' : 'overflow-y-hidden'
                }`}
              >
                <OnboardingRevealStepContent step={step as RevealFlowStep} />
              </FunnelStepMain>
              <FunnelStepFooter
                className={revealFooterFadeClass}
                variant="secondary"
                blur={false}
                overlay={false}
                onClick={handleRevealContinue}
                disabled={step === 'badNews' && !badNewsFooterVisible}
              >
                המשך
              </FunnelStepFooter>
            </FunnelStepForeground>
          </FunnelStepRoot>
        </OnboardingFunnelStepSlot>
      </>
    );
  }

  if (step === 'calculating') {
    return (
      <>
        <OnboardingMintGridBackdrop showGrid />
        <OnboardingFunnelStepSlot stepKey="calculating">
          <FunnelStepRoot fitViewport aria-label="מחשבים זמן מסך">
            <FunnelStepForeground
              distribution="center"
              padTopPx={0}
              padBottomPx={0}
              fitViewport
            >
              <ScreenTimeCalculatingStep
                flow
                onComplete={() => {
                  trackPreSignupCta(AnalyticsEvents.PRE_SIGNUP_CALCULATING);
                  setStep('revealIntro');
                }}
              />
            </FunnelStepForeground>
          </FunnelStepRoot>
        </OnboardingFunnelStepSlot>
      </>
    );
  }

  if (step === 'whatAwaits') {
    return (
      <>
        <OnboardingMintGridBackdrop showGrid={false} mintGlow={false} />
        <OnboardingBackButton onClick={handleBack} />
        <OnboardingFunnelStepSlot stepKey="whatAwaits" clipOverflow={false}>
          <FunnelStepRoot fitViewport className="overflow-visible" aria-label="מה מחכה לנו">
            <FunnelStepForeground
              distribution="start"
              padTopPx={0}
              padBottomPx={0}
              fitViewport
              className="!px-0"
            >
              <FunnelStepMain className="relative min-h-0 w-full flex-1 overflow-visible">
                <ParentWelcomeWhatAwaitsStep
                  role={role}
                  onContinue={handleParentContinue}
                />
              </FunnelStepMain>
            </FunnelStepForeground>
          </FunnelStepRoot>
        </OnboardingFunnelStepSlot>
      </>
    );
  }

  if (step === 'role') {
    return (
      <>
        <OnboardingMintGridBackdrop showGrid={false} />
        <OnboardingBackButton onClick={handleBack} />
        <OnboardingFunnelStepSlot stepKey="role" clipOverflow={false}>
          <FunnelStepRoot fitViewport aria-label="בחירת תפקיד הורה">
            <FunnelStepForeground
              distribution="between"
              padTopPx={0}
              padBottomPx={0}
              fitViewport
            >
              <FunnelStepSection>
                <ParentRoleStep role={role} onRoleChange={setRole} />
              </FunnelStepSection>
              <FunnelStepFooter
                className="v03-funnel-enter-2"
                variant="secondary"
                showLoginLink
                blur={false}
                disabled={!role}
                onClick={handleParentContinue}
              >
                המשך
              </FunnelStepFooter>
            </FunnelStepForeground>
          </FunnelStepRoot>
        </OnboardingFunnelStepSlot>
      </>
    );
  }

  if (step === 'childSetup') {
    const child = children[0] ?? {
      name: '',
      age: ONBOARDING_CHILD_DEFAULT_AGE,
      gender: 'girl' as const,
    };
    const hours = screenTimes[0]?.hours ?? DEFAULT_ONBOARDING_SCREEN_TIME_HOURS;
    const continueDisabled = !childrenDetailsComplete([child]);

    return (
      <>
        <OnboardingMintGridBackdrop showGrid={false} />
        <OnboardingBackButton onClick={handleBack} />
        <OnboardingFunnelStepSlot stepKey="childSetup" clipOverflow={false}>
          <FunnelStepRoot fitViewport aria-label="פרטי הילד">
            <FunnelStepForeground
              distribution="start"
              padTopPx={0}
              padBottomPx={0}
              fitViewport
            >
              <FunnelStepMain
                scroll
                scrollRef={funnelScrollRef}
                className="relative min-h-0 w-full flex-1"
              >
                <SingleChildSetupStep
                  child={child}
                  hours={hours}
                  nameError={childNameErrors[0]}
                  continueDisabled={continueDisabled}
                  onChildChange={(next) => {
                    setChildren([next]);
                    setChildNameErrors(getChildrenHebrewNameErrors([next]));
                    setScreenTimes((prev) => [
                      {
                        name: next.name.trim(),
                        hours: prev[0]?.hours ?? DEFAULT_ONBOARDING_SCREEN_TIME_HOURS,
                      },
                    ]);
                  }}
                  onHoursChange={(nextHours) => {
                    setScreenTimes([
                      {
                        name: child.name.trim(),
                        hours: nextHours,
                      },
                    ]);
                  }}
                  onContinue={handleParentContinue}
                />
              </FunnelStepMain>
            </FunnelStepForeground>
          </FunnelStepRoot>
        </OnboardingFunnelStepSlot>
      </>
    );
  }

  return null;
}
