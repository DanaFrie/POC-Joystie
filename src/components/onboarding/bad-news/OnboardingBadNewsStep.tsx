'use client';

import { useEffect, useState } from 'react';
import { CumulativeScreenTimeCard } from '@/components/onboarding/bad-news/CumulativeScreenTimeCard';
import { useFunnelViewportMetrics } from '@/components/ui/FunnelViewportContext';
import {
  ONBOARDING_BAD_NEWS_HERO_FALLBACK,
  ONBOARDING_BAD_NEWS_HERO_IMAGE,
} from '@/constants/onboarding-figma';
import { getFunnelStackedFooterShellHeightPx } from '@/constants/funnel-vertical-layout';
import { V03_SCREEN_HEIGHT } from '@/constants/v03-screen';
import {
  getChildCumulativeProjections,
  type ChildCumulativeProjection,
} from '@/lib/onboarding/cumulativeScreenTime';
import {
  REVEAL_BODY_CLASS,
  REVEAL_HEADLINE_CLASS,
} from '@/constants/reveal-typography';

/** Match `--v03-funnel-enter-reveal-*` tokens (tokens.css). */
export const BAD_NEWS_REVEAL_STAGGER_MS = 440;
export const BAD_NEWS_REVEAL_DURATION_MS = 1040;
/** Upper stack: hero → headline → body → «לפי החישוב» (indices 0–3). */
export const BAD_NEWS_UPPER_REVEAL_LAST_INDEX = 3;
/** Wait after upper elements finished, then show the card (was 1000ms; −40%). */
export const BAD_NEWS_CARD_AFTER_UPPER_MS = 600;
/** Card fade-in duration before footer may appear. */
export const BAD_NEWS_CARD_FADE_MS = 500;

/** When the calc card becomes visible. */
export const BAD_NEWS_CARD_REVEAL_MS =
  BAD_NEWS_UPPER_REVEAL_LAST_INDEX * BAD_NEWS_REVEAL_STAGGER_MS +
  BAD_NEWS_REVEAL_DURATION_MS +
  BAD_NEWS_CARD_AFTER_UPPER_MS;

/** When the המשך footer should reveal (after card). */
export const BAD_NEWS_FOOTER_REVEAL_MS =
  BAD_NEWS_CARD_REVEAL_MS + BAD_NEWS_CARD_FADE_MS;

const COPY_REPORT_GAP_MAX_PX = 65;
const COPY_REPORT_GAP_MIN_PX = 20;
const TOP_PAD_MAX_PX = 30;
const TOP_PAD_MIN_PX = 10;
const HERO_MAX_PX = 150;
const HERO_MIN_PX = 112;

/**
 * Figma Screen 7 — bad-news facts for the single child.
 * Upper copy reveals at a constant stagger; card waits 600ms after that.
 */
export function OnboardingBadNewsStep() {
  const { usableCanvasHeightPx } = useFunnelViewportMetrics();
  const footerH = getFunnelStackedFooterShellHeightPx();
  const mainBandPx = Math.max(1, usableCanvasHeightPx - footerH);
  const fullMainBandPx = V03_SCREEN_HEIGHT - footerH;
  const heightScale = Math.min(1, mainBandPx / fullMainBandPx);
  const topPadPx = Math.max(TOP_PAD_MIN_PX, Math.round(TOP_PAD_MAX_PX * heightScale));
  const copyReportGapPx = Math.max(
    COPY_REPORT_GAP_MIN_PX,
    Math.round(COPY_REPORT_GAP_MAX_PX * heightScale)
  );
  const heroSizePx = Math.max(HERO_MIN_PX, Math.round(HERO_MAX_PX * heightScale));
  const heroCopyGapPx = Math.max(4, Math.round(9 * heightScale));
  const headlineBodyGapPx = Math.max(8, Math.round(16 * heightScale));
  const reportStackGapPx = Math.max(8, Math.round(15 * heightScale));

  const [heroSrc, setHeroSrc] = useState<string>(ONBOARDING_BAD_NEWS_HERO_IMAGE);
  const [child, setChild] = useState<ChildCumulativeProjection | null>(null);
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    const projections = getChildCumulativeProjections();
    setChild(projections[0] ?? null);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowCard(true), BAD_NEWS_CARD_REVEAL_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      className="flex h-full min-h-0 w-full flex-1 flex-col items-center"
      aria-label="החדשות הפחות טובות"
    >
      <div
        className="flex h-full min-h-0 w-full flex-1 flex-col items-center pb-1"
        style={{ paddingTop: topPadPx }}
      >
        <div
          className="flex w-full shrink-0 flex-col items-center"
          style={{ gap: heroCopyGapPx }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroSrc}
            alt=""
            width={HERO_MAX_PX}
            height={HERO_MAX_PX}
            className="v03-funnel-enter-reveal-0 shrink-0 object-contain"
            style={{ width: heroSizePx, height: heroSizePx }}
            onError={() => {
              if (heroSrc !== ONBOARDING_BAD_NEWS_HERO_FALLBACK) {
                setHeroSrc(ONBOARDING_BAD_NEWS_HERO_FALLBACK);
              }
            }}
          />

          <div
            className="flex w-full flex-col items-center text-center"
            style={{ gap: headlineBodyGapPx }}
          >
            <h1 className={`v03-funnel-enter-reveal-1 ${REVEAL_HEADLINE_CLASS}`}>
              החדשות הפחות טובות הן:
            </h1>
            <p className={`v03-funnel-enter-reveal-2 ${REVEAL_BODY_CLASS}`}>
              כמו אצל הרבה משפחות,
              <br />
              המסך תופס <span className="font-bold tracking-[-0.4px]">חלק גדול</span>{' '}
              מהזמן של הילדים.
            </p>
          </div>
        </div>

        <div
          className="w-full"
          style={{
            height: copyReportGapPx,
            minHeight: COPY_REPORT_GAP_MIN_PX,
            maxHeight: COPY_REPORT_GAP_MAX_PX,
            flexShrink: 1,
          }}
          aria-hidden
        />

        <div
          className="flex w-full shrink-0 flex-col items-center"
          style={{ gap: reportStackGapPx }}
        >
          <div className="flex w-full flex-col items-center gap-[5px]">
            <p className="v03-funnel-enter-reveal-3 w-full text-center font-simpler text-[20px] font-normal leading-[1.2] tracking-[-0.4px] text-[#6d6d6d]">
              לפי החישוב, עד גיל 18:
            </p>

            <div
              className={`w-full transition-opacity duration-500 ease-out ${
                showCard ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {child ? <CumulativeScreenTimeCard child={child} className="w-full" /> : null}
            </div>
          </div>
        </div>

        <div className="min-h-0 w-full flex-1" aria-hidden />
      </div>
    </section>
  );
}
