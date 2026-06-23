'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const LandingHowItWorks = dynamic(
  () => import('@/components/landing/LandingHowItWorks').then((m) => m.LandingHowItWorks),
  { ssr: false, loading: () => null },
);
const LandingTools = dynamic(
  () => import('@/components/landing/LandingTools').then((m) => m.LandingTools),
  { ssr: false, loading: () => null },
);
const LandingFaq = dynamic(
  () => import('@/components/landing/LandingFaq').then((m) => m.LandingFaq),
  { ssr: false, loading: () => null },
);
const LandingFounders = dynamic(
  () => import('@/components/landing/LandingFounders').then((m) => m.LandingFounders),
  { ssr: false, loading: () => null },
);
const LandingFooter = dynamic(
  () => import('@/components/landing/LandingFooter').then((m) => m.LandingFooter),
  { ssr: false, loading: () => null },
);

function defer(fn: () => void) {
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(fn, { timeout: 4000 });
  } else {
    window.setTimeout(fn, 2000);
  }
}

/** Client island — below-fold sections, scroll reveal, deferred analytics/prefetch. */
export function LandingHomeBelowFold() {
  const router = useRouter();
  const revealRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);

  useEffect(() => {
    defer(() => {
      void import('@/utils/analytics').then(({ logEvent, AnalyticsEvents }) =>
        logEvent(AnalyticsEvents.HOME_PAGE_VIEW),
      );
    });
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

  return (
    <>
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
    </>
  );
}
