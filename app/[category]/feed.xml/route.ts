import { allWikis } from 'contentlayer/generated';
import { createFeed, feedHeaders } from '@/lib/feed';
import { getCategoryMeta } from '@/lib/categories';
import { siteConfig } from '@/config/site';

export const dynamic = 'force-static';
export const revalidate = 3600;

interface RouteParams {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  const categories = Array.from(
    new Set(allWikis.filter((d) => !d.draft).map((d) => d.category))
  );
  return categories.map((category) => ({ category }));
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { category } = await params;
  const baseUrl = siteConfig.url.replace(/\/$/, '');
  const meta = getCategoryMeta(category);

  const docs = allWikis
    .filter((d) => !d.draft && d.category === category)
    .map((d) => ({
      title: d.title,
      description: d.description ?? '',
      url: d.url,
      date: d.date ? new Date(d.date) : new Date(),
      lastModified: d.lastModified ? new Date(d.lastModified) : undefined,
      author: d.author,
      content: undefined,
    }))
    .sort((a, b) => (b.lastModified ?? b.date).getTime() - (a.lastModified ?? a.date).getTime());

  const feedTitle = `${meta?.label ?? category} - ${siteConfig.title}`;
  const feedLink = `${baseUrl}/${category}`;

  const feed = createFeed(docs, {
    title: feedTitle,
    description: meta?.description ?? `${siteConfig.description}（${meta?.label ?? category}）`,
    link: feedLink,
    id: feedLink,
  });

  const xml = feed.rss2();

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      ...feedHeaders,
    },
  });
}
