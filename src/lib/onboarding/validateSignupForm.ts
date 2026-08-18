import type { SignupFormValues } from '@/components/onboarding/signup/OnboardingSignupForm';
import {
  isHebrewChildName,
  ONBOARDING_HEBREW_ONLY_ERROR,
} from '@/lib/onboarding/childrenDetails';

export function validateOnboardingSignupForm(
  values: SignupFormValues
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!values.firstName.trim()) {
    errors.firstName = 'אנא הכנס שם פרטי';
  } else if (!isHebrewChildName(values.firstName)) {
    errors.firstName = ONBOARDING_HEBREW_ONLY_ERROR;
  }
  if (!values.lastName.trim()) {
    errors.lastName = 'אנא הכנס שם משפחה';
  } else if (!isHebrewChildName(values.lastName)) {
    errors.lastName = ONBOARDING_HEBREW_ONLY_ERROR;
  }
  if (!values.email.trim()) {
    errors.email = 'אנא הכנס כתובת אימייל';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'כתובת אימייל לא תקינה';
  }
  if (!values.password.trim()) {
    errors.password = 'אנא הכנס סיסמה';
  } else if (values.password.length < 6) {
    errors.password = 'סיסמה חייבת להכיל לפחות 6 תווים';
  }
  if (!values.confirmPassword.trim()) {
    errors.confirmPassword = 'אנא אשר את הסיסמה';
  } else   if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'הסיסמאות לא תואמות';
  }
  if (!values.termsAccepted) {
    errors.termsAccepted = 'אנא אשר את תנאי השימוש';
  }
  return errors;
}
