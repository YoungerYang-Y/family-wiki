import Link from 'next/link';
import { allWikis } from 'contentlayer/generated';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface PageProps {
  params: Promise<{ tag: string }>;
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const posts = allWikis
    .filter((d) => !d.draft && d.tags?.includes(decodedTag))
    .sort((a, b) => {
      const aDate = a.date ? new Date(a.date).getTime() : 0;
      const bDate = b.date ? new Date(b.date).getTime() : 0;
      return bDate - aDate;
    });

  return (
    <div>
      <Breadcrumb items={[{ label: '首页', href: '/' }, { label: '标签', href: '/tags' }, { label: decodedTag }]} />
      <h1 className="text-2xl font-bold mb-4">标签: {decodedTag}</h1>
      <ul className="space-y-3">
        {posts.map((doc) => (
          <li key={doc.slug} className="flex flex-wrap items-baseline gap-2">
            <Link href={doc.url} className="font-medium text-primary hover:underline">
              {doc.title}
            </Link>
            {doc.date && (
              <span className="text-sm text-muted-foreground">
                {format(new Date(doc.date), 'yyyy-MM-dd', { locale: zhCN })}
              </span>
            )}
            <span className="text-sm text-muted-foreground">{doc.readingTime} 分钟</span>
          </li>
        ))}
      </ul>
      {posts.length === 0 && <p className="text-muted-foreground">暂无文章</p>}
    </div>
  );
}
