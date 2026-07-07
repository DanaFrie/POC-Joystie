import {
  SIGNUP_INTRO_COPY_INNER_GAP_PX,
  SIGNUP_INTRO_EYEBROW_TITLE_GAP_PX,
} from '@/constants/signup-layout';

type SignupJourneyCopyProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  /** Canvas height scale — tightens type on SE. */
  compactScale?: number;
};

/** Shared copy block — Figma gap 15 / 4, centered. */
export function SignupJourneyCopy({
  eyebrow,
  title,
  subtitle,
  compactScale = 1,
}: SignupJourneyCopyProps) {
  const titleSizePx = Math.round(40 * compactScale);
  const subtitleSizePx = Math.round(20 * compactScale);
  const eyebrowSizePx = Math.round(18 * compactScale);

  return (
    <section
      dir="rtl"
      className="flex w-full flex-col items-center text-center"
      style={{ gap: SIGNUP_INTRO_COPY_INNER_GAP_PX * compactScale }}
    >
      <div
        className="v03-funnel-enter-0 flex w-full flex-col items-center px-[15px]"
        style={{ gap: SIGNUP_INTRO_EYEBROW_TITLE_GAP_PX * compactScale }}
      >
        <p
          className="font-simpler font-normal text-v03-green-200"
          style={{
            fontSize: eyebrowSizePx,
            lineHeight: `${Math.round(30 * compactScale)}px`,
            letterSpacing: `${(3.78 * compactScale).toFixed(2)}px`,
          }}
        >
          {eyebrow}
        </p>
        <h1
          className="w-full font-simpler font-black text-white"
          style={{
            fontSize: titleSizePx,
            lineHeight: 1.1,
            letterSpacing: `${(-0.8 * compactScale).toFixed(2)}px`,
          }}
        >
          {title}
        </h1>
      </div>
      <p
        className="v03-funnel-enter-1 w-full font-simpler font-normal text-white"
        style={{
          fontSize: subtitleSizePx,
          lineHeight: 1.2,
          letterSpacing: `${(-0.3 * compactScale).toFixed(2)}px`,
        }}
      >
        {subtitle}
      </p>
    </section>
  );
}
