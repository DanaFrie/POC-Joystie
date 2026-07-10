'use client';

import { useCallback, useRef, useState } from 'react';
import { OnboardingBackButton } from '@/components/onboarding/OnboardingBackButton';
import {
  ParentPostGameBlurFooter,
  parentPostGameBlurFooterScrollPadPx,
} from '@/components/onboarding/parent/ParentPostGameBlurFooter';
import { ParentPostGameGreenBackground } from '@/components/onboarding/parent/ParentPostGameGreenBackground';
import { SelectableOptionCard } from '@/components/onboarding/parent/SelectableOptionCard';
import { FunnelStepRoot } from '@/components/ui/funnel-layout';
import { ONBOARDING_STACKED_FOOTER_CONTENT_W_PX } from '@/constants/onboarding-footer';
import { ONBOARDING_SELECTABLE_OPTION } from '@/constants/onboarding-selectable-option';
import {
  getFunnelScrollContentEndPadPx,
} from '@/constants/funnel-vertical-layout';
import {
  PARENT_ADDITIONAL_CHANGE,
  PARENT_POST_GAME_ADDITIONAL_CHANGE_OPTIONS,
} from '@/constants/parent-post-game-layout';
import {
  isHebrewChildName,
  ONBOARDING_HEBREW_ONLY_ERROR,
} from '@/lib/onboarding/childrenDetails';
import {
  PARENT_ADDITIONAL_CHANGE_OR,
  PARENT_CUSTOM_CHANGE_LABEL,
  PARENT_CUSTOM_CHANGE_PLACEHOLDER,
  parentAdditionalChangeSubtitle,
  parentAdditionalChangeTitle,
  parentSendChangeToChildLabel,
} from '@/lib/onboarding/parentPostGameCopy';

type ParentAdditionalChangeStepProps = {
  childName: string;
  onConfirm: (changeText: string) => void;
  onBack: () => void;
};

const MAX_CUSTOM_WORDS = 15;
const HEBREW_INPUT_RE = /[\u0590-\u05FF'"\-\s]/;

function limitWords(value: string, maxWords: number): string {
  const words = value.trimStart().split(/\s+/);
  if (words.length === 1 && words[0] === '') return value.trimStart();
  if (words.length <= maxWords) return value;
  return words.slice(0, maxWords).join(' ');
}

/** Figma 13615:10486 — parent picks an additional change to suggest. */
export function ParentAdditionalChangeStep({
  childName,
  onConfirm,
  onBack,
}: ParentAdditionalChangeStepProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const layout = PARENT_ADDITIONAL_CHANGE;
  const titleId = 'parent-additional-change-title';
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [customText, setCustomText] = useState('');
  const [customError, setCustomError] = useState<string | null>(null);

  const customReady =
    customText.trim().length > 0 &&
    isHebrewChildName(customText) &&
    customError === null;
  const canSubmit = selectedId !== null || customReady;

  const resolveSubmitText = useCallback((): string => {
    if (customReady) return customText.trim();
    if (selectedId) {
      return (
        PARENT_POST_GAME_ADDITIONAL_CHANGE_OPTIONS.find((option) => option.id === selectedId)
          ?.title ?? ''
      );
    }
    return '';
  }, [customReady, customText, selectedId]);

  const handleSubmit = useCallback(() => {
    const text = resolveSubmitText();
    if (!text) return;
    onConfirm(text);
  }, [onConfirm, resolveSubmitText]);

  const handleOptionSelect = useCallback((id: string) => {
    setSelectedId(id);
    setCustomText('');
    setCustomError(null);
  }, []);

  const handleCustomChange = useCallback((raw: string) => {
    const sanitized = Array.from(raw)
      .filter((char) => HEBREW_INPUT_RE.test(char))
      .join('');
    const hadInvalid = sanitized.length !== raw.length;
    const limited = limitWords(sanitized, MAX_CUSTOM_WORDS);

    setCustomText(limited);
    setSelectedId(null);

    const trimmed = limited.trim();
    if (hadInvalid || (trimmed && !isHebrewChildName(trimmed))) {
      setCustomError(ONBOARDING_HEBREW_ONLY_ERROR);
      return;
    }

    setCustomError(null);
  }, []);

  const footerScrollPadPx =
    parentPostGameBlurFooterScrollPadPx() + getFunnelScrollContentEndPadPx();

  return (
    <FunnelStepRoot fitViewport className="flex h-full flex-col">
      <ParentPostGameGreenBackground />
      <OnboardingBackButton onClick={onBack} />

      <div className="relative z-10 min-h-0 flex-1">
        <div
          ref={scrollRef}
          className="h-full overflow-y-auto overscroll-contain v03-scroll-hidden"
        >
          <div
            className="flex w-full flex-col px-v03-gutter"
            style={{
              paddingTop: layout.contentTop,
              paddingBottom: footerScrollPadPx,
              gap: layout.sectionGap,
            }}
            aria-labelledby={titleId}
          >
            <div
              className="flex w-full flex-col items-end"
              style={{ gap: layout.headerGap }}
            >
              <h1
                id={titleId}
                className="w-full max-w-[307px] self-center text-center font-simpler font-black text-white"
                style={{
                  fontSize: layout.headline.fontSize,
                  lineHeight: `${layout.headline.lineHeight}px`,
                }}
              >
                {parentAdditionalChangeTitle(childName)}
              </h1>
              <p
                className="w-full text-center font-simpler font-normal text-[#B0C6BF]"
                style={{
                  fontSize: layout.subtitle.fontSize,
                  lineHeight: `${layout.subtitle.lineHeight}px`,
                }}
              >
                {parentAdditionalChangeSubtitle}
              </p>
            </div>

            <div className="flex w-full flex-col" style={{ gap: layout.optionsGap }}>
              <div
                className="flex w-full flex-col"
                style={{ gap: layout.cardsGap }}
                role="radiogroup"
                aria-label="בחירת שינוי נוסף"
              >
                {PARENT_POST_GAME_ADDITIONAL_CHANGE_OPTIONS.map((option) => {
                  const selected = selectedId === option.id;
                  return (
                    <SelectableOptionCard
                      key={option.id}
                      selected={selected}
                      onSelect={() => handleOptionSelect(option.id)}
                      borderRadius={layout.card.borderRadius}
                      paddingX={layout.card.paddingX}
                      paddingY={layout.card.paddingY}
                      contentGap={layout.cardTextGap}
                      textLayout="flex"
                    >
                      <span
                        className="w-full font-simpler font-bold text-white"
                        style={{
                          fontSize: layout.cardTitle.fontSize,
                          lineHeight: `${layout.cardTitle.lineHeight}px`,
                        }}
                      >
                        {option.title}
                      </span>
                      <span
                        className="w-full font-simpler font-normal text-[#B0C6BF]"
                        style={{
                          fontSize: layout.cardDesc.fontSize,
                          lineHeight: `${layout.cardDesc.lineHeight}px`,
                        }}
                      >
                        {option.description}
                      </span>
                    </SelectableOptionCard>
                  );
                })}

                <div className="flex w-full items-center gap-5">
                  <div className="h-px flex-1 bg-[#90A79F]/70" aria-hidden />
                  <span className="font-simpler text-[14px] font-normal uppercase leading-5 text-[#90A79F]">
                    {PARENT_ADDITIONAL_CHANGE_OR}
                  </span>
                  <div className="h-px flex-1 bg-[#90A79F]/70" aria-hidden />
                </div>

                <div
                  className="flex w-full flex-col items-stretch"
                  style={{ gap: layout.customField.labelGap, minHeight: layout.customField.minHeight }}
                >
                  <span className="w-full px-[10px] text-right font-simpler text-[16px] font-normal leading-[21.6px] text-white">
                    {PARENT_CUSTOM_CHANGE_LABEL}
                  </span>
                  <textarea
                    value={customText}
                    onChange={(event) => handleCustomChange(event.target.value)}
                    placeholder={PARENT_CUSTOM_CHANGE_PLACEHOLDER}
                    rows={4}
                    dir="rtl"
                    className="min-h-[96px] w-full resize-none bg-white/[0.05] text-right font-simpler text-[16px] font-normal leading-[21.6px] text-white placeholder:text-[#7A8D87] focus:outline-none"
                    style={{
                      borderRadius: layout.customField.inputBorderRadius,
                      padding: `${layout.customField.inputPaddingY}px ${layout.customField.inputPaddingX}px`,
                      outline: `${layout.customField.outlineWidth}px solid rgba(255, 255, 255, 0.2)`,
                      outlineOffset: -layout.customField.outlineWidth,
                    }}
                    aria-label={PARENT_CUSTOM_CHANGE_LABEL}
                    aria-invalid={customError ? true : undefined}
                  />
                  {customError ? (
                    <p className="w-full px-[10px] text-right font-simpler text-sm text-red-300">
                      {customError}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>

        <ParentPostGameBlurFooter>
          <div
            className="mx-auto flex w-full flex-col items-start gap-2"
            style={{ maxWidth: ONBOARDING_STACKED_FOOTER_CONTENT_W_PX }}
          >
            <button
              type="button"
              disabled={!canSubmit}
              onClick={handleSubmit}
              className={ONBOARDING_SELECTABLE_OPTION.primaryCtaClass}
            >
              {parentSendChangeToChildLabel(childName)}
            </button>
          </div>
        </ParentPostGameBlurFooter>
      </div>
    </FunnelStepRoot>
  );
}
