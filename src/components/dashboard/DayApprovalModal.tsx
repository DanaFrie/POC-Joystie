'use client';

import { useState } from 'react';
import Image from 'next/image';
import { WeekDay } from '@/types/dashboard';
import { formatNumber } from '@/utils/formatting';

interface DayApprovalModalProps {
  day: WeekDay;
  childName: string;
  onApprove: (dayDate: string) => void;
  onClose: () => void;
}

export default function DayApprovalModal({ 
  day, 
  childName, 
  onApprove, 
  onClose 
}: DayApprovalModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const goalMet = day.screenTimeUsed <= day.screenTimeGoal;

  const handleApprove = async () => {
    setIsProcessing(true);
    await onApprove(day.date);
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-varela font-semibold text-xl text-[#262135]">
            סטטוס יומי - {day.dayName} {day.date}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Status */}
        <div className={`mb-4 p-4 rounded-[12px] ${goalMet ? 'bg-[#E6F19A] bg-opacity-30' : 'bg-[#FFE5E5] bg-opacity-30'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{goalMet ? '✅' : '⚠️'}</span>
            <span className="font-varela font-semibold text-base text-[#273143]">
              {goalMet ? 'עמד ביעד!' : 'חרג מהיעד'}
            </span>
          </div>
          <div className="space-y-1 font-varela text-sm text-[#282743]">
            <p>זמן מסך: <strong>{formatNumber(day.screenTimeUsed)} שעות</strong></p>
            <p>יעד: <strong>{day.screenTimeGoal} שעות</strong></p>
            <p>כסף שנצבר: <strong>₪{formatNumber(day.coinsEarned)}</strong></p>
          </div>
        </div>

        {/* Screenshot */}
        {day.screenshotUrl && (
          <div className="mb-4">
            <h3 className="font-varela font-semibold text-base text-[#282743] mb-2">
              צילום מסך:
            </h3>
            <div className="border-2 border-gray-200 rounded-[12px] p-2">
              <Image
                src={day.screenshotUrl}
                alt="Screenshot"
                width={400}
                height={300}
                className="w-full h-auto rounded-lg object-contain"
              />
            </div>
          </div>
        )}

        {/* Apps */}
        {day.apps && day.apps.length > 0 && (
          <div className="mb-4">
            <h3 className="font-varela font-semibold text-base text-[#282743] mb-2">
              אפליקציות:
            </h3>
            <div className="space-y-2">
              {day.apps.map((app, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-[8px]">
                  <span className="font-varela text-sm text-[#282743]">{app.name}</span>
                  <span className="font-varela text-sm text-[#948DA9]">{formatNumber(app.timeUsed)} שעות</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleApprove}
            disabled={isProcessing}
            className="w-full py-3 px-4 rounded-[12px] font-varela font-semibold text-base bg-[#273143] text-white hover:bg-opacity-90 transition-all disabled:opacity-50"
          >
            {isProcessing ? 'מעבד...' : 'אשר'}
          </button>
        </div>
      </div>
    </div>
  );
}

