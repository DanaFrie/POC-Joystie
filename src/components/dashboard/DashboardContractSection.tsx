'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { WeeklyUpload } from '@/types/firestore';
import {
  PARENT_DASHBOARD_ASSETS,
  PARENT_DASHBOARD_COLORS,
} from '@/constants/parent-dashboard-layout';
import { getChildShareCardAccess } from '@/lib/api/shareCard';
import { shareImageFile } from '@/lib/share/shareImage';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('DashboardContractSection');

type DashboardContractSectionProps = {
  childName: string;
  parentName?: string;
  parentId?: string;
  childId?: string;
  /** Public default asset URL only (not a permanent Storage token link). */
  shareImageUrl?: string | null;
  /** Private Storage share card — load via short-lived signed URL. */
  shareCardStored?: boolean;
  /** Child dashboard `?token=` when parent Auth is absent. */
  dashboardToken?: string | null;
  weeklyUpload?: WeeklyUpload | null;
  variant?: 'parent' | 'child';
  onApprove?: () => Promise<void>;
  onReject?: () => Promise<void>;
};

export function DashboardContractSection({
  childName,
  parentName,
  parentId,
  childId,
  shareImageUrl,
  shareCardStored = false,
  dashboardToken = null,
  weeklyUpload,
  variant = 'parent',
  onApprove,
  onReject,
}: DashboardContractSectionProps) {
  const [shareHint, setShareHint] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(shareImageUrl || null);
  const [loadingCard, setLoadingCard] = useState(shareCardStored);
  const objectUrlRef = useRef<string | null>(null);

  const isPending = weeklyUpload?.status === 'pending';
  const hasShareCard = Boolean(shareCardStored || shareImageUrl);
  const imageUrl = resolvedUrl || PARENT_DASHBOARD_ASSETS.agreementThumb;

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

  const loadStoredCard = useCallback(async (): Promise<string | null> => {
    if (!shareCardStored || !parentId) return shareImageUrl || null;
    try {
      const access = await getChildShareCardAccess({
        parentId,
        childId,
        dashboardToken,
      });
      if (objectUrlRef.current?.startsWith('blob:')) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      // Data-URL fallback from callable is fine as img src; signed URL too.
      setResolvedUrl(access.url);
      return access.url;
    } catch (error) {
      logger.error('Failed to load share card access:', error);
      setResolvedUrl(shareImageUrl || null);
      return shareImageUrl || null;
    }
  }, [shareCardStored, parentId, childId, dashboardToken, shareImageUrl]);

  useEffect(() => {
    let cancelled = false;
    if (!shareCardStored) {
      setResolvedUrl(shareImageUrl || null);
      setLoadingCard(false);
      return;
    }
    setLoadingCard(true);
    void loadStoredCard().finally(() => {
      if (!cancelled) setLoadingCard(false);
    });
    return () => {
      cancelled = true;
      if (objectUrlRef.current?.startsWith('blob:')) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [shareCardStored, shareImageUrl, loadStoredCard]);

  const handleShare = async () => {
    if (!hasShareCard) return;
    setSharing(true);
    setShareHint(null);
    try {
      let url = resolvedUrl;
      if (shareCardStored) {
        url = (await loadStoredCard()) || url;
      }
      if (!url) throw new Error('חסרה תמונה');
      const result = await shareImageFile({
        imageUrl: url,
        fileName: 'joystie-handshake.jpg',
        title: 'Joystie',
        text: 'התמונה שלנו ב־Joystie',
      });
      if (result === 'downloaded') {
        setShareHint('התמונה הורדה');
        setTimeout(() => setShareHint(null), 2000);
      }
    } catch (error) {
      logger.error('Share image failed:', error);
      setShareHint('השיתוף נכשל');
      setTimeout(() => setShareHint(null), 2500);
    } finally {
      setSharing(false);
    }
  };

  const handleView = async () => {
    try {
      let url = resolvedUrl;
      if (shareCardStored) {
        url = (await loadStoredCard()) || url;
      }
      if (!url) return;
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      logger.error('View image failed:', error);
      setShareHint('לא ניתן לפתוח');
      setTimeout(() => setShareHint(null), 2500);
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
              onClick={() => void handleShare()}
              disabled={!hasShareCard || sharing || loadingCard}
              className={`flex h-[40.16px] w-full items-center justify-center rounded-[15.06px] px-[12.55px] py-[6.69px] font-simpler text-[13.39px] font-bold leading-[18.07px] shadow-[1.67px_1.67px_16.73px_rgba(109,109,109,0.15)] disabled:opacity-40 ${sharePrimaryClass}`}
            >
              {shareHint || (sharing ? 'משתף...' : 'לשיתוף התמונה')}
            </button>

            <button
              type="button"
              onClick={() => void handleView()}
              disabled={!hasShareCard || loadingCard}
              className={`flex h-[40.16px] w-full items-center justify-center rounded-[15.06px] px-[12.55px] py-[6.69px] font-simpler text-[13.39px] font-bold leading-[18.07px] shadow-[1.67px_1.67px_16.73px_rgba(109,109,109,0.15)] disabled:opacity-40 ${viewButtonClass}`}
            >
              {loadingCard ? 'טוען...' : 'לצפייה בתמונה'}
            </button>

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
            <Image
              src={imageUrl}
              alt=""
              fill
              className="object-cover"
              sizes="85px"
              unoptimized
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, rgba(0, 0, 0, 0) 15%, rgba(0, 0, 0, 0.40) 85%)',
              }}
              aria-hidden
            />
            <Image
              src={PARENT_DASHBOARD_ASSETS.agreementThumb}
              alt=""
              width={43}
              height={48}
              className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 object-contain"
              style={{
                width: '50%',
                height: '50%',
              }}
              unoptimized
            />
          </div>
        </div>
      </div>
    </section>
  );
}
