'use client';

export default function HelpPage() {
  const faqItems = [
    {
      question: 'איך הילד שלי מעלה את צילום המסך?',
      answer: 'הילד מקבל קישור ייחודי לאחר ההרשמה. כל יום הוא נכנס לקישור הזה, בוחר את היום המתאים (היום, אתמול או שלשום) ומעלה את צילום המסך של זמן המסך מהטלפון שלו. המערכת מזהה אוטומטית את זמן המסך מהתמונה.'
    },
    {
      question: 'מה קורה אם הילד לא מעלה צילום מסך?',
      answer: 'אם הילד לא מעלה צילום מסך עד סוף היום, המערכת תציג את היום הזה כ"חסר". תוכל לשלוח תזכורת לילד דרך המערכת. חשוב לזכור: רק ימים שהועלו ואושרו על ידך נחשבים לחישוב התקציב השבועי.'
    },
    {
      question: 'איך אני מאשר או דוחה צילום מסך?',
      answer: 'כשהילד מעלה צילום מסך, הוא מופיע בלוח הבקרה שלך עם סטטוס "ממתין לאישור". תוכל לראות את הצילום, את זמן המסך שהמערכת זיהתה, ואת הכסף שהילד הרוויח או הפסיד. תוכל לאשר או לדחות את הצילום. אם תדחה, תוכל לשלוח הודעה לילד עם בקשה להעלות שוב.'
    },
    {
      question: 'מה קורה בסוף השבוע?',
      answer: 'בסוף השבוע, אם הילד עמד ביעדים וצבר כסף, הוא יוכל לבחור מה לעשות עם הכסף: לקבל מזומן, לבחור מתנה, להציע פעילות משותפת, או לחסוך את הכסף. כל אפשרות מחזקת הרגלים חיוביים ומלמדת אחריות פיננסית.'
    }
  ];

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
          <div className="space-y-6 text-right">
            {faqItems.map((item, index) => (
              <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                <h3 className="font-semibold text-lg text-[#273143] mb-2">
                  {item.question}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-[#273143] mb-4">
            צור קשר
          </h2>
          <div className="space-y-3 text-right">
            <div className="flex items-center justify-center gap-2">
              <span>📧</span>
              <a 
                href="mailto:info@joystie.com" 
                className="text-[#273143] hover:text-[#E6F19A] transition-colors underline"
              >
                info@joystie.com
              </a>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span>💼</span>
              <a 
                href="https://www.linkedin.com/company/joystie" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#273143] hover:text-[#E6F19A] transition-colors underline"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
