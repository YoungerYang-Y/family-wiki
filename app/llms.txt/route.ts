import { allWikis } from 'contentlayer/generated';
import { generateLlmsTxt } from '@/lib/llms';

export const dynamic = 'force-static';
export const revalidate = 3600;

export async function GET() {
  const docs = allWikis
    .filter((d) => !d.draft)
    .map((d) => ({
      slug: d.slug,
      title: d.title,
      description: d.description,
      category: d.category,
      url: d.url,
    }));
  const body = generateLlmsTxt(docs);
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
    },
  });
}
