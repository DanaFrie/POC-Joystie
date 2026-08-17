'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import {
  FunnelStepForeground,
  FunnelStepMain,
  FunnelStepRoot,
  FunnelStepSection,
} from '@/components/ui/funnel-layout';
import { useFunnelFullBleed } from '@/components/ui/FunnelViewportContext';
import {
  ONBOARDING_COMPLETION,
  ONBOARDING_COMPLETION_CHECK_IMAGE,
  ONBOARDING_COMPLETION_IMAGE,
} from '@/constants/onboarding-completion-layout';
import { loadImageBlob, shareImageFile } from '@/lib/share/shareImage';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('ParentOnboardingCompletion');

type ParentOnboardingCompletionStepProps = {
  onContinue?: () => void;
  /**
   * Preloaded Storage agreement URL — page is only shown after prefetch.
   * Falls back to static asset when null/undefined.
   */
  agreementImageUrl?: string | null;
};

/** Figma 13057:16567 — parent onboarding completion (Screen 66). */
export function ParentOnboardingCompletionStep({
  onContinue,
  agreementImageUrl = null,
}: ParentOnboardingCompletionStepProps) {
  const layout = ONBOARDING_COMPLETION;
  const bleedStyle = useFunnelFullBleed();
  const [sharing, setSharing] = useState(false);
  const [shareHint, setShareHint] = useState<string | null>(null);
  const agreementBlobRef = useRef<Blob | null>(null);

  const previewSrc = agreementImageUrl || ONBOARDING_COMPLETION_IMAGE;

  useEffect(() => {
    let cancelled = false;
    agreementBlobRef.current = null;
    void (async () => {
      try {
        const blob = await loadImageBlob({ imageUrl: previewSrc });
        if (!cancelled) agreementBlobRef.current = blob;
      } catch (error) {
        logger.warn('Agreement image prefetch failed:', error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [previewSrc]);

  const handleShare = useCallback(async () => {
    if (sharing) return;
    setSharing(true);
    setShareHint(null);
    try {
      let blob = agreementBlobRef.current;
      if (!blob) {
        blob = await loadImageBlob({ imageUrl: previewSrc });
        agreementBlobRef.current = blob;
      }
      const result = await shareImageFile({
        imageBlob: blob,
        fileName: 'joystie-handshake.jpg',
        title: 'Joystie',
        text: 'החוזה שלנו ב- joystie.com',
      });
      if (result === 'downloaded') {
        setShareHint('התמונה הורדה');
        setTimeout(() => setShareHint(null), 2000);
      }
    } catch (error) {
      logger.error('Share agreement failed:', error);
      setShareHint('השיתוף נכשל');
      setTimeout(() => setShareHint(null), 2500);
    } finally {
      setSharing(false);
    }
  }, [previewSrc, sharing]);

  return (
    <FunnelStepRoot fitViewport className="overflow-hidden bg-transparent" aria-label="סיום ההרשמה">
      <div
        className="pointer-events-none absolute z-0 v03-funnel-surface-light"
        style={bleedStyle}
        aria-hidden
      />

      <FunnelStepForeground
        fitViewport
        distribution="between"
        padTopPx={layout.content.top}
        padBottomPx={34}
      >
        <FunnelStepMain className="items-center">
          <div
            className="flex h-full min-h-0 w-full max-w-v03-content flex-col items-center"
            style={{ gap: layout.content.gap }}
            dir="rtl"
          >
            <div
              className="flex w-full shrink-0 flex-col items-center"
              style={{ gap: layout.header.gap }}
            >
              <div
                className="relative shrink-0"
                style={{ width: layout.check.size, height: layout.check.size }}
              >
                <OnboardingLazyImage
                  src={ONBOARDING_COMPLETION_CHECK_IMAGE}
                  alt=""
                  className="size-full object-contain"
                  priority
                />
              </div>

              <div
                className="flex w-full flex-col items-center text-center text-v03-turquoise-950"
                style={{ gap: layout.textGap }}
              >
                <p
                  className="w-full font-simpler font-normal"
                  style={{
                    fontSize: layout.title.fontSize,
                    lineHeight: layout.title.lineHeight,
                    letterSpacing: `${layout.title.letterSpacing}px`,
                  }}
                >
                  כל הכבוד!
                </p>
                <h1
                  className="w-full font-simpler font-black"
                  style={{
                    fontSize: layout.headline.fontSize,
                    lineHeight: layout.headline.lineHeight,
                    letterSpacing: `${layout.headline.letterSpacing}px`,
                  }}
                >
                  רשמית, התחלתם את המסע שלכם עם ג׳ויסטי!
                </h1>
              </div>
            </div>

            {/* Leftover 100vh band — preview keeps 375×812 and squeezes via cqh. */}
            <div className="relative min-h-0 w-full flex-1">
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden [container-type:size]">
                <div
                  className="flex max-h-full min-h-0 w-fit max-w-full flex-col items-center overflow-hidden rounded-[29px] bg-white"
                  style={{
                    paddingLeft: layout.card.paddingX,
                    paddingRight: layout.card.paddingX,
                    paddingTop: layout.card.paddingY,
                    paddingBottom: layout.card.paddingY,
                    gap: layout.card.gap,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => void handleShare()}
                    disabled={sharing}
                    className="shrink-0 font-simpler font-bold text-[#05161a] underline decoration-solid underline-offset-2 disabled:opacity-50"
                    style={{
                      fontSize: layout.shareLink.fontSize,
                      lineHeight: layout.shareLink.lineHeight,
                      letterSpacing: `${layout.shareLink.letterSpacing}px`,
                    }}
                  >
                    {shareHint || (sharing ? 'משתף...' : 'לצפייה בחוזה ושיתוף')}
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleShare()}
                    disabled={sharing}
                    className="relative min-h-0 shrink-0 overflow-hidden bg-[#f0f0f0] shadow-[0px_0px_5.86px_rgba(0,0,0,0.3)] disabled:opacity-70"
                    style={{
                      aspectRatio: `${layout.preview.aspectWidth} / ${layout.preview.aspectHeight}`,
                      width: 'auto',
                      // Card chrome ≈ paddingY×2 + gap + share-link line (~28px)
                      height: `min(${layout.preview.maxHeight}px, calc(100cqh - ${layout.card.paddingY * 2 + layout.card.gap + 28}px))`,
                      maxWidth: layout.preview.maxWidth,
                      borderRadius: layout.preview.radius,
                    }}
                    aria-label="לצפייה בחוזה ושיתוף"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewSrc}
                      alt="החוזה שלכם"
                      className="absolute inset-0 size-full object-contain object-top"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </FunnelStepMain>

        {onContinue ? (
          <FunnelStepSection>
            <button
              type="button"
              onClick={onContinue}
              className="inline-flex h-[55px] w-full items-center justify-center rounded-[22px] bg-white px-[15px] py-2 font-simpler text-[18px] font-bold leading-[1.2] tracking-[-0.36px] text-v03-turquoise-950 shadow-[2px_2px_20px_rgba(109,109,109,0.15)] transition hover:brightness-95"
            >
              המשך
            </button>
          </FunnelStepSection>
        ) : null}
      </FunnelStepForeground>
    </FunnelStepRoot>
  );
}
