import { allWikis } from 'contentlayer/generated';
import { createFeed, feedHeaders } from '@/lib/feed';

export const dynamic = 'force-static';
export const revalidate = 3600;

export async function GET() {
  const docs = allWikis
    .filter((d) => !d.draft)
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

  const feed = createFeed(docs);
  const xml = feed.atom1();

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
      ...feedHeaders,
    },
  });
}
