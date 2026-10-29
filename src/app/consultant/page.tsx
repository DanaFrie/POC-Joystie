import { MarketingConsultantPage } from '@/components/landing/MarketingConsultantPage';
import { marketingRubik } from '@/lib/fonts';
import type { Metadata } from 'next';

/** Pre-render at build — served from CDN edge on App Hosting. */
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'ליווי אישי | Joystie',
  description:
    'ליווי אישי לרווחה דיגיטלית במשפחה - פגישה אישית וסדנת הורים בקבוצה קטנה בהובלת מאיר ניצן.',
  alternates: {
    canonical: '/consultant',
  },
  robots: {
    index: true,
    follow: true,
  },
};

/** Hebrew-only accompaniment programs page. */
export default function ConsultantPage() {
  return (
    <div className={marketingRubik.variable}>
      <MarketingConsultantPage locale="he" />
    </div>
  );
}
