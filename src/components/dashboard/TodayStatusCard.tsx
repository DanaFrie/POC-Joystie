'use client';

import { Child, Today } from '@/types/dashboard';

interface TodayStatusCardProps {
  child: Child;
  today: Today;
  onRequestScreenshot: () => void;
}

export default function TodayStatusCard({ child, today, onRequestScreenshot }: TodayStatusCardProps) {
  const progressPercentage = (today.screenTimeUsed / today.screenTimeGoal) * 100;
  const remainingTime = today.screenTimeGoal - today.screenTimeUsed;
  const remainingHours = Math.floor(remainingTime);
  const remainingMinutes = Math.round((remainingTime - remainingHours) * 60);

  const statusMessages = {
    pending: 'שלח בקשה לצילום מסך',
    uploaded: 'צילום מסך הועלה - ממתין לאישור שלך',
    approved: 'צילום מסך אושר',
    overdue: 'צילום מסך באיחור',
    missing: 'צילום מסך חסר'
  };

  const statusIcons = {
    pending: '📱',
    uploaded: '✅',
    approved: '✅',
    overdue: '⚠️',
    missing: '❌'
  };

  return (
    <div className="bg-card-bg shadow-card rounded-xl p-5 mx-6 my-4">
      <div className="mt-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{statusIcons[today.screenshotStatus]}</span>
          {today.screenshotStatus === 'pending' ? (
            <button
              onClick={onRequestScreenshot}
              className="font-varela text-sm bg-secondary-bg px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
            >
              {statusMessages[today.screenshotStatus]}
            </button>
          ) : (
            <span className="font-varela text-sm">
              {statusMessages[today.screenshotStatus]}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4">
        <label className="font-varela text-sm text-text-primary block mb-2">
          זמן מסך היום: {today.screenTimeUsed}/{today.screenTimeGoal} שעות
        </label>
        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-secondary-bg h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
        <small className="font-varela text-xs text-text-muted block mt-1">
          {remainingTime > 0 
            ? `נותרו: ${remainingHours} שעות ו-${remainingMinutes} דקות עד למטרה`
            : 'חרג מהמטרה היומית'}
        </small>
      </div>

      <div className="mt-6 text-center">
        <div className="inline-block bg-secondary-bg rounded-xl px-6 py-3">
          <div className="font-montserrat font-bold text-xl">
            זכאי היום: ₪{today.coinsEarned}
          </div>
          <small className="font-varela text-xs block mt-1">
            (מתוך ₪{today.coinsMaxPossible} אפשריים)
          </small>
        </div>
      </div>
    </div>
  );
}