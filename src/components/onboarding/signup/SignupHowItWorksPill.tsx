import {
  SIGNUP_HOW_IT_WORKS_PILL_PY,
  SIGNUP_HOW_IT_WORKS_PILL_PX,
} from '@/constants/signup-layout';

type SignupHowItWorksPillProps = {
  /** Child first name — «חולקים חווית מסך עם …». */
  childName?: string;
};

/** Figma — Green-700 pill above journey stages. */
export function SignupHowItWorksPill({ childName }: SignupHowItWorksPillProps) {
  const name = childName?.trim() || 'הילד/ה';
  return (
    <div className="flex w-full shrink-0 justify-center">
      <div
        className="inline-flex max-w-full shrink-0 items-center justify-center rounded-[16px] bg-v03-green-700 font-simpler text-[18px] font-bold leading-[100%] text-white"
        style={{
          paddingLeft: SIGNUP_HOW_IT_WORKS_PILL_PX,
          paddingRight: SIGNUP_HOW_IT_WORKS_PILL_PX,
          paddingTop: SIGNUP_HOW_IT_WORKS_PILL_PY,
          paddingBottom: SIGNUP_HOW_IT_WORKS_PILL_PY,
        }}
      >
        <span className="text-center">חולקים חווית מסך עם {name}</span>
      </div>
    </div>
  );
}
