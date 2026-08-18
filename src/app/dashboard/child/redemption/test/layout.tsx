import { redirectHomeIfProd } from '@/lib/env/redirectHomeIfProd';

export default function ChildRedemptionTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  redirectHomeIfProd();
  return children;
}
