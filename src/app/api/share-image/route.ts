import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_HOSTS = new Set([
  'storage.googleapis.com',
  'firebasestorage.googleapis.com',
]);

function isAllowedShareImageUrl(raw: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return false;
  }
  if (parsed.protocol !== 'https:') return false;

  const host = parsed.hostname.toLowerCase();
  const haystack = `${host}${parsed.pathname}`;
  const isJoystieBucket =
    haystack.includes('joystie-poc-prod') || haystack.includes('joystie-poc');

  if (ALLOWED_HOSTS.has(host)) return isJoystieBucket;
  if (host.endsWith('.firebasestorage.app') || host.endsWith('.appspot.com')) {
    return isJoystieBucket;
  }
  return false;
}

/**
 * Same-origin proxy for Firebase Storage signed URLs.
 * Browser fetch/canvas CORS is not set on the prod bucket for localhost.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')?.trim() ?? '';
  if (!url || !isAllowedShareImageUrl(url)) {
    return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 });
  }

  const upstream = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'image/*' },
    cache: 'no-store',
  });

  if (!upstream.ok) {
    return NextResponse.json(
      { error: 'Image fetch failed' },
      { status: upstream.status === 404 ? 404 : 502 }
    );
  }

  const contentType = upstream.headers.get('content-type') || 'image/jpeg';
  const body = await upstream.arrayBuffer();
  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'private, max-age=300',
    },
  });
}
