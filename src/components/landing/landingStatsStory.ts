/** Menu / hash jumps — skip section-2 scroll lock so navigation isn't trapped. */

export const LANDING_STATS_SKIP_EVENT = 'joystie:skip-stats-story';

let bypassActive = false;
let bypassTimer: ReturnType<typeof setTimeout> | null = null;
let scrollEndCleanup: (() => void) | null = null;

function clearBypassTimer() {
  if (bypassTimer) {
    clearTimeout(bypassTimer);
    bypassTimer = null;
  }
}

function endBypass() {
  bypassActive = false;
  clearBypassTimer();
  if (scrollEndCleanup) {
    scrollEndCleanup();
    scrollEndCleanup = null;
  }
}

/** Keep stats story suppressed until menu smooth-scroll finishes (or timeout). */
export function skipLandingStatsStory(holdMs = 8000) {
  if (typeof window === 'undefined') return;
  bypassActive = true;
  clearBypassTimer();
  bypassTimer = setTimeout(() => {
    bypassActive = false;
    bypassTimer = null;
  }, holdMs);
  window.dispatchEvent(new Event(LANDING_STATS_SKIP_EVENT));
}

export function isLandingStatsStoryBypassed() {
  return bypassActive;
}

export function onSkipLandingStatsStory(handler: () => void) {
  if (typeof window === 'undefined') return () => undefined;
  window.addEventListener(LANDING_STATS_SKIP_EVENT, handler);
  return () => window.removeEventListener(LANDING_STATS_SKIP_EVENT, handler);
}

function landingNavOffset(sectionId?: string) {
  const desktop = window.matchMedia('(min-width: 1024px)').matches;
  if (desktop) return 112;
  // Mobile: "מה זה ג׳ויסטי" lands 10px higher under the bar.
  if (sectionId === 'what-is-joystie') return 78;
  return 88;
}

/**
 * Gentle smooth scroll to a landing section, bypassing the stats scroll-lock
 * for the whole animation so the user lands on the target directly.
 */
export function scrollLandingToSection(id: string) {
  if (typeof window === 'undefined') return;
  const el = document.getElementById(id);
  if (!el) return;

  const targetY = el.getBoundingClientRect().top + window.scrollY - landingNavOffset(id);
  const distance = Math.abs(targetY - window.scrollY);
  // Longer pages need a longer bypass; floor so short hops still clear.
  const holdMs = Math.min(12_000, Math.max(2500, distance * 1.2 + 1500));
  skipLandingStatsStory(holdMs);

  const top = targetY;

  if (scrollEndCleanup) {
    scrollEndCleanup();
    scrollEndCleanup = null;
  }

  const finish = () => {
    endBypass();
  };

  const onScrollEnd = () => finish();
  window.addEventListener('scrollend', onScrollEnd, { once: true });

  // Fallback when scrollend isn't supported / doesn't fire.
  const fallback = window.setTimeout(finish, holdMs);
  scrollEndCleanup = () => {
    window.removeEventListener('scrollend', onScrollEnd);
    window.clearTimeout(fallback);
  };

  window.scrollTo({ top, behavior: 'smooth' });
}
