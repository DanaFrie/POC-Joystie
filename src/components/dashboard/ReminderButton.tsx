'use client';

import { useState } from 'react';
import { WeekDay } from '@/types/dashboard';

interface ReminderButtonProps {
  day: WeekDay;
  childName: string;
  uploadUrl: string;
}

export default function ReminderButton({ day, childName, uploadUrl }: ReminderButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleSendReminder = async () => {
    // Create reminder message according to Meir's version
    const reminderMessage = `היי ${childName}, איך היה אתמול? הספקת להעלות את התמונה? יש לי רעיון אדיר לכסף שנרוויח 💰: ${uploadUrl}`;

    try {
      await navigator.clipboard.writeText(reminderMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleSendReminder}
      className="w-full py-2 px-4 rounded-[12px] font-varela font-semibold text-sm bg-[#273143] text-white hover:bg-opacity-90 transition-all"
    >
      {copied ? 'הועתק! ✓' : `שלח תזכורת ל${childName}`}
    </button>
  );
}

