'use client';

import Link from 'next/link';
import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';
import { CARDCOM_CONSULTANT_PAY_START_PATH } from '@/constants/billing-paths';
import type { ConsultantOfferId } from '@/constants/consultant-marketing';
import {
  CONSULTANT_PAY_CTA_CLASS,
  CONSULTANT_PAY_TITLE_CLASS,
  ConsultantPayFrame,
} from '@/components/consultant/ConsultantPayFrame';

/** Disappointed Dori. Retry goes to the matching offer only. */
export function ConsultantPayFailedView({ offer }: { offer: ConsultantOfferId | null }) {
  return (
    <ConsultantPayFrame>
      <div className="flex w-full flex-col items-center gap-6 text-center">
        <OnboardingLazyImage
          src={CHILD_ONBOARDING_ASSETS.doriDisappointed}
          alt="דורי מאוכזב"
          priority
          className="aspect-square w-[min(280px,72vw)] object-contain md:w-[320px]"
        />
        <h1 className={`${CONSULTANT_PAY_TITLE_CLASS} text-center`}>נראה שמשהו השתבש</h1>
        {offer ? (
          <Link
            href={`${CARDCOM_CONSULTANT_PAY_START_PATH}?offer=${offer}`}
            className={CONSULTANT_PAY_CTA_CLASS}
          >
            נסו שוב
          </Link>
        ) : null}
      </div>
    </ConsultantPayFrame>
  );
}
