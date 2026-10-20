import { MarketingConsultantPage } from '@/components/landing/MarketingConsultantPage';
import { marketingRubik } from '@/lib/fonts';
import type { Metadata } from 'next';

/** Pre-render at build — served from CDN edge on App Hosting. */
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'ייעוץ | Joystie',
  description:
    'שתי אופציות לייעוץ: ייעוץ אישי – עושים סדר, ומפגש ייעוץ קבוצתי — קביעה ותשלום.',
  alternates: {
    canonical: '/consultant',
  },
};

export default function ConsultantPage() {
  return (
    <div className={marketingRubik.variable}>
      <MarketingConsultantPage locale="he" />
    </div>
  );
}
