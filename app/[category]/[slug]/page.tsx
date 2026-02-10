import { notFound } from 'next/navigation';
import Link from 'next/link';
import { allWikis } from 'contentlayer/generated';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { TableOfContents } from '@/components/layout/toc';
import { MdxContent } from '@/components/mdx/mdx-content';
import { JsonLd } from '@/components/shared/json-ld';
import { getCategoryMeta } from '@/lib/categories';
import {
  buildArticleJsonLd,
  buildBreadcrumbListJsonLd,
  type BreadcrumbItem,
} from '@/lib/json-ld';
import { siteConfig } from '@/config/site';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface PageProps {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { category, slug } = await params;
  const slugPath = `${category}/${slug}`;
  const doc = allWikis.find((d) => d.slug === slugPath && !d.draft);
  if (!doc) return { title: '未找到' };
  const url = `${siteConfig.url}${doc.url}`;
  return {
    title: doc.title,
    description: doc.description,
    alternates: { canonical: url },
    openGraph: {
      title: doc.title,
      description: doc.description ?? undefined,
      url,
      siteName: siteConfig.title,
      type: 'article',
      ...(doc.date && { publishedTime: doc.date }),
      ...(doc.lastModified && { modifiedTime: doc.lastModified }),
    },
    twitter: {
      card: 'summary_large_image',
      title: doc.title,
      description: doc.description ?? undefined,
    },
  };
}

export async function generateStaticParams() {
  return allWikis.filter((doc) => !doc.draft).map((doc) => {
    const parts = doc.slug.split('/');
    const category = parts[0] ?? doc.slug;
    const slug = (parts.slice(1).join('/') || parts[0]) ?? doc.slug;
    return { category, slug };
  });
}

export default async function WikiArticlePage({ params }: PageProps) {
  const { category, slug } = await params;
  const slugPath = `${category}/${slug}`;
  const doc = allWikis.find((d) => d.slug === slugPath && !d.draft);
  if (!doc) notFound();

  const categoryMeta = getCategoryMeta(doc.category);
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: '首页', href: '/' },
    { label: categoryMeta?.label ?? doc.category, href: `/${doc.category}` },
    { label: doc.title },
  ];
  const articleJsonLd = buildArticleJsonLd(
    {
      title: doc.title,
      description: doc.description,
      slug: doc.slug,
      url: doc.url,
      date: doc.date,
      lastModified: doc.lastModified,
      author: doc.author,
      tags: doc.tags,
    },
    siteConfig.url
  );
  const breadcrumbJsonLd = buildBreadcrumbListJsonLd(breadcrumbItems, siteConfig.url);

  return (
    <div className="flex gap-8">
      <JsonLd data={[articleJsonLd, breadcrumbJsonLd]} />
      <article className="min-w-0 flex-1 prose prose-slate dark:prose-invert max-w-none">
        <Breadcrumb items={breadcrumbItems} />
        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">{doc.title}</h1>
          {doc.description && <p className="text-muted-foreground mt-1">{doc.description}</p>}
          <div className="flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground">
            {doc.date && (
              <time dateTime={doc.date} itemProp="datePublished">
                {format(new Date(doc.date), 'yyyy年M月d日', { locale: zhCN })}
              </time>
            )}
            <span>·</span>
            <span>{doc.readingTime} 分钟阅读</span>
            {doc.tags && doc.tags.length > 0 && (
              <>
                <span>·</span>
                {doc.tags.map((tag) => (
                  <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`} className="hover:text-foreground">
                    {tag}
                  </Link>
                ))}
              </>
            )}
          </div>
        </header>
        <MdxContent code={doc.body.code} />
      </article>
      <TableOfContents />
    </div>
  );
}
