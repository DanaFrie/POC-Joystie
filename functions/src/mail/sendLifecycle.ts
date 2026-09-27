import * as path from 'path';
import { sendEmail } from '../email';
import { renderPlainMail, type MailButton } from './template';

/** Dark-green wordmark, attached inline so Gmail shows it without a hosted file. */
const LOGO_PATH = path.join(__dirname, '../../assets/logo-joystie-email.png');

const MEET_TEAM_URL = 'https://calendar.app.google/XxKAvtFC2Na2zipD9';

export function appBaseUrl(): string {
  let raw = (process.env.SERVICE_FUNCTION_BASE_URL || 'https://joystie.com').trim().replace(/\/$/, '');
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
  return raw;
}

async function sendPlain(options: {
  to: string;
  subject: string;
  lang: 'he' | 'en';
  preview: string;
  before: string[];
  buttons?: MailButton[];
  after: string[];
}): Promise<void> {
  const { html, text } = renderPlainMail({
    lang: options.lang,
    preview: options.preview,
    before: options.before,
    buttons: options.buttons,
    after: options.after,
  });
  await sendEmail({
    to: options.to,
    subject: options.subject,
    html,
    text,
    attachments: [
      {
        filename: 'logo-joystie-email.png',
        path: LOGO_PATH,
        cid: 'joystie-logo',
      },
    ],
  });
}

export async function sendWelcomeEmail(params: {
  to: string;
  parentName: string;
  childName: string;
  childGender?: 'boy' | 'girl';
}): Promise<void> {
  const base = appBaseUrl();
  const withChild = params.childGender === 'girl' ? 'איתה' : 'איתו';
  await sendPlain({
    to: params.to,
    lang: 'he',
    subject: 'ברוכים הבאים לג׳ויסטי!',
    preview: 'יוצאים למסע אל עבר חיים דיגיטליים מאוזנים',
    before: [
      `היי ${params.parentName},`,
      'שמחים שהצטרפת אלינו!',
      'הגעתם לג׳ויסטי - הדרך חדשה להתמודד עם זמן מסך בבית: פחות חסימות ומלחמות, ויותר בחירה אמיתית ואחריות אישית.',
      `בצעדים הבאים נכיר את ${params.childName}, נעבור יחד ${withChild} חווית מסך משותפת ונפתח את הארנק הדיגיטלי!`,
    ],
    buttons: [{ label: 'ממשיכים ל־Joystie', href: `${base}/onboarding` }],
    after: ['נתראה בפנים,', 'צוות Joystie'],
  });
}

export async function sendChildNotStartedEmail(params: {
  to: string;
  parentName: string;
  childName: string;
  childGender?: 'boy' | 'girl';
  sendLinkUrl: string;
  calendarUrl: string;
}): Promise<void> {
  const girl = params.childGender === 'girl';
  const starts = girl ? 'תתחיל' : 'יתחיל';
  const possessive = girl ? 'שלה' : 'שלו';
  const pronoun = girl ? 'היא' : 'הוא';
  const can = girl ? 'תוכל' : 'יוכל';
  await sendPlain({
    to: params.to,
    lang: 'he',
    subject: `מחכים ש${params.childName} ${starts} את המסע ${possessive} ב-Joystie`,
    preview: 'מוכנים להמשיך את תהליך ההצטרפות?',
    before: [
      `היי ${params.parentName},`,
      'שמנו לב שלא השלמתם את תהליך ההצטרפות אלינו.',
      `מה שנשאר הוא לשלוח ל${params.childName} את הלינק האישי ${possessive} - משם ${pronoun} ${can} להיכנס, להכיר את Joystie ולהתחיל את המסע ${possessive}.`,
    ],
    buttons: [
      { label: `שליחת הלינק ל${params.childName}`, href: params.sendLinkUrl },
      { label: 'לינק תזכורת ביומן', href: params.calendarUrl },
    ],
    after: ['מחכים לכם!', 'צוות Joystie'],
  });
}

export async function sendFirstDealEmail(params: {
  to: string;
  parentName: string;
  childName: string;
}): Promise<void> {
  await sendPlain({
    to: params.to,
    lang: 'he',
    subject: 'מוכנים לדיל המסך הראשון שלכם?',
    preview: 'זה הרגע שבו הקסם מתחיל.',
    before: [
      `היי ${params.parentName},`,
      'איזה כיף! פתחתם את הארנק של ג׳ויסטי!',
      'עכשיו נשאר הצעד החשוב ביותר - ליצור יחד את דיל המסך הראשון שלכם.',
      `בדיל תחליטו יחד עם ${params.childName} את חוקי המשחק - כמה כסף מוקצים לדמי כיס וכמה כל שעת מסך שווה.`,
      'זה השלב בו הקסם האמיתי מתחיל וזמן המסך מתחיל לרדת.',
    ],
    buttons: [
      { label: 'יוצרים דיל מסך ראשון', href: `${appBaseUrl()}/dashboard?openChallenge=1` },
    ],
    after: [
      'כמה דקות עכשיו יכולות להפוך את השבוע הקרוב ליותר מאוזן.',
      'שנצא לדרך? מחכים לכם שם.',
      'צוות Joystie',
    ],
  });
}

export async function sendEnglishWaitlistEmail(to: string): Promise<void> {
  await sendPlain({
    to,
    lang: 'en',
    subject: 'You’re on the Joystie waitlist ✨',
    preview: 'We’re building a better future of kids’ screen time habits.',
    before: [
      'Hey!',
      'Thanks for joining the Joystie waitlist.',
      'We’re building a new way for families to approach screen time - with less fighting and controlling and more choice, responsibility, and healthy habits.',
      'We’re still early, and we’re working closely with families in Israel as we shape the product.',
      'We’ll keep you updated as we get closer to launch, and let you know when Joystie is ready for you.',
    ],
    buttons: [
      { label: 'Visit Joystie', href: `${appBaseUrl()}/en` },
      { label: 'Meet our team', href: MEET_TEAM_URL },
    ],
    after: ['See you soon,', 'The Joystie team'],
  });
}

export async function sendTrialEndingEmail(params: {
  to: string;
  parentName: string;
}): Promise<void> {
  await sendPlain({
    to: params.to,
    lang: 'he',
    subject: 'תקופת הניסיון שלכם ב־Joystie מסתיימת בעוד יומיים',
    preview: 'נשמח לשמוע איך התחושות!',
    before: [
      `היי ${params.parentName},`,
      'תקופת הניסיון שלכם ב־Joystie מסתיימת בעוד יומיים.\nיחד עם זאת, לאחר תום תקופת הנסיון לא תחויבו בתשלום עבור המנוי אותו רכשתם.',
    ],
    after: [
      'אנחנו עדיין בהרצה הראשונית של Joystie, ולכן הפידבק שלכם משמעותי עבורנו.\nאם יש משהו שעבד טוב, פחות טוב, או שהייתם רוצים שנעשה אחרת - נשמח מאוד לשמוע.',
      `[מוזמנים לדבר איתנו כאן](${MEET_TEAM_URL}) או לשלוח מייל חוזר`,
      'אתם חלק משמעותי מהדרך של Joystie, ליצירת עתיד טוב יותר להרגלי מסך של ילדים.',
      'צוות Joystie',
    ],
  });
}
