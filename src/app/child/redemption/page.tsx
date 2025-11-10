'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

function ChildRedemptionContent() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const childId = searchParams.get('childId') || '';

  // Get child and parent data from localStorage
  const getChildAndParentData = () => {
    try {
      if (typeof window !== 'undefined') {
        // Try to get from dashboard test data
        const dashboardData = localStorage.getItem('dashboardTestData');
        if (dashboardData) {
          try {
            const parsed = JSON.parse(dashboardData);
            return {
              childName: parsed.child?.name || 'יובל',
              childGender: parsed.child?.gender || 'boy', // Default to boy
              parentName: parsed.parent?.name || 'דנה',
              parentGender: parsed.parent?.gender || 'female' // Default to female
            };
          } catch (e) {
            // Ignore parse errors
          }
        }
        
        // Try to get from challengeData
        const storedChallenge = localStorage.getItem('challengeData');
        if (storedChallenge) {
          try {
            const parsed = JSON.parse(storedChallenge);
            return {
              childName: parsed.childName || 'יובל',
              childGender: parsed.childGender || 'boy',
              parentName: parsed.parentName || 'דנה',
              parentGender: parsed.parentGender || 'female'
            };
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    } catch (e) {
      // Ignore errors
    }
    return {
      childName: 'יובל',
      childGender: 'boy',
      parentName: 'דנה',
      parentGender: 'female'
    };
  };

  const data = getChildAndParentData();
  const childName = data.childName;
  const childGender = data.childGender;
  const totalEarnings = 89.5;
  const redemptionDate = '17/03/2024';

  // Gender pronouns for child
  const childPronouns = {
    boy: { he: 'הוא', him: 'אותו', his: 'שלו', earned: 'צבר', wants: 'תרצה', get: 'קבל', save: 'שמור', earn: 'תרוויח' },
    girl: { he: 'היא', him: 'אותה', his: 'שלה', earned: 'צברה', wants: 'תרצי', get: 'קבלי', save: 'שמרי', earn: 'תרוויחי' }
  };
  const childP = childPronouns[childGender as 'boy' | 'girl'] || childPronouns.boy;

  // Get parent name (אמא/אבא) from localStorage
  const getParentName = () => {
    const parentGender = data.parentGender;
    if (parentGender === 'female' || parentGender === 'אישה') {
      return 'אמא';
    }
    return 'אבא';
  };

  const parentName = getParentName();
  
  // Parent pronouns
  const parentPronouns = {
    female: { they: 'היא', them: 'אותה', their: 'שלה', offers: 'מציעה', decide: 'תחליט' },
    male: { they: 'הוא', them: 'אותו', their: 'שלו', offers: 'מציע', decide: 'יחליט' }
  };
  const parentP = parentPronouns[data.parentGender as 'female' | 'male'] || parentPronouns.female;

  const redemptionOptions = [
    { id: 'cash', label: 'מזומן 💵', description: `${childP.get} את הכסף במטבעות או שטרות ישר אלייך` },
    { id: 'gift', label: 'מתנה 🎁', description: `בחר מתנה מתוך מה ש${parentName} ${parentP.offers} לך` },
    { id: 'activity', label: 'פעילות 🎮', description: `הצע ל${parentName} חוויה ש${childP.he === 'היא' ? 'היית' : 'היית'} רוצה איתם` },
    { id: 'save', label: 'חסכון 🏦', description: `${childP.save} את הכסף בחסכון ו${childP.earn} חצי שקל על כל שבוע ${childP.he === 'היא' ? 'שהוא' : 'שהוא'} שם` }
  ];

  const handleRedemption = async () => {
    if (!selectedOption) return;

    setIsProcessing(true);
    // Here you would typically process redemption with backend
    setTimeout(() => {
      setIsProcessing(false);
      // Show success and redirect or show message
      alert('הפדיון בוצע בהצלחה!');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-transparent pb-24">
      <div className="max-w-md mx-auto px-4 py-8 relative">
        {/* Piggy Bank - פינה ימנית עליונה */}
        <div className="absolute right-0 top-0 z-10">
          <Image
            src="/piggy-bank.png"
            alt="Piggy Bank"
            width={120}
            height={120}
            className="object-contain"
          />
        </div>

        {/* Celebration header */}
        <div className="bg-gradient-to-br from-[#E6F19A] to-[#BBE9FD] rounded-[18px] shadow-card p-6 mb-6 text-center mt-20">
          <h1 className="font-varela font-semibold text-2xl text-[#262135] mb-2">
            יום הפדיון!
          </h1>
          <p className="font-varela text-base text-[#282743] mb-4">
            {childName}, {childP.earned} השבוע:
          </p>
          <div className="bg-white bg-opacity-80 rounded-[12px] p-4">
            <p className="font-varela font-bold text-3xl text-[#262135]">
              ₪{totalEarnings}
            </p>
          </div>
        </div>

        {/* Redemption options */}
        <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 mb-6">
          <h2 className="font-varela font-semibold text-lg text-[#262135] mb-4 text-center">
            איך {childP.wants} לקחת את הכסף?
          </h2>
          <div className="space-y-3">
            {redemptionOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedOption(option.id)}
                className={`w-full p-4 rounded-[18px] border-2 transition-all text-right ${
                  selectedOption === option.id
                    ? 'border-[#273143] bg-[#273143] bg-opacity-10'
                    : 'border-gray-200 bg-white hover:border-[#273143] hover:border-opacity-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-varela font-semibold text-base text-[#282743] mb-1">
                      {option.label}
                    </h3>
                    <p className="font-varela text-sm text-[#948DA9] whitespace-nowrap overflow-hidden text-ellipsis">
                      {option.description}
                    </p>
                  </div>
                  {selectedOption === option.id && (
                    <div className="text-2xl flex-shrink-0 mr-2">✓</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Redemption button */}
        <button
          onClick={handleRedemption}
          disabled={!selectedOption || isProcessing}
          className={`w-full py-4 px-6 rounded-[18px] text-lg font-varela font-semibold transition-all ${
            selectedOption && !isProcessing
              ? 'bg-[#273143] text-white hover:bg-opacity-90'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isProcessing ? 'מעבד...' : 'קח את הכסף!'}
        </button>

        {/* Info */}
        <div className="mt-6 bg-[#FFFCF8] rounded-[18px] shadow-card p-4 text-center">
          <p className="font-varela text-xs text-[#948DA9]">
            תאריך הפדיון: {redemptionDate}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ChildRedemptionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">טוען...</div>}>
      <ChildRedemptionContent />
    </Suspense>
  );
}

