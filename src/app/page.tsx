'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';

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

  // Intersection Observer for reveal animations
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

    return () => {
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
      const navHeight = 80; // Height of fixed navigation
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
    <div className="overflow-x-hidden text-right" style={{ fontFamily: "'Varela Round', sans-serif" }}>

      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center">
            <Image
              src="/logo-joystie.png"
              alt="Joystie Logo"
              width={128}
              height={40}
              className="h-10 w-auto"
              style={{ filter: 'brightness(0) saturate(100%) invert(13%) sepia(46%) saturate(1673%) hue-rotate(186deg) brightness(98%) contrast(91%)' }}
              priority
            />
          </div>

          <div className="hidden md:flex items-center gap-8 font-bold text-joystie-dark">
            <a href="#how-it-works" className="hover:text-joystie-blue transition-colors font-brand">איך זה עובד?</a>
            <a href="#questions" className="hover:text-joystie-blue transition-colors font-brand">שאלות חשובות</a>
            <a href="#behind-idea" className="hover:text-joystie-blue transition-colors font-brand">מאחורי הרעיון</a>
            <button
              onClick={handleLogin}
              className="text-sm font-bold opacity-70 hover:opacity-100 transition-opacity"
            >
              יש לי משתמש
            </button>
            <button
              onClick={handleSignup}
              className="bg-joystie-dark text-white px-7 py-2.5 rounded-full text-sm shadow-lg hover:bg-opacity-90 transition-all font-brand btn-main"
            >
              הירשם
            </button>
          </div>

          <button className="md:hidden p-2 text-joystie-dark" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 p-6 flex flex-col gap-6 font-bold text-joystie-dark shadow-xl">
            <a href="#how-it-works" onClick={(e) => handleSectionClick(e, 'how-it-works')}>איך זה עובד?</a>
            <a href="#questions" onClick={(e) => handleSectionClick(e, 'questions')}>שאלות חשובות</a>
            <a href="#behind-idea" onClick={(e) => handleSectionClick(e, 'behind-idea')}>מאחורי הרעיון</a>
            <hr className="opacity-10" />
            <button onClick={handleLogin} className="bg-white text-joystie-dark border-2 border-joystie-dark py-3 rounded-full shadow-lg font-brand">יש לי משתמש</button>
            <button onClick={handleSignup} className="bg-joystie-dark text-white py-3 rounded-full shadow-lg font-brand">הירשם עכשיו</button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center pt-20 pb-12 md:pt-24 md:pb-20 gradient-bg overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 md:px-6 grid lg:grid-cols-2 gap-8 md:gap-12 items-center relative z-10">
          <div ref={addRevealRef(0)} className="reveal active text-right">
            <h1 className="text-4xl md:text-5xl lg:text-[4.1rem] font-black text-joystie-dark mb-6 md:mb-8 tracking-tighter font-brand">
              הופכים זמן מסך <br/> 
              <span className="text-white drop-shadow-lg">לשיעור לחיים.</span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-joystie-dark/80 leading-relaxed mb-6 md:mb-10 max-w-xl font-medium">
              מקום בו תגלו שפה חדשה ומשותפת. מחברים בין דמי כיס לזמן מסך והופכים אותם לשיעור מעשי על אחריות ובחירה.
            </p>
            <div className="flex flex-col items-center gap-3 md:gap-4" id="register">
              {/* Signup button */}
              <button 
                onClick={handleSignup}
                className="btn-main bg-joystie-dark text-white px-8 py-4 md:px-12 md:py-5 rounded-full text-lg md:text-xl font-black shadow-2xl"
              >
                התחילו ניסיון חינם
              </button>
              
              {/* Features banner */}
              <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs font-bold text-joystie-dark/60">
                <span>ללא צורך בכרטיס אשראי</span>
                <span className="opacity-30">|</span>
                <span>הקמה ב-2 דקות</span>
              </div>
            </div>
          </div>

          <div ref={addRevealRef(1)} className="relative flex justify-center lg:justify-end reveal active" style={{ transitionDelay: '0.2s' }}>
            <div className="relative w-full max-w-[400px] md:max-w-[500px] lg:max-w-[600px] aspect-square flex items-center justify-center">
              
              {/* Main App Icon - Larger with thinner border, moved up */}
              <div className="w-48 h-48 md:w-60 md:h-60 lg:w-72 lg:h-72 bg-white rounded-[2rem] md:rounded-[2.5rem] lg:rounded-[3rem] shadow-2xl flex items-center justify-center duo-float z-30 border border-white/50 shadow-custom p-2 md:p-3 -mt-8 md:-mt-12 lg:-mt-16">
                <Image
                  src="/icon-joystie.png"
                  alt="App Icon"
                  width={288}
                  height={288}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>

              {/* Kids Outdoor - Moved to left side */}
              <div className="absolute bottom-3 left-3 md:bottom-5 md:left-5 lg:bottom-8 lg:left-8 w-24 h-24 md:w-36 md:h-36 lg:w-48 lg:h-48 duo-float-alt z-40 bg-white/90 rounded-xl md:rounded-2xl shadow-lg flex items-center justify-center border border-white overflow-hidden p-0.5 md:p-1">
                <Image
                  src="/kids_outdoor.png"
                  alt="Kids Outdoor"
                  width={192}
                  height={192}
                  className="w-full h-full object-cover rounded-lg md:rounded-xl"
                />
              </div>
              
              {/* Parent-Child Conversation - Moved to right side */}
              <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 lg:bottom-6 lg:right-6 w-36 h-36 md:w-48 md:h-48 lg:w-60 lg:h-60 duo-float-slow z-40 bg-white/80 backdrop-blur-md rounded-[2rem] md:rounded-[2.5rem] lg:rounded-[3rem] shadow-2xl rotate-12 flex items-center justify-center border border-white overflow-hidden p-1 md:p-2">
                <Image
                  src="/parent_kid_conv.png"
                  alt="Parent and Child Conversation"
                  width={240}
                  height={240}
                  className="w-full h-full object-cover rounded-[1.5rem] md:rounded-[2rem] lg:rounded-[2.5rem]"
                />
              </div>

              {/* Time Coin - Smaller on mobile */}
              <div className="absolute top-1/3 right-0 md:top-1/3 md:right-2 w-16 h-16 md:w-20 md:h-20 lg:w-28 lg:h-28 duo-float z-10 bg-joystie-lime rounded-full shadow-lg -rotate-12 flex items-center justify-center border md:border-2 border-white p-0.5 md:p-1">
                <Image
                  src="/time-coin.png"
                  alt="Time Coin"
                  width={112}
                  height={112}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Piggy Bank - Smaller on mobile */}
              <div className="absolute top-3 left-3 md:top-5 md:left-10 lg:top-8 lg:left-12 w-20 h-20 md:w-28 md:h-28 lg:w-36 lg:h-36 duo-float-delayed z-20 bg-white rounded-2xl md:rounded-3xl shadow-xl p-1 md:p-2 flex items-center justify-center overflow-hidden">
                <Image
                  src="/piggy-bank.png"
                  alt="Piggy Bank"
                  width={160}
                  height={160}
                  className="w-full h-full object-contain scale-[1.2]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - WITH WRAPPER */}
      <section className="py-16 md:py-32 bg-white bg-grid relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div ref={addRevealRef(2)} className="text-center mb-12 md:mb-24 reveal">
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
                {/* Tool 1 */}
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
                {/* Tool 2 */}
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
                  <p className="text-base md:text-lg text-gray-500 leading-relaxed">הבנק הראשון שלו. המקום שבו הוא לומד לנהל כסף אמיתי, לחסוך ולהוציא בתבונה.</p>
                </div>
              </div>

              {/* Colorful tag - Static and vibrant */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: '50%',
                transform: 'translate(-50%, 50%)',
                whiteSpace: 'nowrap',
                background: 'linear-gradient(90deg, #BBE9FD 0%, #E6F19A 100%)',
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

      {/* How it Works Section */}
      <section id="how-it-works" className="py-12 md:py-24 bg-joystie-dark text-white overflow-hidden relative">
        <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
          <div ref={addRevealRef(4)} className="text-center mb-10 md:mb-16 reveal">
            <h2 className="text-3xl md:text-4xl lg:text-[3.5rem] font-black mb-4 md:mb-6 font-brand text-center">איך זה עובד?</h2>
            <div className="w-24 h-1.5 bg-joystie-lime mx-auto rounded-full opacity-40"></div>
          </div>

          <div className="flex flex-col md:flex-row justify-center md:justify-between items-center md:items-start gap-6 md:gap-8 relative">
            <div className="hidden md:block absolute top-8 left-10 right-10 h-1 bg-white/10 z-0"></div>

            <div className="flex-1 flex flex-col items-center text-center relative z-10 group max-w-[240px]">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-joystie-blue text-joystie-dark rounded-full flex items-center justify-center text-xl md:text-2xl font-black mb-4 md:mb-6 shadow-xl group-hover:scale-110 transition-transform">1</div>
              <h3 className="text-lg md:text-xl font-black mb-2 md:mb-3 font-brand">קובעים חוקים</h3>
              <p className="text-gray-300 text-xs md:text-sm leading-relaxed">מגדירים יחד "בנק" שעות מסך שבועיות שמותאם לצרכים שלכם.</p>
            </div>

            <div className="flex-1 flex flex-col items-center text-center relative z-10 group max-w-[240px]">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-joystie-lime text-joystie-dark rounded-full flex items-center justify-center text-xl md:text-2xl font-black mb-4 md:mb-6 shadow-xl group-hover:scale-110 transition-transform">2</div>
              <h3 className="text-lg md:text-xl font-black mb-2 md:mb-3 font-brand">מגדירים תגמול</h3>
              <p className="text-gray-300 text-xs md:text-sm leading-relaxed">קושרים את השעות לדמי כיס קבועים. הופכים את הזמן למשאב בעל ערך.</p>
            </div>

            <div className="flex-1 flex flex-col items-center text-center relative z-10 group max-w-[240px]">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white text-joystie-dark rounded-full flex items-center justify-center text-xl md:text-2xl font-black mb-4 md:mb-6 shadow-xl group-hover:scale-110 transition-transform">3</div>
              <h3 className="text-lg md:text-xl font-black mb-2 md:mb-3 font-brand">התוצאה בידיים שלהם</h3>
              <p className="text-gray-300 text-xs md:text-sm leading-relaxed">חיסכון בזמן מתגמל בתוספת כספית, חריגה גוררת הפחתה. הכל קורה אוטומטית.</p>
            </div>
          </div>
          
          {/* Signup Button below "How it Works" */}
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
                q: "האם זה לא מרגיש כמו 'שוחד' לילד?",
                a: "ממש לא. שוחד הוא נקודתי ולא מלמד. Joystie מלמדת ניהול משאבים. בדיוק כמו בעולם המבוגרים – זמן שווה כסף, ואחריות מובילה לתגמול. הילד לא מקבל 'פרס', הוא מנהל תקציב של משאבים."
              },
              {
                q: "מה קורה עם ההגבלה שיש היום?",
                a: "ההגבלות הטכניות (כמו Screen Time של אפל או Google Link) הן מצוינות כשוטר, אבל הן לא מלמדות. Joystie יושבת מעל השכבה הזו ונותנת לילד את ה'למה' ואת המוטיבציה הפנימית לנהל את עצמו, במקום שרק יחסמו אותו."
              },
              {
                q: "איך אפשר לחזור אחורה מול הילד בהתחייבות על הכסף?",
                a: "המערכת גמישה לחלוטין. אנחנו ממליצים להתחיל ב'בנק' קטן ולתקשר לילד שמדובר בתהליך למידה משותף. תמיד אפשר לעדכן את החוקים יחד ב'ישיבה משפחתית' שבועית, מה שבעצמו מהווה שיעור מצוין בניהול משא ומתן."
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
                    {item.a}
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
              <p className="font-bold text-joystie-dark text-xl md:text-2xl font-brand">זה התחיל מהסלון של מאיר...</p>
              <p>מאיר ניצן, אבא לארבעה, מצא את עצמו מנהל "משא ומתן" מתיש כל ערב על עוד 5 דקות של מסך. הוא הבין שהבעיה היא לא הטכנולוגיה, אלא חוסר בשפה משותפת על ערך הזמן והאחריות.</p>
              <p>יחד עם דנה פרידמן, מומחית לחוויית משתמש וחינוך, הם יצרו את Joystie – כלי שהופך את הקונפליקט להזדמנות לימודית מדהימה על ניהול משאבים, כסף ואחריות אישית.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 md:gap-6 order-1 lg:order-2">
              <div ref={addRevealRef(10)} className="reveal bg-joystie-lime p-5 md:p-8 rounded-[2rem] md:rounded-[3rem] text-center rotate-2 shadow-sm border-2 border-white transition-transform hover:rotate-0">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-white/40 rounded-2xl overflow-hidden mx-auto mb-3 md:mb-4 shadow-sm border-2 border-white/60 flex items-center justify-center text-slate-400 text-[10px] rotate-2 placeholder-media">Meir</div>
                <div className="font-black text-joystie-dark font-brand text-base md:text-lg">מאיר ניצן</div>
                <p className="text-[9px] md:text-[10px] italic mt-1 md:mt-2 leading-tight text-gray-500 font-bold">"רציתי להפסיק להיות השוטר של הבית ולהתחיל להיות המנטור שלהם"</p>
              </div>
              <div ref={addRevealRef(11)} className="reveal bg-joystie-lime p-5 md:p-8 rounded-[2rem] md:rounded-[3rem] text-center -rotate-2 shadow-sm border-2 border-white transition-transform hover:rotate-0">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-white/40 rounded-2xl overflow-hidden mx-auto mb-3 md:mb-4 shadow-sm border-2 border-white/60 flex items-center justify-center text-slate-400 text-[10px] -rotate-2 placeholder-media">Dana</div>
                <div className="font-black text-joystie-dark font-brand text-base md:text-lg">דנה פרידמן</div>
                <p className="text-[9px] md:text-[10px] italic mt-1 md:mt-2 leading-tight text-gray-500 font-bold">"הטכנולוגיה כאן כדי לשרת את השקט והחינוך, לא כדי להחליף אותם"</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - WITH TILTED OBJECTS */}
      <footer className="py-12 md:py-20 gradient-bg border-t border-white/20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-8 md:gap-12 text-center md:text-right">
          
          <div className="w-full md:w-1/4 flex justify-center md:justify-start">
            <Image
              src="/logo-joystie.png"
              alt="Joystie Logo"
              width={160}
              height={50}
              className="h-16 w-auto"
              style={{ filter: 'brightness(0) saturate(100%) invert(13%) sepia(46%) saturate(1673%) hue-rotate(186deg) brightness(98%) contrast(91%)' }}
            />
          </div>

          <div className="w-full md:w-2/4 flex flex-col items-center">
            <div className="text-joystie-dark font-black text-xl mb-10 font-brand tracking-tight">Time is Money. We own Time</div>
            <div className="flex justify-center gap-12">
              <div className="flex flex-col items-center max-w-[140px] transition-transform hover:scale-105">
                <div className="w-14 h-14 bg-white/40 rounded-2xl overflow-hidden mb-3 shadow-sm border-2 border-white/60 flex items-center justify-center text-slate-400 text-[10px] rotate-2 placeholder-media">Meir</div>
                <div className="font-bold text-joystie-dark text-sm font-brand leading-none">מאיר ניצן</div>
              </div>
              <div className="flex flex-col items-center max-w-[120px] transition-transform hover:scale-105">
                <div className="w-14 h-14 bg-white/40 rounded-2xl overflow-hidden mb-3 shadow-sm border-2 border-white/60 flex items-center justify-center text-slate-400 text-[10px] -rotate-2 placeholder-media">Dana</div>
                <div className="font-bold text-joystie-dark text-sm font-brand leading-none">דנה פרידמן</div>
              </div>
            </div>
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
