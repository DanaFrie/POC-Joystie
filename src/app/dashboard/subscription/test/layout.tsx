import { redirectHomeIfProd } from '@/lib/env/redirectHomeIfProd';

export default function SubscriptionTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  redirectHomeIfProd();
  return children;
}
