import { MarketingAboutPage } from '@/components/landing/MarketingAboutPage';
import { marketingRubik } from '@/lib/fonts';

/** Pre-render at build — served from CDN edge on App Hosting. */
export const dynamic = 'force-static';

export default function AboutPage() {
  return (
    <div className={marketingRubik.variable}>
      <MarketingAboutPage />
    </div>
  );
}
