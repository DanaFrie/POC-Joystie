import Image from 'next/image';
import { BRAND_LOGO_SRC } from '@/constants/brand-assets';

export function LandingFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-v03-green-900 py-12 md:py-16">
      <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-4 text-center md:flex-row md:gap-12 md:px-6 md:text-right">
        <div className="flex w-full items-center justify-center md:w-1/4 md:justify-start">
          <Image
            src={BRAND_LOGO_SRC}
            alt="Joystie Logo"
            width={140}
            height={48}
            className="h-12 w-auto object-contain mix-blend-screen md:h-14"
          />
        </div>

        <div className="flex w-full flex-col items-center md:w-2/4">
          <div className="font-simpler text-[1.25rem] font-black tracking-tight text-v03-text-on-dark md:text-[2rem]">
            Time is Money. We own Time
          </div>
        </div>

        <div className="flex w-full flex-col items-center gap-3 md:w-1/4 md:items-start">
          <a
            href="https://www.linkedin.com/company/joystie"
            target="_blank"
            rel="noreferrer"
            className="font-simpler text-base font-bold text-v03-text-muted-on-dark transition hover:text-v03-accent"
          >
            Joystie on LinkedIn
          </a>
          <a
            href="mailto:info@joystie.com"
            className="font-simpler text-base font-bold text-v03-text-muted-on-dark transition hover:text-v03-accent"
          >
            info@joystie.com
          </a>
        </div>
      </div>
    </footer>
  );
}
