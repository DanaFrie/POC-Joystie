'use client';

import { HeroWalletContentInner } from './HeroWalletContentInner';
const scaleClass = 'relative origin-top transition-all duration-700 z-10 scale-[0.56] sm:scale-[0.58] md:scale-[0.41] lg:scale-[0.48] xl:scale-[0.54]';


type HeroWalletContentProps = { step: number };

export function HeroWalletContent(props: HeroWalletContentProps) {
  return <HeroWalletContentInner step={props.step} />;
}
