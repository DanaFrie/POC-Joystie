'use client';

import { useState, useEffect } from 'react';
import { HeroWalletContent } from './HeroWalletContent';

export default function HeroWalletCard() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (step === 2) {
      timeout = setTimeout(() => setStep(0), 2500);
    } else {
      timeout = setTimeout(() => setStep((prev) => prev + 1), 2500);
    }
    return () => clearTimeout(timeout);
  }, [step]);

  return <HeroWalletContent step={step} />;
}
