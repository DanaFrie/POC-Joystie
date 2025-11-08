'use client';

import Link from 'next/link';

export default function OnboardingPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold mb-8 text-dark-blue">
        ברוכים הבאים ל-Joystie!
      </h1>
      <p className="text-xl mb-12 max-w-2xl text-gray-700">
        בואו נתחיל להגדיר את חשבון ההורה שלכם
      </p>
      <div className="space-y-4 w-full max-w-md">
        <Link 
          href="/onboarding/setup"
          className="block w-full bg-dark-blue text-white py-4 px-6 rounded-lg text-lg font-semibold hover:bg-opacity-90 transition-colors text-center"
        >
          התחילו כאן
        </Link>
        <Link 
          href="/"
          className="block w-full bg-white text-dark-blue border-2 border-dark-blue py-4 px-6 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors text-center"
        >
          חזרה לדף הבית
        </Link>
      </div>
    </div>
  );
}