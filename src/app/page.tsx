'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingHero } from '@/components/landing/LandingHero';
import { LandingHowItWorks } from '@/components/landing/LandingHowItWorks';
import { LandingTools } from '@/components/landing/LandingTools';
import { LandingFaq } from '@/components/landing/LandingFaq';
import { LandingFounders } from '@/components/landing/LandingFounders';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function Home() {
  const router = useRouter();
  const revealRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);

  useEffect(() => {
    router.prefetch('/onboarding');
    router.prefetch('/login');
  }, [router]);

  useEffect(() => {
    const trackHomePageView = async () => {
      const { logEvent, AnalyticsEvents } = await import('@/utils/analytics');
      await logEvent(AnalyticsEvents.HOME_PAGE_VIEW);
    };
    trackHomePageView();
  }, []);

  useEffect(() => {
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    revealRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    const fallback = window.setTimeout(() => {
      revealRefs.current.forEach((el) => {
        if (el && !el.classList.contains('active')) el.classList.add('active');
      });
    }, 400);

    return () => {
      window.clearTimeout(fallback);
      revealRefs.current.forEach((el) => {
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  const handleSignup = useCallback(() => {
    router.push('/onboarding');
  }, [router]);

  const addRevealRef = (index: number) => (el: HTMLDivElement | null) => {
    revealRefs.current[index] = el;
  };

  const toggleQuestion = (index: number) => {
    setActiveQuestion(activeQuestion === index ? null : index);
  };

  const handleSectionClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    setIsMenuOpen(false);
    
    const element = document.getElementById(sectionId);
    if (element) {
      const navHeight = 72;
      const offset = 20;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navHeight - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  }, []);

  return (
    <div
      className="v03-landing-root min-h-screen overflow-x-hidden text-right font-simpler text-v03-text-on-dark"
      dir="rtl"
    >
      <LandingNav
        isMenuOpen={isMenuOpen}
        onToggleMenu={() => setIsMenuOpen((open) => !open)}
        onSectionClick={handleSectionClick}
      />

      <LandingHero revealRef={addRevealRef(0)} companionRevealRef={addRevealRef(1)} />

      <LandingHowItWorks
        titleRevealRef={addRevealRef(2)}
        ctaRevealRef={addRevealRef(12)}
        onSignup={handleSignup}
      />

      <LandingTools titleRevealRef={addRevealRef(4)} cardsRevealRef={addRevealRef(3)} />

      <LandingFaq
        titleRevealRef={addRevealRef(5)}
        itemRevealRef={(index) => addRevealRef(6 + index)}
        activeQuestion={activeQuestion}
        onToggleQuestion={toggleQuestion}
      />

      <LandingFounders
        titleRevealRef={addRevealRef(9)}
        founderRevealRef={(index) => addRevealRef(10 + index)}
      />

      <LandingFooter />
    </div>
  );
}
