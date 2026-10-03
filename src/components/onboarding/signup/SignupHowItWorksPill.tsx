import {
  SIGNUP_HOW_IT_WORKS_PILL_PY,
  SIGNUP_HOW_IT_WORKS_PILL_PX,
} from '@/constants/signup-layout';

type SignupHowItWorksPillProps = {
  /** @deprecated Pill copy is fixed «איך מתחילים?» — kept for call-site compat. */
  childName?: string;
};

/** Figma — Green-700 pill above journey stages («איך מתחילים?»). */
export function SignupHowItWorksPill(_props: SignupHowItWorksPillProps = {}) {
  return (
    <div className="flex w-full shrink-0 justify-center">
      <div
        className="inline-flex max-w-full shrink-0 items-center justify-center rounded-[16px] bg-v03-green-700 font-simpler text-[18px] font-bold leading-[1.2] tracking-[-0.36px] text-white"
        style={{
          paddingLeft: SIGNUP_HOW_IT_WORKS_PILL_PX,
          paddingRight: SIGNUP_HOW_IT_WORKS_PILL_PX,
          paddingTop: SIGNUP_HOW_IT_WORKS_PILL_PY,
          paddingBottom: SIGNUP_HOW_IT_WORKS_PILL_PY,
        }}
      >
        <span className="text-center text-white">איך מתחילים?</span>
      </div>
    </div>
  );
}
