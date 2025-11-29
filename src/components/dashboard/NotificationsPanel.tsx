'use client';

interface NotificationsPanelProps {
  challengeNotStarted?: boolean;
  challengeStartDate?: string;
  childName?: string;
  childGender?: 'boy' | 'girl';
  parentName?: string;
}

export default function NotificationsPanel({ challengeNotStarted, challengeStartDate, childName, childGender, parentName }: NotificationsPanelProps) {
  const formatStartDate = (dateStr?: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    const dayName = dayNames[date.getDay()];
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `ביום ${dayName}, ${day}/${month}`;
  };

  // Determine parent gender from name
  const getParentGender = (): 'female' | 'male' => {
    if (!parentName) return 'female'; // default
    const name = parentName.trim();
    if (name.endsWith('ה') || name.endsWith('ית')) {
      return 'female';
    }
    return 'male';
  };

  const parentGender = getParentGender();
  const parentVerb = parentGender === 'female' ? 'תוכלי' : 'תוכל';

  return (
    <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-4">
      <h2 className="font-varela font-semibold text-base text-[#282743] mb-3">
        עדכונים
      </h2>
      {challengeNotStarted && challengeStartDate ? (
        <div className="bg-gradient-to-br from-[#E6F19A] to-[#BBE9FD] rounded-[12px] p-4 border-2 border-[#E6F19A]">
          <p className="font-varela text-sm text-[#262135] text-center leading-relaxed font-semibold mb-2">
            האתגר יתחיל ממש בקרוב! {formatStartDate(challengeStartDate)}.
          </p>
          <p className="font-varela text-sm text-[#262135] text-center leading-relaxed">
            בינתיים, {parentVerb} להכין את {childName || '[שם הילד/ה]'} ולהסביר {childGender === 'girl' ? 'לה' : 'לו'} על האתגר.
          </p>
        </div>
      ) : (
        <p className="font-varela text-sm text-[#948DA9] text-center py-2">
          אין עדכונים חדשים
        </p>
      )}
    </div>
  );
}

