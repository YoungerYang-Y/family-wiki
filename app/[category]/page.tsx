import Link from 'next/link';
import { allWikis } from 'contentlayer/generated';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { getCategoryMeta } from '@/lib/categories';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  const categories = Array.from(new Set(allWikis.filter((d) => !d.draft).map((d) => d.category)));
  return categories.map((category) => ({ category }));
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  const meta = getCategoryMeta(category);
  const posts = allWikis
    .filter((d) => !d.draft && d.category === category)
    .sort((a, b) => {
      const aDate = a.date ? new Date(a.date).getTime() : 0;
      const bDate = b.date ? new Date(b.date).getTime() : 0;
      return bDate - aDate;
    });

  return (
    <div>
      <Breadcrumb items={[{ label: '首页', href: '/' }, { label: meta?.label ?? category }]} />
      <h1 className="text-2xl font-bold mb-4">{meta?.label ?? category}</h1>
      {meta?.description && <p className="text-muted-foreground mb-6">{meta.description}</p>}
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
