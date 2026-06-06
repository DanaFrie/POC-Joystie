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
/** RTL chart: א׳ rightmost → DOM order for dir=rtl + justify-between */
const JOYSTIE_DAY_LABELS = ['א׳', 'ב׳', 'ג׳', 'ד׳'] as const;

const FAMILY_BARS = [
  { left: 0, top: 9.43, height: 59.18 },
  { left: 18.88, top: 18.87, height: 49.75 },
  { left: 37.76, top: 0, height: 68.62 },
  { left: 56.64, top: 53.18, height: 15.44 },
  { left: 75.52, top: 3.43, height: 65.18 },
  { left: 94.39, top: 14.58, height: 54.03 },
] as const;
const FAMILY_DAY_LABELS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳'] as const;

const FAMILY_CHART_H_PX = 55;
const FAMILY_BARS_VIEWPORT_H_PX = 46.13;
const FAMILY_BARS_LAYER_TOP_PX = -22.49;
const FAMILY_BARS_LAYER_H_PX = 68.62;

function FamilyLinkBarsLayer() {
  return (
    <div className="relative size-full">
      {FAMILY_BARS.map((bar, i) => (
        <div
          key={i}
          className="absolute w-[10.38px] rounded-t-[2.88px] bg-[#bababa]"
          style={{
            left: bar.left,
            top: bar.top,
            height: bar.height,
          }}
        />
      ))}
    </div>
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
    <div
      className="absolute z-[2]"
      style={{ width: 13, height: 13, left: 29, top: 43.46 }}
      aria-hidden
    >
      <div className="absolute inset-0 rounded-full bg-[#1becae] shadow-[0_1.35px_1.35px_rgba(0,0,0,0.25)] outline outline-[1px] outline-[#00a272]" />
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
    </div>
  );
}

function JoystieStatsCard() {
  return (
    <div
      className="inline-flex flex-col items-center justify-between"
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

        <JoystieCardCheck />

        <div
          className="absolute flex flex-col items-center justify-center"
          style={{ left: 15.27, top: 14.86, width: 132, gap: 9.8 }}
        >
          <p className="w-full text-center font-simpler text-xs font-normal text-white">
            ממוצע זמן מסך יומי
          </p>
          <p className="text-center font-simpler text-2xl font-black text-[#00ffb3]">
            50 דק׳
          </p>
        </div>

        <span
          className="absolute font-simpler text-[10px] font-normal text-[#f3f3f3]"
          style={{ left: 125.42, top: 77.86 }}
        >
          2 שע׳
        </span>
        <span
          className="absolute font-simpler text-[10px] font-normal text-[#f3f3f3]"
          style={{ left: 126.42, top: 110.86 }}
        >
          1 שע׳
        </span>
        <span
          className="absolute text-right font-simpler text-[10px] font-normal text-[#f3f3f3]"
          style={{ left: 127.42, top: 147.02 }}
        >
          0
        </span>

        <div
          dir="ltr"
          className="absolute inline-flex items-end justify-between"
          style={{ left: 14.8, top: 81.86, width: 99, height: 67 }}
        >
          {JOYSTIE_BAR_HEIGHTS.map((height, i) => (
            <div
              key={i}
              className="w-[10.38px] shrink-0 rounded-t-[2.88px] bg-[#00e4ab]"
              style={{ height }}
            />
          ))}
        </div>

        <ChartDayLabels
          labels={JOYSTIE_DAY_LABELS}
          className="absolute font-rubik text-[10px] font-normal text-[#f3f3f3]"
          style={{ left: 14.8, top: 152.86, width: 99 }}
        />
      </div>
    </div>
  );
}

function FamilyLinkStatsCard() {
  const [iconFailed, setIconFailed] = useState(false);

  return (
    <div
      className="inline-flex flex-col items-center justify-between"
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
          className="absolute flex flex-col items-center justify-center"
          style={{ left: 24.76, top: 14.86, width: 109, gap: 9.8 }}
        >
          <p className="w-full text-center font-simpler text-xs font-normal text-[#787878]">
            ממוצע זמן מסך יומי
          </p>
          <p className="w-full text-center font-simpler text-lg font-semibold text-[#545454]">
            1 שע׳ 44 דק׳
          </p>
        </div>

        <span
          className="absolute text-center font-simpler text-[10px] font-normal text-[#a1a1a1]"
          style={{ left: 127.74, top: 77.86 }}
        >
          2 שע׳
        </span>
        <span
          className="absolute text-center font-simpler text-[10px] font-normal text-[#a1a1a1]"
          style={{ left: 128.74, top: 111.86 }}
        >
          1 שע׳
        </span>
        <span
          className="absolute text-right font-simpler text-[10px] font-normal text-[#a1a1a1]"
          style={{ left: 129.74, top: 146.86 }}
        >
          0
        </span>

        <div
          className="absolute flex flex-col items-end justify-start"
          style={{
            left: 14.76,
            top: 105,
            width: 104,
            height: FAMILY_CHART_H_PX,
            gap: 3.46,
          }}
        >
          <div
            className="relative w-full self-stretch overflow-hidden"
            style={{ height: FAMILY_BARS_VIEWPORT_H_PX }}
          >
            <div
              className="absolute left-0"
              style={{
                width: 104,
                height: FAMILY_BARS_LAYER_H_PX,
                top: FAMILY_BARS_LAYER_TOP_PX,
              }}
            >
              <FamilyLinkBarsLayer />
            </div>
          </div>
          <ChartDayLabels
            labels={FAMILY_DAY_LABELS}
            className="self-stretch font-rubik text-[9px] font-normal text-[#a1a1a1]"
          />
        </div>
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
        <JoystieStatsCard />
        <FamilyLinkStatsCard />
      </div>
    </div>
  );
}
