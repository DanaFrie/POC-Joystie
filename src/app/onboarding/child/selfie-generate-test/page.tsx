'use client';

import { ChildSelfieMissionFlow } from '@/components/onboarding/child/ChildSelfieMissionFlow';

/** Dev test — Mission 3 full flow via Firebase `generateSelfie` → Cloud Run. */
export default function SelfieGenerateTestPage() {
  return (
    <ChildSelfieMissionFlow
      childName="אלה"
      childGender="girl"
      parentName="רונית"
      parentGender="female"
      onShareReached={() => {}}
    />
  );
}
