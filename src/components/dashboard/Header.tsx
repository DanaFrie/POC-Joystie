'use client';

import { useState } from 'react';
import { Parent, Child, Challenge } from '@/types/dashboard';

interface HeaderProps {
  parent: Parent;
  child: Child;
  challenge: Challenge;
}

export default function Header({ parent, child, challenge }: HeaderProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="bg-primary-bg p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="relative mb-2">
            <h1 className="font-montserrat font-semibold text-[40px] leading-[121.21%] text-card-bg">
              Joystie
            </h1>
            <div 
              className="absolute -bottom-2 left-6 w-[55px] h-[3px] bg-card-bg"
              style={{ borderBottom: '3.26px solid #FFFCF8' }}
            />
          </div>
          <p className="font-varela text-xs text-text-secondary mt-4">
            האתגר של {child.name} | שבוע {challenge.weekNumber} מתוך {challenge.totalWeeks}
          </p>
        </div>
        <button 
          className="px-4 py-2 text-sm font-varela text-text-secondary hover:text-text-primary transition-colors"
          onClick={() => {/* Handle logout */}}
        >
          התנתק
        </button>
      </div>

      <details 
        className="mt-4"
        open={isSettingsOpen}
        onToggle={(e) => setIsSettingsOpen(e.currentTarget.open)}
      >
        <summary className="font-varela text-xs text-text-muted cursor-pointer">
          הגדרות האתגר ▼
        </summary>
        <div className="bg-card-bg rounded-lg p-3 mt-2 text-sm font-varela">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-text-secondary">
            <div>
              <span className="block text-xs">תקציב שבועי</span>
              <span className="font-rubik">₪{challenge.weeklyBudget}</span>
            </div>
            <div>
              <span className="block text-xs">תקציב יומי</span>
              <span className="font-rubik">₪{challenge.dailyBudget}</span>
            </div>
            <div>
              <span className="block text-xs">יעד יומי</span>
              <span className="font-rubik">{challenge.dailyScreenTimeGoal} שעות</span>
            </div>
            <div>
              <span className="block text-xs">קנס לשעה</span>
              <span className="font-rubik">₪{challenge.penaltyRate}</span>
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}