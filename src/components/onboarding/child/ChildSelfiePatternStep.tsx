'use client';

import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { useFunnelFullBleed } from '@/components/ui/FunnelViewportContext';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';
import { CHILD_SELFIE_PATTERN } from '@/constants/child-post-game-layout';
import { CHILD_SELFIE_PATTERN_CAPTURE_LABEL } from '@/lib/onboarding/childPostGameCopy';
import { resolveParentCourtLabel } from '@/lib/onboarding/childBondingLabels';

function SelfieCaptureCameraIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      className={`size-[18px] shrink-0 ${className}`}
      aria-hidden
    >
      <path
        d="M1.5 7.84234C1.5 6.20352 2.82852 4.875 4.46734 4.875C4.94215 4.875 5.37127 4.59204 5.55831 4.15562L5.7 3.825C6.10949 2.86951 7.04901 2.25 8.08855 2.25H9H9.91145C10.951 2.25 11.8905 2.86951 12.3 3.825L12.4417 4.15562C12.6287 4.59204 13.0579 4.875 13.5327 4.875C15.1715 4.875 16.5 6.20352 16.5 7.84234V10.375C16.5 13.1364 14.2614 15.375 11.5 15.375H6.5C3.73858 15.375 1.5 13.1364 1.5 10.375V7.84234Z"
        stroke="#303030"
        strokeWidth="1.5"
      />
      <circle
        cx="2.25"
        cy="2.25"
        r="2.25"
        transform="matrix(-1 0 0 1 11.25 7.125)"
        stroke="#303030"
        strokeWidth="1.5"
      />
    </svg>
  );
}

type ChildSelfiePatternStepProps = {
  childName: string;
  parentGender?: 'female' | 'male' | null;
  parentName?: string | null;
  onCapture?: () => void;
};

/** Mission 3 — castle selfie frame with child + parent name badges. */
export function ChildSelfiePatternStep({
  childName,
  parentGender,
  parentName,
  onCapture,
}: ChildSelfiePatternStepProps) {
  const layout = CHILD_SELFIE_PATTERN;
  const bleedStyle = useFunnelFullBleed();
  const parentLabel = resolveParentCourtLabel(parentGender, parentName);
  const childBadge = layout.childBadge;
  const parentBadge = layout.parentBadge;
  const capture = layout.captureButton;

  return (
    <div dir="rtl" className="relative h-full w-full overflow-hidden">
      <OnboardingLazyImage
        src={CHILD_ONBOARDING_ASSETS.castleDoriSelfie}
        alt=""
        className="pointer-events-none absolute z-0 object-cover object-center"
        style={bleedStyle}
        priority
      />

      <div className="absolute inset-0 z-10">
        <span
          className="absolute inline-flex items-center justify-center bg-v03-green-700"
          style={{
            left: childBadge.left,
            top: childBadge.top,
            paddingLeft: childBadge.paddingX,
            paddingRight: childBadge.paddingX,
            paddingTop: childBadge.paddingY,
            paddingBottom: childBadge.paddingY,
            borderRadius: childBadge.borderRadius,
            gap: childBadge.gap,
          }}
        >
          <span
            className="text-center font-simpler font-bold text-white"
            style={{ fontSize: childBadge.fontSize }}
          >
            {childName}
          </span>
        </span>

        <span
          className="absolute inline-flex items-center justify-center bg-v03-green-700"
          style={{
            left: parentBadge.left,
            top: parentBadge.top,
            paddingLeft: parentBadge.paddingX,
            paddingRight: parentBadge.paddingX,
            paddingTop: parentBadge.paddingY,
            paddingBottom: parentBadge.paddingY,
            borderRadius: parentBadge.borderRadius,
            gap: parentBadge.gap,
          }}
        >
          <span
            className="text-center font-simpler font-bold text-white"
            style={{ fontSize: parentBadge.fontSize }}
          >
            {parentLabel}
          </span>
        </span>
      </div>

      {onCapture ? (
        <button
          type="button"
          onClick={onCapture}
          className="absolute z-20 inline-flex cursor-pointer touch-manipulation items-center justify-center rounded-[22px] bg-v03-turquoise-300 font-simpler text-[18px] font-bold leading-[1.2] text-v03-green-900 shadow-[2px_2px_20px_rgba(109,109,109,0.15)] transition hover:brightness-95"
          style={{
            left: capture.left,
            top: capture.top,
            width: capture.width,
            height: capture.height,
            padding: `${capture.paddingY}px ${capture.paddingX}px`,
          }}
          aria-label={CHILD_SELFIE_PATTERN_CAPTURE_LABEL}
        >
          <span className="inline-flex items-center gap-2" dir="ltr">
            <span>{CHILD_SELFIE_PATTERN_CAPTURE_LABEL}</span>
            <SelfieCaptureCameraIcon />
          </span>
        </button>
      ) : null}
    </div>
  );
}
