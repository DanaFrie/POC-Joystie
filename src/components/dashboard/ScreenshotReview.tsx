'use client';

import { Today } from '@/types/dashboard';

interface ScreenshotReviewProps {
  childId: string;
  today: Today;
  onApprove: () => void;
  onRequestNew: () => void;
}

export default function ScreenshotReview({ 
  childId, 
  today,
  onApprove,
  onRequestNew 
}: ScreenshotReviewProps) {
  const timeAgo = (timestamp: string) => {
    const minutes = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000);
    if (minutes < 60) return `לפני ${minutes} דקות`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `לפני ${hours} שעות`;
    return `לפני ${Math.floor(hours / 24)} ימים`;
  };

  return (
    <div className="bg-card-bg border border-gray-200 rounded-xl p-4 mx-6 my-4">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xl">📸</span>
        <div>
          <h3 className="font-montserrat font-semibold text-base">
            צילום מסך חדש
          </h3>
          <time className="font-varela text-xs text-text-muted">
            {timeAgo(today.uploadedAt)}
          </time>
        </div>
      </div>

      <div className="flex-1">
        <h4 className="font-varela text-sm mb-2">
          נתונים שזוהו:
        </h4>
        <ul className="font-varela text-xs text-text-secondary space-y-1">
          <li>זמן מסך כולל: {today.screenTimeUsed} שעות</li>
          <li>
            אפליקציות עיקריות: {today.apps.map(app => app.name).join(', ')}
          </li>
          <li>מטרה יומית: {today.screenTimeGoal} שעות</li>
        </ul>

        <div className="bg-secondary-bg p-2 rounded-lg mt-3 text-center">
          <strong className="font-rubik text-sm">
            חישוב: ₪{today.coinsEarned}
            {today.coinsEarned < today.coinsMaxPossible && ' (חריגה)'}
          </strong>
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={onApprove}
          className="flex-1 bg-secondary-bg border-none rounded-lg py-3 font-varela text-sm hover:bg-opacity-90 transition-colors"
        >
          ✅ אשר
        </button>
        <button
          onClick={onRequestNew}
          className="flex-1 bg-white border border-gray-200 rounded-lg py-3 font-varela text-sm hover:bg-gray-50 transition-colors"
        >
          🔄 בקש צילום חדש
        </button>
      </div>
    </div>
  );
}