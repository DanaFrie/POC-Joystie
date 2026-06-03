/**
 * Onboarding step 1 — Figma asset URLs (MCP fetch from node 12703:42224).
 * URLs expire after ~7 days; re-run MCP on the screen node to refresh.
 *
 * User Figma links → implementation mapping (12822:* not readable via MCP yet):
 * | User link   | Maps to (legacy node)     | Role              |
 * |-------------|---------------------------|-------------------|
 * | 12703-42224 | 12703:42224               | Full screen       |
 * | 12822-3495  | 12703:41505               | Kingdom art       |
 * | 12822-3496  | 12742:8555                | Grid lines        |
 * | 12822-3517  | 12703:41514               | Copy block        |
 * | 12822-3539  | 12703:41524               | CTA button        |
 * | 12822-3545  | 12703:41525               | Login link row    |
 * | 12822-3546  | 12703:41513               | Bottom glow       |
 * | 12822-3547  | 12703:41514               | Text (eyebrow/H1) |
 * | 12822-3556  | 12703:41507               | Logo halo         |
 * | 12822-3557  | 12703:41508               | Logo              |
 */

const FILE =
  'https://www.figma.com/design/JzP4ygtXS3V7KSXiPro7hA/Joystie---Platform';

export const onboardingFigmaLinks = {
  /** Signup intro — שלב 1–3 */
  signupIntroStep1: `${FILE}?node-id=12703-42217&m=dev`,
  signupIntroStep2: `${FILE}?node-id=12703-42218&m=dev`,
  signupIntroStep3: `${FILE}?node-id=12703-42219&m=dev`,
  /** Pick first child — עם מי מתחילים? (Screen 28) */
  pickFirstChild: `${FILE}?node-id=12703-42220&m=dev`,
  /** Child invite intro — שנכניס את {child} לתמונה? (Screen 45) */
  childInviteIntro: `${FILE}?node-id=12914-11767&m=dev`,
  /** Child invite share — WhatsApp / copy (Screen 28) */
  childInviteShare: `${FILE}?node-id=12703-42221&m=dev`,
  /** Parent — ספרי לנו קצת על הילדים (Screen 38) */
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
} as const;

/** Screen 35 — export Woman/Man illustrations from Figma to public/ */
export const ONBOARDING_PARENT_IMAGES = {
  mother: '/onboarding-parent-mother.png',
  father: '/onboarding-parent-father.png',
} as const;

/** Children phone step — export hero from Figma to public/ */
export const ONBOARDING_CHILDREN_PHONE_IMAGE =
  '/onboarding-children-phones.png' as const;

/** Children details step — export hero from Figma to public/ */
export const ONBOARDING_CHILDREN_DETAILS_IMAGE =
  '/onboarding-children-details.png' as const;

/** Screen-time step (Frame 1430108706) — export rotated phone art to public/ */
export const ONBOARDING_SCREEN_TIME_HERO_IMAGE =
  '/onboarding-screen-time.png' as const;

/** Good/bad news step — export 201×201 hero to public/onboarding-news.png */
export const ONBOARDING_NEWS_HERO_IMAGE = '/onboarding-news.png' as const;

/** Fallback until onboarding-news.png is exported from Figma */
export const ONBOARDING_NEWS_HERO_FALLBACK = '/time-coin.png' as const;

/** Bad news step — export 150×150 hero to public/onboarding-bad-news.png */
export const ONBOARDING_BAD_NEWS_HERO_IMAGE = '/onboarding-bad-news.png' as const;

export const ONBOARDING_BAD_NEWS_HERO_FALLBACK = '/onboarding-news.png' as const;

/** Real-data step — Family Link icon ~30×35 */
export const ONBOARDING_FAMILY_LINK_ICON =
  '/onboarding-family-link-icon.png' as const;

/** Signup hero — Frame 1430108703; public/signup-box-mountain.png */
export const ONBOARDING_SIGNUP_HERO_IMAGE = '/signup-box-mountain.png' as const;

/** Signup OAuth — export from Figma to public/ */
export const SIGNUP_GOOGLE_ICON = '/signup-google-icon.png' as const;
export const SIGNUP_APPLE_ICON = '/signup-apple-icon.png' as const;

/** Signup journey visuals — export to public/ (Screen 25 / 26) */
export const SIGNUP_JOURNEY_STEP2_IMAGE = '/signup-journey-ball-game.png' as const;
export const SIGNUP_JOURNEY_STEP3_IMAGE = '/signup-journey-agreements.png' as const;

/** Child invite hero — export from Figma 12914:11767 (image 291, 200×200) */
export const SIGNUP_CHILD_INVITE_HERO_IMAGE =
  '/signup-child-invite-hero.png' as const;

/** WhatsApp icon on share CTA — export from Figma 12703:42221 */
export const SIGNUP_INVITE_WHATSAPP_ICON = '/signup-invite-whatsapp.png' as const;

/** Companion carousel — export from Figma Frame 1597882421 to public/ */
export const SIGNUP_COMPANION_IMAGES = [
  '/signup-companion-1.png',
  '/signup-companion-2.png',
  '/signup-companion-3.png',
  '/signup-companion-4.png',
] as const;

/** Kingdom hero — exported from Figma node 12703:41505 (maps 12822:3495) */
export const ONBOARDING_KINGDOM_SRC = '/onboarding-kingdom.png' as const;

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
