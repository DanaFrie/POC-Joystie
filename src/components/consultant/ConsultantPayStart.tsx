'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { createCardcomConsultantCheckout } from '@/lib/api/billing';
import { ConsultantChevronButton } from '@/components/consultant/ConsultantChevronCta';
import { ConsultantOfferCard } from '@/components/consultant/ConsultantOfferCard';
import {
  CONSULTANT_PAY_INPUT_CLASS,
  CONSULTANT_PAY_LABEL_CLASS,
  CONSULTANT_PAY_TITLE_CLASS,
  ConsultantPayFrame,
} from '@/components/consultant/ConsultantPayFrame';
import { CONSULTANT_OFFERS } from '@/constants/consultant-marketing';

function isEmail(value: string): boolean {
  const email = value.trim().toLowerCase();
  return email.length <= 150 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Stable pay links.
 * Private can sit in the Calendar description.
 * Group is sent manually to each workshop participant.
 */
export function ConsultantPayStart() {
  const searchParams = useSearchParams();
  const offer = searchParams?.get('offer');
  const offerId = offer === 'private' || offer === 'group' ? offer : null;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const fromQuery = searchParams?.get('email') || '';
    if (isEmail(fromQuery)) setEmail(fromQuery.trim());
    const nameFromQuery = (searchParams?.get('name') || '').replace(/\s+/g, ' ').trim();
    if (nameFromQuery) setName(nameFromQuery);
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { getAuthInstance } = await import('@/lib/firebase');
        const auth = await getAuthInstance();
        const current = auth.currentUser?.email || '';
        const displayName = (auth.currentUser?.displayName || '').replace(/\s+/g, ' ').trim();
        if (!cancelled && isEmail(current)) {
          setEmail((existing) => existing || current);
        }
        if (!cancelled && displayName) {
          setName((existing) => existing || displayName);
        }
      } catch {
        // Guests pay without an account.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!offerId || busy) return;
    const payerName = name.replace(/\s+/g, ' ').trim();
    if (!payerName) {
      setError('כתבו שם מלא לאישור המפגש');
      return;
    }
    if (!isEmail(email)) {
      setError('כתבו כתובת מייל תקינה - אליה נשלח את אישור המפגש');
      return;
    }
    setError('');
    setBusy(true);
    try {
      const { checkoutUrl } = await createCardcomConsultantCheckout({
        offerId,
        name: payerName,
        email: email.trim(),
      });
      window.location.assign(checkoutUrl);
    } catch (err) {
      setBusy(false);
      setError(err instanceof Error ? err.message : 'לא הצלחנו לפתוח את דף התשלום. נסו שוב.');
    }
  }

  const product = CONSULTANT_OFFERS.find((item) => item.id === offerId);

  return (
    <ConsultantPayFrame contentClassName="max-w-[467px] px-5">
      {offerId && product ? (
        <form onSubmit={onSubmit} className="w-full">
          <ConsultantOfferCard
            offer={product}
            size="responsive"
            titleAs="h1"
            actionClassName="mt-[25px] flex w-full flex-col gap-5"
            action={
              <>
                <label className="flex w-full flex-col items-stretch gap-0.5">
                  <span className={CONSULTANT_PAY_LABEL_CLASS}>שם מלא</span>
                  <input
                    type="text"
                    autoComplete="name"
                    dir="rtl"
                    required
                    value={name}
                    disabled={busy}
                    onChange={(event) => setName(event.target.value)}
                    className={`${CONSULTANT_PAY_INPUT_CLASS} text-right`}
                  />
                </label>
                <label className="flex w-full flex-col items-stretch gap-0.5">
                  <span className={CONSULTANT_PAY_LABEL_CLASS}>מייל</span>
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    dir="ltr"
                    required
                    value={email}
                    disabled={busy}
                    onChange={(event) => setEmail(event.target.value)}
                    className={`${CONSULTANT_PAY_INPUT_CLASS} text-left`}
                  />
                </label>
                {error ? (
                  <p className="w-full px-2.5 text-right font-simpler text-sm text-red-300" role="alert">
                    {error}
                  </p>
                ) : null}
                <div className="flex w-full justify-start">
                  <ConsultantChevronButton
                    type="submit"
                    disabled={busy}
                    label={busy ? 'פותחים את דף התשלום...' : 'המשך לתשלום'}
                  />
                </div>
              </>
            }
          />
        </form>
      ) : (
        <div className="flex w-full flex-col items-stretch gap-3">
          <h1 className={`${CONSULTANT_PAY_TITLE_CLASS} text-center`}>הקישור לתשלום לא תקין</h1>
          <p className="w-full text-center font-simpler text-[16px] font-normal leading-[1.28] tracking-[-0.32px] text-white">
            הקישור צריך לכלול פגישה אישית או סדנה.
          </p>
        </div>
      )}
    </ConsultantPayFrame>
  );
}
