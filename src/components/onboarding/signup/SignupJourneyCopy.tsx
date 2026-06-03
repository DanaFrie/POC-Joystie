import {
  SIGNUP_INTRO_COPY_INNER_GAP_PX,
  SIGNUP_INTRO_EYEBROW_TITLE_GAP_PX,
} from '@/constants/signup-layout';

type SignupJourneyCopyProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
};

/** Shared copy block — Figma gap 15 / 4, centered. */
export function SignupJourneyCopy({
  eyebrow,
  title,
  subtitle,
}: SignupJourneyCopyProps) {
  return (
    <section
      dir="rtl"
      className="flex w-full flex-col items-center text-center"
      style={{ gap: SIGNUP_INTRO_COPY_INNER_GAP_PX }}
    >
      <div
        className="flex w-full flex-col items-center px-[15px]"
        style={{ gap: SIGNUP_INTRO_EYEBROW_TITLE_GAP_PX }}
      >
        <p className="font-simpler text-[18px] font-normal leading-[30px] tracking-[3.78px] text-v03-green-200">
          {eyebrow}
        </p>
        <h1 className="w-full font-simpler text-[40px] font-black leading-[1.1] tracking-[-0.8px] text-white">
          {title}
        </h1>
      </div>
      <p className="w-full font-simpler text-[20px] font-normal leading-[1.2] tracking-[-0.3px] text-white">
        {subtitle}
      </p>
    </section>
  );
}
