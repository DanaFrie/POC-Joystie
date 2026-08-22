import nextDynamic from 'next/dynamic';
import { TrackAnalyticsEvent } from '@/components/analytics/TrackAnalyticsEvent';
import { MarketingNav } from '@/components/landing/MarketingNav';
import { MarketingHero } from '@/components/landing/MarketingHero';
import { MarketingStats } from '@/components/landing/MarketingStats';
import { MarketingPresenting } from '@/components/landing/MarketingPresenting';
import { MarketingScience } from '@/components/landing/MarketingScience';
import { MarketingBehindIdea } from '@/components/landing/MarketingBehindIdea';
import { MarketingKnowledge } from '@/components/landing/MarketingKnowledge';
import { MarketingFooter } from '@/components/landing/MarketingFooter';
import { LandingHashScroll } from '@/components/landing/LandingHashScroll';
import { LANDING_ASSETS } from '@/constants/landing-marketing';
import { AnalyticsEvents } from '@/utils/analytics';

/** Heavy client sections — split JS; SSR HTML preserved. */
const MarketingHowItWorks = nextDynamic(
  () =>
    import('@/components/landing/MarketingHowItWorks').then((m) => ({
      default: m.MarketingHowItWorks,
    })),
  { ssr: true },
);
const MarketingFaq = nextDynamic(
  () =>
    import('@/components/landing/MarketingFaq').then((m) => ({
      default: m.MarketingFaq,
    })),
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
