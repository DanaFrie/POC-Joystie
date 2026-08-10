'use client';

import { useCallback, useMemo, useState } from 'react';
import { ChildSelfieMissionFlow } from '@/components/onboarding/child/ChildSelfieMissionFlow';
import {
  generateSelfieImage,
  getLocalSelfieServiceUrl,
  getSelfieTransport,
} from '@/lib/api/selfie';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('SelfieGenerateTest');

type Mode = 'mission' | 'scratchpad';

/**
 * Local selfie loop — Mission 3 UI + optional API scratchpad.
 * Route: /onboarding/child/selfie-generate-test
 *
 * Point UI at local Cloud Run with:
 *   NEXT_PUBLIC_SELFIE_SERVICE_URL=http://127.0.0.1:8081
 * and run: npm run selfie:service
 */
export default function SelfieGenerateTestPage() {
  const transport = getSelfieTransport();
  const localUrl = getLocalSelfieServiceUrl();
  const [mode, setMode] = useState<Mode>('mission');
  const [childGender, setChildGender] = useState<'girl' | 'boy'>('girl');
  const [parentGender, setParentGender] = useState<'female' | 'male'>('female');
  const [childFile, setChildFile] = useState<File | null>(null);
  const [parentFile, setParentFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);

  const bannerTone =
    transport === 'local'
      ? 'border-[#00E7A2]/40 bg-[#00E7A2]/15 text-[#00E7A2]'
      : 'border-amber-400/40 bg-amber-400/15 text-amber-200';

  const runScratchpad = useCallback(async () => {
    if (!childFile || !parentFile || busy) return;
    setBusy(true);
    setError(null);
    setResultUrl((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
      return null;
    });
    setElapsedMs(null);
    const started = Date.now();
    try {
      const blob = await generateSelfieImage({
        childFace: childFile,
        parentFace: parentFile,
        childGender,
        parentGender,
      });
      setResultUrl(URL.createObjectURL(blob));
      setElapsedMs(Date.now() - started);
      logger.log('Scratchpad result ready', { bytes: blob.size, elapsedMs: Date.now() - started });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      logger.error('Scratchpad failed', { message });
    } finally {
      setBusy(false);
    }
  }, [busy, childFile, childGender, parentFile, parentGender]);

  const genderHint = useMemo(
    () => `${parentGender === 'female' ? 'mother' : 'father'} + ${childGender === 'girl' ? 'daughter' : 'son'}`,
    [childGender, parentGender],
  );

  return (
    <div className="relative h-full min-h-0 w-full">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[90] px-3 pt-[max(8px,env(safe-area-inset-top))]">
        <div
          className={`pointer-events-auto rounded-xl border px-3 py-2 font-simpler text-[11px] leading-snug ${bannerTone}`}
        >
          <p className="font-semibold uppercase tracking-wide">
            TEST · selfie · {transport === 'local' ? 'local service' : 'firebase → cloud run'}
          </p>
          <p className="mt-0.5 opacity-90">
            {transport === 'local'
              ? localUrl
              : 'Set NEXT_PUBLIC_SELFIE_SERVICE_URL=http://127.0.0.1:8081 in .env.local'}
          </p>
          <p className="mt-0.5 opacity-80">{genderHint}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                mode === 'mission' ? 'bg-white/20 text-white' : 'bg-black/20 text-white/70'
              }`}
              onClick={() => setMode('mission')}
            >
              Mission UI
            </button>
            <button
              type="button"
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                mode === 'scratchpad' ? 'bg-white/20 text-white' : 'bg-black/20 text-white/70'
              }`}
              onClick={() => setMode('scratchpad')}
            >
              API scratchpad
            </button>
            <label className="flex items-center gap-1 text-white/80">
              child
              <select
                className="rounded bg-black/30 px-1 py-0.5 text-white"
                value={childGender}
                onChange={(e) => setChildGender(e.target.value as 'girl' | 'boy')}
              >
                <option value="girl">girl</option>
                <option value="boy">boy</option>
              </select>
            </label>
            <label className="flex items-center gap-1 text-white/80">
              parent
              <select
                className="rounded bg-black/30 px-1 py-0.5 text-white"
                value={parentGender}
                onChange={(e) => setParentGender(e.target.value as 'female' | 'male')}
              >
                <option value="female">female</option>
                <option value="male">male</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      {mode === 'mission' ? (
        <ChildSelfieMissionFlow
          childName="נועם"
          childGender={childGender}
          parentName={parentGender === 'female' ? 'אמא' : 'אבא'}
          parentGender={parentGender}
          onShareReached={() => {
            logger.log('Share reached (test — no milestone write)');
          }}
        />
      ) : (
        <div className="flex h-full flex-col gap-3 overflow-y-auto bg-v03-green-900 px-4 pb-8 pt-36 text-white font-simpler">
          <p className="text-[13px] text-white/70">
            Upload face crops and hit generate — skips camera. Restart `npm run selfie:service` after
            Python changes (uvicorn --reload picks up most edits automatically).
          </p>
          <label className="block text-[12px]">
            Child face
            <input
              type="file"
              accept="image/*"
              className="mt-1 block w-full text-[12px]"
              onChange={(e) => setChildFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <label className="block text-[12px]">
            Parent face
            <input
              type="file"
              accept="image/*"
              className="mt-1 block w-full text-[12px]"
              onChange={(e) => setParentFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <button
            type="button"
            disabled={busy || !childFile || !parentFile}
            onClick={() => void runScratchpad()}
            className="rounded-full bg-[#00E7A2] px-4 py-3 text-[15px] font-bold text-v03-green-900 disabled:opacity-40"
          >
            {busy ? 'Generating…' : 'Generate selfie'}
          </button>
          {error ? (
            <p className="text-[13px] text-red-300" role="alert">
              {error}
            </p>
          ) : null}
          {elapsedMs != null ? (
            <p className="text-[12px] text-white/60">{elapsedMs} ms</p>
          ) : null}
          {resultUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resultUrl}
              alt="Generated selfie"
              className="mx-auto w-full max-w-[375px] rounded-lg border border-white/10 object-contain"
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
