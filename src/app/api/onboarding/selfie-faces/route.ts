import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

const OUTPUT_DIR = join(process.cwd(), 'public', 'test-selfie');

async function saveUpload(file: FormDataEntryValue | null, destPath: string) {
  if (!(file instanceof File) || file.size === 0) {
    throw new Error('Missing image file');
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(destPath, buffer);
}

/**
 * Selfie face upload — input for future cloud compose service.
 * Dev: writes PNGs under `public/test-selfie/`. Prod: accepts payload (no local disk).
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const stamp = formData.get('stamp')?.toString() || String(Date.now());
    const childFaceFile = formData.get('childFace');
    const parentFaceFile = formData.get('parentFace');

    if (!(childFaceFile instanceof File) || !(parentFaceFile instanceof File)) {
      return NextResponse.json({ error: 'childFace and parentFace required' }, { status: 400 });
    }

    const childName = `selfie-child-${stamp}.png`;
    const parentName = `selfie-parent-${stamp}.png`;

    if (process.env.NODE_ENV !== 'production') {
      await mkdir(OUTPUT_DIR, { recursive: true });
      await saveUpload(childFaceFile, join(OUTPUT_DIR, childName));
      await saveUpload(parentFaceFile, join(OUTPUT_DIR, parentName));
    }

    return NextResponse.json({
      ok: true,
      stamp,
      childFace: `/test-selfie/${childName}`,
      parentFace: `/test-selfie/${parentName}`,
    });
  } catch (error) {
    console.error('[selfie-faces]', error);
    return NextResponse.json({ error: 'Failed to save selfie faces' }, { status: 500 });
  }
}
