'use client';

export default function HelpPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl font-bold mb-8 text-[#273143]">
        עזרה
      </h1>
      <p className="text-xl mb-12 max-w-2xl text-gray-700">
        כאן תוכל למצוא מידע נוסף על השימוש ב-Joystie
      </p>
      <div className="space-y-4 w-full max-w-md">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-[#273143] mb-4">
            שאלות נפוצות
          </h2>
          <p className="text-gray-700">
            עמוד העזרה בהקמה...
          </p>
        </div>
      </div>
    </div>
  );
}

