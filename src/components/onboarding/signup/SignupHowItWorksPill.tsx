import {
  SIGNUP_HOW_IT_WORKS_PILL_PY,
  SIGNUP_HOW_IT_WORKS_PILL_PX,
  SIGNUP_HOW_IT_WORKS_PILL_TOP_PX,
} from '@/constants/signup-layout';

/** Figma 12697:36221 — top 92, Green-700, 16px radius, 18px Bold. */
export function SignupHowItWorksPill() {
  return (
    <div
      className="absolute left-1/2 z-[11] -translate-x-1/2"
      style={{ top: SIGNUP_HOW_IT_WORKS_PILL_TOP_PX }}
    >
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
