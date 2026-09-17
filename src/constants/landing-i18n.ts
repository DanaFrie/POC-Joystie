/**
 * Landing page UI copy — Hebrew (default `/`) and English (`/en`).
 * Feature mockups + section structure stay shared; EN swaps images via assets.
 */
import {
  LANDING_ASSETS,
  LANDING_BLOG,
  LANDING_FAQ,
  LANDING_FEATURES,
  LANDING_FOOTER_LINKS,
  LANDING_HOW_STEPS,
  LANDING_NAV_LINKS,
  LANDING_SCIENCE,
  LANDING_SOCIAL,
  type LandingBlogPost,
} from '@/constants/landing-marketing';
import type { LandingLocale } from '@/components/landing/LandingLocaleContext';

export type LandingNavLink = { href: string; label: string };

const NAV_EN: readonly LandingNavLink[] = [
  { href: '#what-is-joystie', label: 'What is Joystie?' },
  { href: '#how-it-works', label: 'How does it work?' },
  { href: '#questions', label: 'FAQ' },
  { href: '/about', label: 'About us' },
  { href: '#knowledge', label: 'Knowledge center' },
];

const FEATURES_EN = [
  {
    badge: 'Connecting between allowance to screen time',
    titleBefore: 'The first digital wallet ',
    titleAccent: 'to change screen habits',
    lead: 'Every minute of screen time saved is real money.',
    body: 'At the end of the week, kids cash in their savings and realize every choice matters, and time is money.',
    image: '/landing/first-diff-en.webp',
    imageAlt: 'Joystie digital wallet screen',
    reverse: false,
    wave: LANDING_ASSETS.wave1,
  },
  {
    badge: 'Attention coins converted into screen time or money',
    titleBefore: 'A reward & loss system that leads to ',
    titleAccent: 'conscious choices',
    lead: 'The parent sets weekly allowance and attention',
    body: 'The rules are simple: when the kids manage screen time wisely, they earn their allowance and even more. However, if they exceed the limit, they must pay from their allowance, fostering personal financial responsibility.',
    image: '/landing/second-diff-en.webp',
    imageAlt: 'Attention coins conversion screen',
    reverse: true,
    wave: LANDING_ASSETS.wave2,
  },
  {
    badge: 'A shared journey for lasting habit change',
    titleBefore: 'Gamification to create',
    titleAccent: 'internal motivation',
    breakBeforeAccent: true,
    lead: 'A game character will accompany you from the start of the process.',
    body: 'Smart playfulness, rewards, and tasks turn habit development into an experience kids want to return to, strengthening internal motivation over time.',
    image: '/landing/third-diff-en.webp',
    imageAlt: 'Joystie gamification screen',
    reverse: false,
    wave: LANDING_ASSETS.wave3,
  },
] as const;

const HOW_STEPS_EN = [
  {
    tab: 'Create account together',
    title: 'Open an account together with your kids',
    body: 'Parent and child join the app together and start a shared journey where both win from day one: more independence (and money) for the child, fewer screen-time battles for the parent.',
    image: LANDING_ASSETS.howItWorksHero,
  },
  {
    tab: 'Setting up challenges',
    title: 'Set the rules of the game together',
    body: 'Together you define screen limits, allowance and attention coins — so kids understand the rules upfront and feel like partners in the decisions, not just followers.',
    image: LANDING_ASSETS.howItWorksHero,
  },
  {
    tab: 'Rewarding screen time',
    title: 'Build habits that stick',
    body: 'Throughout the week kids practice conscious choices: every minute saved has real value, and the process becomes a family habit instead of a daily fight.',
    image: LANDING_ASSETS.howItWorksHero,
  },
] as const;

const SCIENCE_EN = [
  {
    n: 1 as const,
    titleParts: [{ text: 'Decisions are shaped by feedback ' }, { text: 'and immediate reward', highlight: true }],
    body: 'Behavioral economics research, including the work of Richard Thaler, clearly shows that feedback and rewards significantly influence decision-making and deep behavior change: an approach directly applied in Joystie.',
  },
  {
    n: 2 as const,
    titleParts: [
      { text: 'Incentives create habits,', highlight: true },
      { text: '\neven in the long run' },
    ],
    body: 'A large-scale study by the University of Pennsylvania and Carnegie Mellon University found that small incentives can help form new habits that persist even after the incentives themselves end.',
  },
  {
    n: 3 as const,
    titleParts: [
      { text: 'Gamification increases ' },
      { text: '\nengagement and motivation', highlight: true },
    ],
    body: 'A systematic review of dozens of studies on Gamification in Education found that playfulness, immediate feedback, and rewards boost children’s engagement and motivation in learning and habit development.',
  },
] as const;

const FAQ_EN = [
  {
    q: 'Doesn’t this create the wrong kind of motivation?',
    a: 'Reward is only the starting point, not the goal.\n\nJust as kids receive allowance to learn financial responsibility, Joystie uses reward as an educational tool that shows time has value. The aim is self-control, decision-making, economic thinking, and habits that last after the reward is gone.',
  },
  {
    q: 'What happens if a child exceeds their screen-time limit?',
    a: 'Going over the limit costs from their allowance — just like in the real world. The child learns that choices have a price, instead of the parent becoming a police officer who cuts the screen by force.',
  },
  {
    q: 'Can the rules be customized per child?',
    a: 'Yes. Each child can have their own screen limit, allowance, and attention coins that fit their age, routine, and your family.',
  },
  {
    q: 'Which devices and operating systems are supported?',
    a: 'Joystie runs in the browser and connects to family screen-time management. We keep expanding device and OS support based on what families need.',
  },
  {
    q: 'Can we try Joystie before committing?',
    a: 'Yes. You can start with a trial, experience the process with your kids, and only then decide if it’s right for your family.',
  },
] as const;

const UI_HE = {
  login: 'התחברות',
  join: 'להצטרפות',
  joinJoystie: 'הצטרפות לג׳ויסטי',
  joinRevolution: 'הצטרפות לג׳ויסטי',
  loginAccount: 'התחברות לחשבון',
  menuTagline: 'הדרך החדשה לנהל הרגלי מסך בריאים',
  language: 'שפה',
  langEnglish: 'English',
  langHebrew: 'עברית',
  openMenu: 'פתח תפריט',
  closeMenu: 'סגור תפריט',
  mainNav: 'ניווט ראשי',
  menuDialog: 'תפריט',
  heroEyebrow: 'לא עוד מלחמות על המסך',
  heroTitleLine1: 'הדרך החדשה לנהל',
  heroTitleUnderline: 'הרגלי מסך',
  heroTitleLine2After: 'בריאים',
  heroTitleMobileUnderline: '',
  heroTitleMobileLine2After: '',
  heroTitleSingle: null as string | null,
  heroBodyMobile:
    'הארנק הדיגיטלי שהופך את זמן המסך למטבעות קשב, ומשנה לטובה את הדרך בה ילדים והורים מתמודדים עם מסכים',
  heroBodyDesktop:
    'הארנק הדיגיטלי שהופך את זמן המסך למטבעות קשב, ומשנה את הדרך בה ילדים והורים מתמודדים עם מסכים: באמצעות כלכלה התנהגותית, משחק ואחריות אישית',
  heroBodyDesktopL1: '',
  heroBodyDesktopL2: '',
  heroLearnMore: 'ספרו לי עוד',
  heroLearnMoreDesktop: 'ספרו לי עוד על ג׳ויסטי',
  howMockChildName: 'יואב',
  howMockMinutes: '40 דקות',
  howMockDailyAvg: 'ממוצע דק׳ יומי של יואב',
  howMockValue: '52 דק׳',
  howMockVsLastWeek: '15%- ביחס לשבוע שעבר',
  statsHighlight: '5 שעות ביום.',
  statsLine1: 'זה הזמן הממוצע שילדים במסך בשנת 2026, וזה רק הולך וגדל.',
  statsLine2: 'הגיע הזמן שנחזיר את הבחירה לידיים שלנו ושל הילדים שלנו.',
  presentingPrefix: 'גאים להציג בפניכם את',
  howTitle: 'איך זה עובד?',
  howLead: 'שלושה צעדים פשוטים להתחיל לשנות הרגלי מסך יחד עם הילדים.',
  scienceTitle: 'המדע מאחורי ג׳ויסטי',
  scienceLead:
    'מאחורי כל פיצ׳ר בג׳ויסטי עומדים עקרונות מוכחים ממדעי ההתנהגות, שנועדו לעזור לילדים',
  scienceVideoAria: 'דורי מציג את המדע מאחורי ג׳ויסטי',
  scienceReadMore: 'קראו עוד >>',
  behindTitle: 'מאחורי הרעיון',
  behindP1:
    'אנחנו מוצאים את עצמנו נשאבים לגלילה אינסופית ומיד מתחרטים עליה. כשהילדים שלנו מתחילים לחקות אותנו - אנחנו מבינים את הבעיה: דור שלם שגדל לתוך מציאות חדשה - ככל שעובר הזמן, ילדים מתמכרים יותר ויותר למסך.',
  behindP2: 'איזה מין ילד אנחנו רוצים בעידן ה-AI?',
  behindAuthor: 'מאיר ניצן',
  behindRole: 'מייסד ג׳ויסטי',
  behindCta: 'קראו עוד אודותינו',
  behindPhotoAlt: 'משפחה רגועה בטבע',
  faqTitle: 'שאלות שחשוב לשאול',
  knowledgeTitle: 'מרכז הידע של ג׳ויסטי',
  knowledgeVisit: 'לבלוג',
  footerTagline: 'הדרך החדשה לנהל הרגלי מסך בריאים',
  footerCta: 'הצטרפות לג׳ויסטי',
  footerCopyright: '© Joystie. כל הזכויות שמורות.',
  scrollExplore: 'גוללים למטה',
} as const;

const UI_EN = {
  login: 'Login',
  join: 'Join Joystie',
  joinJoystie: 'Join Joystie',
  joinRevolution: 'Join the revolution',
  loginAccount: 'Log in to account',
  menuTagline: 'Reshaping kids’ screen time habits',
  language: 'Language',
  langEnglish: 'English',
  langHebrew: 'Hebrew',
  openMenu: 'Open menu',
  closeMenu: 'Close menu',
  mainNav: 'Main navigation',
  menuDialog: 'Menu',
  heroEyebrow: 'no more fighting over screens',
  heroTitleLine1: 'Reshaping kids’',
  /** Desktop EN — marker under “screen time” */
  heroTitleUnderline: 'screen time',
  heroTitleLine2After: 'habits',
  /** Mobile EN — marker under “screen time” (2-line title) */
  heroTitleMobileUnderline: 'screen time',
  heroTitleMobileLine2After: 'habits',
  heroTitleSingle: null as string | null,
  heroBodyMobile:
    'The digital wallet that turns screen time into attention coins, positively changing the way children and parents deal with screens',
  heroBodyDesktop:
    'The digital wallet that turns screen time into attention coins, positively changing the way children and parents deal with screens',
  heroBodyDesktopL1:
    'The digital wallet that turns screen time into attention coins,',
  heroBodyDesktopL2:
    'positively changing the way children and parents deal with screens',
  heroLearnMore: 'Learn more',
  heroLearnMoreDesktop: 'Learn more',
  howMockChildName: 'Alex',
  howMockMinutes: '40 min',
  howMockDailyAvg: "Alex's daily avg min",
  howMockValue: '52 min',
  howMockVsLastWeek: '15% vs last week',
  statsHighlight: '5 hours a day.',
  statsLine1: 'That’s the average amount of time kids spend on screens in 2026, and it’s only increasing.',
  statsLine2: 'It’s time to put the choice back in our hands.',
  presentingPrefix: 'Introducing',
  howTitle: 'How does it work?',
  howLead: 'Three simple steps to start reshaping screen habits together with your kids.',
  scienceTitle: 'The science behind Joystie',
  scienceLead:
    'Behind every Joystie feature are proven behavioral-science principles designed to help kids',
  scienceVideoAria: 'Dori presents the science behind Joystie',
  scienceReadMore: 'Read more >>',
  behindTitle: 'Behind the idea',
  behindP1:
    'We catch ourselves pulled into endless scrolling — and instantly regret it. When our kids start copying us, we see the problem: a generation growing into a new reality where, over time, children become more and more addicted to screens.',
  behindP2: 'What kind of child do we want in the age of AI?',
  behindAuthor: 'Meir Nitzan',
  behindRole: 'Founder of Joystie',
  behindCta: 'Read our Story',
  behindPhotoAlt: 'Calm family in nature',
  faqTitle: 'Some good questions to ask',
  knowledgeTitle: 'The knowledge center of Joystie',
  knowledgeVisit: 'Visit blog',
  footerTagline: 'Building a better future of screen time habits',
  footerCta: 'Join Joystie',
  footerCopyright: '© Joystie. All rights reserved.',
  scrollExplore: 'Scroll to explore',
} as const;

const FOOTER_LINKS_EN: readonly { href: string; label: string }[] = [
  { href: 'https://calendar.app.google/XxKAvtFC2Na2zipD9', label: 'Talk with us' },
  { href: 'https://www.facebook.com/profile.php?id=61586594025586', label: 'Facebook' },
  { href: 'https://www.linkedin.com/company/joystie', label: 'LinkedIn' },
];

const SOCIAL_EN: readonly { href: string; label: string }[] = [
  { href: 'https://calendar.app.google/XxKAvtFC2Na2zipD9', label: 'Talk with us' },
  { href: 'https://www.linkedin.com/company/joystie', label: 'LinkedIn' },
  { href: 'https://www.facebook.com/profile.php?id=61586594025586', label: 'Facebook' },
];

export type LandingUiCopy = {
  [K in keyof typeof UI_HE]: string;
};

export function getLandingUi(locale: LandingLocale): LandingUiCopy {
  return (locale === 'en' ? UI_EN : UI_HE) as LandingUiCopy;
}

export function getLandingNavLinks(locale: LandingLocale): readonly LandingNavLink[] {
  return locale === 'en' ? NAV_EN : LANDING_NAV_LINKS;
}

export function getLandingFeatures(locale: LandingLocale) {
  return locale === 'en' ? FEATURES_EN : LANDING_FEATURES;
}

export function getLandingHowSteps(locale: LandingLocale) {
  return locale === 'en' ? HOW_STEPS_EN : LANDING_HOW_STEPS;
}

export function getLandingScience(locale: LandingLocale) {
  return locale === 'en' ? SCIENCE_EN : LANDING_SCIENCE;
}

export function getLandingFaq(locale: LandingLocale) {
  return locale === 'en' ? FAQ_EN : LANDING_FAQ;
}

export function getLandingBlog(locale: LandingLocale): readonly LandingBlogPost[] {
  // Articles remain Hebrew for now; cards still list on EN landing.
  void locale;
  return LANDING_BLOG;
}

export function getLandingFooterLinks(locale: LandingLocale) {
  return locale === 'en' ? FOOTER_LINKS_EN : LANDING_FOOTER_LINKS;
}

export function getLandingSocial(locale: LandingLocale) {
  return locale === 'en' ? SOCIAL_EN : LANDING_SOCIAL;
}
