'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChildCastleChangeCelebrationOverlay } from '@/components/onboarding/child/ChildCastleChangeCelebrationOverlay';
import { ChildCastleChangeConfirmOverlay } from '@/components/onboarding/child/ChildCastleChangeConfirmOverlay';
import { ChildCastleTiltCard } from '@/components/onboarding/child/ChildCastleTiltCard';
import { ChildContinueGlowTapButton } from '@/components/onboarding/child/ChildContinueGlowButton';
import { ChildSpeechBubble } from '@/components/onboarding/child/ChildSpeechBubble';
import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { OnboardingMintGlow } from '@/components/onboarding/OnboardingMintGlow';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';
import {
  CHILD_CASTLE_INTERIOR_CARDS,
  CHILD_RUN_TO_CASTLE,
  childCastleInteriorCardLayout,
} from '@/constants/child-post-game-layout';

type RunPhase = 'idle' | 'playing' | 'dissolve' | 'interior' | 'confirm' | 'celebration';

/** Run to castle — tap plays video; dissolve → castle + header + tilt card slider. */
export function ChildRunToCastleStep({
  childName,
  childGender = 'boy',
  onContinue,
}: {
  childName: string;
  childGender?: 'boy' | 'girl';
  onContinue?: () => void;
}) {
  const layout = CHILD_RUN_TO_CASTLE;
  const bubble = layout.bubble;
  const videoLayout = layout.video;
  const castleLayout = layout.castle;
  const glow = layout.glowButton;
  const header = layout.header;
  const cards = layout.cards;
  const videoRef = useRef<HTMLVideoElement>(null);
  const dissolveDone = useRef(false);
  const phaseRef = useRef<RunPhase>('idle');

  const [phase, setPhase] = useState<RunPhase>('idle');
  const [uiVisible, setUiVisible] = useState(true);
  const [videoOpacity, setVideoOpacity] = useState(1);
  const [castleOpacity, setCastleOpacity] = useState(0);
  const [headerOpacity, setHeaderOpacity] = useState(0);
  const [cardVisible, setCardVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState('');

  phaseRef.current = phase;

  const enterInterior = useCallback(() => {
    if (dissolveDone.current) return;
    dissolveDone.current = true;
    setPhase('interior');
  }, []);

  const handleVideoEnded = useCallback(() => {
    setPhase('dissolve');
    window.requestAnimationFrame(() => {
      setVideoOpacity(0);
      setCastleOpacity(1);
    });
  }, []);

  useEffect(() => {
    if (phase !== 'dissolve') return;
    const timer = window.setTimeout(enterInterior, layout.castleDissolveMs);
    return () => window.clearTimeout(timer);
  }, [phase, enterInterior, layout.castleDissolveMs]);

  useEffect(() => {
    if (phase !== 'interior') return;

    const headerRaf = window.requestAnimationFrame(() => setHeaderOpacity(1));
    const cardTimer = window.setTimeout(() => setCardVisible(true), layout.cardRevealMs);

    return () => {
      window.cancelAnimationFrame(headerRaf);
      window.clearTimeout(cardTimer);
    };
  }, [phase, layout.cardRevealMs]);

  const handleTap = useCallback(() => {
    if (phaseRef.current !== 'idle') return;
    phaseRef.current = 'playing';
    setUiVisible(false);
    setPhase('playing');

    const el = videoRef.current;
    if (!el) return;
    el.loop = false;
    el.currentTime = 0;
    void el.play().catch(() => {});
  }, []);

  const handleSelectCard = useCallback((id: string, title: string) => {
    setSelectedId(id);
    setSelectedTitle(title);
    setPhase('confirm');
  }, []);

  const handleConfirmChange = useCallback(() => {
    setPhase('celebration');
  }, []);

  const handleDeclineChange = useCallback(() => {
    setSelectedId(null);
    setSelectedTitle('');
    setPhase('interior');
  }, []);

  const dissolveTransition = `opacity ${layout.castleDissolveMs}ms ease-in-out`;
  const uiTransition = `opacity ${layout.uiFadeMs}ms ease-out`;
  const headerTransition = `opacity ${layout.headerFadeMs}ms ease-out`;

  return (
    <div className="relative h-full w-full overflow-hidden bg-transparent">
      <OnboardingMintGlow />

      <video
        ref={videoRef}
        src={CHILD_ONBOARDING_ASSETS.doriRunToCastle}
        muted
        playsInline
        preload="auto"
        onEnded={handleVideoEnded}
        className="pointer-events-none absolute z-[1] shrink-0 object-cover"
        style={{
          top: videoLayout.top,
          left: videoLayout.left,
          width: videoLayout.width,
          height: videoLayout.height,
          aspectRatio: videoLayout.aspectRatio,
          opacity: videoOpacity,
          transition: phase === 'dissolve' ? dissolveTransition : undefined,
        }}
        aria-hidden
      />

      <OnboardingLazyImage
        src={CHILD_ONBOARDING_ASSETS.doriCastle}
        alt=""
        className="pointer-events-none absolute z-[2] shrink-0 object-cover"
        style={{
          top: castleLayout.top,
          left: castleLayout.left,
          width: castleLayout.width,
          height: castleLayout.height,
          aspectRatio: castleLayout.aspectRatio,
          opacity: castleOpacity,
          transition: dissolveTransition,
        }}
        priority
      />

      {phase === 'interior' || phase === 'confirm' ? (
        <>
          <header
            className="absolute left-0 z-[15] flex w-full items-center justify-center"
            style={{
              top: header.top,
              width: header.width,
              height: header.height,
              padding: header.padding,
              gap: header.gap,
              background: header.background,
              opacity: headerOpacity,
              transition: headerTransition,
            }}
          >
            <p
              className="shrink-0 text-center font-simpler font-black text-white"
              style={{
                width: header.textWidth,
                fontSize: header.fontSize,
                lineHeight: header.lineHeight,
                letterSpacing: `${header.letterSpacing}px`,
              }}
            >
              {`${childName}, זה הזמן לבחור `}
              <span className="text-[#00FFB3]">שינוי אחד</span>{' '}
              <span className="text-white">שנתחיל ליישם יחד!</span>
            </p>
          </header>

          <div
            className="absolute inset-0"
            style={{ zIndex: cards.zIndex }}
          >
            {cardVisible ? (
            <div className="v03-funnel-enter-0 absolute inset-0">
              {CHILD_CASTLE_INTERIOR_CARDS.map((card) => (
                <div
                  key={card.id}
                  className="absolute"
                  style={{
                    top: card.placeTop,
                    left: card.placeLeft,
                    width: card.width,
                    height: card.height,
                    transform: `rotate(${card.placeRotateDeg}deg)`,
                    transformOrigin: 'top left',
                  }}
                >
                  <ChildCastleTiltCard
                    variant="slider"
                    layout={childCastleInteriorCardLayout(card)}
                    title={card.title}
                    onSelect={() => handleSelectCard(card.id, card.title)}
                  />
                </div>
              ))}
            </div>
          ) : null}
          </div>
        </>
      ) : null}

      <ChildCastleChangeConfirmOverlay
        changeTitle={selectedTitle}
        childGender={childGender}
        visible={phase === 'confirm' && selectedId != null}
        onConfirm={handleConfirmChange}
        onDecline={handleDeclineChange}
      />

      <ChildCastleChangeCelebrationOverlay
        childGender={childGender}
        visible={phase === 'celebration'}
        onContinue={onContinue}
      />

      <div
        className="pointer-events-none absolute inset-0 z-[20]"
        style={{
          opacity: uiVisible ? 1 : 0,
          transition: uiTransition,
        }}
        aria-hidden={!uiVisible}
      >
        <div className={phase === 'idle' ? 'pointer-events-auto' : 'pointer-events-none'}>
          <ChildContinueGlowTapButton left={glow.left} top={glow.top} onClick={handleTap} />

          <ChildSpeechBubble
            top={bubble.top}
            left={bubble.left}
            width={bubble.width}
            tailLeft={bubble.tailLeft}
            tailBorderOverlap={bubble.tailBorderOverlap}
            paddingTop={bubble.paddingTop}
            paddingBottom={bubble.paddingBottom}
            appearance={{
              paddingLeft: bubble.paddingLeft,
              paddingRight: bubble.paddingRight,
              gap: bubble.gap,
              borderRadius: bubble.borderRadius,
              border: bubble.border,
              background: bubble.background,
              backdropBlur: bubble.backdropBlur,
              boxShadow: bubble.boxShadow,
              useBorder: true,
            }}
          >
            <p className="w-full flex-[1_0_0] text-center font-simpler text-[16px] font-semibold leading-[1.35] tracking-[-0.24px] text-white">
              זה הזמן להיכנס לארמון ההחלטות - שם נבחר שינוי לחיים!
            </p>
          </ChildSpeechBubble>
        </div>
      </div>
    </div>
  );
}
