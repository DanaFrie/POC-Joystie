'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { OnboardingAccentFooter } from '@/components/onboarding/OnboardingAccentFooter';
import { OnboardingBackButton } from '@/components/onboarding/OnboardingBackButton';
import { ONBOARDING_BLUR_FOOTER_HEIGHT_PX } from '@/components/onboarding/OnboardingBlurFooter';
import { OnboardingMintGlow } from '@/components/onboarding/OnboardingMintGlow';
import {
  OnboardingSignupForm,
  type SignupFormValues,
} from '@/components/onboarding/signup/OnboardingSignupForm';
import { SignupHeroFrame } from '@/components/onboarding/signup/SignupHeroFrame';
import { SIGNUP_CONTENT_PULL_UP_PX } from '@/constants/signup-layout';
import {
  getOnboardingParentRole,
  parentRoleToGender,
} from '@/lib/onboarding/parentRole';
import { createUser } from '@/lib/api/users';
import { signUp } from '@/utils/auth';
import { getErrorMessage } from '@/utils/errors';
import { createContextLogger } from '@/utils/logger';
import { createSession } from '@/utils/session';
import { trackMetaCompleteRegistration } from '@/utils/meta-pixel';

export const dynamic = 'force-dynamic';

const logger = createContextLogger('OnboardingSignup');

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();
  const space = trimmed.indexOf(' ');
  if (space === -1) {
    return { firstName: trimmed, lastName: '' };
  }
  return {
    firstName: trimmed.slice(0, space),
    lastName: trimmed.slice(space + 1).trim(),
  };
}

function validate(values: SignupFormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.fullName.trim()) {
    errors.fullName = 'אנא הכנס שם מלא';
  }
  if (!values.email.trim()) {
    errors.email = 'אנא הכנס כתובת אימייל';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'כתובת אימייל לא תקינה';
  }
  if (!values.password.trim()) {
    errors.password = 'אנא הכנס סיסמה';
  } else if (values.password.length < 6) {
    errors.password = 'סיסמה חייבת להכיל לפחות 6 תווים';
  }
  if (!values.confirmPassword.trim()) {
    errors.confirmPassword = 'אנא אשר את הסיסמה';
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'הסיסמאות לא תואמות';
  }
  return errors;
}

/** Dark funnel signup — after reveal; ellipse 385 + turquoise CTA. */
export default function OnboardingSignupPage() {
  const router = useRouter();
  const [values, setValues] = useState<SignupFormValues>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleOAuthUnavailable = () => {
    setErrors((prev) => ({
      ...prev,
      _general: 'התחברות עם Google או Apple תהיה זמינה בקרוב',
    }));
  };

  const handleSubmit = async () => {
    const nextErrors = validate(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const { firstName, lastName } = splitFullName(values.fullName);
      const displayName = values.fullName.trim();
      const user = await signUp(
        values.email.trim(),
        values.password,
        displayName
      );

      const parentRole = getOnboardingParentRole();
      const gender = parentRole ? parentRoleToGender(parentRole) : 'male';

      await createUser(user.uid, {
        email: values.email.trim().toLowerCase(),
        firstName,
        lastName,
        gender,
        kidsAges: [],
        notificationsEnabled: true,
        termsAccepted: false,
        signupDate: new Date().toISOString(),
      });

      createSession(user.uid);
      trackMetaCompleteRegistration({ content_name: 'onboarding_signup' });

      try {
        const { logEvent, AnalyticsEvents, setUserId } = await import('@/utils/analytics');
        await setUserId(user.uid);
        await logEvent(AnalyticsEvents.SIGNUP, {
          user_id: user.uid,
          email: values.email.trim().toLowerCase(),
        });
      } catch (analyticsError) {
        logger.warn('Signup analytics failed:', analyticsError);
      }

      router.push('/onboarding/setup');
    } catch (error) {
      logger.error('Signup error:', error);
      const errorMessage = getErrorMessage(error);
      if (errorMessage.includes('אימייל')) {
        setErrors({ email: errorMessage });
      } else if (errorMessage.includes('סיסמה')) {
        setErrors({ password: errorMessage });
      } else {
        setErrors({ _general: errorMessage });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <OnboardingMintGlow />
      <OnboardingBackButton onClick={() => router.back()} />
      <div
        dir="rtl"
        className="absolute inset-x-0 top-0 z-[10] overflow-y-auto overflow-x-hidden v03-scroll-hidden"
        style={{ bottom: ONBOARDING_BLUR_FOOTER_HEIGHT_PX }}
      >
        <SignupHeroFrame />
        <div
          className="relative z-[12] flex flex-col items-center gap-5 px-v03-gutter pb-8"
          style={{ marginTop: SIGNUP_CONTENT_PULL_UP_PX }}
        >
          <OnboardingSignupForm
            values={values}
            errors={errors}
            onChange={handleChange}
            onOAuthGoogle={handleOAuthUnavailable}
            onOAuthApple={handleOAuthUnavailable}
            oauthDisabled={isSubmitting}
          />
        </div>
      </div>
      <OnboardingAccentFooter
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'נרשם…' : 'הרשמה'}
      </OnboardingAccentFooter>
    </>
  );
}
