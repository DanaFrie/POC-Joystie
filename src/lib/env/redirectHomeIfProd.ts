import { redirect } from 'next/navigation';

/** Dev/intgr-only screens — send prod traffic to the marketing home. */
export function redirectHomeIfProd(): void {
  if (process.env.NEXT_PUBLIC_ENV === 'prod') {
    redirect('/');
  }
}
