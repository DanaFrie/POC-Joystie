/** About page — Figma About 15597:19331 */

import type { LandingLocale } from '@/components/landing/LandingLocaleContext';

export const ABOUT_ASSETS = {
  storyScroll: '/landing/about/joy-docs.webp',
  meir: '/landing/about/meir.webp',
  dana: '/landing/about/dana.webp',
  dvir: '/landing/about/dvir.webp',
} as const;

export type AboutTeamMember = {
  name: string;
  role: string;
  bio: string;
  avatar: string;
};

export type AboutCopy = {
  heroLine1: string;
  heroLine2: string;
  storyTitle: string;
  teamTitle: string;
  emphasis: string;
  storyParas: readonly (readonly string[])[];
  team: readonly AboutTeamMember[];
};

/** Phrase kept bold in the story body. */
export const ABOUT_EMPHASIS = 'האינטראקציה בין אדם למסך האישי שלו';

export const ABOUT_STORY_PARAS: readonly (readonly string[])[] = [
  [
    'אנחנו מוצאים את עצמנו נשאבים לגלילה אינסופית ומיד מתחרטים עליה. כשהילדים שלנו מתחילים לחקות אותנו - אנחנו מבינים את הבעיה:',
    'דור שלם שגדל לתוך מציאות חדשה - ככל שעובר הזמן, ילדים מתמכרים יותר ויותר למסך.',
    'איזה מין ילד אנחנו רוצים בעידן ה-AI?',
  ],
  [
    'כדי להבין את גודל האבסורד - בין הגילאים 8 ל-12 הילד שלנו, לוחץ על כפתור "אישור" תמים, אותו כפתור שייך לאחת מענקיות הטכנולוגיה ומאחורי אותו כפתור מסתתר חוזה די פשוט:',
    'אנחנו ניתן לך ריגוש ללא תשלום - אתה תתן לנו בתמורה את הקשב שלך - חינם!',
  ],
  [
    `${ABOUT_EMPHASIS} היא המשפיעה הגדולה ביותר על הזהות והערכים של האדם הממוצע החל משנת 2004: יותר מההורים, יותר מהחברים, יותר מקבוצת השייכות. זו אינטראקציה סופר-מעניינת, תמיד מרגשת, שבסופה לעיתים קיימת תחושת ריקנות - שאותה אנחנו מחפשים למלא באפליקציה אחרת… אבל להבדיל מאינטראקציה רגילה, היחסים בין הילד למכשיר שלו גלויים רק לישות אחת - אלגוריתם.`,
    'בשנים האחרונות הוא הפך להיות חכם, מותאם ואפילו מדבר כמו בן אדם.',
  ],
  [
    'הוא מציג לנו תכנים, גורם לנו לקנות, מעצב לנו את הדעה הפוליטית ולאט לאט משפיע על הערכים ועל הזהות שלנו.',
    'עצרו רגע לחשוב עד כמה אתם מחליטים? עד כמה אתם מבצעים פעולות שבאמת רציתם?',
    'האם יתכן שהרבה מן מהפעולות הן רצון של אלגוריתם חכם? עד כמה אנחנו כהורים מצליחים לשמור על מרחב ההשפעה שלנו?',
  ],
  [
    "פרופ' ג'ונתן היידט טוען שהדורות האחרונים חווים חיווט מחדש של המוח. כשאנחנו מדברים על מוח של אדם בגילאים 6-25, נכנס גם האפקט של ההתפתחות המוחית שנפגעת.",
  ],
  ['אנחנו רוצים לגדל ילדים ואנשים שגרעין הזהות שלהם איתן - זו הסיבה שהחלטנו לייסד את Joystie'],
];

export const ABOUT_TEAM = [
  {
    name: 'מאיר ניצן',
    role: 'מייסד ומנכ״ל',
    bio: "מרצה ומומחה לרווחה דיגיטלית למשפחות, יזם וקצין לשעבר ביחידת שלדג. מוביל את חזון ג'ויסטי.",
    avatar: ABOUT_ASSETS.meir,
  },
  {
    name: 'דנה פרידמן',
    role: 'מייסדת ומנהלת מוצר',
    bio: 'מנהלת מוצר עם רקע במדעי הנתונים ומחקר התנהגותי. מתמקדת בפיתוח מוצרים שיוצרים שינוי התנהגותי מתמשך.',
    avatar: ABOUT_ASSETS.dana,
  },
  {
    name: 'דביר פרישטיק',
    role: 'מעצב חוויית משתמש',
    bio: "מעצב מוצר עם ניסיון עשיר בעיצוב התנהגות משתמשים דרך מוצרים דיגיטליים. מוביל את חוויית המוצר והעיצוב של ג'ויסטי.",
    avatar: ABOUT_ASSETS.dvir,
  },
] as const;

const ABOUT_EMPHASIS_EN = 'The interaction between a person and their personal screen';

const ABOUT_STORY_PARAS_EN: readonly (readonly string[])[] = [
  [
    'We find ourselves pulled into endless scrolling - and regret it right away. When our kids start copying us, we see the problem clearly:',
    'A whole generation is growing up in a new reality and over time, kids become more and more addicted to the screen.',
    'What kind of child do we want to raise in the age of AI?',
  ],
  [
    'To grasp how absurd this is: between ages 8 and 12, our child taps an innocent “Accept” button — a button owned by one of the tech giants — and behind that button sits a simple deal:',
    'We’ll give you free excitement and you’ll give us your attention - for free!',
  ],
  [
    `${ABOUT_EMPHASIS_EN} has been the biggest influence on the average person’s identity and values since 2004: more than parents, more than friends, more than any peer group. It’s a super-interesting, always-exciting interaction that often ends in emptiness which we then try to fill with another app… But unlike ordinary interaction, the relationship between a child and their device is visible to only one entity - an algorithm.`,
    'In recent years it has become smarter, more personalized, and even talks like a person.',
  ],
  [
    'It shows us content, makes us buy, shapes our political views, and slowly influences our values and identity.',
    'Pause for a moment: how much are you really deciding? How many of the actions you take did you truly want?',
    'Could many of those actions be the will of a smart algorithm? How well are we, as parents, protecting our space of influence?',
  ],
  [
    'Prof. Jonathan Haidt argues that recent generations are experiencing a rewiring of the brain. When we talk about a brain aged 6–25, that also includes the impact on disrupted brain development.',
  ],
  [
    'We want to raise children and people whose core identity is strong. that is why we founded Joystie.',
  ],
];

const ABOUT_TEAM_EN: readonly AboutTeamMember[] = [
  {
    name: 'Meir Nitzan',
    role: 'Founder & CEO',
    bio: 'Speaker and expert in digital wellbeing for families, entrepreneur, and former Shaldag unit officer. Leads the Joystie vision.',
    avatar: ABOUT_ASSETS.meir,
  },
  {
    name: 'Dana Friedman',
    role: 'Co-founder & Product Lead',
    bio: 'Product manager with a background in data science and behavioral research. Focused on products that create lasting behavior change.',
    avatar: ABOUT_ASSETS.dana,
  },
  {
    name: 'Dvir Frishtik',
    role: 'UX Designer',
    bio: 'Product designer with deep experience shaping user behavior through digital products. Leads Joystie’s product experience and design.',
    avatar: ABOUT_ASSETS.dvir,
  },
];

const ABOUT_HE: AboutCopy = {
  heroLine1: 'הקשב הוא המשאב החשוב ביותר של הדור הבא.',
  heroLine2: 'אנחנו כאן כדי לעזור לילדים שלנו לשמור עליו.',
  storyTitle: 'הסיפור שלנו',
  teamTitle: 'הכירו את הצוות',
  emphasis: ABOUT_EMPHASIS,
  storyParas: ABOUT_STORY_PARAS,
  team: ABOUT_TEAM,
};

const ABOUT_EN: AboutCopy = {
  heroLine1: 'Attention is the most important resource of the next generation.',
  heroLine2: 'We’re here to help our kids protect it.',
  storyTitle: 'Our story',
  teamTitle: 'Meet the team',
  emphasis: ABOUT_EMPHASIS_EN,
  storyParas: ABOUT_STORY_PARAS_EN,
  team: ABOUT_TEAM_EN,
};

export function getAboutCopy(locale: LandingLocale): AboutCopy {
  return locale === 'en' ? ABOUT_EN : ABOUT_HE;
}
