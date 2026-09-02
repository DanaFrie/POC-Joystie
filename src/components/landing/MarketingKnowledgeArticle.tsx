import Image from 'next/image';
import Link from 'next/link';
import {
  LANDING_BLOG,
  type LandingBlogBlock,
  type LandingBlogPost,
} from '@/constants/landing-marketing';
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
}: {
  blocks: readonly LandingBlogBlock[];
  figureSrc: string;
}) {
  return (
    <div className="space-y-5 text-right font-rubik text-base leading-[1.55] tracking-[-0.2px] text-[#1a2b2f] md:space-y-6 md:text-[18px] md:leading-[1.5]">
      {blocks.map((block, i) => {
        if (block.type === 'p') {
          return <p key={i}>{block.text}</p>;
        }
        if (block.type === 'h') {
          return (
            <h2
              key={i}
              className="pt-2 text-right font-rubik text-[22px] font-bold leading-[1.25] tracking-[-0.4px] text-[#05161a] md:text-[28px]"
            >
              {block.text}
            </h2>
          );
        }
        if (block.type === 'ol') {
          return (
            <ol key={i} className="list-decimal space-y-2 pr-6 marker:font-bold">
              {block.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ol>
          );
        }
        if (block.type === 'ul') {
          return (
            <ul key={i} className="list-disc space-y-3 pr-6 marker:text-[#00b37a]">
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
            <h2 className="text-right font-rubik text-[22px] font-bold leading-[1.25] tracking-[-0.4px] text-[#05161a] md:text-[28px]">
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
                    <ol className="list-decimal space-y-1.5 pr-6">
                      {path.steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  </div>
                ))}
                {item.steps ? (
                  <ol className="list-decimal space-y-1.5 pr-6">
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
  /* Points toward older (visual left). Mirror for “הקודם” on the right. */
  const mirror = direction === 'prev';
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
  const articles = LANDING_BLOG.filter((p) => p.slug && p.body);
  const index = articles.findIndex((p) => p.slug === post.slug);
  if (index < 0) return null;

  const older = articles[index + 1];
  const newer = articles[index - 1];

  return (
    <nav
      className="mt-12 flex items-stretch justify-between gap-3 border-t border-[#eef2f2] pt-8 md:mt-16 md:gap-5 md:pt-10"
      aria-label="ניווט בין מאמרים"
    >
      {/* RTL: start (right) = newer / previous in list toward YouTube */}
      {newer ? (
        <Link
          href={`/knowledge/${newer.slug}`}
          className="group flex min-w-0 flex-1 items-center gap-3 rounded-[22px] bg-[#f7f9f9] px-4 py-4 text-right shadow-[0_2px_12px_rgba(5,22,26,0.04)] transition-[background,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:bg-[#eef6f3] hover:shadow-[0_6px_18px_rgba(5,22,26,0.08)] md:gap-4 md:px-5 md:py-5"
        >
          <ArticleChevron direction="prev" />
          <span className="min-w-0 flex-1">
            <span className="mb-1 block font-rubik text-xs text-[#6b7c80] md:text-sm">הקודם</span>
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
          href={`/knowledge/${older.slug}`}
          className="group flex min-w-0 flex-1 items-center gap-3 rounded-[22px] bg-[#f7f9f9] px-4 py-4 text-left shadow-[0_2px_12px_rgba(5,22,26,0.04)] transition-[background,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:bg-[#eef6f3] hover:shadow-[0_6px_18px_rgba(5,22,26,0.08)] md:gap-4 md:px-5 md:py-5"
          dir="ltr"
        >
          <span className="min-w-0 flex-1 text-right" dir="rtl">
            <span className="mb-1 block font-rubik text-xs text-[#6b7c80] md:text-sm">הבא</span>
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

export function MarketingKnowledgeArticle({ post }: { post: LandingBlogPost }) {
  const bodyHasFigure = Boolean(post.body?.some((b) => b.type === 'figure'));
  const thumbSrc = post.thumb ?? null;
  const figureSrc = post.image;
  /* Same asset as in-body figure → show once (mid-article figure only). */
  const showHeroThumb = Boolean(thumbSrc && !(bodyHasFigure && thumbSrc === figureSrc));

  return (
    <div
      className="v03-knowledge-article-root min-h-screen bg-white text-right font-rubik text-[#092125] [direction:rtl]"
      dir="rtl"
    >
      <MarketingNav homeHashPrefix="/" chrome="onLight" />

      {/* Continuous white surface — article + footer (footer full-bleed like about) */}
      <div className="bg-white">
        <main className="mx-auto w-full max-w-[820px] px-6 pb-16 pt-28 md:px-8 md:pb-24 md:pt-36">
          <h1 className="mb-6 text-right font-rubik text-[28px] font-bold leading-[1.2] tracking-[-0.7px] text-[#05161a] md:mb-8 md:text-[42px] md:tracking-[-1.1px]">
            {post.title}
          </h1>

          <div className="mb-8 flex items-center justify-start gap-3 md:mb-10">
            <span className="md:hidden">
              <LandingAuthorAvatar src={post.avatar} alt={post.author} size="lg" />
            </span>
            <span className="hidden md:inline-flex">
              <LandingAuthorAvatar src={post.avatar} alt={post.author} size="xl" />
            </span>
            <p className="font-rubik text-base leading-none text-[#434343] md:text-lg">{post.author}</p>
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

          {post.body ? <ArticleBlocks blocks={post.body} figureSrc={figureSrc} /> : null}

          <ArticleBrowseNav post={post} />
        </main>

        {/* Full-bleed footer — same max-w-[1786px] as about (not capped at article column) */}
        <div className="pt-10 md:pt-[80px]">
          <MarketingFooter surface="light" />
        </div>
      </div>
    </div>
  );
}
