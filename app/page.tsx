import Link from 'next/link';
import { allWikis } from 'contentlayer/generated';
import { getSidebarCategories } from '@/lib/categories';
import { JsonLd } from '@/components/shared/json-ld';
import { buildWebSiteJsonLd } from '@/lib/json-ld';
import { siteConfig } from '@/config/site';

export default function HomePage() {
  const posts = allWikis.filter((doc) => !doc.draft);
  const categories = getSidebarCategories(posts);
  const recent = [...posts].sort((a, b) => {
    const aDate = a.date ? new Date(a.date).getTime() : 0;
    const bDate = b.date ? new Date(b.date).getTime() : 0;
    return bDate - aDate;
  }).slice(0, 10);

  return (
    <div>
      <JsonLd data={buildWebSiteJsonLd(siteConfig)} />
      <h1 className="text-3xl font-bold">Family Wiki</h1>
      <p className="mt-2 text-muted-foreground">个人决策型知识库</p>

      {categories.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-4">分类</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/${cat.name}`}
                className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                {cat.icon && <span className="text-2xl">{cat.icon}</span>}
                <div>
                  <div className="font-medium">{cat.label}</div>
                  <div className="text-sm text-muted-foreground">{cat.count} 篇文章</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {recent.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-4">最近更新</h2>
          <ul className="space-y-2">
            {recent.map((doc) => (
              <li key={doc.slug}>
                <Link href={doc.url} className="text-primary hover:underline">
                  {doc.title}
                </Link>
                <span className="text-muted-foreground text-sm ml-2">
                  {doc.category} · {doc.readingTime} 分钟
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
