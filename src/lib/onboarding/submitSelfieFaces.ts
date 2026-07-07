export type SelfieFaceUploadResult = {
  stamp: string;
  childFace: string;
  parentFace: string;
};

/** Submit child + parent face crops — cloud compose stub (persists in dev). */
export async function submitSelfieFaces(
  faces: { childFace: Blob; parentFace: Blob },
  parentId?: string,
): Promise<SelfieFaceUploadResult> {
  const stamp = String(Date.now());
  const formData = new FormData();
  formData.append('stamp', stamp);
  formData.append('childFace', faces.childFace, `selfie-child-${stamp}.png`);
  formData.append('parentFace', faces.parentFace, `selfie-parent-${stamp}.png`);
  if (parentId) formData.append('parentId', parentId);

  const response = await fetch('/api/onboarding/selfie-faces', {
    method: 'POST',
    body: formData,
  });

  const payload = (await response.json()) as SelfieFaceUploadResult & { error?: string };
  if (!response.ok || !payload.childFace || !payload.parentFace) {
    throw new Error(payload.error ?? 'שמירת תמונות הפנים נכשלה');
  }

  return {
    stamp: payload.stamp ?? stamp,
    childFace: payload.childFace,
    parentFace: payload.parentFace,
  };
}
