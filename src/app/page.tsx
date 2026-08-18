import { MarketingLandingPage } from '@/components/landing/MarketingLandingPage';
import { marketingRubik } from '@/lib/fonts';

/** Pre-render at build — served from CDN edge on App Hosting. */
export const dynamic = 'force-static';

export default function Home() {
  return (
    <div className={marketingRubik.variable}>
      <MarketingLandingPage />
    </div>
  );
}
