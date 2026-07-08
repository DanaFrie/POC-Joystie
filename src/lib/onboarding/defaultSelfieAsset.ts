import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';

/** Default share-screen selfie when the child skips camera capture. */
export function defaultSelfieAssetForChild(childGender?: string | null): string {
  const value = childGender?.toLowerCase() ?? '';
  if (value === 'girl' || value === 'female') {
    return CHILD_ONBOARDING_ASSETS.defaultSelfieGirl;
  }
  return CHILD_ONBOARDING_ASSETS.defaultSelfieBoy;
}
