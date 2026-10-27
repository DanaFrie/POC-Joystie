'use client';

import {
  CONSULTANT_PAY_TITLE_CLASS,
  ConsultantPayFrame,
} from '@/components/consultant/ConsultantPayFrame';

/**
 * Bare success URL. CardCom returns to /consultant/pay/success/{orderId}.
 * This page does not celebrate a payment.
 */
export default function ConsultantPaySuccessPage() {
  return (
    <ConsultantPayFrame>
      <div className="flex w-full flex-col items-center gap-2 text-center">
        <h1 className={`${CONSULTANT_PAY_TITLE_CLASS} text-center`}>התשלום לא אומת</h1>
        <p className="w-full font-simpler text-[16px] font-normal leading-[1.28] tracking-[-0.32px] text-white">
          אם החיוב עבר, האישור יגיע למייל שכתבתם.
        </p>
      </div>
    </ConsultantPayFrame>
  );
}
