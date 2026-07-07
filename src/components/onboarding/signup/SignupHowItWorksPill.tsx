import {
  SIGNUP_HOW_IT_WORKS_PILL_PY,
  SIGNUP_HOW_IT_WORKS_PILL_PX,
} from '@/constants/signup-layout';

/** Figma 12697:36221 — Green-700, 16px radius, 18px Bold (in-flow, not absolute). */
export function SignupHowItWorksPill() {
  return (
    <div className="flex w-full shrink-0 justify-center">
      <div
        className="inline-flex shrink-0 items-center justify-center rounded-[16px] bg-v03-green-700 font-simpler text-[18px] font-bold leading-[100%] text-white"
        style={{
          paddingLeft: SIGNUP_HOW_IT_WORKS_PILL_PX,
          paddingRight: SIGNUP_HOW_IT_WORKS_PILL_PX,
          paddingTop: SIGNUP_HOW_IT_WORKS_PILL_PY,
          paddingBottom: SIGNUP_HOW_IT_WORKS_PILL_PY,
        }}
      >
        <span className="whitespace-nowrap text-center">איך מתחילים?</span>
      </div>
    </div>
  );
}
