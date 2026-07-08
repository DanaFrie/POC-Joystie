'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { WeeklyUpload } from '@/types/firestore';
import {
  PARENT_DASHBOARD_ASSETS,
  PARENT_DASHBOARD_COLORS,
} from '@/constants/parent-dashboard-layout';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('DashboardContractSection');

type DashboardContractSectionProps = {
  childName: string;
  parentName?: string;
  shareUrl?: string;
  weeklyUpload?: WeeklyUpload | null;
  variant?: 'parent' | 'child';
  onApprove?: () => Promise<void>;
  onReject?: () => Promise<void>;
};

export function DashboardContractSection({
  childName,
  parentName,
  shareUrl,
  weeklyUpload,
  variant = 'parent',
  onApprove,
  onReject,
}: DashboardContractSectionProps) {
  const [copied, setCopied] = useState(false);
  const [processing, setProcessing] = useState(false);

  const screenshotUrl = weeklyUpload?.screenshotUrl || null;
  const isPending = weeklyUpload?.status === 'pending';
  const viewUrl = screenshotUrl || PARENT_DASHBOARD_ASSETS.agreementThumb;

  const sectionTitle =
    variant === 'child'
      ? parentName
        ? `החוזה שלי עם ${parentName}`
        : 'החוזה שלי'
      : childName
        ? `החוזה שלי עם ${childName}`
        : 'החוזה שלי';

  const sharePrimaryClass =
    variant === 'child'
      ? 'bg-[#1BECAE] text-[#092125]'
      : 'bg-white text-[#092125]';

  const viewButtonClass =
    variant === 'child'
      ? 'bg-white text-[#092125]'
      : 'border-[0.84px] border-white bg-transparent text-white';

  const handleShare = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      logger.error('Copy failed:', error);
    }
  };

  const handleApprove = async () => {
    if (!onApprove) return;
    setProcessing(true);
    try {
      await onApprove();
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!onReject) return;
    setProcessing(true);
    try {
      await onReject();
    } finally {
      setProcessing(false);
    }
  };

  return (
    <section className="flex w-full flex-col items-end justify-center gap-2 py-2">
      <div className="flex w-full items-center justify-center px-2.5">
        <p className="flex-1 text-right font-simpler text-[16px] font-normal leading-[21.6px] text-white">
          {sectionTitle}
        </p>
      </div>

      <div
        className="flex w-full flex-col items-center justify-center rounded-[32px] px-[18px] py-[25px]"
        style={{
          background: PARENT_DASHBOARD_COLORS.cardBg,
          outline: `1px solid ${PARENT_DASHBOARD_COLORS.cardOutline}`,
          outlineOffset: -1,
        }}
      >
        <div className="flex w-full items-start justify-center gap-[15px]">
          <div className="flex flex-1 flex-col items-start gap-3">
            <button
              type="button"
              onClick={handleShare}
              disabled={!shareUrl}
              className={`flex h-[40.16px] w-full items-center justify-center rounded-[15.06px] px-[12.55px] py-[6.69px] font-simpler text-[13.39px] font-bold leading-[18.07px] shadow-[1.67px_1.67px_16.73px_rgba(109,109,109,0.15)] disabled:opacity-40 ${sharePrimaryClass}`}
            >
              {copied ? 'הועתק!' : 'לשיתוף התמונה'}
            </button>

            <a
              href={viewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex h-[40.16px] w-full items-center justify-center rounded-[15.06px] px-[12.55px] py-[6.69px] font-simpler text-[13.39px] font-bold leading-[18.07px] shadow-[1.67px_1.67px_16.73px_rgba(109,109,109,0.15)] ${viewButtonClass}`}
            >
              לצפייה בתמונה
            </a>

            {variant === 'parent' && isPending && onApprove && onReject && (
              <div className="flex w-full gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={processing}
                  className="flex-1 rounded-[16px] border border-red-300/50 py-2 font-simpler text-[13px] font-bold text-red-200 disabled:opacity-50"
                >
                  דחה
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={processing}
                  className="flex-1 rounded-[16px] bg-white py-2 font-simpler text-[13px] font-bold text-[#092125] disabled:opacity-50"
                >
                  {processing ? 'מאשר...' : 'אשר'}
                </button>
              </div>
            )}
          </div>

          <div
            className="relative h-[96.64px] w-[85px] shrink-0 overflow-hidden rounded-[12.44px]"
            style={{ outline: '0.62px solid white', outlineOffset: -0.62 }}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, rgba(0, 0, 0, 0) 15%, rgba(0, 0, 0, 0.40) 85%)',
              }}
              aria-hidden
            />
            <Image
              src={PARENT_DASHBOARD_ASSETS.agreementThumb}
              alt=""
              width={62}
              height={62}
              className="absolute object-cover"
              style={{
                width: 61.599,
                height: 61.599,
                aspectRatio: '1 / 1',
                top: 17.5,
                left: 12,
              }}
              unoptimized
            />
          </div>
        </div>
      </div>
    </section>
  );
}
