import { redirectHomeIfProd } from '@/lib/env/redirectHomeIfProd';

export default function ChallengeTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  redirectHomeIfProd();
  return children;
}
