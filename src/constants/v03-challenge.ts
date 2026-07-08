/** v0.3 challenge setup / redemption — paid-state UX defaults + child money goals. */

export const V03_CHALLENGE_BUDGET = {
  min: 20,
  max: 300,
  step: 10,
  default: 100,
} as const;

export const V03_CHALLENGE_HOURLY_RATE = {
  min: 5,
  max: 50,
  step: 1,
  default: 20,
} as const;

/** Fallback when onboarding screen-time / last-challenge average is missing. */
export const V03_CHALLENGE_DEFAULT_DAILY_HOURS = 1;

export const V03_MONEY_GOAL_OPTIONS = [
  { id: 'pizza-friend', label: 'פיצה עם חבר/ה' },
  { id: 'craft-kit', label: 'ערכת יצירה' },
  { id: 'escape-room', label: 'חדר בריחה' },
  { id: 'lego', label: 'לגו (LEGO)' },
  { id: 'icecream', label: 'גלידה' },
  { id: 'football', label: 'כדורגל' },
  { id: 'save-money', label: 'אני רוצה לחסוך!' },
  { id: 'supergoal-cards', label: 'קלפי סופרגול' },
  { id: 'slime', label: 'סליים (Slime)' },
  { id: 'popcorn', label: 'פופקורן (לסרט)' },
  { id: 'playstation-game', label: 'משחק לפלייסטיישן' },
  { id: 'lol-doll', label: 'בובת לאבובו' },
] as const;

export type V03MoneyGoalId = (typeof V03_MONEY_GOAL_OPTIONS)[number]['id'];

export const V03_REDEMPTION_OPTIONS = [
  { id: 'cash', label: 'כסף מזומן' },
  { id: 'activity', label: 'פעילות משותפת' },
  { id: 'donation', label: 'תרומה' },
  { id: 'save', label: 'לחסוך להמשך' },
] as const;

export type V03RedemptionChoiceId = (typeof V03_REDEMPTION_OPTIONS)[number]['id'];
