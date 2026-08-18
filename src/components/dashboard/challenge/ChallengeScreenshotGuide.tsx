'use client';

import { useEffect, useRef } from 'react';
import {
  ChallengeBody,
  ChallengeEyebrow,
  ChallengeTitle,
} from '@/components/dashboard/challenge/ChallengeCardPrimitives';
import { V03_REDEMPTION_SCREENSHOT_GUIDE } from '@/constants/v03-challenge-layout';

type ChallengeScreenshotGuideProps = {
  titleId: string;
};

function GuideExampleVideo({ src, label }: { src: string; label: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const play = () => {
      void video.play().catch(() => undefined);
    };

    video.addEventListener('ended', play);
    play();

    return () => video.removeEventListener('ended', play);
  }, [src]);

  return (
    <div
      className="pointer-events-none relative w-full overflow-hidden rounded-[10px] bg-black/30 outline outline-1 outline-white/15 select-none"
      onContextMenu={(event) => event.preventDefault()}
    >
      <video
        ref={videoRef}
        src={src}
        muted
        playsInline
        loop
        autoPlay
        preload="auto"
        controls={false}
        disablePictureInPicture
        tabIndex={-1}
        aria-hidden
        className="aspect-[9/16] w-full object-cover object-top"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

/** iPhone + Android screen-time capture examples — side by side in card. */
export function ChallengeScreenshotGuide({ titleId }: ChallengeScreenshotGuideProps) {
  return (
    <>
      <ChallengeEyebrow>בדיקת השבוע</ChallengeEyebrow>
      <ChallengeTitle id={titleId}>מה לצלם?</ChallengeTitle>
      <ChallengeBody>
        גשו למסך של <span dir="ltr">Family Link</span> / Screen Time וצלמו את המסך כמו שמופיע כאן
        למטה
      </ChallengeBody>

      <div className="grid w-full grid-cols-2 gap-2">
        {V03_REDEMPTION_SCREENSHOT_GUIDE.examples.map((example) => (
          <div key={example.id} className="flex flex-col items-center gap-1.5">
            <GuideExampleVideo src={example.src} label={example.label} />
            <span className="font-simpler text-[11px] font-semibold text-white/60">{example.label}</span>
          </div>
        ))}
      </div>
    </>
  );
}
