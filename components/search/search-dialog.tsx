'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { loadSearchClient } from '@/lib/search-client';
import type { SearchResultItem } from '@/lib/search';
import { highlightQuery } from '@/lib/search';
import { cn } from '@/lib/utils';
import { Search as SearchIcon, Loader2 } from 'lucide-react';

export function SearchDialog() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<SearchResultItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  const runSearch = React.useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const c = await loadSearchClient();
        const items = c.search(q, { limit: 20 });
        setResults(items);
        setSelectedIndex(0);
      } catch (err) {
        console.error('Search failed:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const debouncedSearch = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(() => {
    if (debouncedSearch.current) clearTimeout(debouncedSearch.current);
    if (!open) return;
    debouncedSearch.current = setTimeout(() => runSearch(query), 200);
    return () => {
      if (debouncedSearch.current) clearTimeout(debouncedSearch.current);
    };
  }, [query, open, runSearch]);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
        if (!open) {
          setQuery('');
          setResults([]);
          setTimeout(() => inputRef.current?.focus(), 0);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    setSelectedIndex((i) => Math.min(i, Math.max(0, results.length - 1)));
  }, [results.length, open]);

  React.useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const child = el.children[selectedIndex] as HTMLElement | undefined;
    child?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      router.push(results[selectedIndex].url);
      setOpen(false);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const handleSelect = (item: SearchResultItem) => {
    router.push(item.url);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="搜索 (Ctrl+K)"
      >
        <SearchIcon className="h-4 w-4" />
        <span className="hidden sm:inline">搜索</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:inline-flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="top-[20%] max-w-xl gap-0 p-0 translate-y-0"
          showClose={true}
          onKeyDown={handleKeyDown}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogTitle className="sr-only">搜索文章</DialogTitle>
          <DialogDescription className="sr-only">输入关键词搜索 Wiki 文章，支持标题、描述与正文</DialogDescription>
          <div className="flex items-center border-b px-3">
            <SearchIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="search"
              placeholder="搜索…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-0 shadow-none focus-visible:ring-0"
              autoComplete="off"
              aria-label="搜索关键词"
            />
            {loading && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />}
          </div>
          <div
            ref={listRef}
            className="max-h-[60vh] overflow-y-auto"
            role="listbox"
            aria-label="搜索结果"
          >
            {results.length === 0 && !loading && query.trim() && (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">未找到相关结果</p>
            )}
            {results.length === 0 && !loading && !query.trim() && (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">输入关键词搜索</p>
            )}
            {results.map((item, i) => (
              <button
                key={item.slug}
                type="button"
                role="option"
                aria-selected={i === selectedIndex}
                className={cn(
                  'w-full px-4 py-3 text-left text-sm transition-colors',
                  i === selectedIndex ? 'bg-accent' : 'hover:bg-muted/50'
                )}
                onMouseEnter={() => setSelectedIndex(i)}
                onClick={() => handleSelect(item)}
              >
                <div className="font-medium" dangerouslySetInnerHTML={{ __html: highlightQuery(item.title, query) }} />
                <div className="mt-0.5 line-clamp-1 text-muted-foreground" dangerouslySetInnerHTML={{ __html: highlightQuery(item.description, query) }} />
                {item.excerpt && (
                  <div className="mt-1 line-clamp-2 text-xs text-muted-foreground" dangerouslySetInnerHTML={{ __html: highlightQuery(item.excerpt, query) }} />
                )}
                <div className="mt-1 text-xs text-muted-foreground">{item.category}</div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
