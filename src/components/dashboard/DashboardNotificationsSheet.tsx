'use client';

import NotificationsPanel from '@/components/dashboard/NotificationsPanel';
import type { WeeklyUpload } from '@/types/firestore';

type DashboardNotificationsSheetProps = {
  open: boolean;
  onClose: () => void;
  challengeNotStarted?: boolean;
  challengeStartDate?: string;
  childName?: string;
  childGender?: 'boy' | 'girl';
  parentName?: string;
  parentGender?: 'male' | 'female';
  setupUrl?: string;
  uploadUrl?: string;
  redemptionUrl?: string;
  weeklyUpload?: WeeklyUpload | null;
  childSetupCompleted?: boolean;
  noChallengeExists?: boolean;
};

export function DashboardNotificationsSheet({
  open,
  onClose,
  ...panelProps
}: DashboardNotificationsSheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[55] flex items-end justify-center bg-black/50 backdrop-blur-sm">
      <button type="button" className="absolute inset-0" aria-label="סגור" onClick={onClose} />
      <div className="relative z-10 max-h-[70vh] w-full max-w-[375px] overflow-y-auto rounded-t-[24px] bg-[#061C1E] px-4 pb-8 pt-4 v03-scroll-hidden">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" aria-hidden />
        <NotificationsPanel variant="dark" {...panelProps} />
      </div>
    </div>
  );
}
