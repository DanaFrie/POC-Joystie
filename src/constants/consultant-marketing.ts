/**
 * Consultant sales page — `/consultant`
 * Personal + group Zoom sessions.
 */

/** Interim booking — same calendar as landing «שיחה איתנו». */
export const CONSULTANT_BOOKING_URL =
  'https://calendar.app.google/XxKAvtFC2Na2zipD9';

export type ConsultantOfferId = 'private_zoom' | 'group_zoom';

export type ConsultantOffer = {
  id: ConsultantOfferId;
  title: string;
  /** Meta line under title (e.g. duration · format · capacity). */
  meta: string;
  description?: string;
  priceShekels: number;
  priceLabel: string;
  ctaLabel: string;
  bookingUrl: string;
};

export const CONSULTANT_PAGE = {
  title: 'ייעוץ פרטי וקבוצתי',
  subtitle: 'מכירת ייעוץ עם מאיר ניצן — קביעה ותשלום',
  intro:
    'ליווי אישי או קבוצתי להורים שרוצים לבנות הרגלים דיגיטליים בריאים בבית.',
  consultantName: 'מאיר ניצן',
  consultantRole: "מלווה הורים להגיע לאיזון דיגיטלי ומייסד ג'ויסטי",
  consultantNote: 'הייעוץ מתקיים עם',
  offersHeading: 'שתי אופציות לייעוץ',
  ctaLabel: 'קביעה ותשלום',
  ctaDisabledHint: 'בחרו סוג מפגש כדי להמשיך',
  footnote: 'לאחר הבחירה תועברו לקביעת מועד ותשלום.',
} as const;

export const CONSULTANT_OFFERS: readonly ConsultantOffer[] = [
  {
    id: 'private_zoom',
    title: 'ייעוץ אישי – עושים סדר',
    meta: '45 דקות - אונליין',
    description:
      'פגישה בה נבין את הדינמיקה אצלכם בבית, נשתמש בכלים הקיימים היום ונגדיר גבולות נכונים.',
    priceShekels: 260,
    priceLabel: '₪260',
    ctaLabel: 'קביעה ותשלום',
    bookingUrl: CONSULTANT_BOOKING_URL,
  },
  {
    id: 'group_zoom',
    title: 'מפגש ייעוץ קבוצתי',
    meta: 'שעה - אונליין - עד 4 משתתפים',
    priceShekels: 100,
    priceLabel: '₪100 למשתתף',
    ctaLabel: 'קביעה ותשלום',
    bookingUrl: CONSULTANT_BOOKING_URL,
  },
] as const;
