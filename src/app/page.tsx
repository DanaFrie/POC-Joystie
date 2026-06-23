import { LandingHero } from '@/components/landing/LandingHero';
import { LandingHomeBelowFold } from '@/components/landing/LandingHomeBelowFold';
import { LandingNav } from '@/components/landing/LandingNav';
import { SIGNUP_COMPANION_IMAGES } from '@/constants/onboarding-figma';

/** Pre-render at build — served from CDN edge on App Hosting. */
export const dynamic = 'force-static';

export default function Home() {
  return (
    <>
      <link
        rel="preload"
        href={SIGNUP_COMPANION_IMAGES[0]}
        as="image"
        type="image/webp"
      />
      <link
        rel="preload"
        href={SIGNUP_COMPANION_IMAGES[1]}
        as="image"
        type="image/webp"
      />
      <link
        rel="preload"
        href={SIGNUP_COMPANION_IMAGES[2]}
        as="image"
        type="image/webp"
      />
      <link
        rel="preload"
        href={SIGNUP_COMPANION_IMAGES[3]}
        as="image"
        type="image/webp"
      />
      <div
        className="v03-landing-root min-h-screen overflow-x-hidden text-right font-simpler text-v03-text-on-dark"
        dir="rtl"
      >
        <LandingNav />
        <LandingHero />
        <LandingHomeBelowFold />
      </div>
    </>
  );
}
