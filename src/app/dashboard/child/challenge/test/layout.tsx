import { redirectHomeIfProd } from '@/lib/env/redirectHomeIfProd';

export default function ChildChallengeTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  redirectHomeIfProd();
  return children;
}
