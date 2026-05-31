import { Assistant } from 'next/font/google';

/** Fallback when Simpler Pro woff2 missing from public/fonts/simpler-pro/ */
export const simplerPro = Assistant({
  subsets: ['hebrew', 'latin'],
  weight: ['400', '700', '800'],
  variable: '--font-simpler',
  display: 'swap',
});
