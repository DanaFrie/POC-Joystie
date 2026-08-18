import Image from 'next/image';
import Link from 'next/link';
import { LANDING_BLOG, type LandingBlogPost } from '@/constants/landing-marketing';
import { LandingReveal } from '@/components/landing/LandingReveal';

function KnowledgeCard({
  post,
  variant,
}: {
  post: LandingBlogPost;
  variant: 'mobile' | 'desktop';
}) {
  const mobile = variant === 'mobile';
  const card = (
    <article
      className={
        mobile
          ? 'flex h-full w-[232px] shrink-0 flex-col rounded-[28px] bg-white/[0.07] px-4 pb-5 pt-3'
          : 'flex h-full flex-col rounded-[28px] bg-white/[0.07] px-6 pb-6 pt-4 transition-transform duration-500 ease-out hover:-translate-y-1'
      }
    >
      <div
        className={
          mobile
            ? 'relative mb-4 aspect-[200/160] w-full shrink-0 overflow-hidden rounded-[18px]'
            : 'relative mb-6 aspect-[279/220] w-full shrink-0 overflow-hidden rounded-[18px]'
        }
      >
        <Image
          src={post.thumb ?? post.image}
          alt=""
          fill
          loading="lazy"
          decoding="async"
          className="object-cover object-top"
          sizes={mobile ? '232px' : '313px'}
        />
      </div>
      <div
        className={
          mobile
            ? 'mb-2 flex items-center justify-end gap-2'
            : 'mb-3 flex items-center justify-end gap-3'
        }
      >
        <p
          className={
            mobile
              ? 'flex-1 text-right font-rubik text-sm tracking-[-0.4px] text-white'
              : 'flex-1 text-right font-rubik text-[20px] tracking-[-0.4px] text-white'
          }
        >
          {post.author}
        </p>
        <div
          className={
            mobile
              ? 'relative size-8 shrink-0 overflow-hidden rounded-full'
              : 'relative size-9 shrink-0 overflow-hidden rounded-full'
          }
        >
          <Image
            src={post.avatar}
            alt=""
            fill
            loading="lazy"
            decoding="async"
            className="object-cover"
            sizes={mobile ? '32px' : '36px'}
          />
        </div>
      </div>
      <h3
        className={
          mobile
            ? 'mb-2 text-right font-rubik text-base font-bold leading-[1.1] tracking-[-0.5px] text-white'
            : 'mb-3 text-right font-rubik text-2xl font-bold leading-[1.1] tracking-[-0.72px] text-white'
        }
      >
        {post.title}
      </h3>
      <p
        className={
          mobile
            ? 'mt-auto text-right font-rubik text-xs leading-[1.28] text-white/80'
            : 'mt-auto text-right font-rubik text-base leading-[1.28] tracking-[-0.32px] text-white/80'
        }
      >
        {post.excerpt}
      </p>
    </article>
  );

  if (!post.slug) return card;

  return (
    <Link
      href={`/knowledge/${post.slug}`}
      className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-[#00ffb3]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05161a]"
      aria-label={post.title}
    >
      {card}
    </Link>
  );
}

export function MarketingKnowledge() {
  return (
    <section id="knowledge" className="landing-section landing-gutter-md py-12 md:py-24">
      <div className="mx-auto flex max-w-[1000px] flex-col gap-6 md:gap-8">
        <LandingReveal className="flex flex-col gap-4 px-6 md:flex-row md:items-center md:justify-between md:gap-10 md:px-0">
          <h2 className="bg-gradient-to-b from-[#efefef] from-[10%] to-[#d1d1d1] to-[94%] bg-clip-text text-right font-rubik text-[28px] font-bold leading-[1.15] tracking-[-0.9px] text-transparent md:text-[40px] lg:text-[45px]">
            מרכז הידע של ג׳ויסטי
          </h2>
        </LandingReveal>

        {/*
          Mobile cards strip — horizontal scroll only.
          touch-pan-x + overscroll-x-contain: swipe X through cards; Y gestures don’t scroll this strip.
        */}
        <div className="flex items-stretch gap-4 overflow-x-auto overflow-y-hidden overscroll-x-contain touch-pan-x px-6 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
          {LANDING_BLOG.map((post, index) => (
            <LandingReveal
              key={post.slug ?? post.title}
              delayMs={index * 90}
              className="flex shrink-0 self-stretch"
            >
              <KnowledgeCard post={post} variant="mobile" />
            </LandingReveal>
          ))}
        </div>

        <div className="hidden items-stretch gap-[30px] lg:grid lg:grid-cols-3">
          {LANDING_BLOG.map((post, index) => (
            <LandingReveal key={post.slug ?? post.title} delayMs={100 + index * 110} className="h-full">
              <KnowledgeCard post={post} variant="desktop" />
            </LandingReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
