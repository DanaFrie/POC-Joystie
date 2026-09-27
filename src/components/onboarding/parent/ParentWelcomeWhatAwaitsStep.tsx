'use client';

import {
  useFunnelFullBleed,
  useFunnelViewportMetrics,
} from '@/components/ui/FunnelViewportContext';
import type { OnboardingParentRole } from '@/lib/onboarding/parentRole';

type ParentWelcomeWhatAwaitsStepProps = {
  role: OnboardingParentRole | null;
  onContinue: () => void;
};

function IconWand() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <path
        d="M4.71424 9.16854L3.48893 11.9255C1.94304 15.4037 1.17009 17.1428 2.01369 17.9865C2.85729 18.83 4.59642 18.0571 8.07468 16.5112L10.8316 15.2859C12.9295 14.3535 13.9784 13.8873 14.1453 12.9884C14.3122 12.0895 13.5005 11.2778 11.8773 9.65454L10.3456 8.12287C8.72229 6.49957 7.91064 5.68792 7.01172 5.85483C6.11279 6.02174 5.64661 7.07066 4.71424 9.16854Z"
        fill="#05161A"
        stroke="#05161A"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.41667 8.75L11.25 14.5833M3.75 12.9167L7.08333 16.25"
        stroke="#1BECAE"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.3333 6.66663L15.8333 4.16663"
        stroke="#05161A"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.2292 4.99996H18.1251M18.3334 4.99996C18.3334 5.11502 18.2401 5.20829 18.1251 5.20829C18.01 5.20829 17.9167 5.11502 17.9167 4.99996C17.9167 4.8849 18.01 4.79163 18.1251 4.79163C18.2401 4.79163 18.3334 4.8849 18.3334 4.99996Z"
        stroke="#05161A"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.3958 11.0417H17.2916M17.4999 11.0417C17.4999 11.1568 17.4066 11.25 17.2916 11.25C17.1765 11.25 17.0833 11.1568 17.0833 11.0417C17.0833 10.9266 17.1765 10.8334 17.2916 10.8334C17.4066 10.8334 17.4999 10.9266 17.4999 11.0417Z"
        stroke="#05161A"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.1042 1.87496H15.0001M15.2084 1.87496C15.2084 1.99002 15.1151 2.08329 15.0001 2.08329C14.885 2.08329 14.7917 1.99002 14.7917 1.87496C14.7917 1.7599 14.885 1.66663 15.0001 1.66663C15.1151 1.66663 15.2084 1.7599 15.2084 1.87496Z"
        stroke="#05161A"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.27075 2.70833H9.16659M9.37492 2.70833C9.37492 2.82339 9.28159 2.91667 9.16659 2.91667C9.0515 2.91667 8.95825 2.82339 8.95825 2.70833C8.95825 2.59327 9.0515 2.5 9.16659 2.5C9.28159 2.5 9.37492 2.59327 9.37492 2.70833Z"
        stroke="#05161A"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.8309 1.66663C12.1635 2.22218 12.4296 3.66663 10.8333 4.99996"
        stroke="#05161A"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.3333 8.16891C17.7777 7.83634 16.3333 7.57028 15 9.16663"
        stroke="#05161A"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={15}
      height={21}
      viewBox="0 0 15 21"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <path
        d="M11.0965 15.2456L13.0668 7.46519C13.6474 5.17287 13.9376 4.0267 13.4058 3.13423C12.874 2.24173 11.7279 1.95149 9.43552 1.37098C7.14319 0.790466 5.99703 0.500211 5.10455 1.032C4.21207 1.5638 3.92181 2.70997 3.3413 5.0023L1.37099 12.7827C0.790481 15.075 0.500228 16.2212 1.032 17.1137C1.56381 18.0062 2.70998 18.2964 5.00231 18.8769C7.29464 19.4575 8.44077 19.7477 9.33331 19.216C10.2258 18.6841 10.516 17.5379 11.0965 15.2456Z"
        fill="#05161A"
        stroke="#05161A"
        strokeWidth="1.50488"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="9.4142"
        cy="3.24104"
        r="0.909091"
        transform="rotate(14.2108 9.4142 3.24104)"
        fill="#1BECAE"
      />
    </svg>
  );
}

function IconKid() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={23}
      height={23}
      viewBox="0 0 23 23"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <path
        d="M11.25 20.625C16.4277 20.625 20.625 16.4277 20.625 11.25C20.625 6.07233 16.4277 1.875 11.25 1.875C6.07233 1.875 1.875 6.07233 1.875 11.25C1.875 16.4277 6.07233 20.625 11.25 20.625Z"
        fill="#05161A"
        stroke="#05161A"
        strokeWidth="1.40625"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.25 1.875C13.125 1.875 14.5312 3.06518 14.5312 4.41732C14.5312 5.29223 14.0889 6.5625 12.6562 6.5625C11.8883 6.5625 11.3979 5.99482 11.25 5.625"
        stroke="#1BECAE"
        strokeWidth="1.40625"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.6484 9.73781V10.2342M7.85156 9.73781V10.2342M8.20312 10.0781C8.20312 9.68981 8.04573 9.375 7.85156 9.375C7.6574 9.375 7.5 9.68981 7.5 10.0781C7.5 10.4664 7.6574 10.7812 7.85156 10.7812C8.04573 10.7812 8.20312 10.4664 8.20312 10.0781ZM15 10.0781C15 9.68981 14.8426 9.375 14.6484 9.375C14.4543 9.375 14.2969 9.68981 14.2969 10.0781C14.2969 10.4664 14.4543 10.7812 14.6484 10.7812C14.8426 10.7812 15 10.4664 15 10.0781Z"
        stroke="#1BECAE"
        strokeWidth="1.40625"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 15C8.35511 16.1385 9.71653 16.875 11.25 16.875C12.7835 16.875 14.1449 16.1385 15 15"
        stroke="#1BECAE"
        strokeWidth="1.40625"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ROWS = [
  {
    title: 'מצטרפים בתהליך כיפי',
    body: 'בדרך נבקש קצת פרטים כדי להבין את הרגלי המסך היום, ולהתאים את החוויה',
    Icon: IconWand,
  },
  {
    title: 'חולקים חווית מסך משותפת',
    body: 'עוד לפני פתיחת הארנק, נשבור חומות סביב המסך יחד עם הילדים',
    Icon: IconPhone,
  },
  {
    title: 'מתחילים עם ילד אחד',
    body: 'ולאחר פתיחת הארנק, תוכלו להוסיף ילדים או לשנות פרטים',
    Icon: IconKid,
  },
] as const;

const BULLET_ENTER = [
  'v03-welcome-enter-bullet-0',
  'v03-welcome-enter-bullet-1',
  'v03-welcome-enter-bullet-2',
] as const;

function WelcomeDashedDivider({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex h-0 w-full shrink-0 items-center self-stretch ${className}`}
      style={{ transform: 'rotate(-180deg)' }}
      aria-hidden
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="327"
        height="2"
        viewBox="0 0 327 2"
        fill="none"
        className="w-full max-w-full"
      >
        <path
          d="M326 1L0.999991 0.999972"
          stroke="#00FFB3"
          strokeOpacity="0.1"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="8 8"
        />
      </svg>
    </div>
  );
}

const HEADER_BLOCK_PX = 122;
/** Fixed air above title + below subtitle (never eaten by flex centering). */
const HEADER_EDGE_GAP_PX = 20;
const SHEET_CHROME_PX = 36 + 220 + 67;
const GAP_SLOTS = 5;

/**
 * Figma 14663:29231 — welcome / «מה מחכה לנו?» after parent role.
 * Full-bleed shell so the slider sits on the real screen bottom (no green gap).
 * 20px above header + 20px below subtitle; prefer 40px frame gaps, shrink only if needed.
 */
export function ParentWelcomeWhatAwaitsStep({
  role,
  onContinue,
}: ParentWelcomeWhatAwaitsStepProps) {
  const line1 = role === 'father' ? 'ברוך הבא' : 'ברוכה הבאה';
  const { usableCanvasHeightPx, viewportHeight, scale } =
    useFunnelViewportMetrics();
  const bleedStyle = useFunnelFullBleed();

  /** Full-bleed height in canvas px — includes letterbox / safe-area under the artboard. */
  const bleedHeightPx = Math.max(
    usableCanvasHeightPx,
    Math.round(viewportHeight / Math.max(scale, 0.0001))
  );

  const roomForGaps =
    bleedHeightPx -
    HEADER_EDGE_GAP_PX -
    HEADER_BLOCK_PX -
    HEADER_EDGE_GAP_PX -
    SHEET_CHROME_PX;
  const sliderGapPx = Math.max(
    8,
    Math.min(40, Math.floor(roomForGaps / GAP_SLOTS))
  );

  return (
    <div className="relative h-full min-h-0 w-full">
      {/*
        Absolute full-bleed shell — extends into bottom letterbox so the slider
        can sit flush on the screen edge (CTA stays inside the sheet).
      */}
      <section
        className="z-[10] flex flex-col overflow-hidden"
        style={bleedStyle}
        aria-label="מה מחכה לנו"
      >
        <div
          className="pointer-events-none absolute z-[1]"
          aria-hidden
          style={{
            top: 330,
            left: 51,
            width: 272,
            height: 272,
            borderRadius: 272,
            background: 'rgba(0, 255, 179, 0.90)',
            filter: 'blur(150px)',
          }}
        />

        {/* Always ≥20px above the header */}
        <div
          className="relative z-[11] w-full shrink-0"
          style={{ height: HEADER_EDGE_GAP_PX }}
          aria-hidden
        />

        <div className="relative z-[11] flex min-h-0 w-full flex-1 items-center justify-center px-[82px]">
          <header className="flex w-[211px] flex-col items-center gap-1 text-center">
            <h1 className="v03-welcome-enter-title w-full font-simpler text-[40px] font-bold leading-[1.1] tracking-[-1.2px] text-white">
              <span className="block">{line1}</span>
              <span className="block">
                לג׳ויסטי{' '}
                <span
                  className="inline-block text-[32px] font-bold leading-[1.1] tracking-[-0.96px]"
                  aria-hidden
                >
                  👋
                </span>
              </span>
            </h1>
            <p className="v03-welcome-enter-subtitle w-full font-simpler text-[24px] font-normal leading-[1.35] tracking-[-0.72px] text-white/80">
              מה מחכה לנו?
            </p>
          </header>
        </div>

        {/* Always ≥20px between subtitle and slider */}
        <div
          className="relative z-[11] w-full shrink-0"
          style={{ height: HEADER_EDGE_GAP_PX }}
          aria-hidden
        />

        <div
          className="v03-welcome-enter-sheet relative z-[12] flex max-h-[min(566px,calc(100%-9rem))] w-full shrink-0 flex-col items-center overflow-hidden rounded-t-[36px] bg-[rgba(9,35,38,0.5)] px-[26px] pt-9 shadow-[2px_2px_15px_rgba(0,0,0,0.08)] outline outline-1 outline-white/25 outline-offset-[-1px] backdrop-blur-[15px]"
          style={{ gap: sliderGapPx }}
        >
          <div
            className="flex w-full flex-col items-stretch"
            style={{ gap: sliderGapPx }}
          >
            {ROWS.map((row, index) => (
              <div key={row.title} className="contents">
                <div
                  className={`flex w-full items-start justify-end gap-3 ${BULLET_ENTER[index]}`}
                  dir="rtl"
                >
                  <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center gap-[9.375px] rounded-[281.25px] bg-[#1BECAE]">
                    <row.Icon />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col items-stretch gap-1 text-right">
                    <p className="w-full font-simpler text-[24px] font-bold leading-[26.4px] text-white">
                      {row.title}
                    </p>
                    <p className="w-full font-simpler text-[18px] font-normal leading-[22.5px] text-[#dce4e6]">
                      {row.body}
                    </p>
                  </div>
                </div>
                {index < ROWS.length - 1 ? (
                  <WelcomeDashedDivider
                    className={
                      index === 0
                        ? 'v03-welcome-enter-divider-0'
                        : 'v03-welcome-enter-divider-1'
                    }
                  />
                ) : null}
              </div>
            ))}
          </div>

          <div
            className="v03-welcome-enter-cta flex w-full shrink-0 flex-col items-center gap-[15px]"
            style={{
              paddingBottom: 'max(15px, env(safe-area-inset-bottom, 0px))',
            }}
          >
            <button
              type="button"
              onClick={onContinue}
              className="inline-flex h-[55px] w-full max-w-v03-content items-center justify-center overflow-hidden rounded-[22px] bg-white px-[15px] py-2 font-simpler text-[18px] font-bold leading-[21.6px] text-v03-green-900 shadow-[2px_2px_20px_rgba(109,109,109,0.15)] transition hover:brightness-95"
            >
              קדימה, מתחילים!
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
