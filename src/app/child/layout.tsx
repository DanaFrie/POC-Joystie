'use client';

import Image from 'next/image';

export default function ChildLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Logo only - מושך וידידותי לילדים - מוצב במרכז העליון */}
      <div className="fixed top-4 left-1/2 z-50" style={{ transform: 'translateX(-50%)' }}>
        <div className="relative logo-bounce">
          <div className="absolute inset-0 bg-gradient-to-r from-[#E6F19A] via-[#BBE9FD] to-[#E6F19A] opacity-30 rounded-full blur-xl"></div>
          <Image
            src="/logo-joystie.png"
            alt="Joystie"
            width={160}
            height={60}
            className="h-14 w-auto object-contain drop-shadow-2xl relative z-10"
            priority
            style={{ 
              filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1)) brightness(0) saturate(100%) invert(13%) sepia(46%) saturate(1673%) hue-rotate(186deg) brightness(98%) contrast(91%)',
              height: 'auto',
            }}
          />
        </div>
      </div>
      
      {/* Children content */}
      <div className="pt-20">
        {children}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes logo-bounce {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-5px) scale(1.02);
          }
        }
        .logo-bounce {
          animation: logo-bounce 3s ease-in-out infinite;
        }
      `}} />
    </>
  );
}

