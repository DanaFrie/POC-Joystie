/** Parent post-game funnel — Figma 13615:10485 / 13615:10486. */

export const PARENT_POST_GAME_WIN_FADE_MS = 1_000;
export const PARENT_POST_GAME_WAIT_CHILD_CHANGE_MS = 6_000;
export const PARENT_POST_GAME_WAIT_ADDITIONAL_CHANGE_MS = 6_000;
export const PARENT_POST_GAME_WAIT_DORI_SELFIE_MS = 6_000;

/** Hardcoded until child onboarding writes the chosen change. */
export const PARENT_POST_GAME_DEMO_CHILD_CHANGE =
  'לנסות ללכת לישון בשעה קצת יותר מוקדמת';

/** Figma 13615:10485 — child change confirm frame. */
export const PARENT_CONFIRM_CHILD_CHANGE = {
  contentTop: 72,
  contentBottom: 34,
  sectionGap: 42,
  heroGap: 26,
  iconSize: 49,
  headline: {
    fontSize: 30,
    lineHeight: 33,
    letterSpacing: -0.6,
    textShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
  },
  card: {
    borderRadius: 24,
    paddingX: 20,
    paddingY: 16,
    gap: 10,
    outlineWidth: 1.5,
  },
  cardLabel: {
    fontSize: 16,
    lineHeight: 21.6,
  },
  cardText: {
    fontSize: 24,
    lineHeight: 30,
  },
  buttonsGap: 8,
  bottomSectionGap: 20,
  primaryButtonClass:
    'inline-flex h-[55px] w-full items-center justify-center gap-2 rounded-[22px] bg-[#00FFB3] px-[15px] py-2 font-simpler text-[18px] font-bold leading-[1.2] tracking-[-0.36px] text-right text-v03-green-900 shadow-[2px_2px_20px_rgba(109,109,109,0.15)] transition hover:brightness-95',
  secondaryButtonClass:
    'inline-flex h-[55px] w-full items-center justify-center gap-2 rounded-[22px] border border-solid border-white bg-transparent px-[15px] py-2 font-simpler text-[18px] font-bold leading-[1.2] tracking-[-0.36px] text-right text-white shadow-[2px_2px_20px_rgba(109,109,109,0.15)] transition hover:bg-white/5',
} as const;

/** Figma 13615:10486 — parent additional change choice. */
export const PARENT_ADDITIONAL_CHANGE = {
  contentTop: 72,
  sectionGap: 24,
  headerGap: 5,
  optionsGap: 12,
  cardsGap: 16,
  cardTextGap: 4,
  headline: {
    fontSize: 30,
    lineHeight: 33,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 21.6,
  },
  card: {
    borderRadius: 24,
    paddingX: 25,
    paddingY: 20,
    gap: 20,
    outlineWidth: 1.5,
  },
  cardTitle: {
    fontSize: 20,
    lineHeight: 24,
  },
  cardDesc: {
    fontSize: 16,
    lineHeight: 21.6,
  },
  customField: {
    labelGap: 2,
    minHeight: 143,
    inputBorderRadius: 18,
    inputPaddingX: 15,
    inputPaddingY: 14,
    outlineWidth: 1,
  },
} as const;

/** Preset suggestions until backend provides a curated list. */
export const PARENT_POST_GAME_ADDITIONAL_CHANGE_OPTIONS = [
  {
    id: 'evening-screen',
    title: 'לנסות לא להיות מול המסך בשעות הערב',
    description: 'מומלץ כדי לשפר את איכות השינה',
  },
  {
    id: 'tasks-first',
    title: 'להתמקד במשימות ובסיומן, לפני זמן מסך',
    description: 'מסייע בפיתוח דחיית סיפוקים ואחריות אישית',
  },
  {
    id: 'quality-content',
    title: 'לצפות בפחות סרטונים קצרים ויותר בתוכן איכותי',
    description: 'מסייע בשיפור הקשב והריכוז',
  },
  {
    id: 'hobbies',
    title: 'למצוא יותר זמן לתחביבים',
    description: 'תורם לפיתוח Soft-skills ולהרחבת האופקים',
  },
] as const;
