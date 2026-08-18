'use client';

import { LegalDocumentScreen } from '@/components/legal/LegalDocumentScreen';
import { TermsOfUseContent } from '@/components/legal/TermsOfUseContent';

export function OnboardingTermsScreen() {
  return (
    <LegalDocumentScreen title="תנאי שימוש">
      {(expanded) => <TermsOfUseContent expanded={expanded} />}
    </LegalDocumentScreen>
  );
}
