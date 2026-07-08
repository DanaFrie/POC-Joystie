'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { WeekDay } from '@/types/dashboard';
import {
  PARENT_DASHBOARD_ASSETS,
  PARENT_DASHBOARD_COLORS,
} from '@/constants/parent-dashboard-layout';

/** Visual order right→left in RTL layout when using flex row with dir=rtl: א…ש */
const DAY_LETTERS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'] as const;

export type ChangeCardMock = {
  id: string;
  title: string;
  changeText: string;
  initialChecked?: boolean[];
};

type DayToggleCircleProps = {
  letter: string;
  checked: boolean;
  onToggle: () => void;
};

function DayToggleCircle({ letter, checked, onToggle }: DayToggleCircleProps) {
  return (
    <div className="relative flex h-[73px] flex-col items-center justify-center gap-2">
      <span className="font-simpler text-[12px] font-bold leading-[15.6px] text-white">
        {letter}
      </span>

      <button
        type="button"
        onClick={onToggle}
        className="relative flex shrink-0 items-center justify-center"
        style={
          checked
            ? { width: 32.5, height: 32.5 }
            : {
                display: 'flex',
                width: 30,
                height: 30,
                padding: 6.25,
                justifyContent: 'center',
                alignItems: 'center',
                gap: 6.25,
                flexShrink: 0,
                borderRadius: 321.429,
                border: '1.25px solid #888',
                background: '#3A514A',
                boxSizing: 'border-box',
              }
        }
        aria-pressed={checked}
        aria-label={checked ? `בטל סימון יום ${letter}` : `סמן יום ${letter}`}
      >
        {checked ? (
          <Image
            src={PARENT_DASHBOARD_ASSETS.completionCheck}
            alt=""
            width={33}
            height={33}
            className="pointer-events-none size-[32.5px]"
            unoptimized
          />
        ) : null}
      </button>
    </div>
  );
}

type ChangeCardProps = {
  title: string;
  changeText: string;
  checkedDays: boolean[];
  onToggleDay: (index: number) => void;
};

function ChangeCard({ title, changeText, checkedDays, onToggleDay }: ChangeCardProps) {
  return (
    <section
      className="w-full rounded-[32px] px-[18px] pb-5 pt-[25px]"
      style={{
        background: PARENT_DASHBOARD_COLORS.cardBg,
        outline: `1px solid ${PARENT_DASHBOARD_COLORS.cardOutline}`,
        outlineOffset: -1,
      }}
    >
      <div className="flex w-full flex-col items-center gap-2">
        <p className="w-full px-2 text-center font-simpler text-[16px] font-normal leading-[21.6px] text-white">
          {title}
        </p>
        <p className="w-full px-2 text-center font-simpler text-[20px] font-black leading-[25px] text-white">
          {changeText}
        </p>
      </div>

      <div className="my-5 h-0 w-full outline outline-1 outline-[#586D66] -outline-offset-[0.5px]" aria-hidden />

      <div className="flex w-full items-center justify-between">
        {DAY_LETTERS.map((letter, dayIndex) => (
          <DayToggleCircle
            key={letter}
            letter={letter}
            checked={Boolean(checkedDays[dayIndex])}
            onToggle={() => onToggleDay(dayIndex)}
          />
        ))}
      </div>
    </section>
  );
}

type DashboardWeekTrackerProps = {
  week: WeekDay[];
  dailyScreenTimeGoal: number;
  childName?: string;
  changeText?: string;
  cards?: ChangeCardMock[];
};

function defaultCards(childName?: string, changeText?: string): ChangeCardMock[] {
  const name = childName || 'הילד';
  return [
    {
      id: 'change-1',
      title: `השינוי הראשון של ${name}`,
      changeText: changeText || 'לנסות ללכת לישון בשעה קצת יותר מוקדמת',
      initialChecked: [true, true, true, false, false, false, false],
    },
    {
      id: 'change-2',
      title: `השינוי השני של ${name}`,
      changeText: 'להפחית את כמות המסכים לפני שינה',
      initialChecked: [true, false, false, false, false, false, false],
    },
  ];
}

export function DashboardWeekTracker({
  childName,
  changeText,
  week: _week,
  dailyScreenTimeGoal: _goal,
  cards: cardsProp,
}: DashboardWeekTrackerProps) {
  const cards = cardsProp ?? defaultCards(childName, changeText);

  const [checkedByCard, setCheckedByCard] = useState<Record<string, boolean[]>>(() => {
    const initial: Record<string, boolean[]> = {};
    cards.forEach((card) => {
      initial[card.id] = card.initialChecked ?? [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ];
    });
    return initial;
  });

  const toggleDay = (cardId: string, dayIndex: number) => {
    setCheckedByCard((prev) => {
      const current = prev[cardId] ?? [false, false, false, false, false, false, false];
      const next = [...current];
      next[dayIndex] = !next[dayIndex];
      return { ...prev, [cardId]: next };
    });
  };

  return (
    <div className="flex w-full flex-col gap-3">
      {cards.map((card) => (
        <ChangeCard
          key={card.id}
          title={card.title}
          changeText={card.changeText}
          checkedDays={
            checkedByCard[card.id] ?? [false, false, false, false, false, false, false]
          }
          onToggleDay={(dayIndex) => toggleDay(card.id, dayIndex)}
        />
      ))}
    </div>
  );
}
