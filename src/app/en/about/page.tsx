import { MarketingAboutPage } from '@/components/landing/MarketingAboutPage';
import { marketingRubik } from '@/lib/fonts';
import type { Metadata } from 'next';

/** Pre-render at build — served from CDN edge on App Hosting. */
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'About us | Joystie',
  description:
    'Attention is the most important resource of the next generation. Meet the Joystie team and our story.',
  alternates: {
    languages: {
      he: '/about',
      en: '/en/about',
    },
  },
};

export default function EnglishAboutPage() {
  return (
    <div className={marketingRubik.variable}>
      <MarketingAboutPage locale="en" />
    </div>
  );
}
