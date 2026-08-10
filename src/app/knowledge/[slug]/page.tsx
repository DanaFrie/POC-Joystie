import { notFound } from 'next/navigation';
import { LANDING_BLOG } from '@/constants/landing-marketing';
import { MarketingKnowledgeArticle } from '@/components/landing/MarketingKnowledgeArticle';
import { marketingRubik } from '@/lib/fonts';

/** Pre-render at build — served from CDN edge on App Hosting. */
export const dynamic = 'force-static';

export function generateStaticParams() {
  return LANDING_BLOG.filter((post) => post.slug).map((post) => ({ slug: post.slug! }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const post = LANDING_BLOG.find((p) => p.slug === params.slug);
  if (!post) return {};
  return {
    title: `${post.title} | Joystie`,
    description: post.excerpt,
  };
}

export default function KnowledgeArticlePage({ params }: { params: { slug: string } }) {
  const post = LANDING_BLOG.find((p) => p.slug === params.slug && p.body);
  if (!post) notFound();

  return (
    <div className={marketingRubik.variable}>
      <MarketingKnowledgeArticle post={post} />
    </div>
  );
}
