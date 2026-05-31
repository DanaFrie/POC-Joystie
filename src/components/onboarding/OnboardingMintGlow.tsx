/**
 * Ellipse 385 — mint CTA glow (Figma Inspect).
 * inset: top 757, bottom -217, left -98, right 201 → 272×272 circle.
 */
export function OnboardingMintGlow() {
  return (
    <div
      className="pointer-events-none absolute z-[8]"
      aria-hidden
      style={{
        top: 757,
        right: 201,
        bottom: -217,
        left: -98,
        borderRadius: 272,
        background: 'var(--v03-ellipse-385)',
        filter: 'blur(150px)',
      }}
    />
  );
}
