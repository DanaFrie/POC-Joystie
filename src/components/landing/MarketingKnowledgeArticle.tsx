'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { LandingBlogBlock, LandingBlogPost } from '@/constants/landing-marketing';
import { getLandingBlog } from '@/constants/landing-i18n';
import {
  LandingLocaleProvider,
  landingHomePath,
  landingKnowledgePath,
  type LandingLocale,
  useLandingLocale,
} from '@/components/landing/LandingLocaleContext';
import { MarketingNav } from '@/components/landing/MarketingNav';
import { MarketingFooter } from '@/components/landing/MarketingFooter';
import { LandingAuthorAvatar } from '@/components/landing/LandingAuthorAvatar';

function ArticleFigure({ src }: { src: string }) {
  return (
    <div className="flex justify-center py-2">
      <Image
        src={src}
        alt=""
        width={1600}
        height={1200}
        className="h-auto w-full max-w-[420px] rounded-[22px] shadow-[0_8px_28px_rgba(5,22,26,0.08)] md:w-1/2 md:max-w-none"
        sizes="(max-width: 767px) 100vw, 410px"
      />
    </div>
  );
}

function ArticleBlocks({
  blocks,
  figureSrc,
  isEn,
}: {
  blocks: readonly LandingBlogBlock[];
  figureSrc: string;
  isEn: boolean;
}) {
  const textAlign = isEn ? 'text-left' : 'text-right';
  const listPad = isEn ? 'pl-6' : 'pr-6';
  return (
    <div
      className={`space-y-5 font-rubik text-base leading-[1.55] tracking-[-0.2px] text-[#1a2b2f] md:space-y-6 md:text-[18px] md:leading-[1.5] ${textAlign}`}
    >
      {blocks.map((block, i) => {
        if (block.type === 'p') {
          return <p key={i}>{block.text}</p>;
        }
        if (block.type === 'h') {
          return (
            <h2
              key={i}
              className={`pt-2 font-rubik text-[22px] font-bold leading-[1.25] tracking-[-0.4px] text-[#05161a] md:text-[28px] ${textAlign}`}
            >
              {block.text}
            </h2>
          );
        }
        if (block.type === 'ol') {
          return (
            <ol key={i} className={`list-decimal space-y-2 ${listPad} marker:font-bold`}>
              {block.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ol>
          );
        }
        if (block.type === 'ul') {
          return (
            <ul key={i} className={`list-disc space-y-3 ${listPad} marker:text-[#00b37a]`}>
              {block.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          );
        }
        if (block.type === 'figure') {
          return <ArticleFigure key={i} src={figureSrc} />;
        }
        return (
          <div key={i} className="space-y-6 py-2">
            <h2
              className={`font-rubik text-[22px] font-bold leading-[1.25] tracking-[-0.4px] text-[#05161a] md:text-[28px] ${textAlign}`}
            >
              {block.title}
            </h2>
            {block.items.map((item, j) => (
              <div key={j} className="space-y-3">
                <h3 className="font-rubik text-lg font-bold text-[#05161a] md:text-[22px]">
                  <span className="text-[#00b37a]">{j + 1}. </span>
                  {item.title}
                </h3>
                {item.intro ? <p>{item.intro}</p> : null}
                {item.paths?.map((path) => (
                  <div key={path.label} className="space-y-2">
                    <p className="font-bold text-[#223F46]">{path.label}:</p>
                    <ol className={`list-decimal space-y-1.5 ${listPad}`}>
                      {path.steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  </div>
                ))}
                {item.steps ? (
                  <ol className={`list-decimal space-y-1.5 ${listPad}`}>
                    {item.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                ) : null}
                {item.note ? (
                  <p className="text-sm leading-[1.45] text-[#434343] md:text-base">{item.note}</p>
                ) : null}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function ArticleChevron({ direction }: { direction: 'prev' | 'next' }) {
  const mirror = direction === 'next';
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="8"
      height="14"
      viewBox="0 0 7 12"
      fill="none"
      className={`h-[14px] w-[8px] shrink-0 text-[#05161a] ${mirror ? 'rotate-180' : ''}`}
      aria-hidden
    >
      <path
        d="M6.15 0.75L0.75 6.15L6.15 11.55"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArticleBrowseNav({ post }: { post: LandingBlogPost }) {
  const locale = useLandingLocale();
  const isEn = locale === 'en';
  const articles = getLandingBlog(locale).filter((p) => p.slug && p.body);
  const index = articles.findIndex((p) => p.slug === post.slug);
  if (index < 0) return null;

  const older = articles[index + 1];
  const newer = articles[index - 1];
  const prevLabel = isEn ? 'Previous' : 'הקודם';
  const nextLabel = isEn ? 'Next' : 'הבא';
  const navLabel = isEn ? 'Article navigation' : 'ניווט בין מאמרים';

  return (
    <nav
      className="mt-12 flex items-stretch justify-between gap-3 border-t border-[#eef2f2] pt-8 md:mt-16 md:gap-5 md:pt-10"
      aria-label={navLabel}
      dir={isEn ? 'ltr' : 'rtl'}
    >
      {newer ? (
        <Link
          href={landingKnowledgePath(locale, newer.slug!)}
          className={`group flex min-w-0 flex-1 items-center gap-3 rounded-[22px] bg-[#f7f9f9] px-4 py-4 shadow-[0_2px_12px_rgba(5,22,26,0.04)] transition-[background,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:bg-[#eef6f3] hover:shadow-[0_6px_18px_rgba(5,22,26,0.08)] md:gap-4 md:px-5 md:py-5 ${
            isEn ? 'text-left' : 'text-right'
          }`}
        >
          <ArticleChevron direction="prev" />
          <span className="min-w-0 flex-1">
            <span className="mb-1 block font-rubik text-xs text-[#6b7c80] md:text-sm">
              {prevLabel}
            </span>
            <span className="line-clamp-2 font-rubik text-sm font-bold leading-[1.3] text-[#05161a] md:text-base">
              {newer.title}
            </span>
          </span>
        </Link>
      ) : (
        <span className="flex-1" aria-hidden />
      )}

      {older ? (
        <Link
          href={landingKnowledgePath(locale, older.slug!)}
          className={`group flex min-w-0 flex-1 items-center gap-3 rounded-[22px] bg-[#f7f9f9] px-4 py-4 shadow-[0_2px_12px_rgba(5,22,26,0.04)] transition-[background,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:bg-[#eef6f3] hover:shadow-[0_6px_18px_rgba(5,22,26,0.08)] md:gap-4 md:px-5 md:py-5 ${
            isEn ? 'text-left' : 'text-left'
          }`}
          dir={isEn ? 'ltr' : 'ltr'}
        >
          <span className={`min-w-0 flex-1 ${isEn ? 'text-left' : 'text-right'}`} dir={isEn ? 'ltr' : 'rtl'}>
            <span className="mb-1 block font-rubik text-xs text-[#6b7c80] md:text-sm">
              {nextLabel}
            </span>
            <span className="line-clamp-2 font-rubik text-sm font-bold leading-[1.3] text-[#05161a] md:text-base">
              {older.title}
            </span>
          </span>
          <ArticleChevron direction="next" />
        </Link>
      ) : (
        <span className="flex-1" aria-hidden />
      )}
    </nav>
  );
}

function KnowledgeArticleInner({ post }: { post: LandingBlogPost }) {
  const locale = useLandingLocale();
  const isEn = locale === 'en';
  const bodyHasFigure = Boolean(post.body?.some((b) => b.type === 'figure'));
  const thumbSrc = post.thumb ?? null;
  const figureSrc = post.image;
  const showHeroThumb = Boolean(thumbSrc && !(bodyHasFigure && thumbSrc === figureSrc));
  const homePrefix = landingHomePath(locale);
  const textAlign = isEn ? 'text-left' : 'text-right';
  const fontClass = isEn ? 'font-sf' : 'font-rubik';

  return (
    <div
      className={`v03-knowledge-article-root marketing-page-fade min-h-screen bg-white text-[#092125] ${fontClass} ${textAlign} ${
        isEn ? '[direction:ltr]' : '[direction:rtl]'
      }`}
      dir={isEn ? 'ltr' : 'rtl'}
      lang={locale}
    >
      <MarketingNav
        homeHashPrefix={homePrefix === '/en' ? '/en' : '/'}
        chrome="onLight"
      />

      <div className="bg-white">
        <main className="mx-auto w-full max-w-[820px] px-6 pb-16 pt-28 md:px-8 md:pb-24 md:pt-36">
          <h1
            className={`mb-6 font-rubik text-[28px] font-bold leading-[1.2] tracking-[-0.7px] text-[#05161a] md:mb-8 md:text-[42px] md:tracking-[-1.1px] ${textAlign}`}
          >
            {post.title}
          </h1>

          <div className="mb-8 flex items-center justify-start gap-3 md:mb-10">
            <span className="md:hidden">
              <LandingAuthorAvatar src={post.avatar} alt={post.author} size="lg" />
            </span>
            <span className="hidden md:inline-flex">
              <LandingAuthorAvatar src={post.avatar} alt={post.author} size="xl" />
            </span>
            <p className="font-rubik text-base leading-none text-[#434343] md:text-lg">
              {post.author}
            </p>
          </div>

          {showHeroThumb && thumbSrc ? (
            <div className="mb-8 flex justify-center md:mb-12">
              <Image
                src={thumbSrc}
                alt=""
                width={800}
                height={640}
                priority
                className="h-auto w-full max-w-[420px] rounded-[22px] shadow-[0_8px_28px_rgba(5,22,26,0.08)] md:w-1/2 md:max-w-none"
                sizes="(max-width: 767px) 100vw, 410px"
              />
            </div>
          ) : null}

          {post.body ? (
            <ArticleBlocks blocks={post.body} figureSrc={figureSrc} isEn={isEn} />
          ) : null}

          <ArticleBrowseNav post={post} />
        </main>

        <div className="pt-10 md:pt-[80px]">
          <MarketingFooter surface="light" />
        </div>
      </div>
    </div>
  );
}

export function MarketingKnowledgeArticle({
  post,
  locale = 'he',
}: {
  post: LandingBlogPost;
  locale?: LandingLocale;
}) {
  return (
    <LandingLocaleProvider locale={locale}>
      <KnowledgeArticleInner post={post} />
    </LandingLocaleProvider>
  );
}
