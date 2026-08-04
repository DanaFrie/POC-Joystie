import Image from 'next/image';
import { LANDING_ASSETS, LANDING_FEATURES } from '@/constants/landing-marketing';
import { LandingReveal } from '@/components/landing/LandingReveal';
import {
  LandingFeatureEllipse,
  LandingFeatureWave,
} from '@/components/landing/LandingDecor';
import { LandingFeatureDonex } from '@/components/landing/LandingFeatureDonex';
import { LandingFeatureDonexConvert } from '@/components/landing/LandingFeatureDonexConvert';
import { LandingFeatureDonexCelebrate } from '@/components/landing/LandingFeatureDonexCelebrate';

/** CSS Ellipse 208 — above wave dots; coords vs 870 feature frame */
function FeatureEllipse({
  left,
  top,
  borderRadius = 310.57,
}: {
  left: number;
  top: number;
  borderRadius?: number;
}) {
  return (
    <div
      className="pointer-events-none absolute z-[1] hidden bg-[rgba(0,231,162,0.4)] blur-[93.171px] lg:block"
      style={{
        width: 309.328,
        height: 310.57,
        borderRadius,
        left,
        top,
      }}
      aria-hidden
    />
  );
}

const MOCKUP_FADE_BG =
  'linear-gradient(180deg, rgba(5, 22, 26, 0) 0%, #05161A 89.22%)';

/**
 * Mobile-only fade over bottom of phone mockup (Figma Rectangle 6555 / 6556).
 * Lives inside the phone LandingReveal so it transitions with the mockup.
 */
function MobileMockupFade({ height }: { height: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] lg:hidden"
      style={{
        height,
        background: MOCKUP_FADE_BG,
      }}
      aria-hidden
    />
  );
}

export function MarketingPresenting() {
  return (
    <section
      id="what-is-joystie"
      className="landing-section landing-gutter pt-0 pb-12 md:py-24 lg:pt-0"
      dir="rtl"
    >
      <div className="landing-section-fg relative mx-auto flex max-w-[870px] flex-col items-center gap-14 md:gap-[100px] lg:gap-[160px]">
        <LandingReveal className="flex w-full max-w-[358px] items-center justify-center gap-3 md:max-w-none md:gap-9">
          <div className="h-px flex-1 bg-white/25" aria-hidden />
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="font-rubik text-[15px] font-light tracking-[-0.4px] text-white md:text-[30px] md:tracking-[-0.75px]">
              גאים להציג בפניכם את
            </p>
            <Image
              src={LANDING_ASSETS.presentingLogo}
              alt="Joystie"
              width={172}
              height={85}
              className="h-[50px] w-auto md:h-[85px]"
              unoptimized
            />
          </div>
          <div className="h-px flex-1 bg-white/25" aria-hidden />
        </LandingReveal>

        {LANDING_FEATURES.map((feature, index) => {
          const isSection1 = index === 0;
          const isSection2 = index === 1;
          const isSection3 = index === 2;
          const useArticleEllipse = isSection1 || isSection2 || isSection3;
          const useAbsoluteDesktop = isSection2 || isSection3;
          const mobileFadeHeight = isSection3 ? 180.278 : 167;

          return (
            <article
              key={feature.badge}
              className={`relative grid w-full max-w-[327px] items-start gap-5 overflow-visible md:max-w-none md:gap-12 ${
                useAbsoluteDesktop
                  ? `lg:block ${isSection2 ? 'lg:min-h-[657px]' : 'lg:min-h-[654px]'}`
                  : feature.reverse
                    ? 'lg:grid-cols-[1fr_minmax(0,320px)] lg:items-center'
                    : 'lg:grid-cols-[minmax(0,320px)_1fr]'
              } ${isSection1 ? 'lg:min-h-[665px]' : ''}`}
            >
              {isSection1 ? <FeatureEllipse left={423} top={249} borderRadius={453.257} /> : null}
              {isSection2 ? <FeatureEllipse left={60} top={150} /> : null}
              {isSection3 ? <FeatureEllipse left={431} top={256} /> : null}

              {/* Desktop dots — 1917×~652 (asset aspect; keeps dots round) */}
              <LandingFeatureWave
                src={feature.wave}
                showMobile={false}
                showDesktop
                desktopWidth={1917.444}
                desktopHeight={651.74}
                desktopFlip={isSection3}
              />

              {/*
                Phone column — relative wrapper WITHOUT LandingReveal transform
                so mobile rotated dots (2174 tall) are not clipped.
              */}
              <div
                className={`relative z-10 order-1 mx-auto w-full max-w-[210px] overflow-visible md:max-w-[320px] ${
                  isSection2
                    ? 'lg:absolute lg:left-0 lg:top-0 lg:mx-0'
                    : isSection3
                      ? 'lg:absolute lg:right-0 lg:top-[-34px] lg:mx-0'
                      : feature.reverse
                        ? 'lg:order-2'
                        : 'lg:order-1'
                }`}
              >
                {/* Mobile dots — Figma 1597882674, first feature only; z-0 under phone */}
                {isSection1 ? (
                  <LandingFeatureWave src={feature.wave} showMobile showDesktop={false} />
                ) : null}

                <LandingReveal delayMs={180 + index * 40} className="relative z-[1] overflow-visible">
                  <LandingFeatureEllipse showDesktop={!useArticleEllipse} />
                  <div className="relative mx-auto aspect-[210/435] w-full max-w-[210px] overflow-hidden md:aspect-[320/663] md:max-w-[320px]">
                    <Image
                      src={feature.image}
                      alt={feature.imageAlt}
                      fill
                      className="object-contain object-center"
                      sizes="(max-width: 768px) 210px, 320px"
                    />
                    {/* Bottom blur — same LandingReveal as mockup */}
                    <MobileMockupFade height={mobileFadeHeight} />
                  </div>
                  {isSection1 ? <LandingFeatureDonex /> : null}
                  {isSection2 ? <LandingFeatureDonexConvert /> : null}
                  {isSection3 ? <LandingFeatureDonexCelebrate /> : null}
                </LandingReveal>
              </div>

              <LandingReveal
                delayMs={80}
                className={`relative z-10 order-2 flex w-full flex-col gap-4 text-center lg:gap-[30px] lg:text-right ${
                  isSection2
                    ? 'lg:absolute lg:left-[439px] lg:top-[279px] lg:order-none lg:w-[431px]'
                    : isSection3
                      ? 'lg:absolute lg:left-0 lg:top-[89px] lg:order-none lg:w-[431px] lg:gap-6'
                      : feature.reverse
                        ? 'lg:order-1'
                        : 'lg:order-2'
                } ${isSection1 ? 'lg:pt-[120px]' : ''}`}
              >
                <div className="flex w-full justify-center lg:justify-start">
                  <div className="inline-flex rounded-full bg-white/20 px-3 py-1.5 lg:px-4 lg:py-2">
                    <span className="font-rubik text-[13px] tracking-[-0.24px] text-white md:text-base">
                      {feature.badge}
                    </span>
                  </div>
                </div>
                <h2 className="font-rubik text-[28px] font-bold leading-[1.15] tracking-[-0.9px] text-white md:text-[36px] lg:text-[45px] lg:tracking-[-1.35px]">
                  {feature.titleBefore}
                  {'breakBeforeAccent' in feature && feature.breakBeforeAccent ? <br /> : null}
                  <span className="text-v03-turquoise-300">{feature.titleAccent}</span>
                </h2>
                {feature.lead ? (
                  <p className="font-rubik text-base font-semibold text-white md:text-[20px] lg:text-lg">
                    {feature.lead}
                  </p>
                ) : null}
                {/* Figma text spacer — 7×72 rotate -90° → horizontal pill; mobile only */}
                <div
                  className="mx-auto flex h-[7px] w-[72px] shrink-0 items-center justify-center lg:hidden"
                  aria-hidden
                >
                  <div
                    className="h-[72px] w-[7px] shrink-0 rounded-[28px] bg-[#223F46]"
                    style={{ transform: 'rotate(-90deg)' }}
                  />
                </div>
                <p className="font-rubik text-sm leading-[1.33] tracking-[-0.3px] text-white/70 md:text-[20px] lg:text-base">
                  {feature.body}
                </p>
              </LandingReveal>
            </article>
          );
        })}
      </div>
    </section>
  );
}
