/**
 * Consultant / accompaniment programs — `/consultant` (Hebrew only).
 * Desktop Figma 16348:20486 (scroll / expanded) · Mobile 16348:21470.
 * Booking CTAs open Google Calendar appointment pages (אישי / סדנה).
 */

export const CONSULTANT_ASSETS = {
  /** Meir avatar for bio banner — outdoor crop (visible on dark UI). */
  meirCircle: '/landing/consultant/meir-circle.png',
  /**
   * Desktop dots vector mask — Figma Frame 1597882804 (16348:20486 right side).
   * Used with CSS mask + gradient so dots stay visible on #05161A.
   */
  dotsMask: '/landing/consultant/dots-mask.svg',
  /** Families-tell carousel — Figma Reviews 16374:3264 */
  storyImages: [
    '/landing/consultant/story-circle.jpg',
    '/landing/consultant/story-hall.jpg',
  ] as const,
} as const;

export type ConsultantOfferId = 'private' | 'group';

export type ConsultantOffer = {
  id: ConsultantOfferId;
  /** Desktop title */
  title: string;
  /** Mobile title (falls back to title) */
  titleMobile?: string;
  subtitle: string;
  /** Mobile subtitle (falls back to subtitle) */
  subtitleMobile?: string;
  meta: string;
  /** Mobile meta (falls back to meta) */
  metaMobile?: string;
  /** Display price (payment may be via Calendar / CardCom pay-start). */
  priceShekels: number;
  priceLabel: string;
  /** Google Calendar appointment booking URL. */
  calendarBookingHref: string;
};

export const CONSULTANT_PAGE = {
  backLabel: 'חזרה לג׳ויסטי',
  headlineMint: 'ליווי אישי',
  headlineRest: 'לרווחה דיגיטלית במשפחה',
  intro: 'מתאים להורים שרוצים לקחת את השינוי לשלב הבא',
  meirEyebrow: 'תוכניות ליווי',
  meirTitle: 'בהובלת מאיר ניצן',
  meirTitleDesktop: 'תוכניות ליווי בהובלת מאיר ניצן',
  meirBio:
    'מדריך הורים לרווחה דיגיטלית וממייסדי Joystie, עבד עם הורים ביותר מ־65 קהילות ברחבי הארץ. מתמחה בבניית הרגלי מסך בריאים וביצירת שגרה דיגיטלית שמתאימה לחיים של משפחות בעידן הנוכחי',
  offersHeading: 'תוכניות הליווי שלנו:',
  ctaLabel: 'לקביעת תאריך ותשלום',
  joinLabel: 'הצטרפות לג׳ויסטי',
} as const;

export const CONSULTANT_OFFERS: readonly ConsultantOffer[] = [
  {
    id: 'private',
    title: 'פגישה אישית',
    titleMobile: 'פגישה אישית',
    subtitle: 'יצירת תוכנית מותאמת אישית לדיאטה דיגיטלית',
    subtitleMobile: 'יצירת תוכנית מותאמת אישית לדיאטה דיגיטלית',
    meta: '60 דקות  ·  אונליין',
    priceShekels: 260,
    priceLabel: '₪260',
    calendarBookingHref: 'https://calendar.app.google/ZzeFiQETsjUUZG6h7',
  },
  {
    id: 'group',
    title: 'סדנת הורים בקבוצה קטנה',
    subtitle: 'עקרונות וכלים מעשיים לניהול מסכים בבית',
    meta: 'עד 4 משתתפים · 75 דקות · אונליין',
    metaMobile: "עד 4 משתתפים · 75 דק׳ · אונליין",
    priceShekels: 100,
    priceLabel: '₪100 למשתתף',
    calendarBookingHref: 'https://calendar.app.google/hdLcqRc4S2oYK4xeA',
  },
] as const;

export type ConsultantFaqId = 'about' | 'stories' | 'contact';

export type ConsultantStory = {
  quote: string;
  attribution: string;
  image: string;
};

/** «משפחות מספרות» carousel — 2 testimonies (Figma Reviews 16374:3265). */
export const CONSULTANT_STORIES: readonly ConsultantStory[] = [
  {
    quote:
      '"התגובות היו מצוינות. אנשים נהנו מהשיח, היה ברור שאכפת להם ושיש רצון להמשך ואף לעוד מפגשים. נראה שחשוב להמשיך בקרוב ולא לתת לתנופה לדעוך.\n\nתודה לך מאיר"',
    attribution: 'דניאל, בן 36 מרמת גן, הורה לילד בן 9',
    image: CONSULTANT_ASSETS.storyImages[0],
  },
  {
    quote:
      '״הסדנה שילבה בצורה מצוינת בין העלאת מודעות אישית ומשפחתית, הקניית ידע עדכני, שיתוף בסיכונים ובנתונים, ומתן כלים פרקטיים להתנהלות בבית ולבניית נורמות קהילתיות. המשתתפים נהנו מהסדנה ומהאופן שבו הועברה, הרגישו שהיא העלתה נקודות חשובות ושאפשר היה מיד לקחת ממנה רעיונות ופעולות ליישום.״',
    attribution: 'אלונה, בת 35 מזיכרון יעקב, הורה לילד בן 10',
    image: CONSULTANT_ASSETS.storyImages[1],
  },
] as const;

export const CONSULTANT_FAQ: readonly {
  id: ConsultantFaqId;
  title: string;
  titleMobile?: string;
  /** Plain paragraphs for about / contact */
  paragraphs?: readonly string[];
}[] = [
  {
    id: 'about',
    title: 'הליווי שלנו',
    paragraphs: [
      'בליווי נעבור יחד על שגרת המסכים בבית, נזהה את נקודות החיכוך וההרגלים שכבר לא עובדים, ונבנה תוכנית משפחתית מעשית שמתאימה לילדים ולשגרה שלכם.',
      'בליווי שלנו אנחנו תמיד נמשיך ליישום בפועל, עם הגדרת גבולות, הסכמות וכלים דיגיטליים שיעזרו להפוך את התוכנית להרגל שאפשר באמת להתמיד בו.',
    ],
  },
  {
    id: 'stories',
    title: 'משפחות מספרות',
  },
  {
    id: 'contact',
    title: 'פרטים נוספים ויצירת קשר',
    titleMobile: 'יצירת קשר ופרטים נוספים',
    paragraphs: [
      'מרגישים שחסר לכם עוד פרטים? מוזמנים ליצור קשר ישירות עם מאיר.\nטלפון: 055-883-8664',
      'אימייל: nnmeir@gmail.com',
    ],
  },
] as const;
