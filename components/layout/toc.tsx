'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export interface TocItem {
  depth: number;
  text: string;
  slug: string;
}

function extractHeadingsFromDOM(): TocItem[] {
  if (typeof document === 'undefined') return [];
  const items: TocItem[] = [];
  const nodes = document.querySelectorAll('article h2, article h3, article h4');
  nodes.forEach((node) => {
    const id = node.id;
    const depth = parseInt(node.tagName.charAt(1), 10);
    if (id && depth >= 2 && depth <= 4) items.push({ depth, text: node.textContent ?? '', slug: id });
  });
  return items;
}

export function TableOfContents({ items: initialItems = [] }: { items?: TocItem[] }) {
  const [items, setItems] = useState<TocItem[]>(initialItems);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (initialItems.length === 0) {
      const t = setTimeout(() => setItems(extractHeadingsFromDOM()), 100);
      return () => clearTimeout(t);
    }
  }, [initialItems.length]);

  useEffect(() => {
    if (items.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: '-80px 0% -80% 0%', threshold: 0 }
    );
    const els = items.map((i) => document.getElementById(i.slug)).filter(Boolean) as HTMLElement[];
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <aside className="sticky top-20 hidden w-52 shrink-0 lg:block">
      <h3 className="mb-2 text-sm font-semibold">本页目录</h3>
      <ul className="space-y-1 border-l pl-4 text-sm">
        {items.map((item) => (
          <li
            key={item.slug}
            style={{ paddingLeft: (item.depth - 1) * 8 }}
            className={cn(
              'border-l-2 -ml-px pl-2 transition-colors',
              activeId === item.slug ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <a href={`#${item.slug}`} className="block py-0.5">
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
