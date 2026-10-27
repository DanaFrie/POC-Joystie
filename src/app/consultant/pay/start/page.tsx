import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ConsultantPayStart } from '@/components/consultant/ConsultantPayStart';

export const metadata: Metadata = {
  title: 'תשלום | Joystie',
  robots: { index: false, follow: false },
};

function PayStartFallback() {
  return (
    <div
      className="flex min-h-[100dvh] items-center justify-center bg-v03-green-900 font-simpler text-[16px] text-white"
      dir="rtl"
      lang="he"
    >
      טוענים...
    </div>
  );
}

/** Calendar description link: /consultant/pay/start?offer=private */
export default function ConsultantPayStartPage() {
  return (
    <Suspense fallback={<PayStartFallback />}>
      <ConsultantPayStart />
    </Suspense>
  );
}
