import { notFound } from 'next/navigation';
import { LANDING_BLOG_EN } from '@/constants/landing-blog-en';
import { MarketingKnowledgeArticle } from '@/components/landing/MarketingKnowledgeArticle';
import { marketingRubik } from '@/lib/fonts';
import type { Metadata } from 'next';

/** Pre-render at build — served from CDN edge on App Hosting. */
export const dynamic = 'force-static';

export function generateStaticParams() {
  return LANDING_BLOG_EN.filter((post) => post.slug).map((post) => ({ slug: post.slug! }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = LANDING_BLOG_EN.find((p) => p.slug === params.slug);
  if (!post) return {};
  return {
    title: `${post.title} | Joystie`,
    description: post.excerpt,
    alternates: {
      languages: {
        he: `/knowledge/${params.slug}`,
        en: `/en/knowledge/${params.slug}`,
      },
    },
  };
}

export default function EnglishKnowledgeArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const post = LANDING_BLOG_EN.find((p) => p.slug === params.slug && p.body);
  if (!post) notFound();

  return (
    <div className={marketingRubik.variable}>
      <MarketingKnowledgeArticle post={post} locale="en" />
    </div>
  );
}
