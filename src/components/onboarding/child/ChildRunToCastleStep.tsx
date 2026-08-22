'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChildCastleChangeCelebrationOverlay } from '@/components/onboarding/child/ChildCastleChangeCelebrationOverlay';
import { ChildCastleChangeConfirmOverlay } from '@/components/onboarding/child/ChildCastleChangeConfirmOverlay';
import { ChildCastleTiltCard } from '@/components/onboarding/child/ChildCastleTiltCard';
import { ChildContinueGlowTapButton } from '@/components/onboarding/child/ChildContinueGlowButton';
import { ChildSpeechBubble } from '@/components/onboarding/child/ChildSpeechBubble';
import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { FunnelRootPortal } from '@/components/ui/FunnelRootPortal';
import { FunnelStepRoot } from '@/components/ui/funnel-layout';
import { useFunnelViewportMetrics } from '@/components/ui/FunnelViewportContext';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';
import {
  CHILD_CASTLE_INTERIOR_CARDS,
  CHILD_RUN_TO_CASTLE,
  childCastleInteriorCardLayout,
} from '@/constants/child-post-game-layout';
import { V03_SCREEN_HEIGHT, V03_SCREEN_WIDTH } from '@/constants/v03-screen';

type RunPhase = 'idle' | 'playing' | 'dissolve' | 'interior' | 'confirm' | 'celebration';

/**
 * Run-to-castle video → castle interior card picker.
 *
 * One fixed full-screen layer (portaled above the scaled funnel canvas):
 * - Artboard height ≥ viewport/scale so media fills 100vh after width-fit scale
 * - Video + bubble share that artboard so backdrop-filter blurs the media again
 */
export function ChildRunToCastleStep({
  childName,
  childGender = 'boy',
  onContinue,
  onChangeConfirmed,
}: {
  childName: string;
  childGender?: 'boy' | 'girl';
  onContinue?: () => void;
  onChangeConfirmed?: (changeText: string) => void;
}) {
  const layout = CHILD_RUN_TO_CASTLE;
  const bubble = layout.bubble;
  const glow = layout.glowButton;
  const header = layout.header;
  const cards = layout.cards;
  const { viewportWidth, viewportHeight } = useFunnelViewportMetrics();

  const uiScale = Math.max(viewportWidth / V03_SCREEN_WIDTH, 0.0001);
  /** Canvas-space height that maps to at least one full viewport after scale. */
  const artboardHeightPx = Math.max(
    V03_SCREEN_HEIGHT,
    Math.ceil(viewportHeight / uiScale)
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const dissolveDone = useRef(false);
  const phaseRef = useRef<RunPhase>('idle');

  const [phase, setPhase] = useState<RunPhase>('idle');
  const [uiVisible, setUiVisible] = useState(true);
  const [videoOpacity, setVideoOpacity] = useState(1);
  const [castleOpacity, setCastleOpacity] = useState(0);
  const [headerOpacity, setHeaderOpacity] = useState(0);
  const [revealedCardCount, setRevealedCardCount] = useState(0);
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

    setRevealedCardCount(0);
    setHeaderOpacity(0);

    const headerRaf = window.requestAnimationFrame(() => setHeaderOpacity(1));
    const cardTimers = CHILD_CASTLE_INTERIOR_CARDS.map((_, index) =>
      window.setTimeout(
        () => setRevealedCardCount((count) => Math.max(count, index + 1)),
        layout.cardRevealMs + index * layout.cardRevealStaggerMs
      )
    );

    return () => {
      window.cancelAnimationFrame(headerRaf);
      cardTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [phase, layout.cardRevealMs, layout.cardRevealStaggerMs]);

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

  const handleCelebrationComplete = useCallback(() => {
    if (selectedTitle.trim()) {
      onChangeConfirmed?.(selectedTitle.trim());
    }
    onContinue?.();
  }, [onChangeConfirmed, onContinue, selectedTitle]);

  const handleDeclineChange = useCallback(() => {
    setSelectedId(null);
    setSelectedTitle('');
    setPhase('interior');
  }, []);

  const dissolveTransition = `opacity ${layout.castleDissolveMs}ms ease-in-out`;
  const uiTransition = `opacity ${layout.uiFadeMs}ms ease-out`;
  const headerTransition = `opacity ${layout.headerFadeMs}ms ease-out`;

  const scaledInteriorCards = useMemo(
    () =>
      CHILD_CASTLE_INTERIOR_CARDS.map((card) => ({
        card,
        placeTopPx: card.placeTop,
        widthPx: card.width,
        minHeightPx: card.height,
      })),
    []
  );

  return (
    <>
      <FunnelStepRoot fillViewport aria-hidden className="pointer-events-none opacity-0">
        {null}
      </FunnelStepRoot>

      <FunnelRootPortal>
        <div
          className="fixed inset-0 z-[15] overflow-hidden bg-[#092125]"
          aria-label="ריצה לארמון"
        >
          <div
            className="absolute left-0 top-0 origin-top-left"
            style={{
              width: V03_SCREEN_WIDTH,
              height: artboardHeightPx,
              transform: `scale(${uiScale})`,
            }}
          >
            {/* Media inside the same scaled tree as the bubble → backdrop-filter works. */}
            <video
              ref={videoRef}
              src={CHILD_ONBOARDING_ASSETS.doriRunToCastle}
              muted
              playsInline
              preload="auto"
              onEnded={handleVideoEnded}
              className="pointer-events-none absolute left-0 top-0 z-0 object-cover object-top"
              style={{
                width: V03_SCREEN_WIDTH,
                height: artboardHeightPx,
                opacity: videoOpacity,
                transition: phase === 'dissolve' ? dissolveTransition : undefined,
              }}
            />
            <OnboardingLazyImage
              src={CHILD_ONBOARDING_ASSETS.doriCastle}
              alt=""
              className="pointer-events-none absolute left-0 top-0 z-0 object-cover object-top"
              style={{
                width: V03_SCREEN_WIDTH,
                height: artboardHeightPx,
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

                <div className="absolute inset-0" style={{ zIndex: cards.zIndex }}>
                  {scaledInteriorCards.map(({ card, placeTopPx, widthPx, minHeightPx }, index) =>
                    index < revealedCardCount ? (
                      <div
                        key={card.id}
                        className="absolute"
                        style={{
                          top: placeTopPx,
                          left: card.placeLeft,
                          width: widthPx,
                          minHeight: minHeightPx,
                          transform: `rotate(${card.placeRotateDeg}deg)`,
                          transformOrigin: 'top left',
                        }}
                      >
                        <div
                          className="castle-card-enter"
                          style={{
                            animationDelay: `${index * layout.cardRevealStaggerMs}ms`,
                          }}
                        >
                          <div
                            className="castle-card-float relative"
                            style={{ animationDelay: `${index * 0.4}s` }}
                          >
                            <ChildCastleTiltCard
                              variant="slider"
                              layout={{
                                ...childCastleInteriorCardLayout(card),
                                width: widthPx,
                                height: minHeightPx,
                              }}
                              title={card.title}
                              onSelect={() => handleSelectCard(card.id, card.title)}
                            />
                          </div>
                        </div>
                      </div>
                    ) : null
                  )}
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
              onComplete={handleCelebrationComplete}
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
                <ChildContinueGlowTapButton
                  left={glow.left}
                  top={glow.top}
                  onClick={handleTap}
                />

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
                    gap: 0,
                    borderRadius: bubble.borderRadius,
                    border: bubble.border,
                    background: bubble.background,
                    backdropBlur: bubble.backdropBlur,
                    boxShadow: bubble.boxShadow,
                    useBorder: true,
                  }}
                >
                  <p
                    className="w-full flex-[1_0_0] text-center font-simpler font-normal text-white"
                    style={{
                      fontSize: 16,
                      lineHeight: '128%',
                      letterSpacing: '-0.32px',
                    }}
                  >
                    {`${childName}, זה הזמן להיכנס לארמון ההחלטות:`}
                    <br />
                    <span
                      className="font-simpler text-white"
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        lineHeight: '128%',
                        letterSpacing: '-0.32px',
                      }}
                    >
                      שם נבחר שינוי לחיים!
                    </span>
                  </p>
                </ChildSpeechBubble>
              </div>
            </div>
          </div>
        </div>
      </FunnelRootPortal>
    </>
  );
}
