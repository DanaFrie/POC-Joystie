'use client';

import type { CSSProperties } from 'react';
import { useState } from 'react';
import { ONBOARDING_FAMILY_LINK_ICON } from '@/constants/onboarding-figma';
import { JoystieComparisonHeaderIcon } from '@/components/onboarding/real-data/JoystieComparisonHeaderIcon';
import { REVEAL_REAL_DATA_CARDS_GAP_PX } from '@/constants/reveal-real-data-layout';

const CARD_W_PX = 159;
const CARD_H_PX = 169;
const CARD_PAD_PX = 11.53;
const HEADER_GAP_PX = 8.07;

const JOYSTIE_BAR_HEIGHTS = [25.37, 31.71, 26.52, 23.64] as const;
const JOYSTIE_DAY_LABELS = ['א׳', 'ב׳', 'ג׳', 'ד׳'] as const;

/** Joystie mini-chart — Figma frames 1171274913 / 17 / 1430108617 */
const JOYSTIE_CHART = {
  barsBottomPx: 20.136,
  barsHeightPx: 67,
  bgLayerLeftPx: 16,
  bgLayerWidthPx: 100,
  fgLayerLeftPx: 14.803,
  fgLayerWidthPx: 99,
  barWidthPx: 10.38,
  xLabelsTopPx: 152.86,
  xLabelsLeftPx: 14.803,
  xLabelsWidthPx: 100,
  yAxisTwoHours: { left: 125.42, top: 77.86 },
  yAxisOneHour: { left: 126.42, top: 110.86 },
  yAxisZero: { left: 127.42, top: 147.02 },
} as const;

const FAMILY_DAY_LABELS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳'] as const;

/** Family Link mini-chart — Figma frames 1430108616 / 16 / 1430108626 */
const FAMILY_HEADLINE = {
  leftPx: 24.758,
  topPx: 14.864,
  widthPx: 109,
  gapPx: 9.802,
  /** 12px + gap + 18px — inner frame fills parent */
  heightPx: 39.802,
} as const;

const FAMILY_CHART = {
  leftPx: 14.76,
  bottomPx: 20.136,
  widthPx: 105,
  barsHeightPx: 69,
  gridHeightPx: 68,
  labelsGapPx: 3.46,
  dayLabelHeightPx: 9,
} as const;

/** Y-axis rows aligned to grid-line icons (justify-between in 68px grid) */
const FAMILY_GRID_LINE_Y_PX = [0, 34, 67] as const;

const FAMILY_Y_AXIS = {
  twoHours: { leftPx: 127.74 },
  oneHour: { leftPx: 128.74 },
  zero: { leftPx: 129.74 },
} as const;

function familyChartTopPx() {
  return (
    CARD_H_PX -
    FAMILY_CHART.bottomPx -
    FAMILY_CHART.labelsGapPx -
    FAMILY_CHART.dayLabelHeightPx -
    FAMILY_CHART.barsHeightPx
  );
}

const FAMILY_BAR_PATHS = [
  'M0 12.3176C0 10.7253 1.29077 9.43457 2.88301 9.43457H7.49583C9.08807 9.43457 10.3788 10.7253 10.3788 12.3176V68.6155H0V12.3176Z',
  'M18.8789 21.7521C18.8789 20.1599 20.1697 18.8691 21.7619 18.8691H26.3747C27.967 18.8691 29.2577 20.1599 29.2577 21.7521V68.6155H18.8789V21.7521Z',
  'M37.7578 2.88301C37.7578 1.29077 39.0486 0 40.6408 0H45.2536C46.8459 0 48.1366 1.29077 48.1366 2.88301V68.6156H37.7578V2.88301Z',
  'M56.6367 56.0598C56.6367 54.4675 57.9275 53.1768 59.5197 53.1768H64.1325C65.7248 53.1768 67.0155 54.4675 67.0155 56.0598V68.6153H56.6367V56.0598Z',
  'M75.5156 6.31367C75.5156 4.72143 76.8064 3.43066 78.3986 3.43066H83.0115C84.6037 3.43066 85.8945 4.72143 85.8945 6.31367V68.6155H75.5156V6.31367Z',
  'M94.3945 17.4631C94.3945 15.8708 95.6853 14.5801 97.2775 14.5801H101.89C103.483 14.5801 104.773 15.8708 104.773 17.4631V68.6149H94.3945V17.4631Z',
] as const;

function FamilyLinkChartGridLines() {
  return (
    <div
      className="absolute inset-x-0 top-0 z-0 flex flex-col items-start justify-between"
      style={{ height: FAMILY_CHART.gridHeightPx }}
      aria-hidden
    >
      {[0, 1, 2].map((i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`family-chart-line-${i}`}
          src="/onboarding/family-link-chart-line-3.png"
          alt=""
          className="block h-px w-full max-w-full object-cover object-left"
          width={FAMILY_CHART.widthPx}
          height={1}
          draggable={false}
        />
      ))}
    </div>
  );
}

function FamilyLinkBarsSvg() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={FAMILY_CHART.widthPx}
      height={FAMILY_CHART.barsHeightPx}
      viewBox="0 0 105 69"
      fill="none"
      className="relative z-[1] block"
      aria-hidden
    >
      {FAMILY_BAR_PATHS.map((d) => (
        <path key={d.slice(0, 24)} d={d} fill="#BABABA" />
      ))}
    </svg>
  );
}

function FamilyLinkChartYAxis() {
  const chartTopPx = familyChartTopPx();

  return (
    <>
      <span
        className="absolute -translate-y-1/2 text-center font-simpler text-[10px] font-normal text-[#a1a1a1]"
        style={{
          left: FAMILY_Y_AXIS.twoHours.leftPx,
          top: chartTopPx + FAMILY_GRID_LINE_Y_PX[0],
        }}
      >
        2 שע׳
      </span>
      <span
        className="absolute -translate-y-1/2 text-center font-simpler text-[10px] font-normal text-[#a1a1a1]"
        style={{
          left: FAMILY_Y_AXIS.oneHour.leftPx,
          top: chartTopPx + FAMILY_GRID_LINE_Y_PX[1],
        }}
      >
        1 שע׳
      </span>
      <span
        className="absolute -translate-y-1/2 text-right font-simpler text-[10px] font-normal text-[#a1a1a1]"
        style={{
          left: FAMILY_Y_AXIS.zero.leftPx,
          top: chartTopPx + FAMILY_GRID_LINE_Y_PX[2],
        }}
      >
        0
      </span>
    </>
  );
}
function FamilyLinkChart() {
  return (
    <div
      className="absolute flex flex-col items-start"
      style={{
        left: FAMILY_CHART.leftPx,
        bottom: FAMILY_CHART.bottomPx,
        width: FAMILY_CHART.widthPx,
        gap: FAMILY_CHART.labelsGapPx,
      }}
    >
      <div
        className="relative shrink-0"
        style={{
          width: FAMILY_CHART.widthPx,
          height: FAMILY_CHART.barsHeightPx,
        }}
      >
        <FamilyLinkChartGridLines />
        <FamilyLinkBarsSvg />
      </div>
      <ChartDayLabels
        labels={FAMILY_DAY_LABELS}
        className="w-full font-rubik text-[9px] font-normal text-[#a1a1a1]"
      />
    </div>
  );
}

function JoystieChartGridLines() {
  return (
    <div
      className="absolute flex flex-col items-start justify-between"
      style={{
        left: JOYSTIE_CHART.bgLayerLeftPx,
        bottom: JOYSTIE_CHART.barsBottomPx,
        width: JOYSTIE_CHART.bgLayerWidthPx,
        height: JOYSTIE_CHART.barsHeightPx,
      }}
      aria-hidden
    >
      {[0, 1, 2].map((i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`joystie-chart-line-${i}`}
          src="/onboarding/joystie-chart-line-3.png"
          alt=""
          className="block h-px w-full max-w-full object-cover object-left opacity-50"
          width={100}
          height={1}
          draggable={false}
        />
      ))}
    </div>
  );
}

function JoystieChartBars() {
  return (
    <>
      <JoystieChartGridLines />
      <div
        dir="rtl"
        className="absolute flex items-end justify-between"
        style={{
          left: JOYSTIE_CHART.fgLayerLeftPx,
          bottom: JOYSTIE_CHART.barsBottomPx,
          width: JOYSTIE_CHART.fgLayerWidthPx,
          height: JOYSTIE_CHART.barsHeightPx,
        }}
        aria-hidden
      >
        {JOYSTIE_BAR_HEIGHTS.map((height, i) => (
          <div
            key={`joystie-bar-fg-${i}`}
            className="v03-joystie-bar-enter shrink-0 rounded-t-[2.88px] bg-[#00e4ab]"
            style={{
              width: JOYSTIE_CHART.barWidthPx,
              height,
              ['--v03-joystie-bar-index' as string]: i,
            }}
          />
        ))}
      </div>
    </>
  );
}

function JoystieChartYAxis() {
  return (
    <>
      <span
        className="absolute text-center font-simpler text-[10px] font-normal text-[#f3f3f3]"
        style={JOYSTIE_CHART.yAxisTwoHours}
      >
        2 שע׳
      </span>
      <span
        className="absolute text-center font-simpler text-[10px] font-normal text-[#f3f3f3]"
        style={JOYSTIE_CHART.yAxisOneHour}
      >
        1 שע׳
      </span>
      <span
        className="absolute text-right font-simpler text-[10px] font-normal text-[#f3f3f3]"
        style={JOYSTIE_CHART.yAxisZero}
      >
        0
      </span>
    </>
  );
}
function ChartDayLabels({
  labels,
  className,
  style,
}: {
  labels: readonly string[];
  className: string;
  style?: CSSProperties;
}) {
  return (
    <div
      dir="rtl"
      className={`inline-flex w-full items-center justify-between ${className}`}
      style={style}
    >
      {labels.map((label) => (
        <span key={label} className="text-center">
          {label}
        </span>
      ))}
    </div>
  );
}

function JoystieCardCheck() {
  return (
    <span
      className="relative inline-flex h-[13px] w-[13px] shrink-0"
      aria-hidden
    >
      <span className="absolute inset-0 rounded-full bg-[#1becae] shadow-[0_1.35px_1.35px_rgba(0,0,0,0.25)] outline outline-[1px] outline-[#00a272]" />
      <svg
        className="absolute"
        style={{ left: 3.5, top: 4, width: 6, height: 5 }}
        viewBox="0 0 7 6"
        fill="none"
        aria-hidden
      >
        <path
          d="M1 3L2.5 4.5L6 1"
          stroke="#0a2523"
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function JoystieStatsCard({ className }: { className?: string }) {
  return (
    <div
      className={`inline-flex flex-col items-center justify-between ${className ?? ''}`}
      style={{ width: CARD_W_PX, height: 245 }}
    >
      <div
        className="flex flex-col items-center justify-end"
        style={{ gap: HEADER_GAP_PX }}
      >
        <JoystieComparisonHeaderIcon />
        <p
          dir="rtl"
          className="whitespace-nowrap text-center font-simpler text-base font-normal leading-[21.6px] text-v03-green-900"
        >
          <span>שימוש ב-</span>
          <span className="font-bold" dir="ltr">
            Joystie
          </span>
        </p>
      </div>

      <div
        className="relative overflow-hidden rounded-[16.14px] bg-[#092523] outline outline-[2.88px] outline-white"
        style={{
          width: CARD_W_PX,
          height: CARD_H_PX,
          padding: CARD_PAD_PX,
          boxShadow: '2.306px 2.306px 11.532px rgba(35, 35, 35, 0.35)',
        }}
      >
        <div
          className="pointer-events-none absolute rounded-full bg-[#00ffb3]/70"
          style={{
            width: 105,
            height: 105,
            left: -30,
            top: 118.86,
            filter: 'blur(50px)',
          }}
          aria-hidden
        />

        <div
          dir="rtl"
          className="absolute flex flex-col items-center justify-center"
          style={{ left: 15.27, top: 14.86, width: 132, gap: 9.8 }}
        >
          <p
            dir="rtl"
            className="w-full text-center font-simpler text-xs font-normal text-white"
          >
            ממוצע זמן מסך יומי
          </p>
          <div
            dir="rtl"
            className="flex items-center justify-center gap-[5px]"
          >
            <span dir="ltr" className="font-simpler text-2xl font-black leading-none text-[#00ffb3]">
              50
            </span>
            <span className="font-simpler text-2xl font-black leading-none text-[#00ffb3]">
              דק׳
            </span>
            <JoystieCardCheck />
          </div>
        </div>

        <JoystieChartYAxis />
        <JoystieChartBars />

        <ChartDayLabels
          labels={JOYSTIE_DAY_LABELS}
          className="absolute font-rubik text-[10px] font-normal text-[#f3f3f3]"
          style={{
            left: JOYSTIE_CHART.xLabelsLeftPx,
            top: JOYSTIE_CHART.xLabelsTopPx,
            width: JOYSTIE_CHART.xLabelsWidthPx,
          }}
        />
      </div>
    </div>
  );
}

function FamilyLinkStatsCard({ className }: { className?: string }) {
  const [iconFailed, setIconFailed] = useState(false);

  return (
    <div
      className={`inline-flex flex-col items-center justify-between ${className ?? ''}`}
      style={{ width: CARD_W_PX, height: 245 }}
    >
      <div
        className="flex flex-col items-center justify-end"
        style={{ gap: HEADER_GAP_PX }}
      >
        {!iconFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ONBOARDING_FAMILY_LINK_ICON}
            alt=""
            width={30}
            height={35}
            className="h-[34.77px] w-[30px] object-contain"
            onError={() => setIconFailed(true)}
          />
        ) : (
          <div className="h-[34.77px] w-[30px] rounded-md bg-[#e0e0e0]" />
        )}
        <p
          dir="rtl"
          className="whitespace-nowrap text-center font-simpler text-base font-normal leading-[21.6px] text-v03-green-900"
        >
          שימוש ב-<span dir="ltr">Family link</span>
        </p>
      </div>

      <div
        className="relative overflow-hidden rounded-[16.14px] bg-[#f3f3f3] outline outline-[0.58px] outline-[#dfdfdf]"
        style={{
          width: CARD_W_PX,
          height: CARD_H_PX,
          padding: CARD_PAD_PX,
        }}
      >
        <div
          className="absolute"
          style={{
            left: FAMILY_HEADLINE.leftPx,
            top: FAMILY_HEADLINE.topPx,
            width: FAMILY_HEADLINE.widthPx,
            height: FAMILY_HEADLINE.heightPx,
          }}
        >
          <div
            className="absolute inset-0 inline-flex flex-col items-center justify-center"
            style={{ gap: FAMILY_HEADLINE.gapPx }}
          >
            <div className="text-center font-simpler text-xs font-normal leading-none text-[#787878]">
              ממוצע זמן מסך יומי
            </div>
            <div className="text-center font-simpler text-lg font-semibold leading-none text-[#545454]">
              1 שע׳ 44 דק׳
            </div>
          </div>
        </div>

        <FamilyLinkChartYAxis />
        <FamilyLinkChart />
      </div>
    </div>
  );
}

/** Side-by-side Joystie (left) vs Family Link (right) — Figma 12910:9075. */
export function StatsComparisonCards() {
  return (
    <div
      className="mx-auto flex w-full max-w-v03-content justify-center"
      style={{ minHeight: 245 }}
    >
      <div
        dir="ltr"
        className="inline-flex items-start justify-center"
        style={{ gap: REVEAL_REAL_DATA_CARDS_GAP_PX }}
      >
        <JoystieStatsCard className="v03-funnel-enter-reveal-2" />
        <FamilyLinkStatsCard className="v03-funnel-enter-reveal-3" />
      </div>
    </div>
  );
}
