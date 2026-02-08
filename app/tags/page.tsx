import Link from 'next/link';
import { allWikis } from 'contentlayer/generated';

export default function TagsPage() {
  const tagCount: Record<string, number> = {};
  for (const doc of allWikis.filter((d) => !d.draft)) {
    for (const tag of doc.tags ?? []) {
      tagCount[tag] = (tagCount[tag] ?? 0) + 1;
    }
  }
  const tags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">标签</h1>
      <div className="flex flex-wrap gap-2">
        {tags.map(([tag, count]) => (
          <Link
            key={tag}
            href={`/tags/${encodeURIComponent(tag)}`}
            className="rounded-md border bg-muted/50 px-3 py-1 text-sm hover:bg-muted"
          >
            {tag} ({count})
          </Link>
        ))}
      </div>
      {tags.length === 0 && <p className="text-muted-foreground">暂无标签</p>}
    </div>
  );
}
