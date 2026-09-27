import { TrackAnalyticsEvent } from '@/components/analytics/TrackAnalyticsEvent';
import { MarketingNav } from '@/components/landing/MarketingNav';
import { MarketingHero } from '@/components/landing/MarketingHero';
import { MarketingStats } from '@/components/landing/MarketingStats';
import { MarketingPresenting } from '@/components/landing/MarketingPresenting';
import { MarketingHowItWorks } from '@/components/landing/MarketingHowItWorks';
import { MarketingScience } from '@/components/landing/MarketingScience';
import { MarketingBehindIdea } from '@/components/landing/MarketingBehindIdea';
import { MarketingFaq } from '@/components/landing/MarketingFaq';
import { MarketingKnowledge } from '@/components/landing/MarketingKnowledge';
import { MarketingFooter } from '@/components/landing/MarketingFooter';
import { LandingHashScroll } from '@/components/landing/LandingHashScroll';
import {
  LandingLocaleProvider,
  type LandingLocale,
} from '@/components/landing/LandingLocaleContext';
import { LANDING_ASSETS } from '@/constants/landing-marketing';
import { AnalyticsEvents } from '@/utils/analytics';

export function MarketingLandingPage({ locale = 'he' }: { locale?: LandingLocale }) {
  const isEn = locale === 'en';
  const dir = isEn ? 'ltr' : 'rtl';
  const firstDiff = isEn ? '/landing/first-diff-en.webp' : LANDING_ASSETS.firstDiff;

  return (
    <LandingLocaleProvider locale={locale}>
      <div
        className={`v03-landing-root marketing-page-fade min-h-screen w-full max-w-[100vw] bg-[#05161a] text-white ${
          isEn ? 'font-sf text-left [direction:ltr]' : 'font-rubik text-right [direction:rtl]'
        }`}
        dir={dir}
        lang={locale}
      >
        <TrackAnalyticsEvent event={AnalyticsEvents.LANDING_MARKETING} />
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
        <link
          rel="preload"
          href={LANDING_ASSETS.heroUnderline}
          as="image"
          type="image/svg+xml"
        />
        <link
          rel="preload"
          href={LANDING_ASSETS.heroUnderlineMobile}
          as="image"
          type="image/svg+xml"
          media="(max-width: 1023px)"
        />
        <link
          rel="preload"
          href={firstDiff}
          as="image"
          type="image/webp"
          media="(max-width: 1023px)"
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
    </LandingLocaleProvider>
  );
}
