'use client';

import { LegalDocumentScreen } from '@/components/legal/LegalDocumentScreen';
import { PrivacyPolicyContent } from '@/components/legal/PrivacyPolicyContent';

export function OnboardingPrivacyScreen() {
  return (
    <LegalDocumentScreen title="מדיניות פרטיות">
      {(expanded) => <PrivacyPolicyContent expanded={expanded} />}
    </LegalDocumentScreen>
  );
}
