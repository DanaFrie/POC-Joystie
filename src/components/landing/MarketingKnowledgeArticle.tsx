import Image from 'next/image';
import type { LandingBlogBlock, LandingBlogPost } from '@/constants/landing-marketing';
import { MarketingNav } from '@/components/landing/MarketingNav';
import { MarketingFooter } from '@/components/landing/MarketingFooter';

function ArticleBlocks({ blocks }: { blocks: readonly LandingBlogBlock[] }) {
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

export function MarketingKnowledgeArticle({ post }: { post: LandingBlogPost }) {
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
            <p className="font-rubik text-base text-[#434343] md:text-lg">{post.author}</p>
            <div className="relative size-10 shrink-0 overflow-hidden rounded-full md:size-12">
              <Image src={post.avatar} alt="" fill className="object-cover" sizes="48px" />
            </div>
          </div>

          <div className="mb-8 flex justify-center md:mb-12">
            <Image
              src={post.image}
              alt=""
              width={1600}
              height={1200}
              priority
              className="h-auto w-full md:w-1/2"
              sizes="(max-width: 767px) 100vw, 50vw"
            />
          </div>

          {post.body ? <ArticleBlocks blocks={post.body} /> : null}
        </main>

        {/* Full-bleed footer — same max-w-[1786px] as about (not capped at article column) */}
        <div className="pt-10 md:pt-[80px]">
          <MarketingFooter surface="light" />
        </div>
      </div>
    </div>
  );
}
