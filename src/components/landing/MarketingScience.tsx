import { LANDING_ASSETS, LANDING_SCIENCE } from '@/constants/landing-marketing';
import { LandingReveal } from '@/components/landing/LandingReveal';
import { LandingLazyVideo } from '@/components/landing/LandingLazyVideo';

/** Frosted number badge — Figma science cards; digit 1 path from design export. */
function ScienceDigit({ n }: { n: 1 | 2 | 3 }) {
  if (n === 1) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="7"
        height="17"
        viewBox="0 0 7 17"
        fill="none"
        className="shrink-0"
        aria-hidden
      >
        <path
          d="M2.89169 16.4849V5.21415H0V2.61846C2.02646 2.61846 3.18769 1.57108 3.71138 0H6.76246V16.4849H2.89169Z"
          fill="#FFF"
        />
      </svg>
    );
  }

  if (n === 2) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="11"
        height="17"
        viewBox="17.05 13.25 13.9 21.5"
        fill="none"
        className="h-[16.485px] w-[10.66px] shrink-0"
        aria-hidden
      >
        <path
          d="M17.6291 34.7491V31.5782L24.96 22.5891C26.0655 21.2509 26.4436 20.3782 26.4436 19.5636C26.4436 18.2545 25.4545 17.3527 24.0291 17.3527C23.1564 17.3527 22.4582 17.7018 22.0218 18.2836C21.5273 18.9818 21.4691 19.7382 21.4691 20.5236H17.0473C17.0473 16.16 19.8691 13.2509 24.4073 13.2509C28.3055 13.2509 30.9527 15.4618 30.9527 19.0109C30.9527 21.1636 30.0509 23.0836 27.4036 26.2545L23.7382 30.6764H30.5745V34.7491H17.6291Z"
          fill="#FFF"
        />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="10"
      height="17"
      viewBox="17.57 13.27 12.86 21.47"
      fill="none"
      className="h-[16.485px] w-[9.87px] shrink-0"
      aria-hidden
    >
      <path
        d="M21.2364 34.7345C19.84 34.7345 18.6473 34.5018 17.5709 34.0073V29.6727C18.6764 30.2545 20.0145 30.5455 21.3236 30.5455C24.1455 30.5455 25.7745 29.1491 25.7745 26.9964C25.7745 25.3091 24.7564 24.2327 23.0691 24.2327C22.1964 24.2327 21.4109 24.5236 20.7709 25.0473L20.0727 21.2945L23.4473 17.2509H17.7745V13.2655H29.2073V16.4073L25.6582 20.5964C28.5964 21.0909 30.4291 23.2436 30.4291 26.5891C30.4291 31.3891 26.7055 34.7345 21.2364 34.7345Z"
        fill="#FFF"
      />
    </svg>
  );
}

/**
 * Badge — Figma 15445:6202: 37×37, radius 19.788, bg white/10,
 * absolute right 28 / top -19. Digit flex-centered (ignore Dev Mode
 * horizontal padding — it would collapse a border-box 37px frame).
 */
function ScienceBadge({
  n,
  size = 'mobile',
}: {
  n: 1 | 2 | 3;
  size?: 'mobile' | 'desktop';
}) {
  const mobile = size === 'mobile';
  return (
    <div
      className={
        mobile
          ? 'absolute right-7 top-[-19px] z-10 flex h-[37px] w-[37px] shrink-0 flex-col items-center justify-center rounded-[19.788px] bg-[rgba(255,255,255,0.10)]'
          : 'absolute -top-6 right-9 z-10 flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-[24px] bg-[rgba(255,255,255,0.10)]'
      }
      aria-hidden
    >
      <ScienceDigit n={n} />
    </div>
  );
}
function DoriVideoDesktop() {
  return (
    <div className="relative h-[405px] w-[334px] shrink-0 overflow-hidden">
      <LandingLazyVideo
        className="absolute max-w-none object-cover"
        style={{
          left: -49.4,
          top: -31.71,
          width: 449.68,
          height: 449.68,
        }}
        src={LANDING_ASSETS.doriResearchVideo}
        aria-label="דורי מציג את המדע מאחורי ג׳ויסטי"
      />
    </div>
  );
}

/**
 * Mobile — Figma 15445:6189 clip 178.543×217.568;
 * video 15445:6190 @ left −26.41 / top −16.95 / 240.383²
 */
function DoriVideoMobile() {
  return (
    <div className="relative h-[217.568px] w-[178.543px] shrink-0 overflow-hidden">
      <LandingLazyVideo
        className="absolute max-w-none object-cover"
        style={{
          left: -26.41,
          top: -16.95,
          width: 240.383,
          height: 240.383,
        }}
        src={LANDING_ASSETS.doriResearchVideo}
        aria-label="דורי מציג את המדע מאחורי ג׳ויסטי"
      />
    </div>
  );
}

type ScienceCardData = (typeof LANDING_SCIENCE)[number];

/** Mint underline bar behind highlighted title words — Figma Rectangle 6552 */
const MOBILE_HIGHLIGHT_BAR: Record<number, { left: number; top: number; width: number }> = {
  0: { left: 108, top: 22, width: 101 },
  1: { left: 17, top: 1, width: 192 },
  2: { left: 51, top: 22, width: 156 },
};

function ScienceTitle({
  card,
  size,
}: {
  card: ScienceCardData;
  size: 'mobile' | 'desktop';
}) {
  const textClass =
    size === 'mobile'
      ? 'font-rubik text-[20px] font-bold leading-[1.05] tracking-[-0.6px]'
      : 'font-rubik text-2xl font-bold leading-[1.1] tracking-[-0.72px]';
  const highlightClass =
    size === 'mobile' ? 'text-[#092125]' : 'bg-[#00ffb3] text-[#05161a]';

  return (
    <h3 className={`relative z-[1] w-full text-right text-white ${textClass}`}>
      {card.titleParts.map((part) => {
        const highlighted = 'highlight' in part && part.highlight;
        if (part.text.includes('\n')) {
          return (
            <span key={part.text}>
              {part.text.split('\n').map((line, i) => (
                <span key={`${part.text}-${i}`}>
                  {i > 0 ? <br /> : null}
                  {highlighted ? (
                    size === 'mobile' ? (
                      <span className={highlightClass}>{line}</span>
                    ) : (
                      <mark className={highlightClass}>{line}</mark>
                    )
                  ) : (
                    line
                  )}
                </span>
              ))}
            </span>
          );
        }
        if (highlighted) {
          return size === 'mobile' ? (
            <span key={part.text} className={highlightClass}>
              {part.text}
            </span>
          ) : (
            <mark key={part.text} className={highlightClass}>
              {part.text}
            </mark>
          );
        }
        return <span key={part.text}>{part.text}</span>;
      })}
    </h3>
  );
}

function ScienceCard({
  card,
  className = '',
}: {
  card: ScienceCardData;
  className?: string;
}) {
  return (
    <article
      dir="rtl"
      className={`relative flex h-[305.297px] w-full flex-col overflow-visible rounded-[26px] bg-white/10 px-[30px] pb-[35px] pt-[45px] text-right ${className}`}
    >
      <ScienceBadge n={card.n} size="desktop" />
      <div className="relative z-[1] flex w-full flex-col items-end gap-[9px] text-right text-white">
        <ScienceTitle card={card} size="desktop" />
        <p className="w-full text-right font-rubik text-base leading-[1.28] tracking-[-0.32px]">
          {card.body}
        </p>
      </div>
    </article>
  );
}

/** Mobile card — Figma 15445:6196 / 6204 / 6214: 267×262, radius 25.671 */
function ScienceCardMobile({
  card,
  index,
}: {
  card: ScienceCardData;
  index: number;
}) {
  const bar = MOBILE_HIGHLIGHT_BAR[index];

  return (
    <article
      dir="rtl"
      className="relative flex h-[262px] w-[267px] shrink-0 flex-col overflow-visible rounded-[25.671px] bg-white/10 px-[30px] pb-5 pt-[30px] text-right"
    >
      <ScienceBadge n={card.n} size="mobile" />
      <div className="relative z-[1] flex w-full flex-col items-end gap-[9px] text-right">
        {bar ? (
          <div
            className="pointer-events-none absolute bg-[#00ffb3]"
            style={{ left: bar.left, top: bar.top, width: bar.width, height: 20 }}
            aria-hidden
          />
        ) : null}
        <ScienceTitle card={card} size="mobile" />
        <p className="relative z-[1] w-full text-right font-rubik text-sm leading-[1.25] tracking-[-0.28px] text-white">
          {card.body}
        </p>
      </div>
    </article>
  );
}

/**
 * Mobile science — Figma Home_Mobile 15445:6187
 * Header + Dori (6188) then horizontal card row (6195) gap 21.
 * Desktop — Figma 1597882682 (cards) + 1597882688 (copy+Dori).
 */
export function MarketingScience() {
  return (
    <section className="landing-section landing-gutter-md relative py-12 md:py-24">
      {/* Mobile — Figma 15445:6187. Page is RTL: items-start = visual right (Dori). */}
      <div className="relative z-[2] flex flex-col gap-[45px] lg:hidden">
        <LandingReveal className="flex w-full flex-col items-start gap-[18px] px-6 text-right">
          <div className="flex w-full max-w-[329px] flex-col items-start gap-[18px] self-start">
            <DoriVideoMobile />
            <div className="flex w-full flex-col items-end gap-2 text-right">
              <h2 className="w-full font-rubik text-[30px] font-bold leading-[1.15] tracking-[-0.9px] text-white">
                המדע מאחורי ג׳ויסטי
              </h2>
              <p className="w-full font-rubik text-base leading-[1.33] tracking-[-0.24px] text-[#abbec3]">
                מאחורי כל פיצ׳ר בג׳ויסטי עומדים עקרונות מוכחים ממדעי ההתנהגות, שנועדו לעזור לילדים
                לפתח הרגלים בריאים בעולם הדיגיטלי
              </p>
            </div>
          </div>
        </LandingReveal>

        {/*
          Horizontal cards — Figma 15445:6195 gap 21.
          pt-[19px]: overflow-x-auto clips Y; pad so badge (top:-19) stays visible above the card.
        */}
        <LandingReveal className="w-full overflow-visible">
          <div
            className="flex w-full flex-row items-start gap-[21px] overflow-x-auto overscroll-x-contain pt-[19px] v03-scroll-hidden"
            dir="rtl"
          >
            <div className="w-6 shrink-0" aria-hidden />
            {LANDING_SCIENCE.map((card, index) => (
              <ScienceCardMobile key={card.body.slice(0, 24)} card={card} index={index} />
            ))}
            <div className="w-6 shrink-0" aria-hidden />
          </div>
        </LandingReveal>
      </div>

      {/*
        Desktop — Figma: cards left (1597882682), copy+Dori right (1597882688).
        Cards use dir=rtl + text-right for in-box copy.
      */}
      <div
        className="landing-section-fg relative mx-auto hidden min-h-[1299px] w-full max-w-[806px] lg:block"
        dir="ltr"
      >
        {/* pt-6 so card badges (-top-6) are not clipped by stacking/overflow */}
        <div className="absolute left-0 top-[213px] flex w-[320px] flex-col gap-[72px] overflow-visible pt-6">
          {LANDING_SCIENCE.map((card, index) => (
            <LandingReveal
              key={card.body.slice(0, 24)}
              delayMs={120 + index * 120}
              className="overflow-visible"
            >
              <ScienceCard card={card} />
            </LandingReveal>
          ))}
        </div>

        <LandingReveal
          className="absolute left-[374px] top-[237px] flex w-[432px] flex-col items-start gap-[61px] text-right"
          dir="rtl"
        >
          <div className="flex w-full flex-col gap-[7px] text-right">
            <h2 className="bg-gradient-to-b from-[#efefef] from-[10%] to-[#d1d1d1] to-[94%] bg-clip-text font-rubik text-[45px] font-bold leading-[1.15] tracking-[-1.35px] text-transparent">
              המדע והנתונים שתומכים בג׳ויסטי
            </h2>
            <p className="font-rubik text-[20px] leading-[1.33] tracking-[-0.3px] text-white">
              מאחורי כל פיצ׳ר בג׳ויסטי עומדים עקרונות מוכחים ממדעי ההתנהגות, שנועדו לעזור לילדים
              לפתח הרגלים בריאים בעולם הדיגיטלי
            </p>
          </div>
          {/* items-start in RTL = visual right */}
          <div className="w-[334px] shrink-0 self-start">
            <DoriVideoDesktop />
          </div>
        </LandingReveal>
      </div>
    </section>
  );
}
