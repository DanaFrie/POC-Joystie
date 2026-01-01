'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCallback, useEffect, useRef } from 'react';

export default function Home() {
  const router = useRouter();
  const revealRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  return (
    <div className="overflow-x-hidden text-right" style={{ fontFamily: "'Varela Round', sans-serif" }}>

      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/70 backdrop-blur-xl border-b border-white/20">
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
            <button
              onClick={handleLogin}
              className="hover:opacity-50 transition-all text-sm"
            >
              יש לי משתמש
            </button>
            <button
              onClick={handleSignup}
              className="bg-joystie-dark text-white px-7 py-2.5 rounded-full text-sm shadow-lg hover:bg-opacity-90 transition-all font-brand"
            >
              הירשם
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center pt-24 pb-20 gradient-bg overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div ref={addRevealRef(0)} className="reveal active">
            <h1 className="text-5xl lg:text-7xl font-black text-joystie-dark mb-8 tracking-tighter">
              הופכים זמן מסך <br/> 
              <span className="text-white drop-shadow-lg">לשיעור לחיים.</span>
            </h1>
            <p className="text-xl lg:text-2xl text-joystie-dark/80 leading-relaxed mb-10 max-w-xl font-medium">
              מקום בו תגלו שפה חדשה ומשותפת. מחברים בין דמי כיס לזמן מסך והופכים אותם לשיעור מעשי על אחריות ובחירה.
            </p>
            <div className="flex flex-col items-center gap-4" id="register">
              {/* Login button - above signup */}
              <button 
                onClick={handleLogin}
                className="btn-main bg-white text-joystie-dark px-12 py-5 rounded-full text-xl shadow-2xl border-2 border-joystie-dark"
              >
                כניסה
              </button>
              
              {/* Signup button */}
              <button 
                onClick={handleSignup}
                className="btn-main bg-joystie-dark text-white px-12 py-5 rounded-full text-xl shadow-2xl"
              >
                התחילו ניסיון חינם
              </button>
              
              {/* Features banner */}
              <div className="flex items-center gap-3 text-xs font-medium text-gray-400" style={{ 
                textShadow: '0 0 8px rgba(255, 255, 255, 0.4)'
              }}>
                {/* No credit card */}
                <div className="flex items-center gap-1.5">
                  <span>ללא צורך בכרטיס אשראי</span>
                </div>
                
                {/* Divider */}
                <div className="w-px h-3 bg-gray-400 opacity-50">|</div>
                
                {/* Setup in 2 minutes */}
                <div className="flex items-center gap-1.5">
                  <span>הקמה ב-2 דקות</span>
                </div>
              </div>
            </div>
          </div>

          <div ref={addRevealRef(1)} className="relative flex justify-center lg:justify-end reveal active" style={{ transitionDelay: '0.2s' }}>
            <div className="relative w-full max-w-[500px] lg:max-w-[600px] aspect-square flex items-center justify-center">
              
              {/* Main App Icon - Larger on desktop */}
              <div className="w-52 h-52 lg:w-72 lg:h-72 bg-white rounded-[3rem] shadow-2xl flex items-center justify-center duo-float z-30 border-4 border-white/50 shadow-custom p-4">
                <Image
                  src="/icon-joystie.png"
                  alt="App Icon"
                  width={288}
                  height={288}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>

              {/* Trophy - Larger on desktop */}
              <div className="absolute bottom-5 left-5 lg:bottom-8 lg:left-8 w-24 h-24 lg:w-32 lg:h-32 duo-float-alt z-40 bg-white/90 rounded-2xl shadow-lg flex items-center justify-center border-2 border-white">
                <span className="text-5xl lg:text-6xl text-center">🏆</span>
              </div>
              
              {/* Phone - Larger on desktop */}
              <div className="absolute bottom-10 right-10 lg:bottom-12 lg:right-12 w-32 h-32 lg:w-40 lg:h-40 duo-float-slow z-40 bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-2xl rotate-12 flex items-center justify-center border-2 border-white">
              <Image
                  src="/piggy-bank.png"
                  alt="Piggy Bank"
                  width={144}
                  height={144}
                  className="w-full h-full object-contain"
                />
               
              </div>

              {/* Piggy Bank - Moved to money position, Larger on desktop */}
              <div className="absolute top-1/3 right-0 lg:top-1/3 lg:right-2 w-20 h-20 lg:w-28 lg:h-28 duo-float z-10 bg-joystie-lime rounded-full shadow-lg -rotate-12 flex items-center justify-center border-4 border-white p-1">
                <Image
                  src="/time-coin.png"
                  alt="Time Coin"
                  width={112}
                  height={112}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Time Coin - Replaces old piggy bank position */}
              <div className="absolute top-5 left-10 lg:top-8 lg:left-12 w-28 h-28 lg:w-36 lg:h-36 duo-float-delayed z-20 bg-white rounded-3xl shadow-xl p-2 flex items-center justify-center">
              <span className="text-5xl lg:text-6xl text-center">📱</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Added BG GRID */}
      <section className="py-32 bg-white bg-grid relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div ref={addRevealRef(2)} className="text-center mb-24 reveal">
            <h2 className="text-4xl lg:text-6xl font-black text-joystie-dark mb-6 text-center">הכלים שיעזרו לכם להצליח</h2>
            <div className="w-32 h-2.5 bg-joystie-lime mx-auto rounded-full"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div ref={addRevealRef(3)} className="reveal p-12 rounded-[3rem] bg-white/90 backdrop-blur-sm hover:bg-joystie-blue/10 transition-all duration-500 border border-gray-100 flex flex-col items-center text-center group shadow-sm">
              <div className="w-24 h-24 rounded-[2rem] flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 transition-transform placeholder-media">
                Icon 1
              </div>
              <h3 className="text-2xl font-black text-joystie-dark mb-4 text-center">איזון זמן מסך</h3>
              <p className="text-gray-500 leading-relaxed text-lg text-center">בלי הריב היומי! הופכים את המסכים לכלי של ניהול עצמי ואחריות אישית.</p>
            </div>
            <div ref={addRevealRef(4)} className="reveal p-12 rounded-[3rem] bg-white/90 backdrop-blur-sm hover:bg-joystie-lime/10 transition-all duration-500 border border-gray-100 flex flex-col items-center text-center group shadow-sm">
              <div className="w-24 h-24 rounded-[2rem] flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 transition-transform placeholder-media">
                Icon 2
              </div>
              <h3 className="text-2xl font-black text-joystie-dark mb-4 text-center text-center">ארנק דיגיטלי לילד</h3>
              <p className="text-gray-500 leading-relaxed text-lg text-center">הבנק הראשון שלו. המקום שבו הוא לומד לנהל כסף אמיתי, לחסוך ולהוציא בתבונה.</p>
            </div>
            <div ref={addRevealRef(5)} className="reveal p-12 rounded-[3rem] bg-white/90 backdrop-blur-sm hover:bg-joystie-dark/5 transition-all duration-500 border border-gray-100 flex flex-col items-center text-center group shadow-sm">
              <div className="w-24 h-24 rounded-[2rem] flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 transition-transform placeholder-media">
                Icon 3
              </div>
              <h3 className="text-2xl font-black text-joystie-dark mb-4 text-center text-center">חינוך פיננסי</h3>
              <p className="text-gray-500 leading-relaxed text-lg text-center">כלים חיוניים לטווח ארוך. מעניקים לילדים מיומנויות לחיים של עצמאות פיננסית.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 bg-joystie-dark text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <h2 ref={addRevealRef(6)} className="text-4xl lg:text-5xl font-black text-center mb-24 reveal">מה הורים חושבים?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center md:text-right">
            {/* Quote 1 */}
            <div ref={addRevealRef(7)} className="reveal bg-joystie-blue/10 p-8 rounded-[2rem] border border-joystie-blue/20 hover:bg-joystie-blue/20 transition-all">
              <div className="text-joystie-blue text-4xl mb-4 opacity-50 font-serif leading-none">"</div>
              <p className="text-lg italic opacity-90 leading-relaxed font-medium">סוף סוף יש שפה משותפת בבית סביב המסכים. הילדים מבינים שזמן הוא משאב שהם צריכים לנהל, לא משהו שמתווכחים עליו.</p>
            </div>
            {/* Quote 2 */}
            <div ref={addRevealRef(8)} className="reveal bg-joystie-lime/10 p-8 rounded-[2rem] border border-joystie-lime/20 hover:bg-joystie-lime/20 transition-all" style={{ transitionDelay: '0.1s' }}>
              <div className="text-joystie-lime text-4xl mb-4 opacity-50 font-serif leading-none">"</div>
              <p className="text-lg italic opacity-90 leading-relaxed font-medium">הארנק הדיגיטלי הפך את המושג 'כסף' למשהו מוחשי. הם חוסכים למטרות שהם קבעו וזה מדהים לראות את האחריות שלהם.</p>
            </div>
            {/* Quote 3 */}
            <div ref={addRevealRef(9)} className="reveal bg-joystie-blue/10 p-8 rounded-[2rem] border border-joystie-blue/20 hover:bg-joystie-blue/20 transition-all" style={{ transitionDelay: '0.2s' }}>
              <div className="text-joystie-blue text-4xl mb-4 opacity-50 font-serif leading-none">"</div>
              <p className="text-lg italic opacity-90 leading-relaxed font-medium">הופתעתי לגלות כמה מהר הם הפסיקו לבקש שוחד והתחילו לשאול איך הם יכולים להרוויח את זמן המסך שלהם במאמץ אמיתי.</p>
            </div>
            {/* Quote 4 */}
            <div ref={addRevealRef(10)} className="reveal bg-joystie-lime/10 p-8 rounded-[2rem] border border-joystie-lime/20 hover:bg-joystie-lime/20 transition-all" style={{ transitionDelay: '0.3s' }}>
              <div className="text-joystie-lime text-4xl mb-4 opacity-50 font-serif leading-none">"</div>
              <p className="text-lg italic opacity-90 leading-relaxed font-medium">זה כבר לא מאבק כוחות יומי. המערכת שקופה, הכללים ברורים, והשקט שחזר לסלון שווה הכל.</p>
            </div>
          </div>
          
          {/* Signup Button below testimonials */}
          <div ref={addRevealRef(11)} className="reveal flex justify-center mt-16">
            <button 
              onClick={handleSignup}
              className="btn-main bg-white text-joystie-dark px-12 py-5 rounded-full text-xl shadow-2xl border-2 border-white hover:bg-joystie-lime hover:border-joystie-lime transition-all"
            >
              צרו חשבון
            </button>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-joystie-lime/10 blur-[120px]"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-joystie-blue/10 blur-[120px]"></div>
      </section>

      {/* Simplified Footer */}
      <footer className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          
          {/* Right: Logo Centered in its section */}
          <div className="w-full md:w-1/4 flex justify-center">
            <Image
              src="/logo-joystie.png"
              alt="Joystie Logo"
              width={160}
              height={50}
              className="h-16 w-auto"
              style={{ filter: 'brightness(0) saturate(100%) invert(13%) sepia(46%) saturate(1673%) hue-rotate(186deg) brightness(98%) contrast(91%)' }}
            />
          </div>

          {/* Center: Founders (Meir & Dana) with new Title */}
          <div className="w-full md:w-2/4 flex flex-col items-center">
            <div className="text-joystie-dark font-black text-lg mb-8 font-brand text-center">Time is Money. We own Time</div>
            <div className="flex justify-center gap-10">
              <div className="flex flex-col items-center text-center max-w-[140px]">
                <div className="w-16 h-16 bg-joystie-blue rounded-2xl overflow-hidden mb-3 shadow-custom border-2 border-white rotate-2 placeholder-media">
                  Meir
                </div>
                <div className="font-bold text-joystie-dark text-sm font-brand leading-none">מאיר ניצן</div>
                <div className="text-gray-400 text-[10px] mt-2 italic leading-tight text-center px-1">"ציטוט מסר/סיפור של מאיר"</div>
              </div>
              <div className="flex flex-col items-center text-center max-w-[140px]">
                <div className="w-16 h-16 bg-joystie-lime rounded-2xl overflow-hidden mb-3 shadow-custom border-2 border-white -rotate-2 placeholder-media">
                  Dana
                </div>
                <div className="font-bold text-joystie-dark text-sm font-brand leading-none">דנה פרידמן</div>
                <div className="text-gray-400 text-[10px] mt-2 italic leading-tight text-center px-1">"ציטוט מסר של דנה"</div>
              </div>
            </div>
          </div>

          {/* Left: Contact Info (Enlarged) */}
          <div className="w-full md:w-1/4 flex flex-col items-center md:items-start gap-4">
            <a href="https://www.linkedin.com/company/joystie" target="_blank" rel="noopener noreferrer" className="text-joystie-dark font-black text-base hover:text-blue-600 transition-colors font-brand">
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
