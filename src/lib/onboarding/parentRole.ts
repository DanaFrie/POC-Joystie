export type OnboardingParentRole = 'mother' | 'father';

const ROLE_STORAGE_KEY = 'onboardingParentRole';

export function setOnboardingParentRole(role: OnboardingParentRole) {
  sessionStorage.setItem(ROLE_STORAGE_KEY, role);
}

export function getOnboardingParentRole(): OnboardingParentRole | null {
  const value = sessionStorage.getItem(ROLE_STORAGE_KEY);
  return value === 'mother' || value === 'father' ? value : null;
}

/** Maps onboarding role → signup/Firestore gender when needed. */
export function parentRoleToGender(
  role: OnboardingParentRole
): 'female' | 'male' {
  return role === 'mother' ? 'female' : 'male';
}
