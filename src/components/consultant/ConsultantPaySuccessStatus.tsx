'use client';

import { useEffect, useState } from 'react';
import { ConsultantPayCelebration } from '@/components/consultant/ConsultantPayCelebration';
import { ConsultantPayFailedView } from '@/components/consultant/ConsultantPayFailedView';
import {
  CONSULTANT_PAY_TITLE_CLASS,
  ConsultantPayFrame,
} from '@/components/consultant/ConsultantPayFrame';
import type { ConsultantOfferId } from '@/constants/consultant-marketing';
import { getConsultantCheckoutStatus } from '@/lib/api/billing';

const POLL_TIMES = 8;
const POLL_MS = 2000;

function offerOf(orderId: string): ConsultantOfferId | null {
  let decoded = orderId;
  try {
    decoded = decodeURIComponent(orderId);
  } catch {
    decoded = orderId;
  }
  const offer = decoded.split('_')[1];
  return offer === 'private' || offer === 'group' ? offer : null;
}

type Phase = 'checking' | 'paid' | 'failed' | 'waiting';

/** Polls the order. Celebration renders only when the webhook marked it paid. */
export function ConsultantPaySuccessStatus({ orderId }: { orderId: string }) {
  const [phase, setPhase] = useState<Phase>('checking');
  const offer = offerOf(orderId);

  useEffect(() => {
    let cancelled = false;
    let timer = 0;
    let tries = 0;

    const run = async () => {
      tries += 1;
      let status: 'paid' | 'pending' | 'failed' | 'unknown' = 'pending';
      try {
        status = await getConsultantCheckoutStatus(orderId);
      } catch {
        status = 'pending';
      }
      if (cancelled) return;
      if (status === 'paid') {
        setPhase('paid');
        return;
      }
      if (status === 'failed' || status === 'unknown') {
        setPhase('failed');
        return;
      }
      if (tries >= POLL_TIMES) {
        setPhase('waiting');
        return;
      }
      timer = window.setTimeout(() => {
        void run();
      }, POLL_MS);
    };

    void run();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [orderId]);

  if (phase === 'paid') return <ConsultantPayCelebration />;
  if (phase === 'failed') return <ConsultantPayFailedView offer={offer} />;

  const title = phase === 'waiting' ? 'עוד רגע מאמתים את התשלום' : 'מאמתים את התשלום';
  return (
    <ConsultantPayFrame>
      <div className="flex w-full flex-col items-center gap-2 text-center">
        <h1 className={`${CONSULTANT_PAY_TITLE_CLASS} text-center`}>{title}</h1>
        <p className="w-full font-simpler text-[16px] font-normal leading-[1.28] tracking-[-0.32px] text-white">
          אם החיוב עבר, האישור יגיע למייל שכתבתם.
        </p>
      </div>
    </ConsultantPayFrame>
  );
}
