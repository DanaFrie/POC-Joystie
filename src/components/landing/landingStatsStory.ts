/** Landing in-page menu / hash navigation helpers. */

function landingNavOffset(sectionId?: string) {
  const desktop = window.matchMedia('(min-width: 1024px)').matches;
  if (desktop) return 112;
  // Mobile: "מה זה ג׳ויסטי" lands 10px higher under the bar.
  if (sectionId === 'what-is-joystie') return 78;
  return 88;
}

/** Gentle smooth scroll to a landing section (no scroll lock). */
export function scrollLandingToSection(id: string) {
  if (typeof window === 'undefined') return;
  const el = document.getElementById(id);
  if (!el) return;

  const top = el.getBoundingClientRect().top + window.scrollY - landingNavOffset(id);
  window.scrollTo({ top, behavior: 'smooth' });
}
