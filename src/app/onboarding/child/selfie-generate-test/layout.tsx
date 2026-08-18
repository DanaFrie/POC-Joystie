import { redirectHomeIfProd } from '@/lib/env/redirectHomeIfProd';

export default function SelfieGenerateTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  redirectHomeIfProd();
  return children;
}
