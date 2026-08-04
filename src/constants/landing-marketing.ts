/** Marketing landing — assets + copy (Figma Home 15329:17364). */

export const LANDING_ASSETS = {
  heroLandscape: '/landing/landscape.webp',
  calmFamily: '/landing/calm-family.webp',
  footerMountainDesktop: '/landing/mountains-desktop.webp',
  footerMountainMobile: '/landing/mountains-mobile.webp',
  howItWorksHero: '/signup/child-invite/hero.webp',
  howItWorksCircle: '/landing/how-it-works-circle.webp',
  doriResearchVideo: '/landing/dori-research.mp4',
  firstDiff: '/landing/first-diff.webp',
  secondDiff: '/landing/second-diff.webp',
  thirdDiff: '/landing/third-diff.webp',
  logoWordmark: '/brand/logo-joystie.png',
  logoFooter: '/brand/logo-joystie.png',
  presentingLogo: '/landing/figma/presenting-logo.svg',
  ctaArrow: '/landing/figma/cta-arrow.svg',
  ctaArrowDark: '/landing/figma/cta-arrow-dark.svg',
  heroUnderline: '/landing/figma/hero-underline.svg',
  heroUnderlineMobile: '/landing/figma/hero-underline-mobile.svg',
  scienceBadge1: '/landing/figma/science-1.svg',
  scienceBadge2: '/landing/figma/science-2.svg',
  scienceBadge3: '/landing/figma/science-3.svg',
  wave1: '/landing/figma/wave-1.webp',
  wave2: '/landing/figma/wave-2.webp',
  wave3: '/landing/figma/wave-3.webp',
  ellipseGlow: '/landing/figma/ellipse-glow.svg',
  ellipseStats: '/landing/figma/ellipse-stats.svg',
  ellipseHow: '/landing/figma/ellipse-how.svg',
  blog1: '/landing/figma/blog-1.webp',
  blog2: '/landing/figma/blog-2.webp',
  blog3: '/landing/figma/blog-3.webp',
  founderAvatar: '/landing/meir_img.webp',
  menuGlow: '/landing/figma/menu-glow.svg',
  menuChevron: '/landing/figma/menu-chevron.svg',
  donexGlow: '/landing/figma/donex-glow.png',
  donexJoyUnderline: '/landing/figma/donex-joy-underline.svg',
  donexFull: '/landing/figma/donex-full.png',
  donex2Coins: '/landing/figma/donex2-coins.png',
  donex2Clock: '/landing/figma/donex2-clock.png',
  donex2Chevron: '/landing/figma/donex2-chevron.svg',
  donex2Full: '/landing/figma/donex2-full.png',
  doriFlyHappy: '/landing/dori-fly-happy.webp',
} as const;

export const LANDING_NAV_LINKS = [
  { href: '#what-is-joystie', label: 'מה זה ג׳ויסטי?' },
  { href: '#how-it-works', label: 'איך זה עובד?' },
  { href: '#questions', label: 'שאלות ותשובות' },
  { href: '#knowledge', label: 'מרכז הידע' },
  { href: '/about', label: 'קצת עלינו' },
] as const;

export const LANDING_FEATURES = [
  {
    badge: 'מחברים דמי כיס לזמן מסך',
    titleBefore: 'הארנק הדיגיטלי הראשון ',
    titleAccent: 'שמשנה הרגלי מסך',
    lead: 'כל דקת מסך שנחסכת שווה כסף אמיתי.',
    body: 'בסוף השבוע הילדים מממשים את החיסכון שלהם ומבינים שלכל בחירה יש משמעות, ושזמן שווה כסף.',
    image: LANDING_ASSETS.firstDiff,
    imageAlt: 'מסך הארנק הדיגיטלי בג׳ויסטי',
    reverse: false,
    wave: LANDING_ASSETS.wave1,
  },
  {
    badge: 'מטבעות קשב שמומרים לזמן מסך או לכסף',
    titleBefore: 'מנגנון של תגמול והפסד ',
    titleAccent: 'שמוביל לבחירה מודעת',
    lead: 'ההורה מקצה דמי כיס שבועיים ומטבעות קשב.',
    body: 'החוקים פשוטים: כשזמן המסך מתנהל בחוכמה ע״י הילדים, הם מרוויחים את דמי הכיס ואפילו מעבר לכך. לעומת זאת, כשחורגים מהמכסה, נאלצים לשלם על כך מדמי הכיס, מתוך אחריות כלכלית אישית.',
    image: LANDING_ASSETS.secondDiff,
    imageAlt: 'מסך המרה של מטבעות קשב',
    reverse: true,
    wave: LANDING_ASSETS.wave2,
  },
  {
    badge: 'תהליך משותף לשינוי הרגלים עמוק',
    titleBefore: 'משחקיות ליצירת ',
    titleAccent: 'מוטיבציה פנימית לשינוי',
    breakBeforeAccent: true,
    lead: 'דמות משחקית תלווה אתכם מתחילת התהליך.',
    body: 'משחקיות חכמה, תגמולים ומשימות הופכים את פיתוח ההרגלים לחוויה שהילדים רוצים לחזור אליה, ומחזקים מוטיבציה פנימית לאורך זמן.',
    image: LANDING_ASSETS.thirdDiff,
    imageAlt: 'מסך משחקיות בג׳ויסטי',
    reverse: false,
    wave: LANDING_ASSETS.wave3,
  },
] as const;

export const LANDING_HOW_STEPS = [
  {
    tab: 'הצטרפות משותפת',
    title: 'פותחים חשבון יחד עם הילדים',
    body: 'ההורה והילד מצטרפים יחד לאפליקציה ויוצאים למסע משותף, בו הם יבינו כבר מתחילתו ששניהם מרוויחים: יותר עצמאות (וכסף) לילד, ופחות מאבקים סביב המסך להורה',
    image: LANDING_ASSETS.howItWorksHero,
  },
  {
    tab: 'קביעת יעדים ואתגרים',
    title: 'מגדירים יחד את חוקי המשחק',
    body: 'קובעים יחד מכסת מסך, דמי כיס ומטבעות קשב — כך שהילדים מבינים את הכללים מראש ומרגישים שותפים להחלטות, לא רק מצייתים להן.',
    image: LANDING_ASSETS.howItWorksHero,
  },
  {
    tab: 'עיצוב מחדש של הרגלי מסך',
    title: 'בונים הרגלים שנשארים',
    body: 'לאורך השבוע הילדים מתרגלים בחירה מודעת: כל דקה שנחסכת שווה ערך אמיתי, והתהליך הופך להרגל משפחתי במקום מאבק יומיומי.',
    image: LANDING_ASSETS.howItWorksHero,
  },
] as const;

export const LANDING_SCIENCE = [
  {
    n: 1 as const,
    titleParts: [{ text: 'החלטות מושפעות ממשוב ' }, { text: 'ותגמול מיידי', highlight: true }],
    body: 'מחקרים בתחום הכלכלה ההתנהגותית, ובהם עבודותיו של Richard Thaler, מראים באופן מובהק שמשוב ותגמול מיידי משפיעים באופן משמעותי על קבלת החלטות ועל שינוי התנהגות עמוק - עיקרון שמיושם ישירות בג׳ויסטי.',
  },
  {
    n: 2 as const,
    titleParts: [
      { text: 'תמריצים יוצרים הרגלים,', highlight: true },
      { text: '\nגם לטווח הארוך' },
    ],
    body: 'מחקר רחב היקף של University of Pennsylvania ו-Carnegie Mellon University בקרב אלפי תלמידים מצא כי תמריצים קטנים יכולים לסייע ביצירת הרגלים חדשים, שנשמרים גם לאחר שהתמריצים עצמם מסתיימים.',
  },
  {
    n: 3 as const,
    titleParts: [
      { text: 'משחקיות מגבירה ' },
      { text: '\nמעורבות ומוטיבציה', highlight: true },
    ],
    body: 'סקירה שיטתית של עשרות מחקרים על Gamification in Education מצאה שמשחקיות, משוב מיידי ותגמולים מגבירים את המעורבות והמוטיבציה של ילדים בתהליכי למידה ופיתוח הרגלים.',
  },
] as const;

export const LANDING_FAQ = [
  {
    q: 'האם לא נוצרת כאן מוטיבציה שאינה חינוכית?',
    a: 'תגמול הוא רק נקודת ההתחלה, לא המטרה.\n\nבדיוק כפי שילדים מקבלים דמי כיס כדי ללמוד אחריות כלכלית, Joystie משתמשת בתגמול ככלי חינוכי שממחיש שלזמן יש ערך. המטרה היא לפתח אצל הילדים שליטה עצמית, קבלת החלטות, חשיבה כלכלית והרגלים שילוו אותם גם כשהתגמול כבר לא יהיה שם.',
  },
  {
    q: 'מה קורה אם הילד חורג ממכסת זמן המסך שלו?',
    a: 'חריגה מהמכסה עולה מדמי הכיס — בדיוק כמו בעולם האמיתי. כך הילד לומד שיש מחיר לבחירות, במקום שההורה יהפוך לשוטר שמנתק את המסך בכוח.',
  },
  {
    q: 'האם אפשר להתאים את הכללים לכל ילד בנפרד?',
    a: 'כן. לכל ילד אפשר להגדיר מכסת מסך, דמי כיס ומטבעות קשב שמתאימים לגיל, לשגרה ולמשפחה שלכם.',
  },
  {
    q: 'אילו מכשירים ומערכות הפעלה נתמכים?',
    a: 'Joystie פועלת דרך הדפדפן ומחוברת לניהול זמן מסך במשפחה. אנחנו ממשיכים להרחיב תמיכה במכשירים ובמערכות הפעלה לפי צרכי המשפחות.',
  },
  {
    q: 'האם אפשר לנסות את Joystie לפני שמתחייבים?',
    a: 'כן. אפשר להתחיל בתקופת ניסיון, להכיר את התהליך יחד עם הילדים, ורק אחר כך להחליט אם זה מתאים למשפחה שלכם.',
  },
] as const;

export const LANDING_BLOG = [
  {
    author: 'דנה פרידמן',
    avatar: '/dana_img.jpg',
    title: 'איך מגדלים ילדים עם שליטה עצמית בעולם של אינסוף גירויים',
    excerpt: 'למה המטרה היא לא להרחיק ילדים ממסכים, אלא ללמד אותם לנהל אותם',
    image: LANDING_ASSETS.blog1,
  },
  {
    author: 'דביר פרישטיק',
    avatar: LANDING_ASSETS.founderAvatar,
    title: 'מה באמת קורה במוח של הילדים בעידן הדיגיטלי',
    excerpt: 'למה המטרה היא לא להרחיק ילדים ממסכים, אלא ללמד אותם לנהל אותם',
    image: LANDING_ASSETS.blog2,
  },
  {
    author: 'מאיר ניצן',
    avatar: LANDING_ASSETS.founderAvatar,
    title: 'איך כלכלה התנהגותית עוזרת לילדים לקבל החלטות טובות',
    excerpt: 'למה המטרה היא לא להרחיק ילדים ממסכים, אלא ללמד אותם לנהל אותם',
    image: LANDING_ASSETS.blog3,
  },
] as const;

export const LANDING_SOCIAL = [
  { href: 'https://calendar.app.google/XxKAvtFC2Na2zipD9', label: 'שיחה איתנו' },
  { href: 'https://www.linkedin.com/company/joystie', label: 'לינקדאין' },
  { href: 'https://www.facebook.com/profile.php?id=61586594025586', label: 'פייסבוק' },
] as const;

/** Page + desktop footer bar — Figma links + שיחה איתנו */
export const LANDING_FOOTER_LINKS = [
  { href: 'https://calendar.app.google/XxKAvtFC2Na2zipD9', label: 'שיחה איתנו' },
  { href: 'https://www.facebook.com/profile.php?id=61586594025586', label: 'פייסבוק' },
  { href: 'https://www.linkedin.com/company/joystie', label: 'לינקדאין' },
] as const;
