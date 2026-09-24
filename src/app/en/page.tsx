import { MarketingLandingPage } from '@/components/landing/MarketingLandingPage';
import { marketingRubik } from '@/lib/fonts';
import type { Metadata } from 'next';

/** Pre-render at build — served from CDN edge on App Hosting. */
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Joy Wallet of Digital Balance',
  description: 'Creating financial incentives for balanced digital usage',
  alternates: {
    languages: {
      he: '/',
      en: '/en',
    },
  },
};

export default function EnglishHome() {
  return (
    <div className={marketingRubik.variable}>
      <MarketingLandingPage locale="en" />
    </div>
  );
}
