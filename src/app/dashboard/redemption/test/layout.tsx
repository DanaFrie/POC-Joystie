import { redirectHomeIfProd } from '@/lib/env/redirectHomeIfProd';

export default function RedemptionTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  redirectHomeIfProd();
  return children;
}
