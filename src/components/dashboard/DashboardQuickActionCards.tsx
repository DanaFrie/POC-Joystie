'use client';

import Image from 'next/image';
import {
  ChallengeBody,
  ChallengeCardHero,
  ChallengeTitle,
} from '@/components/dashboard/challenge/ChallengeCardPrimitives';
import {
  DashboardBlurCardOverlay,
  OverlayPrimaryButton,
} from '@/components/dashboard/challenge/DashboardBlurCardOverlay';
import { formatCountdown } from '@/components/dashboard/DashboardScreenTimeRing';
import { PARENT_DASHBOARD_ASSETS } from '@/constants/parent-dashboard-layout';
import { useEffect, useState } from 'react';

function pad2(n: number) {
  return String(Math.max(0, n)).padStart(2, '0');
}

type DashboardDealRunningCardProps = {
  visible: boolean;
  childName: string;
  countdownTarget?: Date | null;
  onClose: () => void;
};

/** Shown when parent taps "create deal" while a deal is already live. */
export function DashboardDealRunningCard({
  visible,
  childName,
  countdownTarget = null,
  onClose,
}: DashboardDealRunningCardProps) {
  const [now, setNow] = useState(() => Date.now());
  const name = childName || 'הילד';
  const titleId = 'deal-already-running-title';

  useEffect(() => {
    if (!visible || !countdownTarget) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [visible, countdownTarget]);

  const remainingMs = countdownTarget
    ? Math.max(0, countdownTarget.getTime() - now)
    : 0;
  const countdown = formatCountdown(remainingMs);
  const countdownLabel = `${countdown.days}:${pad2(countdown.hours)}:${pad2(countdown.minutes)}:${pad2(countdown.seconds)}`;

  return (
    <DashboardBlurCardOverlay
      visible={visible}
      titleId={titleId}
      onClose={onClose}
      compact
      footer={
        <OverlayPrimaryButton onClick={onClose}>הבנתי</OverlayPrimaryButton>
      }
    >
      <ChallengeCardHero
        src={PARENT_DASHBOARD_ASSETS.doriMoneySit}
        frameWidth={180}
        frameHeight={160}
      />
      <ChallengeTitle id={titleId}>הדיל כבר רץ</ChallengeTitle>
      <ChallengeBody>
        {`סוף השבוע תיפגש עם ${name} — ותוסיף ריצה לאחור של הזמן.`}
      </ChallengeBody>
      {countdownTarget ? (
        <p
          className="w-full text-center font-simpler text-[28px] font-black tracking-[-0.5px] text-[#00E7A2]"
          dir="ltr"
          aria-label="ספירה לאחור עד סוף השבוע"
        >
          {countdownLabel}
        </p>
      ) : null}
    </DashboardBlurCardOverlay>
  );
}

type DashboardContractImageCardProps = {
  visible: boolean;
  imageUrl: string | null;
  childName: string;
  onClose: () => void;
};

/** In-app card preview of the share/contract image. */
export function DashboardContractImageCard({
  visible,
  imageUrl,
  childName,
  onClose,
}: DashboardContractImageCardProps) {
  const titleId = 'contract-image-card-title';
  const name = childName || 'הילד';

  return (
    <DashboardBlurCardOverlay
      visible={visible}
      titleId={titleId}
      onClose={onClose}
      compact
      footer={null}
    >
      <ChallengeTitle id={titleId}>{`החוזה עם ${name}`}</ChallengeTitle>
      <div className="relative mx-auto w-full max-w-[280px] overflow-hidden rounded-[18px] border border-white/20 bg-black/30">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`החוזה עם ${name}`}
            width={560}
            height={700}
            className="h-auto w-full object-contain"
            unoptimized
          />
        ) : (
          <p className="px-4 py-10 text-center font-simpler text-[15px] text-white/70">
            אין תמונת חוזה זמינה כרגע
          </p>
        )}
      </div>
    </DashboardBlurCardOverlay>
  );
}
