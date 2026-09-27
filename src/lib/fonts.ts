import { Plus_Jakarta_Sans, Rubik } from 'next/font/google';

/**
 * App-wide Rubik (Hebrew + Latin).
 * CSS var `--font-rubik` — also aliased to `--font-simpler` / `--font-marketing-rubik`
 * so existing `font-simpler` / marketing classes resolve to Rubik.
 */
export const appRubik = Rubik({
  subsets: ['hebrew', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-rubik',
  display: 'swap',
});

/**
 * English marketing typeface (replaces SF Pro system stack).
 * CSS var `--font-plus-jakarta` — used by `.font-sf` / EN marketing roots.
 */
export const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

/** @deprecated Use `appRubik` — kept so marketing pages keep importing this name. */
export const marketingRubik = appRubik;

/** @deprecated Assistant/Simpler fallback replaced by Rubik. */
export const simplerPro = appRubik;
