/**
 * Onboarding & signup funnel assets — `public/onboarding/` + `public/signup/`.
 * Figma refs: node 12703:42224 et al. (see onboardingFigmaLinks).
 */
import {
  BRAND_FAMILY_LINK_ICON_SRC,
  BRAND_ICON_SRC,
} from '@/constants/brand-assets';

const FILE =
  'https://www.figma.com/design/JzP4ygtXS3V7KSXiPro7hA/Joystie---Platform';

export const onboardingFigmaLinks = {
  signupIntroStep1: `${FILE}?node-id=12703-42217&m=dev`,
  signupIntroStep2: `${FILE}?node-id=12703-42218&m=dev`,
  signupIntroStep3: `${FILE}?node-id=12703-42219&m=dev`,
  /** Post-OAuth terms sheet — Figma 13367:6834 */
  signupOAuthTerms: `${FILE}?node-id=13367-6834&m=dev`,
  pickFirstChild: `${FILE}?node-id=13680-1526&m=dev`,
  childInviteIntro: `${FILE}?node-id=12914-11767&m=dev`,
  childInviteShare: `${FILE}?node-id=12703-42221&m=dev`,
  childInviteWaiting: `${FILE}?node-id=12703-42221&m=dev`,
  /** Parent pre-game ready — Figma 13245:19151 */
  childGameReady: `${FILE}?node-id=13245-19151&m=dev`,
  /** Parent post-game section — Figma 13615:10483 */
  parentPostGameSection: `${FILE}?node-id=13615-10483&m=dev`,
  /** Parent post-game — child change to confirm (Figma 13656:4329) */
  parentReviewChildChange: `${FILE}?node-id=13656-4329&m=dev`,
  /** Parent post-game — parent change choice (Figma 13615:10486) */
  parentAdditionalChange: `${FILE}?node-id=13615-10486&m=dev`,
  /** Post-bonding completion — Figma 13057:16567 */
  onboardingCompletion: `${FILE}?node-id=13057-16567&m=dev`,
  /** Subscription / trial gate — Figma 13277:11554 */
  subscriptionGate: `${FILE}?node-id=13277-11554&m=dev`,
  /** Plan + change option cards — Figma 13617:4029 */
  selectableOptionCard: `${FILE}?node-id=13617-4029&m=dev`,
  revealRealData: `${FILE}?node-id=12910-9075&m=dev`,
  childrenDetails: `${FILE}?node-id=12703-42228&m=dev`,
  screen: `${FILE}?node-id=12703-42224&m=dev`,
  kingdom: `${FILE}?node-id=12822-3495&m=dev`,
  grid: `${FILE}?node-id=12822-3496&m=dev`,
  gridAlt: `${FILE}?node-id=12822-3538&m=dev`,
  copy: `${FILE}?node-id=12822-3517&m=dev`,
  cta: `${FILE}?node-id=12822-3539&m=dev`,
  loginRow: `${FILE}?node-id=12822-3545&m=dev`,
  bottomGlow: `${FILE}?node-id=12822-3546&m=dev`,
  textBlock: `${FILE}?node-id=12822-3547&m=dev`,
  logoGlow: `${FILE}?node-id=12822-3556&m=dev`,
  logo: `${FILE}?node-id=12822-3557&m=dev`,
  parentRole: `${FILE}?node-id=12703-42224&m=dev`,
  /** Role screen — CTA + התחברות (same frame as landing 12703:41524 / 41525) */
  parentRoleCta: `${FILE}?node-id=13160-501&m=dev`,
} as const;

/** Landing + role footer — Figma 12703:41524 (CTA), 12703:41525 (login) */
export const ONBOARDING_FUNNEL_CTA_TOP_PX = 661;
export const ONBOARDING_FUNNEL_LOGIN_TOP_PX = 738;
export const ONBOARDING_FUNNEL_LOGIN_LEFT_PX = 108;

/** `/onboarding/parent` — role picker */
export const ONBOARDING_PARENT_IMAGES = {
  mother: '/onboarding/parent/parent-mother.webp',
  father: '/onboarding/parent/parent-father.webp',
  onboardingCompletion: '/onboarding/parent/onboarding-completion.webp',
} as const;

export const ONBOARDING_PARENT_SUBSCRIPTION_HERO_IMAGE =
  '/onboarding/parent/bright-mountain-day.webp' as const;

export const ONBOARDING_CHILDREN_PHONE_IMAGE =
  '/onboarding/parent/children-phones.webp' as const;

export const ONBOARDING_CHILDREN_DETAILS_IMAGE =
  '/onboarding/parent/children-details.webp' as const;

export const ONBOARDING_SCREEN_TIME_HERO_IMAGE =
  '/onboarding/parent/screen-time.webp' as const;

/** Reveal flow heroes */
export const ONBOARDING_NEWS_HERO_IMAGE = '/onboarding/reveal/news.webp' as const;
export const ONBOARDING_NEWS_HERO_FALLBACK = '/time-coin.png' as const;
export const ONBOARDING_BAD_NEWS_HERO_IMAGE =
  '/onboarding/reveal/bad-news.webp' as const;
export const ONBOARDING_BAD_NEWS_HERO_FALLBACK = '/onboarding/reveal/news.webp' as const;

export const ONBOARDING_JOYSTIE_ICON = BRAND_ICON_SRC;
export const ONBOARDING_FAMILY_LINK_ICON = BRAND_FAMILY_LINK_ICON_SRC;

/** `/onboarding/parent` signup form hero */
export const ONBOARDING_SIGNUP_HERO_IMAGE = '/signup/hero/box-mountain.webp' as const;

export const SIGNUP_GOOGLE_ICON = '/signup/oauth/google-icon.png' as const;
export const SIGNUP_APPLE_ICON = '/signup/oauth/apple-icon.png' as const;

/** Post-signup «איך זה עובד» journey */
export const SIGNUP_JOURNEY_STEP2_IMAGE = '/signup/journey/ball-game.webp' as const;
export const SIGNUP_JOURNEY_STEP3_IMAGE = '/signup/journey/agreements.webp' as const;

export const SIGNUP_CHILD_INVITE_HERO_IMAGE =
  '/signup/child-invite/hero.webp' as const;

export const SIGNUP_INVITE_WHATSAPP_ICON =
  '/signup/child-invite/whatsapp.png' as const;

export const SIGNUP_CHILD_INVITE_WAITING_LOGO =
  '/signup/child-invite/waiting-logo.gif' as const;

export const SIGNUP_COMPANION_IMAGES = [
  '/signup/journey/companion-1.webp',
  '/signup/journey/companion-2.webp',
  '/signup/journey/companion-3.webp',
  '/signup/journey/companion-4.webp',
] as const;

/** Landing kingdom transition — Figma 13411 ellipses on 375×812 */
export const ONBOARDING_ELLIPSE_387 = {
  top: 284,
  left: -24,
  width: 253,
  height: 236,
  fill: '#092125',
  blurPx: 45,
} as const;

export const ONBOARDING_ELLIPSE_388 = {
  top: 267,
  left: 140,
  width: 265,
  height: 248,
  borderRadius: 265,
  fill: '#092125',
  blurPx: 45,
} as const;

/** `/onboarding` landing kingdom */
export const ONBOARDING_KINGDOM_SRC = '/onboarding/landing/kingdom.webp' as const;

/** MCP asset URLs — refresh from get_design_context(12703:42224) */
export const onboardingFigmaAssets = {
  gridHori: {
    url: 'https://www.figma.com/api/mcp/asset/28f37624-e6ea-4bd2-b165-5887221c6f67',
    nodeId: '12742:8556',
  },
  gridVert: {
    url: 'https://www.figma.com/api/mcp/asset/d3a6063f-dd4f-4172-9931-c6f16b2e8c48',
    nodeId: '12742:8577',
  },
  logoGlow: {
    url: 'https://www.figma.com/api/mcp/asset/f9d80958-af16-4d17-97fe-09df859ae0d6',
    nodeId: '12703:41507',
  },
  logo: {
    url: 'https://www.figma.com/api/mcp/asset/5e2f18ae-56f8-4d92-942a-733d72284d6d',
    nodeId: '12703:41508',
  },
  glow388: {
    url: 'https://www.figma.com/api/mcp/asset/aff49acb-8f21-4dc5-b9ae-76497669fa12',
    nodeId: '12703:41511',
  },
  glow387: {
    url: 'https://www.figma.com/api/mcp/asset/ad10e76e-373c-4de6-b272-80308c0e9c15',
    nodeId: '12703:41512',
  },
  bottomGlow: {
    url: 'https://www.figma.com/api/mcp/asset/c0802c88-fa70-4a3f-a6a5-447491c85eb7',
    nodeId: '12703:41513',
  },
} as const;
