'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import type { WeekDay } from '@/types/dashboard';
import {
  PARENT_DASHBOARD_ASSETS,
  PARENT_DASHBOARD_COLORS,
} from '@/constants/parent-dashboard-layout';
import { updateChild } from '@/lib/api/children';
import {
  emptyDayChecks,
  matrixToChangeDayCheckRows,
} from '@/lib/onboarding/changeDayChecks';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('DashboardWeekTracker');

/** Visual order right→left in RTL layout when using flex row with dir=rtl: א…ש */
const DAY_LETTERS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'] as const;

function emptyChecks(): boolean[] {
  return emptyDayChecks();
}

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
  dailyScreenTimeGoal?: number;
  childName?: string;
  childId?: string;
  parentId?: string;
  changes?: string[];
  changeDayChecks?: boolean[][];
  changeText?: string;
  cards?: ChangeCardMock[];
};

function buildCardsFromChanges(
  childName: string | undefined,
  changes: string[] | undefined,
  changeDayChecks: boolean[][] | undefined,
  fallbackChangeText?: string
): ChangeCardMock[] {
  const name = childName || 'הילד';
  const texts =
    changes && changes.length > 0
      ? changes.slice(0, 2)
      : fallbackChangeText
        ? [fallbackChangeText]
        : [];

  return texts.map((text, index) => ({
    id: `change-${index}`,
    title: index === 0 ? `השינוי הראשון של ${name}` : `השינוי השני של ${name}`,
    changeText: text,
    initialChecked: changeDayChecks?.[index] ?? emptyChecks(),
  }));
}

export function DashboardWeekTracker({
  childName,
  childId,
  parentId,
  changes,
  changeDayChecks,
  changeText,
  week: _week,
  dailyScreenTimeGoal: _goal,
  cards: cardsProp,
}: DashboardWeekTrackerProps) {
  const cards = cardsProp ?? buildCardsFromChanges(childName, changes, changeDayChecks, changeText);

  const [checkedByCard, setCheckedByCard] = useState<Record<string, boolean[]>>(() => {
    const initial: Record<string, boolean[]> = {};
    cards.forEach((card) => {
      initial[card.id] = card.initialChecked ?? emptyChecks();
    });
    return initial;
  });

  useEffect(() => {
    const next: Record<string, boolean[]> = {};
    cards.forEach((card) => {
      next[card.id] = card.initialChecked ?? emptyChecks();
    });
    setCheckedByCard(next);
    // Re-hydrate when Firestore child changes load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId, changes?.join('|'), JSON.stringify(changeDayChecks)]);

  const persistChecks = useCallback(
    async (nextByCard: Record<string, boolean[]>) => {
      if (!childId || !parentId || cards.length === 0) return;
      const matrix = cards.map((card) => nextByCard[card.id] ?? emptyChecks());
      try {
        await updateChild(
          childId,
          { changeDayChecks: matrixToChangeDayCheckRows(matrix) },
          parentId
        );
      } catch (error) {
        logger.warn('Failed to persist change day checks:', error);
      }
    },
    [childId, parentId, cards]
  );

  const toggleDay = (cardId: string, dayIndex: number) => {
    setCheckedByCard((prev) => {
      const current = prev[cardId] ?? emptyChecks();
      const next = [...current];
      next[dayIndex] = !next[dayIndex];
      const nextState = { ...prev, [cardId]: next };
      void persistChecks(nextState);
      return nextState;
    });
  };

  if (cards.length === 0) return null;

  return (
    <div className="flex w-full flex-col gap-3">
      {cards.map((card) => (
        <ChangeCard
          key={card.id}
          title={card.title}
          changeText={card.changeText}
          checkedDays={checkedByCard[card.id] ?? emptyChecks()}
          onToggleDay={(dayIndex) => toggleDay(card.id, dayIndex)}
        />
      ))}
    </div>
  );
}
