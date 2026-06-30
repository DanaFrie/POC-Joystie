'use client';

import { useState } from 'react';
import type { WeeklyUpload } from '@/types/firestore';
import { PARENT_DASHBOARD_COLORS } from '@/constants/parent-dashboard-layout';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('DashboardContractSection');

type DashboardContractSectionProps = {
  childName: string;
  parentName?: string;
  shareUrl?: string;
  weeklyUpload?: WeeklyUpload | null;
  onApprove?: () => Promise<void>;
  onReject?: () => Promise<void>;
};

export function DashboardContractSection({
  childName,
  parentName,
  shareUrl,
  weeklyUpload,
  onApprove,
  onReject,
}: DashboardContractSectionProps) {
  const [copied, setCopied] = useState(false);
  const [processing, setProcessing] = useState(false);

  const screenshotUrl =
    weeklyUpload?.screenshotUrl || null;
  const isPending = weeklyUpload?.status === 'pending';

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
    <section className="w-full">
      <p className="mb-2 text-right font-simpler text-[16px] font-normal leading-[21.6px] text-white">
        {parentName ? `החוזה עם ${childName}` : `החוזה של ${childName}`}
      </p>

      <div
        className="rounded-[32px] px-[18px] py-[25px]"
        style={{
          background: PARENT_DASHBOARD_COLORS.cardBg,
          outline: `1px solid ${PARENT_DASHBOARD_COLORS.cardOutline}`,
          outlineOffset: -1,
        }}
      >
        <div className="flex items-start gap-5">
          <div className="flex flex-1 flex-col gap-3">
            <button
              type="button"
              onClick={handleShare}
              disabled={!shareUrl}
              className="h-10 rounded-[18px] font-simpler text-[13px] font-bold leading-[18px] text-[#092125] shadow-[1.7px_1.7px_16.7px_rgba(109,109,109,0.15)] disabled:opacity-40"
              style={{ background: PARENT_DASHBOARD_COLORS.mintBright }}
            >
              {copied ? 'הועתק!' : 'לשיתוף הקישור'}
            </button>

            {screenshotUrl ? (
              <a
                href={screenshotUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 items-center justify-center rounded-[18px] bg-white font-simpler text-[13px] font-bold leading-[18px] text-[#092125] shadow-[1.7px_1.7px_16.7px_rgba(109,109,109,0.15)]"
              >
                לצפייה בתמונה
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="flex h-10 items-center justify-center rounded-[18px] bg-white/40 font-simpler text-[13px] font-bold leading-[18px] text-[#092125]/50"
              >
                לצפייה בתמונה
              </button>
            )}

            {isPending && onApprove && onReject && (
              <div className="flex gap-2 pt-1">
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

          <div className="relative h-[97px] w-[85px] shrink-0 overflow-hidden rounded-[12px] border border-white/60 bg-[#093532]">
            {screenshotUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={screenshotUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl opacity-40">
                📱
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
