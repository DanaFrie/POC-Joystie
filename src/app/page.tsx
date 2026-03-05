'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import HeroWalletCard from '@/components/landing/HeroWalletCard';

export default function Home() {
  const router = useRouter();
  const revealRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);

  // Prefetch routes on mount for faster navigation
  useEffect(() => {
    router.prefetch('/signup');
    router.prefetch('/login');
  }, [router]);

  // Track home page view
  useEffect(() => {
    const trackHomePageView = async () => {
      const { logEvent, AnalyticsEvents } = await import('@/utils/analytics');
      await logEvent(AnalyticsEvents.HOME_PAGE_VIEW);
    };
    trackHomePageView();
  }, []);

  // Intersection Observer for reveal animations + fallback so sections never stay hidden
  useEffect(() => {
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    revealRefs.current.forEach(el => {
      if (el) observer.observe(el);
    });

    const fallback = setTimeout(() => {
      revealRefs.current.forEach(el => {
        if (el && !el.classList.contains('active')) el.classList.add('active');
      });
    }, 400);

    return () => {
      clearTimeout(fallback);
      revealRefs.current.forEach(el => {
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  // Optimized handlers with useCallback
  const handleSignup = useCallback(() => {
    router.push('/signup');
  }, [router]);

  const handleLogin = useCallback(() => {
    router.push('/login');
  }, [router]);

  const addRevealRef = (index: number) => (el: HTMLDivElement | null) => {
    revealRefs.current[index] = el;
  };

  const toggleQuestion = (index: number) => {
    setActiveQuestion(activeQuestion === index ? null : index);
  };

  // Handle smooth scroll with offset for mobile menu
  const handleSectionClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    setIsMenuOpen(false);
    
    const element = document.getElementById(sectionId);
    if (element) {
      const navHeight = 106; // Height of fixed navigation (matches pt-28 clearance)
      const offset = 20; // Additional offset in pixels
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navHeight - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, []);

  return (
    <div className="landing-page overflow-x-hidden text-right" style={{ fontFamily: "'Varela Round', sans-serif" }}>

      {/* Navigation – גובה מוקטן ~10%, לינקים במרכז */}
      <nav className="fixed w-full z-50 py-2 md:py-3 bg-white/80 backdrop-blur-sm overflow-visible" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 relative w-full">
          <div className="flex items-center">
            {/* צד ימין (RTL): לוגו תמיד בימין */}
            <div className="flex-1 flex justify-start min-w-0">
              <a href="#" className="flex items-center shrink-0">
                <Image
                  src="/logo-joystie.png"
                  alt="Joystie"
                  width={81}
                  height={27}
                  className="h-[20px] w-auto max-h-[27px]"
                  style={{ filter: 'brightness(0) saturate(100%) invert(13%) sepia(46%) saturate(1673%) hue-rotate(186deg) brightness(98%) contrast(91%)', height: 'auto' }}
                  priority
                />
              </a>
            </div>

            {/* מרכז: לינקים (דסקטופ) */}
            <div className="hidden md:flex flex-1 justify-center gap-8 font-bold text-joystie-dark shrink-0 md:text-[1.1rem]">
              <a href="#how-it-works" className="hover:text-joystie-blue transition-colors font-brand">איך זה עובד?</a>
              <a href="#questions" className="hover:text-joystie-blue transition-colors font-brand">שאלות חשובות</a>
              <a href="#behind-idea" className="hover:text-joystie-blue transition-colors font-brand">מאחורי הרעיון</a>
            </div>

            {/* המבורגר במובייל */}
            <div className="flex md:hidden flex-1 justify-end min-w-0">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-joystie-dark hover:bg-gray-100"
                aria-label="תפריט"
                type="button"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* תפריט מובייל – מתחת לניו, full width, נראה תמיד כש-open */}
        {isMenuOpen && (
          <div
            className="md:hidden absolute left-0 right-0 top-full mt-0 bg-white border-t border-gray-200 p-6 flex flex-col gap-4 font-bold text-joystie-dark shadow-xl z-50"
            role="menu"
          >
            <a href="#how-it-works" onClick={(e) => handleSectionClick(e, 'how-it-works')} className="block py-2 text-right text-lg font-brand">איך זה עובד?</a>
            <a href="#questions" onClick={(e) => handleSectionClick(e, 'questions')} className="block py-2 text-right text-lg font-brand">שאלות חשובות</a>
            <a href="#behind-idea" onClick={(e) => handleSectionClick(e, 'behind-idea')} className="block py-2 text-right text-lg font-brand">מאחורי הרעיון</a>
          </div>
        )}
      </nav>

      {/* Hero Section - מובייל: טקסט למעלה, כותרת, ארנק (תופס את השאר). דסקטופ: כמו קודם */}
      <section 
        className="min-h-0 md:min-h-screen flex flex-col md:flex-row md:items-center pt-28 pb-4 md:pt-28 md:pb-12 lg:pb-20 overflow-visible relative" 
        style={{ backgroundImage: 'url(/background.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 w-full flex flex-col md:grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 lg:gap-8 md:items-center relative z-10 flex-1 min-h-0">
          {/* עמודה שמאל: טקסט + כותרת. מובייל: טקסט למעלה (order-1) ואז כותרת (order-2) */}
          <div className="flex flex-col gap-2 lg:gap-8 lg:justify-center lg:items-center order-1 md:order-1 shrink-0 self-center min-h-0">
            <div className="reveal active text-center order-1 lg:order-2 py-1">
              <p className="text-[1.1rem] sm:text-[1.46rem] md:text-[1.63rem] lg:text-[1.95rem] text-joystie-dark/85 leading-relaxed mb-2 md:mb-6 lg:mb-10 max-w-xl font-medium mx-auto">
                <span className="block text-[1.5rem] sm:text-inherit font-black text-joystie-dark drop-shadow-sm tracking-tight">המהפכה מתחילה!</span>
                הארנק שמחבר דמי כיס לזמן מסך!<br />הילדים שלכם לומדים לבחור, לחסוך ולהוביל.
              </p>
              {/* כפתורים בדסקטופ – במובייל מופיעים מתחת לארנק */}
              <div className="hidden md:flex flex-col items-center gap-2 md:gap-5" id="register">
                <Link
                  href="/signup"
                  className="btn-main bg-joystie-dark text-white px-14 py-6 text-2xl rounded-full font-black shadow-2xl text-center"
                >
                  התחילו ניסיון
                </Link>
                <Link
                  href="/login"
                  className="btn-main bg-transparent text-joystie-dark border-2 border-joystie-dark px-14 py-6 text-2xl rounded-full font-black shadow-lg hover:bg-joystie-dark/5 transition-all text-center"
                >
                  יש לי משתמש
                </Link>
              </div>
            </div>
            <h1 ref={addRevealRef(0)} className="reveal active text-center order-2 lg:order-1 text-[2.25rem] sm:text-[3.25rem] md:text-[4.25rem] lg:text-[5.2rem] font-black text-joystie-dark mb-0 tracking-tight font-brand">
              Joystie Wallet
            </h1>
          </div>
          {/* מובייל: ארנק בלי flex-1 – לוקח רק גובה התוכן. דסקטופ: ארנק בעמודה ימין. ממדים כאן כדי wrapper אחד בלבד */}
          <div
            ref={addRevealRef(1)}
            className="relative flex flex-none md:flex-1 min-h-0 min-w-0 overflow-hidden justify-center items-center reveal active order-2 md:order-2 pt-4 pb-0 md:py-0 self-center w-[216px] sm:w-[223px] h-[431px] sm:h-[445px] md:w-full md:h-auto md:h-full"
            style={{ transitionDelay: '0.2s' }}
          >
            <HeroWalletCard />
          </div>
          {/* מובייל בלבד: כפתורים בשורה אחת, תמיד ממורכזים */}
          <div className="flex md:hidden flex-row items-stretch gap-2 sm:gap-3 shrink-0 order-3 pt-0 pb-4 mt-6 mx-auto w-fit max-w-[min(100%,28rem)]" id="register-mobile">
            <Link
              href="/signup"
              className="btn-main flex-1 min-w-0 bg-joystie-dark text-white px-4 py-3 text-[0.95rem] sm:text-[1.15rem] sm:px-7 sm:py-3.5 rounded-full font-black shadow-2xl whitespace-nowrap text-center"
            >
              התחילו ניסיון
            </Link>
            <Link
              href="/login"
              className="btn-main flex-1 min-w-0 bg-transparent text-joystie-dark border-2 border-joystie-dark px-4 py-3 text-[0.95rem] sm:text-[1.15rem] sm:px-7 sm:py-3.5 rounded-full font-black shadow-lg hover:bg-joystie-dark/5 transition-all whitespace-nowrap text-center"
            >
              יש לי משתמש
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works Section - first */}
      <section id="how-it-works" className="py-12 md:py-24 bg-joystie-dark text-white overflow-hidden relative">
        <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
          <div ref={addRevealRef(2)} className="text-center mb-10 md:mb-16 reveal">
            <h2 className="text-3xl md:text-4xl lg:text-[3.5rem] font-black mb-4 md:mb-6 font-brand text-center">איך זה עובד?</h2>
            <div className="w-24 h-1.5 bg-joystie-lime mx-auto rounded-full opacity-40"></div>
          </div>

          <div className="flex flex-col md:flex-row justify-center md:justify-between items-center md:items-start gap-6 md:gap-8 relative">
            <div className="hidden md:block absolute top-8 left-10 right-10 h-1 bg-white/10 z-0"></div>

            <div className="flex-1 flex flex-col items-center text-center relative z-10 group max-w-[260px]">
              <div className="w-12 h-12 md:w-[4.25rem] md:h-[4.25rem] bg-joystie-blue text-joystie-dark rounded-full flex items-center justify-center text-xl md:text-[1.4rem] font-black mb-4 md:mb-6 shadow-xl group-hover:scale-110 transition-transform">1</div>
              <h3 className="text-lg md:text-2xl font-black mb-2 md:mb-3 font-brand">דמי כיס דרך Joystie Wallet</h3>
              <p className="text-gray-300 text-xs md:text-base leading-relaxed">אתם טוענים סכום כסף שבועי. שווי הכסף עבור הילד הוא כסף וזמן מסך יחדיו.</p>
            </div>

            <div className="flex-1 flex flex-col items-center text-center relative z-10 group max-w-[260px]">
              <div className="w-12 h-12 md:w-[4.25rem] md:h-[4.25rem] bg-joystie-lime text-joystie-dark rounded-full flex items-center justify-center text-xl md:text-[1.4rem] font-black mb-4 md:mb-6 shadow-xl group-hover:scale-110 transition-transform">2</div>
              <h3 className="text-lg md:text-2xl font-black mb-2 md:mb-3 font-brand">הילד מקבל החלטות</h3>
              <p className="text-gray-300 text-xs md:text-base leading-relaxed">כל שעת מסך שווה כסף שניתן לממש ב-Joystie. בסוף השבוע הילד פודה את הכסף שהצליח לחסוך ולומד שיש מחיר לזמן.</p>
            </div>

            <div className="flex-1 flex flex-col items-center text-center relative z-10 group max-w-[260px]">
              <div className="w-12 h-12 md:w-[4.25rem] md:h-[4.25rem] bg-white text-joystie-dark rounded-full flex items-center justify-center text-xl md:text-[1.4rem] font-black mb-4 md:mb-6 shadow-xl group-hover:scale-110 transition-transform">3</div>
              <h3 className="text-lg md:text-2xl font-black mb-2 md:mb-3 font-brand">Joystie והילד מוצאים<br />את האיזון</h3>
              <p className="text-gray-300 text-xs md:text-base leading-relaxed">מגיעים יחד לנוסחה שמתאימה למשפחה שלכם.</p>
            </div>
          </div>
          
          <div ref={addRevealRef(12)} className="reveal flex justify-center mt-10 md:mt-16">
            <button 
              onClick={handleSignup}
              className="btn-main bg-white text-joystie-dark px-8 py-4 md:px-12 md:py-5 rounded-full text-lg md:text-xl shadow-2xl border-2 border-white hover:bg-joystie-lime hover:border-joystie-lime transition-all font-brand"
            >
              הצטרפו עכשיו
            </button>
          </div>
        </div>
      </section>

      {/* Features Section - הכלים שיעזרו לכם להצליח */}
      <section id="tools" className="py-16 md:py-32 bg-white bg-grid relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div ref={addRevealRef(4)} className="text-center mb-12 md:mb-24 reveal">
            <h2 className="text-3xl md:text-4xl lg:text-6xl font-black text-joystie-dark mb-4 md:mb-6 font-brand text-center">הכלים שיעזרו לכם להצליח</h2>
            <div className="w-32 h-2.5 bg-joystie-lime mx-auto rounded-full"></div>
          </div>
          
          <div className="max-w-5xl mx-auto mt-10 md:mt-20">
            <div ref={addRevealRef(3)} className="reveal active" style={{
              position: 'relative',
              padding: '2rem 1.5rem',
              border: '3px dashed rgba(39, 49, 67, 0.15)',
              borderRadius: '3rem',
              background: 'rgba(255, 255, 255, 0.4)'
            }}>
              
              <div className="grid md:grid-cols-2 gap-6 md:gap-10">
                <div className="p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-white border border-gray-100 shadow-xl group hover:scale-[1.03] transition-all flex flex-col items-center text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl mb-4 md:mb-8 shadow-inner flex items-center justify-center overflow-hidden">
                    <Image
                      src="/time-balance-icon.png"
                      alt="Time Balance Icon"
                      width={80}
                      height={80}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-joystie-dark mb-3 md:mb-4 font-brand text-center">איזון זמן מסך</h3>
                  <p className="text-base md:text-lg text-gray-500 leading-relaxed">בלי הריב היומי! הופכים את המסכים לכלי של ניהול עצמי ואחריות אישית.</p>
                </div>
                <div className="p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-white border border-gray-100 shadow-xl group hover:scale-[1.03] transition-all flex flex-col items-center text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl mb-4 md:mb-8 shadow-inner flex items-center justify-center overflow-hidden">
                    <Image
                      src="/digital-wallet-icon.png"
                      alt="Digital Wallet Icon"
                      width={80}
                      height={80}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-joystie-dark mb-3 md:mb-4 font-brand text-center">ארנק דיגיטלי</h3>
                  <p className="text-base md:text-lg text-gray-500 leading-relaxed">הבנק הראשון של הילד. המקום שבו הוא לומד לנהל כסף אמיתי, לחסוך ולהוציא בתבונה.</p>
                </div>
              </div>

              <div style={{
                position: 'absolute',
                bottom: 0,
                left: '50%',
                transform: 'translate(-50%, 50%)',
                whiteSpace: 'nowrap',
                backgroundImage: 'url(/background.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: '#273143',
                padding: '0.75rem 2rem',
                borderRadius: '9999px',
                boxShadow: '0 15px 35px rgba(39,49,67,0.2)',
                fontSize: '1rem',
                fontWeight: 900,
                zIndex: 20,
                border: '3px solid white',
                fontFamily: "'Fredoka', sans-serif"
              }}>
                חינוך פיננסי מעשי
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Questions Section */}
      <section id="questions" className="py-16 md:py-32 bg-[#f8fafc] relative z-10">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div ref={addRevealRef(5)} className="text-center mb-12 md:mb-20 reveal">
            <h2 className="text-3xl md:text-4xl lg:text-6xl font-black text-joystie-dark mb-4 md:mb-6 font-brand text-center">שאלות חשובות</h2>
            <div className="w-32 h-2.5 bg-joystie-lime mx-auto rounded-full"></div>
          </div>

          <div className="space-y-3 md:space-y-4">
            {[
              {
                q: "האם לא נוצרת כאן מוטיבציה שגויה שאינה חינוכית?",
                a: "המוטיבציה השגויה קיימת במצב הנוכחי. כיום, הילד מקבל שירותי תוכן \"בחינם\" לכאורה, אך משלם עליהם במטבע יקר של קשב ובריאות נפשית.\nהמודל הקיים מעודד חוסר גבולות, חרדה וקושי בדחיית סיפוקים.\nהמוצר שלנו מחליף את \"התשלום השקוף\" וההרסני הזה במודל כלכלי גלוי, המלמד את הילד לנהל תקציב, לקבל החלטות מושכלות ולדחות סיפוקים - בדיוק כמו בעולם האמיתי"
              },
              {
                q: "מה קורה עם ההגבלה שיש היום?",
                a: "ההגבלות הטכניות - ScreenTime, Family Link - מציבות אותנו כשוטר מול הילד. ההגבלה שמה את הילד במקום בלתי אפשרי, בדיוק ברגע שהוא הכי רוצה להמשיך, המערכת זורקת אותו החוצה.\nדמיינו אתכם בשיא הדיאטה עם עוגת גבינה מול הפנים!\nJoystie יוצר בסיס לתקשורת משפחתית, במקום ריב על המסך נוצרת תקשורת.\nמשוטרים להורים - כמו פעם."
              },
              {
                q: "ומה אם אנחנו לא נותנים דמי כיס?",
                a: "המערכת כיום היא אתגר של שבוע בלבד. כך גם אנחנו מציעים להסביר את זה לילד. אנחנו רוצים להצית את הניצוץ שיחל ליצור הרגלים מיטיבים."
              }
            ].map((item, idx) => (
              <div key={idx} ref={addRevealRef(6 + idx)} className="reveal bg-white rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
                <button 
                  className="w-full p-5 md:p-8 flex items-center justify-between font-bold text-lg md:text-xl text-joystie-dark text-right font-brand"
                  onClick={() => toggleQuestion(idx)}
                >
                  <span>{item.q}</span>
                  <ChevronDown className={`transition-transform duration-300 ${activeQuestion === idx ? 'rotate-180' : ''}`} />
                </button>
                {activeQuestion === idx && (
                  <div className="px-5 pb-5 md:px-8 md:pb-8 text-joystie-dark/70 text-base md:text-lg leading-relaxed animate-fadeIn">
                    {item.a.split('\n').map((line, lineIdx) => (
                      <p key={lineIdx} className={lineIdx > 0 ? 'mt-3' : ''}>{line}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Behind the Idea Section - WITH QUOTES AND GRID */}
      <section id="behind-idea" className="py-16 md:py-32 bg-white bg-grid relative">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div ref={addRevealRef(9)} className="text-center mb-12 md:mb-24 reveal">
            <h2 className="text-3xl md:text-4xl lg:text-6xl font-black text-joystie-dark mb-4 md:mb-6 font-brand tracking-tight text-center">מאחורי הרעיון</h2>
            <div className="w-32 h-2.5 bg-joystie-blue mx-auto rounded-full"></div>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 md:gap-20 items-center">
            <div className="space-y-4 md:space-y-6 text-base md:text-lg text-joystie-dark/80 leading-relaxed text-right order-2 lg:order-1">
              <p>מצאתי את עצמי מתוסכל משעות של בזבוז - גלילה אינסופית שגרמה לי להרגיש חרדה ותסכול - והרגשתי שאני לא מרוכז דווקא בזמנים שהכי רציתי להיות נוכח: עם הילדים שלי.</p>
              <p>כשהבנות שלי התחילו לחקות אותי, הבנתי שאני בבעיה. יצאתי למסע של איזון דיגיטלי - בשביל המשפחה שלי ובשביל הנפש שלי. הבנתי שהילדים שלי משלמים מחיר בעסקה שאף אחד לא חתם איתם עליה: הן נותנות את תשומת הלב שלהן ומקבלות שירותים "בחינם".</p>
              <p>בדרך פגשתי את דנה, שחולקת איתי את האתגר הזה. יחד החלטנו ליצור עסקה אחרת - מנגנון שמצד אחד שם את העסקה המקורית על השולחן בשקיפות מלאה, ומצד שני עוזר למשפחות למצוא איזון אמיתי.</p>
              <p>ככה נולד Joystie - כלי שהופך את הקונפליקט הדיגיטלי להזדמנות מעשית ללמד את הילדים על ניהול משאבים, כסף ואחריות אישית.</p>
              <p className="text-joystie-dark text-sm md:text-base font-brand mt-6">מאיר, מייסד Joystie</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 md:gap-6 order-1 lg:order-2">
              <div ref={addRevealRef(10)} className="reveal bg-joystie-lime p-5 md:p-8 rounded-[2rem] md:rounded-[3rem] text-center rotate-2 shadow-sm border-2 border-white transition-transform hover:rotate-0">
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden mx-auto mb-3 md:mb-4 shadow-sm border-2 border-white/60 flex items-center justify-center rotate-2">
                  <Image 
                    src="/meir_img.jfif" 
                    alt="מאיר ניצן" 
                    width={128} 
                    height={128} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="font-black text-joystie-dark font-brand text-base md:text-lg">מאיר ניצן</div>
                <div className="text-[10px] md:text-[11px] mt-1 md:mt-2 leading-tight text-joystie-dark/80 space-y-1">
                  <p className="font-bold">CEO & Co-founder</p>
                  <p>יזם חברתי, מרצה בכיר לאיזון דיגיטלי</p>
                  <p>עשור ביחידות העילית של הצבא וראש מכינה קדם צבאית</p>
                </div>
              </div>
              <div ref={addRevealRef(11)} className="reveal bg-joystie-lime p-5 md:p-8 rounded-[2rem] md:rounded-[3rem] text-center -rotate-2 shadow-sm border-2 border-white transition-transform hover:rotate-0">
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden mx-auto mb-3 md:mb-4 shadow-sm border-2 border-white/60 flex items-center justify-center -rotate-2">
                  <Image 
                    src="/dana_img.jfif" 
                    alt="דנה פרידמן" 
                    width={128} 
                    height={128} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="font-black text-joystie-dark font-brand text-base md:text-lg">דנה פרידמן</div>
                <div className="text-[10px] md:text-[11px] mt-1 md:mt-2 leading-tight text-joystie-dark/80 space-y-1">
                  <p className="font-bold">Head of product & Co-founder</p>
                  <p>יזמת טכנולוגית, Data Scientist</p>
                  <p>מנהלת מוצר וקצינה במילואים</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - WITH TILTED OBJECTS */}
      <footer 
        className="py-12 md:py-20 border-t border-white/20" 
        style={{ backgroundImage: 'url(/background.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-8 md:gap-12 text-center md:text-right">
          
          <div className="w-full md:w-1/4 flex justify-center md:justify-start items-center">
            <Image
              src="/logo-joystie.png"
              alt="Joystie Logo"
              width={160}
              height={50}
              className="h-16 w-auto"
              style={{ filter: 'brightness(0) saturate(100%) invert(13%) sepia(46%) saturate(1673%) hue-rotate(186deg) brightness(98%) contrast(91%)' }}
            />
          </div>

          <div className="w-full md:w-2/4 flex flex-col items-center md:items-center">
            <div className="text-joystie-dark font-black text-[1.3rem] md:text-[2.25rem] mb-6 md:mb-0 font-brand tracking-tight">Time is Money. We own Time</div>
          </div>

          <div className="w-full md:w-1/4 flex flex-col items-center md:items-start gap-4">
            <a href="https://www.linkedin.com/company/joystie" target="_blank" rel="noreferrer" className="text-joystie-dark font-black text-base hover:opacity-50 transition-all font-brand">
              Joystie on LinkedIn
            </a>
            <a href="mailto:info@joystie.com" className="text-joystie-dark font-black text-base font-brand">
              info@joystie.com
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}