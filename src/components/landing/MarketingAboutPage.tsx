import {
  ABOUT_ASSETS,
  ABOUT_EMPHASIS,
  ABOUT_STORY_PARAS,
  ABOUT_TEAM,
} from '@/constants/about-marketing';
import { LANDING_ASSETS } from '@/constants/landing-marketing';
import { MarketingNav } from '@/components/landing/MarketingNav';
import { MarketingFooter } from '@/components/landing/MarketingFooter';
import { LandingReveal } from '@/components/landing/LandingReveal';

function StoryBody({ className = '' }: { className?: string }) {
  return (
    <div
      className={`space-y-4 text-right font-rubik text-base leading-[1.35] tracking-[-0.32px] text-black md:space-y-4 md:text-[18px] md:leading-[1.25] md:tracking-[-0.36px] ${className}`}
    >
      {ABOUT_STORY_PARAS.map((para, i) => (
        <p key={i}>
          {para.map((line, j) => {
            const parts = line.split(ABOUT_EMPHASIS);
            return (
              <span key={j}>
                {j > 0 ? <br /> : null}
                {parts.length === 1 ? (
                  line
                ) : (
                  <>
                    {parts[0]}
                    <strong className="font-bold">{ABOUT_EMPHASIS}</strong>
                    {parts[1]}
                  </>
                )}
              </span>
            );
          })}
        </p>
      ))}
    </div>
  );
}

function StoryMark({ size }: { size: 'mobile' | 'desktop' }) {
  const mobile = size === 'mobile';
  return (
    <div
      className={
        mobile
          ? 'relative z-[1] mx-auto flex w-full max-w-[200px] flex-col items-center gap-4 overflow-visible pt-6'
          : 'relative z-[1] flex shrink-0 flex-col items-center justify-center gap-[25px] overflow-visible'
      }
    >
      <div
        className={
          mobile
            ? 'relative h-[96px] w-[96px] shrink-0 overflow-visible rounded-full bg-[#E3E3E3]'
            : 'relative h-[117.12px] w-[117.12px] shrink-0 overflow-visible rounded-[164.958px] bg-[#E3E3E3]'
        }
      >
        <div
          className="absolute z-[1]"
          style={
            mobile
              ? { left: -20, top: -20, width: 136, height: 136 }
              : {
                  left: -25.082,
                  top: -25.082,
                  width: 167.283,
                  height: 167.283,
                  aspectRatio: '1 / 1',
                }
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ABOUT_ASSETS.storyScroll}
            alt=""
            width={1024}
            height={1024}
            loading="lazy"
            decoding="async"
            className="pointer-events-none absolute inset-0 h-full w-full max-w-none object-cover"
            draggable={false}
          />
        </div>
      </div>
      <h2
        className={
          mobile
            ? 'text-center font-rubik text-[28px] font-bold leading-[1.15] tracking-[-0.84px] text-[#092125]'
            : 'text-center font-rubik text-[40px] font-bold leading-[1.1] tracking-[-1.2px] text-[#092125]'
        }
      >
        הסיפור שלנו
      </h2>
    </div>
  );
}

function TeamCard({
  member,
  variant,
}: {
  member: (typeof ABOUT_TEAM)[number];
  variant: 'mobile' | 'desktop';
}) {
  const mobile = variant === 'mobile';
  return (
    <article
      className={
        mobile
          ? 'flex w-[280px] shrink-0 flex-col gap-5 rounded-[22px] bg-[#f5f5f5] px-5 py-6'
          : 'flex flex-col gap-[26px] rounded-[25.671px] bg-[#f5f5f5] px-10 py-[30px]'
      }
    >
      <div className={`flex items-center ${mobile ? 'gap-4' : 'gap-5'}`}>
        <div className="min-w-0 flex-1 text-right">
          <p
            className={
              mobile
                ? 'font-rubik text-[22px] font-bold leading-[1.15] tracking-[-0.66px] text-[#161616]'
                : 'font-rubik text-[30px] font-bold leading-[1.15] tracking-[-0.9px] text-[#161616]'
            }
          >
            {member.name}
          </p>
          <p
            className={
              mobile
                ? 'mt-1 font-rubik text-sm leading-[1.25] tracking-[-0.28px] text-[rgba(67,67,67,0.7)]'
                : 'mt-1 font-rubik text-[18px] leading-[1.25] tracking-[-0.36px] text-[rgba(67,67,67,0.7)]'
            }
          >
            {member.role}
          </p>
        </div>
        <div
          className={
            mobile
              ? 'relative h-[64px] w-[64px] shrink-0 rounded-full bg-white shadow-[2px_2px_5px_rgba(0,0,0,0.1)]'
              : 'relative h-[88px] w-[88px] shrink-0 rounded-full bg-white shadow-[2px_2px_5px_rgba(0,0,0,0.1)]'
          }
        >
          <div
            className={
              mobile
                ? 'absolute left-1/2 top-1/2 h-[56px] w-[56px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full bg-[#05161a]'
                : 'absolute left-1/2 top-1/2 h-[77px] w-[77px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full bg-[#05161a]'
            }
          >
            <div
              className="pointer-events-none absolute z-0 rounded-full"
              style={{
                left: mobile ? -3 : -4.44,
                bottom: mobile ? -24 : -32.65,
                width: mobile ? 60 : 81.884,
                height: mobile ? 60 : 81.884,
                background:
                  'radial-gradient(circle, rgba(0,255,179,0.95) 0%, rgba(0,255,179,0.45) 45%, rgba(0,255,179,0) 72%)',
                filter: 'blur(8px)',
              }}
              aria-hidden
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={member.avatar}
              alt={member.name}
              width={77}
              height={77}
              loading="lazy"
              decoding="async"
              className="relative z-[1] h-full w-full object-cover object-center"
              draggable={false}
            />
          </div>
        </div>
      </div>
      <p
        className={
          mobile
            ? 'text-right font-rubik text-sm leading-[1.35] tracking-[-0.28px] text-[#434343]'
            : 'text-right font-rubik text-[20px] leading-[1.2] tracking-[-0.4px] text-[#434343]'
        }
      >
        {member.bio}
      </p>
    </article>
  );
}

/**
 * About — Figma 15597:19331 (desktop).
 * Mobile: compact hero → story (mark then body) → team carousel → footer.
 */
export function MarketingAboutPage() {
  return (
    <div
      className="v03-about-root min-h-screen bg-white text-right font-rubik text-[#092125] [direction:rtl]"
      dir="rtl"
    >
      <MarketingNav activeHref="/about" homeHashPrefix="/" />

      {/*
        Stack: green (z-0) → ellipse (z-1) → headline + white (z-2).
      */}
      <div className="relative isolate">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[min(52vh,340px)] bg-[#05161a] md:h-[498px]"
          aria-hidden
        />

        <div
          className="pointer-events-none absolute z-[1] hidden rounded-full bg-[rgba(0,231,162,0.4)] blur-[93.171px] md:block"
          style={{
            top: 293,
            left: 635,
            width: 709,
            height: 711,
            borderRadius: 711,
          }}
          aria-hidden
        />

        {/* Mobile hero — short band, headline near bottom of dark area */}
        <section className="relative z-[2] flex h-[min(52vh,340px)] flex-col justify-end overflow-hidden px-6 pb-10 pt-24 md:hidden">
          {/*
            Ellipse 208 — center on hero/white seam; overflow-hidden crops the bottom half.
          */}
          <div
            className="pointer-events-none absolute left-1/2 top-full z-0 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2"
            aria-hidden
          >
            <div className="absolute inset-[-70%]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={LANDING_ASSETS.ellipseGlow}
                alt=""
                loading="eager"
                decoding="async"
                className="h-full w-full max-w-none object-contain"
                draggable={false}
              />
            </div>
          </div>
          <LandingReveal immediate className="relative z-[1] mx-auto w-full max-w-[327px] text-center">
            <h1 className="font-rubik text-[26px] font-bold leading-[1.2] tracking-[-0.78px]">
              <span className="block text-white">הקשב הוא המשאב החשוב ביותר של הדור הבא.</span>
              <span className="mt-1 block text-[#00ffb3]">
                אנחנו כאן כדי לעזור לילדים שלנו לשמור עליו.
              </span>
            </h1>
          </LandingReveal>
        </section>

        {/* Desktop hero — Figma: bottom of headline 107px above green band edge */}
        <section className="relative z-[2] hidden h-[498px] items-end justify-center pb-[107px] md:flex">
          <LandingReveal immediate className="relative mx-auto w-full max-w-[1000px] px-6 text-center">
            <h1 className="font-rubik text-[50px] font-bold leading-[1.17] tracking-[-1.5px]">
              <span className="block text-white">הקשב הוא המשאב החשוב ביותר של הדור הבא.</span>
              <span className="block text-[#00ffb3]">
                אנחנו כאן כדי לעזור לילדים שלנו לשמור עליו.
              </span>
            </h1>
          </LandingReveal>
        </section>

        <div className="relative z-[2] bg-white">
          {/* Mobile content — single-column reading order */}
          <div className="mx-auto flex w-full max-w-[1200px] flex-col md:hidden">
            <LandingReveal className="flex flex-col items-center gap-8 px-6 pb-4 pt-12">
              <StoryMark size="mobile" />
              <div className="flex w-full items-stretch gap-4">
                {/* Accent along story text (visual right in RTL) */}
                <div
                  className="mt-1 w-[5px] shrink-0 self-stretch rounded-full bg-[#223F46]/35"
                  aria-hidden
                />
                <StoryBody className="min-w-0 flex-1" />
              </div>
            </LandingReveal>

            <LandingReveal delayMs={80} className="flex flex-col gap-5 pt-10">
              <h2 className="px-6 text-center font-rubik text-[28px] font-bold leading-[1.15] tracking-[-0.84px] text-[#092125]">
                הכירו את הצוות
              </h2>
              {/*
                Horizontal snap carousel — easier scan than a long vertical bio wall.
                overscroll-x-contain keeps page scroll working over the strip.
              */}
              <div
                className="flex gap-4 overflow-x-auto overscroll-x-contain px-6 pb-2 v03-scroll-hidden"
                dir="rtl"
              >
                {ABOUT_TEAM.map((member) => (
                  <TeamCard key={member.name} member={member} variant="mobile" />
                ))}
                <div className="w-2 shrink-0" aria-hidden />
              </div>
            </LandingReveal>
          </div>

          {/* Desktop — Figma 15573:4758 / 4767. RTL: mark first = visual right. */}
          <div className="mx-auto hidden w-full max-w-[1200px] flex-col items-center px-8 pb-0 pt-[180px] md:flex">
            <div className="flex w-full flex-col items-center gap-[180px]">
              <LandingReveal className="flex w-full flex-row items-start justify-center gap-[67px]">
                <StoryMark size="desktop" />
                <div className="w-full max-w-[555px]">
                  <StoryBody />
                </div>
              </LandingReveal>

              <LandingReveal className="flex w-full flex-col items-center gap-5">
                <h2 className="font-rubik text-[40px] font-bold leading-[1.1] tracking-[-1.2px] text-[#092125]">
                  הכירו את הצוות
                </h2>
                <div className="grid w-full grid-cols-3 gap-[25px]">
                  {ABOUT_TEAM.map((member) => (
                    <TeamCard key={member.name} member={member} variant="desktop" />
                  ))}
                </div>
              </LandingReveal>
            </div>
          </div>

          {/* Full-bleed footer — same max-w-[1786px] layout as landing (not capped at 1200) */}
          <div className="pt-10 md:pt-[180px]">
            <MarketingFooter surface="light" />
          </div>
        </div>
      </div>
    </div>
  );
}
