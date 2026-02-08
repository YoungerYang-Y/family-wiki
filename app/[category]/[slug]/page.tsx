import { notFound } from 'next/navigation';
import Link from 'next/link';
import { allWikis } from 'contentlayer/generated';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { TableOfContents } from '@/components/layout/toc';
import { MdxContent } from '@/components/mdx/mdx-content';
import { getCategoryMeta } from '@/lib/categories';
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
  return { title: doc.title, description: doc.description };
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

  return (
    <div className="flex gap-8">
      <article className="min-w-0 flex-1 prose prose-slate dark:prose-invert max-w-none">
        <Breadcrumb
          items={[
            { label: '首页', href: '/' },
            { label: categoryMeta?.label ?? doc.category, href: `/${doc.category}` },
            { label: doc.title },
          ]}
        />
        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">{doc.title}</h1>
          {doc.description && <p className="text-muted-foreground mt-1">{doc.description}</p>}
          <div className="flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground">
            {doc.date && (
              <time dateTime={doc.date}>
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
