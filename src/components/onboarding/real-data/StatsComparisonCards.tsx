'use client';

import { useState } from 'react';
import { JoystieHomeIconMark } from '@/components/onboarding/good-news/JoystieHomeIconMark';
import { ONBOARDING_FAMILY_LINK_ICON } from '@/constants/onboarding-figma';

const JOYSTIE_BAR_HEIGHTS = [25.37, 31.71, 26.52, 23.64];
const FAMILY_BAR_HEIGHTS = [59.18, 49.75, 68.62, 15.44, 65.18, 54.03];

function MiniJoystieIcon() {
  return (
    <div className="relative h-[30px] w-[30px] overflow-hidden rounded-md bg-[#092523] shadow-sm">
      <div className="pointer-events-none absolute left-1/2 top-1/2 origin-center -translate-x-1/2 -translate-y-1/2 scale-[0.5]">
        <JoystieHomeIconMark />
      </div>
    </div>
  );
}

function JoystieStatsCard() {
  return (
    <div
      className="relative flex flex-col items-center gap-6"
      style={{ width: 159 }}
    >
      <div className="flex flex-col items-center gap-2">
        <MiniJoystieIcon />
        <p className="text-center font-simpler text-[16px] leading-normal text-v03-green-900">
          <span className="font-normal">שימוש ב-</span>
          <span className="font-black">Joystie</span>
        </p>
      </div>

      <div
        className="relative flex w-full flex-col justify-between overflow-hidden rounded-[16px] bg-[#092523] p-3 outline outline-[2.88px] outline-white"
        style={{
          height: 169,
          boxShadow: '2.31px 2.31px 11.53px rgba(35,35,35,0.35)',
        }}
      >
        <div className="flex flex-col items-center gap-2.5 pt-1">
          <p className="text-center font-simpler text-[13px] font-normal text-white">
            ממוצע זמן מסך יומי
          </p>
          <p className="text-center font-simpler text-[24px] font-black text-[#00ffb3]">
            50 דק׳
          </p>
        </div>

        <div className="relative mt-auto w-full px-1 pb-1">
          <div className="absolute right-2 top-0 flex flex-col gap-4 text-[10px] text-[#f3f3f3]">
            <span>2 שע׳</span>
            <span>1 שע׳</span>
            <span>0</span>
          </div>
          <div className="flex h-[67px] items-end justify-between gap-1 pl-2 pr-8">
            {JOYSTIE_BAR_HEIGHTS.map((h, i) => (
              <div
                key={i}
                className="w-[10px] rounded-t-[3px] bg-[#00e4ab]"
                style={{ height: h }}
              />
            ))}
          </div>
          <div className="mt-1 flex justify-between px-1 font-rubik text-[10px] text-[#f3f3f3]">
            <span>ד׳</span>
            <span>ג׳</span>
            <span>ב׳</span>
            <span>א׳</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FamilyLinkStatsCard() {
  const [iconFailed, setIconFailed] = useState(false);

  return (
    <div
      className="relative flex flex-col items-center gap-[14px]"
      style={{ width: 159 }}
    >
      <div className="flex flex-col items-center gap-2">
        {!iconFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ONBOARDING_FAMILY_LINK_ICON}
            alt=""
            width={30}
            height={35}
            className="h-[35px] w-[30px] object-contain"
            onError={() => setIconFailed(true)}
          />
        ) : (
          <div className="h-[35px] w-[30px] rounded-md bg-[#e0e0e0]" />
        )}
        <p className="text-center font-simpler text-[16px] font-normal text-v03-green-900">
          שימוש ב-Family link
        </p>
      </div>

      <div
        className="relative flex w-full flex-col overflow-hidden rounded-[16px] bg-[#f3f3f3] p-3 outline outline-[0.58px] outline-[#dfdfdf]"
        style={{ height: 169 }}
      >
        <div className="flex flex-col items-center gap-2.5 pt-1">
          <p className="text-center font-simpler text-[13px] font-normal text-[#787878]">
            ממוצע זמן מסך יומי
          </p>
          <p className="text-center font-simpler text-[18px] font-semibold text-[#545454]">
            1 שע׳ 44 דק׳
          </p>
        </div>

        <div className="relative mt-auto w-full px-1 pb-1">
          <div className="absolute right-1 top-0 flex flex-col gap-4 text-[10px] text-[#a1a1a1]">
            <span>2 שע׳</span>
            <span>1 שע׳</span>
            <span>0</span>
          </div>
          <div className="flex h-[68px] items-end justify-between gap-0.5 pl-1 pr-7">
            {FAMILY_BAR_HEIGHTS.map((h, i) => (
              <div
                key={i}
                className="w-[10px] rounded-t-[3px] bg-[#bababa]"
                style={{ height: h * 0.85 }}
              />
            ))}
          </div>
          <div className="mt-1 flex justify-between px-0.5 font-rubik text-[9px] text-[#a1a1a1]">
            <span>ו׳</span>
            <span>ה׳</span>
            <span>ד׳</span>
            <span>ג׳</span>
            <span>ב׳</span>
            <span>א׳</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Side-by-side Joystie vs Family Link stats. */
export function StatsComparisonCards() {
  return (
    <div
      className="mx-auto flex w-full max-w-v03-content justify-center"
      style={{ minHeight: 246, paddingTop: 6.47 }}
    >
      <div className="inline-flex items-start" style={{ gap: 13 }}>
        <JoystieStatsCard />
        <FamilyLinkStatsCard />
      </div>
    </div>
  );
}
