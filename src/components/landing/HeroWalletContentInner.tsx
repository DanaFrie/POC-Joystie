'use client';

import { HeroWalletContentUI } from './HeroWalletContentUI';

type Props = { step: number };

export function HeroWalletContentInner({ step }: Props) {
  return <HeroWalletContentUI step={step} />;
}
