'use client';

import { WeekDay, WeeklyTotals } from '@/types/dashboard';

interface WeeklyProgressProps {
  week: WeekDay[];
  totals: WeeklyTotals;
}

const statusConfig = {
  success: { icon: '✅', borderColor: '#000000', bg: 'bg-[#FFFCF8]' },
  warning: { icon: '⚠️', borderColor: '#ffc107', bg: 'bg-[#FFFCF8]' },
  pending: { icon: '⏳', borderColor: '#007AFF', bg: 'bg-[#FFFCF8]' },
  missing: { icon: '❌', borderColor: '#dc3545', bg: 'bg-[#FFFCF8]' },
  future: { icon: '➖', borderColor: '#ddd', bg: 'bg-[#F6F6F6] opacity-50' },
  redemption: { icon: null, borderColor: '#8bc34a', bg: 'bg-gradient-to-br from-[#E6F19A] to-[#BBE9FD]' }
};

function DayCard({ day }: { day: WeekDay }) {
  const config = statusConfig[day.status];
  
  return (
    <div 
      className={`relative p-2 sm:p-3 text-center rounded-[18px] border ${config.bg} shadow-card`}
      style={{ 
        borderColor: config.borderColor,
        borderWidth: day.isRedemptionDay ? '2px' : '0.5px'
      }}
    >
      <div className="font-varela font-bold text-[10px] text-[#282743]">
        {day.dayName}
      </div>
      <div className="font-varela text-[10px] text-[#948DA9]">
        {day.date}
      </div>
      <div className="text-sm sm:text-base my-1 flex items-center justify-center">
        {day.isRedemptionDay ? '🎉' : config.icon}
      </div>
      <div className="font-varela font-semibold text-[9px] text-[#282743]">
        {day.isRedemptionDay ? 'פדיון!' : `₪${day.coinsEarned.toFixed(1)}`}
      </div>
    </div>
  );
}

export default function WeeklyProgress({ week, totals }: WeeklyProgressProps) {
  return (
    <div className="my-4">
      <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-4 mb-4">
        <div className="grid grid-cols-7 gap-1">
          {week.map((day, index) => (
            <DayCard key={index} day={day} />
          ))}
        </div>
      </div>
    </div>
  );
}