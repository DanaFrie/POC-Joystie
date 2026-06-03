/** Signup «איך זה עובד» — 3 שלבים (Figma 12703:42217 / 42218 / 42219). */
export const SIGNUP_JOURNEY_STAGE_COUNT = 3;

export type SignupJourneyStageIndex = 0 | 1 | 2;

export const SIGNUP_JOURNEY_STEPS = [
  {
    eyebrow: 'שלב 1',
    title: 'בוחרים יחד חבר למסע',
    subtitle: 'יחד עם הילדים, בוחרים חבר שילווה לאורך הדרך',
  },
  {
    eyebrow: 'שלב 2',
    title: 'משלימים יחד משימה קלילה',
    subtitle: 'ליצירת סנכרון בין ההורה לילדים',
  },
  {
    eyebrow: 'שלב 3',
    title: 'מגיעים להסכמות משותפות',
    subtitle: 'יחד עם הילדים, בונים תוכנית לשינוי',
  },
] as const;
