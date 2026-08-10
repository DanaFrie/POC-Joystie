import nextDynamic from 'next/dynamic';
import { TrackAnalyticsEvent } from '@/components/analytics/TrackAnalyticsEvent';
import { MarketingNav } from '@/components/landing/MarketingNav';
import { MarketingHero } from '@/components/landing/MarketingHero';
import { LandingHashScroll } from '@/components/landing/LandingHashScroll';
import { LANDING_ASSETS } from '@/constants/landing-marketing';
import { AnalyticsEvents } from '@/utils/analytics';

/** Below-fold: split JS; still SSR HTML for SEO / first paint of structure. */
const MarketingStats = nextDynamic(
  () =>
    import('@/components/landing/MarketingStats').then((m) => ({ default: m.MarketingStats })),
  { ssr: true },
);
const MarketingPresenting = nextDynamic(
  () =>
    import('@/components/landing/MarketingPresenting').then((m) => ({
      default: m.MarketingPresenting,
    })),
  { ssr: true },
);
const MarketingHowItWorks = nextDynamic(
  () =>
    import('@/components/landing/MarketingHowItWorks').then((m) => ({
      default: m.MarketingHowItWorks,
    })),
  { ssr: true },
);
const MarketingScience = nextDynamic(
  () =>
    import('@/components/landing/MarketingScience').then((m) => ({ default: m.MarketingScience })),
  { ssr: true },
);
const MarketingBehindIdea = nextDynamic(
  () =>
    import('@/components/landing/MarketingBehindIdea').then((m) => ({
      default: m.MarketingBehindIdea,
    })),
  { ssr: true },
);
const MarketingFaq = nextDynamic(
  () => import('@/components/landing/MarketingFaq').then((m) => ({ default: m.MarketingFaq })),
  { ssr: true },
);
const MarketingKnowledge = nextDynamic(
  () =>
    import('@/components/landing/MarketingKnowledge').then((m) => ({
      default: m.MarketingKnowledge,
    })),
  { ssr: true },
);
const MarketingFooter = nextDynamic(
  () =>
    import('@/components/landing/MarketingFooter').then((m) => ({ default: m.MarketingFooter })),
  { ssr: true },
);

export function MarketingLandingPage() {
  return (
    <div className="v03-landing-root min-h-screen bg-[#05161a] text-right font-rubik text-white [direction:rtl]" dir="rtl">
      <TrackAnalyticsEvent event={AnalyticsEvents.LANDING_MARKETING} />
      {/* LCP: preload only the hero that matches the viewport */}
      <link
        rel="preload"
        href={LANDING_ASSETS.heroMobile}
        as="image"
        type="image/webp"
        media="(max-width: 1023px)"
      />
      <link
        rel="preload"
        href={LANDING_ASSETS.heroDesktop}
        as="image"
        type="image/webp"
        media="(min-width: 1024px)"
      />
      <LandingHashScroll />
      <MarketingNav />
      <MarketingHero />
      <MarketingStats />
      <MarketingPresenting />
      <MarketingHowItWorks />
      <MarketingScience />
      <MarketingBehindIdea />
      <MarketingFaq />
      <MarketingKnowledge />
      <MarketingFooter />
    </div>
  );
}
