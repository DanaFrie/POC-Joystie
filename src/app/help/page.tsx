'use client';

export default function HelpPage() {
  const faqItems = [
    {
      question: 'איך הילד שלי מעלה את צילום המסך?',
      answer: 'הילד נכנס כל יום לקישור שהעברת לו ומעלה את צילום המסך של זמן המסך שלו, המערכת שלנו יודעת לקרוא את הצילום ולעדכן סטאטוס.'
    },
    {
      question: 'מה קורה אם הילד לא מעלה צילום מסך?',
      answer: 'אם הילד לא מעלה צילום מסך עד סוף היום, המערכת תציג את היום הזה כ"חסר". תוכל לשלוח תזכורת לילד דרך המערכת. חשוב לזכור: רק ימים שהועלו ואושרו על ידך נחשבים לחישוב התקציב השבועי.'
    },
    {
      question: 'איך אני מאשר או דוחה צילום מסך?',
      answer: 'בלוח הבקרה תוכל לראות את הצילום עם סטטוס "ממתין לאישור", יחד עם זמן המסך שהמערכת זיהתה, ואת הכסף שהילד הרוויח או הפסיד.'
    },
    {
      question: 'מה קורה בסוף השבוע?',
      answer: 'בסוף השבוע, אם הילד עמד ביעדים וצבר כסף, הוא יוכל לבחור מה לעשות עם הכסף: לקבל מזומן, לבחור מתנה, להציע פעילות משותפת, או לחסוך את הכסף. כל אפשרות מחזקת הרגלים חיוביים ומלמדת אחריות פיננסית.'
    }
  ];

  return (
    <div className="min-h-screen bg-transparent pb-24">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* FAQ Section */}
        <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 mb-6">
          <h2 className="font-varela font-semibold text-2xl text-[#262135] mb-6 text-right">
            שאלות נפוצות
          </h2>
          <div className="space-y-6 text-right">
            {faqItems.map((item, index) => (
              <div 
                key={index} 
                className={`pb-6 ${index < faqItems.length - 1 ? 'border-b border-gray-200' : ''}`}
              >
                <h3 className="font-varela font-semibold text-lg text-[#262135] mb-3">
                  {item.question}
                </h3>
                <p className="font-varela text-base text-[#282743] leading-relaxed">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Contact Section */}
        <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6">
          <h2 className="font-varela font-semibold text-2xl text-[#262135] mb-6 text-center">
            צור קשר
          </h2>
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center p-4 bg-[#E4E4E4] bg-opacity-30 rounded-[12px] hover:bg-opacity-40 transition-all">
              <a 
                href="mailto:info@joystie.com" 
                className="font-varela text-base text-[#273143] hover:text-[#262135] transition-colors"
              >
                info@joystie.com
              </a>
            </div>
            <div className="flex items-center justify-center p-4 bg-[#E4E4E4] bg-opacity-30 rounded-[12px] hover:bg-opacity-40 transition-all">
              <a 
                href="https://www.linkedin.com/company/joystie" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-varela text-base text-[#273143] hover:text-[#262135] transition-colors"
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
