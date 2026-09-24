import { EnglishMarketingShell } from '@/components/landing/EnglishMarketingShell';

export default function EnglishMarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <EnglishMarketingShell>{children}</EnglishMarketingShell>;
}
