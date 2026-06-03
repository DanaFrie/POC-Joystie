'use client';

import { useCallback, useEffect, useRef } from 'react';
import { SIGNUP_COMPANION_IMAGES } from '@/constants/onboarding-figma';
import {
  SIGNUP_COMPANION_ACTIVE_SIZE_PX,
  SIGNUP_COMPANION_GAP_PX,
  SIGNUP_COMPANION_SIZE_PX,
} from '@/constants/signup-layout';

const CAROUSEL_GRADIENT =
  'linear-gradient(275deg, #092523 4.2%, rgba(9, 37, 35, 0) 96.33%)';

const COMPANION_COUNT = SIGNUP_COMPANION_IMAGES.length;
const CELL_PX = SIGNUP_COMPANION_ACTIVE_SIZE_PX;
const SNAP_PADDING = `max(0px, calc(50% - ${CELL_PX / 2}px))`;

/** Real companions sit at slides 1…4; 0 and 5 are wrap clones (4 and 1). */
const FIRST_REAL_SLIDE = 1;
const LAST_REAL_SLIDE = COMPANION_COUNT;
const DUP_LAST_SLIDE = 0;
const DUP_FIRST_SLIDE = COMPANION_COUNT + 1;

type SlideKind = 'dup-last' | 'real' | 'dup-first';

type Slide = {
  src: string;
  companionIndex: number;
  kind: SlideKind;
  key: string;
};

function buildSlides(): Slide[] {
  const last = COMPANION_COUNT - 1;
  const dupLast: Slide = {
    src: SIGNUP_COMPANION_IMAGES[last],
    companionIndex: last,
    kind: 'dup-last',
    key: 'dup-last',
  };
  const reals: Slide[] = SIGNUP_COMPANION_IMAGES.map((src, companionIndex) => ({
    src,
    companionIndex,
    kind: 'real' as const,
    key: `real-${companionIndex}`,
  }));
  const dupFirst: Slide = {
    src: SIGNUP_COMPANION_IMAGES[0],
    companionIndex: 0,
    kind: 'dup-first',
    key: 'dup-first',
  };
  return [dupLast, ...reals, dupFirst];
}

const SLIDES = buildSlides();

function slideIndexForCompanion(companionIndex: number): number {
  return companionIndex + FIRST_REAL_SLIDE;
}

function companionFromSlide(slideIndex: number): number {
  if (slideIndex === DUP_LAST_SLIDE) return COMPANION_COUNT - 1;
  if (slideIndex === DUP_FIRST_SLIDE) return 0;
  return slideIndex - FIRST_REAL_SLIDE;
}

function nearestSlideIndex(container: HTMLElement): number {
  const center = container.scrollLeft + container.clientWidth / 2;
  let closest = FIRST_REAL_SLIDE;
  let minDistance = Infinity;

  Array.from(container.children).forEach((child, index) => {
    const node = child as HTMLElement;
    const childCenter = node.offsetLeft + node.offsetWidth / 2;
    const distance = Math.abs(childCenter - center);
    if (distance < minDistance) {
      minDistance = distance;
      closest = index;
    }
  });

  return closest;
}

type SignupCompanionCarouselProps = {
  activeIndex: number;
  onSelect: (index: number) => void;
};

/** Frame 1597882421 — RTL scroll; wrap clones only at ends after user scrolls past 1 or 4. */
export function SignupCompanionCarousel({
  activeIndex,
  onSelect,
}: SignupCompanionCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const programmaticScrollRef = useRef(false);
  const skipScrollToRef = useRef(false);
  const isJumpingRef = useRef(false);
  const hasMountedScrollRef = useRef(false);

  const scrollToSlide = useCallback(
    (slideIndex: number, behavior: ScrollBehavior = 'smooth') => {
      const el = scrollRef.current;
      if (!el) return;

      const child = el.children[slideIndex] as HTMLElement | undefined;
      if (!child) return;

      programmaticScrollRef.current = true;
      child.scrollIntoView({ behavior, inline: 'center', block: 'nearest' });
    },
    []
  );

  const scrollToCompanion = useCallback(
    (companionIndex: number, behavior: ScrollBehavior = 'smooth') => {
      scrollToSlide(slideIndexForCompanion(companionIndex), behavior);
    },
    [scrollToSlide]
  );

  const jumpToRealSlide = useCallback(
    (companionIndex: number) => {
      isJumpingRef.current = true;
      scrollToSlide(slideIndexForCompanion(companionIndex), 'auto');
      requestAnimationFrame(() => {
        isJumpingRef.current = false;
      });
    },
    [scrollToSlide]
  );

  const finalizeScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || programmaticScrollRef.current || isJumpingRef.current) return;

    const closestSlide = nearestSlideIndex(el);
    const companionIndex = companionFromSlide(closestSlide);

    if (closestSlide === DUP_LAST_SLIDE) {
      skipScrollToRef.current = true;
      onSelect(COMPANION_COUNT - 1);
      jumpToRealSlide(COMPANION_COUNT - 1);
      return;
    }

    if (closestSlide === DUP_FIRST_SLIDE) {
      skipScrollToRef.current = true;
      onSelect(0);
      jumpToRealSlide(0);
      return;
    }

    if (companionIndex !== activeIndex) {
      skipScrollToRef.current = true;
      onSelect(companionIndex);
    }
  }, [activeIndex, jumpToRealSlide, onSelect]);

  useEffect(() => {
    if (skipScrollToRef.current) {
      skipScrollToRef.current = false;
      return;
    }
    const behavior = hasMountedScrollRef.current ? 'smooth' : 'auto';
    hasMountedScrollRef.current = true;
    scrollToCompanion(activeIndex, behavior);
  }, [activeIndex, scrollToCompanion]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;

    let frame = 0;
    const onScroll = () => {
      if (programmaticScrollRef.current || isJumpingRef.current) return;

      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const closestSlide = nearestSlideIndex(el);
        if (
          closestSlide === DUP_LAST_SLIDE ||
          closestSlide === DUP_FIRST_SLIDE
        ) {
          return;
        }
        const companionIndex = companionFromSlide(closestSlide);
        if (companionIndex !== activeIndex) {
          skipScrollToRef.current = true;
          onSelect(companionIndex);
        }
      });
    };

    const onScrollEnd = () => {
      if (programmaticScrollRef.current) {
        programmaticScrollRef.current = false;
        return;
      }
      if (isJumpingRef.current) return;
      finalizeScroll();
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    el.addEventListener('scrollend', onScrollEnd);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener('scroll', onScroll);
      el.removeEventListener('scrollend', onScrollEnd);
    };
  }, [activeIndex, finalizeScroll, onSelect]);

  return (
    <div className="relative w-full max-w-[375px]">
      <div
        className="pointer-events-none absolute right-0 top-1/2 z-[2] -translate-y-1/2"
        style={{
          width: 74,
          height: 197,
          background: CAROUSEL_GRADIENT,
        }}
        aria-hidden
      />
      <div
        ref={scrollRef}
        dir="rtl"
        className="v03-scroll-hidden flex w-full snap-x snap-mandatory items-center overflow-x-auto"
        style={{
          gap: SIGNUP_COMPANION_GAP_PX,
          paddingInline: SNAP_PADDING,
        }}
      >
        {SLIDES.map(({ src, companionIndex, kind, key }) => {
          const isClone = kind !== 'real';
          const isActive = !isClone && companionIndex === activeIndex;
          const imageSize = isActive
            ? SIGNUP_COMPANION_ACTIVE_SIZE_PX
            : SIGNUP_COMPANION_SIZE_PX;

          return (
            <button
              key={key}
              type="button"
              onClick={() => !isClone && onSelect(companionIndex)}
              className="shrink-0 snap-center transition-[width,height] duration-200"
              style={{
                width: CELL_PX,
                height: CELL_PX,
              }}
              aria-hidden={isClone ? true : undefined}
              aria-label={
                isClone ? undefined : `בחירת חבר ${companionIndex + 1}`
              }
              aria-pressed={isClone ? undefined : isActive}
              tabIndex={isClone ? -1 : undefined}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="mx-auto object-contain"
                style={{ width: imageSize, height: imageSize }}
                draggable={false}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
