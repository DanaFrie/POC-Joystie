import { Assistant, Rubik } from 'next/font/google';

/** Fallback when Simpler Pro woff2 missing from public/fonts/simpler-pro/ */
export const simplerPro = Assistant({
  subsets: ['hebrew', 'latin'],
  weight: ['400', '700', '800'],
  variable: '--font-simpler',
  display: 'swap',
});

/** Marketing website (Figma Joystie Marketing) */
export const marketingRubik = Rubik({
  subsets: ['hebrew', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-marketing-rubik',
  display: 'swap',
});
