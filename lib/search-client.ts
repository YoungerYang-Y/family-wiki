/**
 * 客户端搜索：懒加载索引、FlexSearch 检索
 * 仅由 "use client" 组件引用，避免服务端加载 FlexSearch
 */
import type { SearchIndexItem, SearchResultItem } from './search';
import { buildExcerpt } from './search';

export type SearchClient = {
  search(query: string, options?: { limit?: number; category?: string }): SearchResultItem[];
};

/**
 * FlexSearch Document.search({ enrich: true }) 返回的结构：
 * 每个 field 一个分组，分组内是匹配到的文档列表
 */
interface FlexSearchFieldResult {
  field: string;
  result: Array<{ id: string | number; doc: SearchIndexItem }>;
}

let cachedClient: SearchClient | null = null;
let loadPromise: Promise<SearchClient> | null = null;

/** 懒加载：拉取索引并构建 FlexSearch，返回可复用的 SearchClient */
export async function loadSearchClient(): Promise<SearchClient> {
  if (cachedClient) return cachedClient;
  if (loadPromise) return loadPromise;

  loadPromise = (async (): Promise<SearchClient> => {
    const res = await fetch('/search-index.json');
    if (!res.ok) throw new Error('Failed to load search index');
    const items: SearchIndexItem[] = await res.json();

    const FlexSearch = (await import('flexsearch')).default;
    const { Document } = FlexSearch;
    // FlexSearch 类型定义与运行时 API 不完全一致，此处按官方 run-time 用法传参
    const index = new Document({
      document: {
        id: 'id',
        store: true,
        index: [
          { field: 'title', tokenize: 'forward' },
          { field: 'description', tokenize: 'forward' },
          { field: 'content', tokenize: 'forward' },
        ],
        tag: [{ field: 'category' }],
      },
    } as never);

    for (const item of items) index.add(item);

    // 保存原始数据以便通过 id 查找（当 store 不工作时的 fallback）
    const itemMap = new Map(items.map((item) => [item.id, item]));

    const search = (query: string, options?: { limit?: number; category?: string }): SearchResultItem[] => {
      const limit = options?.limit ?? 20;
      const q = (query ?? '').trim();
      if (!q) return [];

      // FlexSearch Document.search 的 tag 为 string | string[]，表示按 tag 字段过滤的值
      const tag = options?.category ? options.category : undefined;
      const raw = index.search({
        query: q,
        limit,
        enrich: true,
        ...(tag !== undefined && { tag }),
      }) as unknown as FlexSearchFieldResult[];

      // FlexSearch Document 按 field 分组返回，需要合并去重
      const seen = new Set<string>();
      const results: SearchResultItem[] = [];

      const fieldResults = Array.isArray(raw) ? raw : [];
      for (const fieldGroup of fieldResults) {
        if (!fieldGroup.result || !Array.isArray(fieldGroup.result)) continue;
        for (const entry of fieldGroup.result) {
          const id = String(entry.id);
          if (seen.has(id)) continue;
          seen.add(id);

          // 优先使用 enriched doc，fallback 到 itemMap
          const doc = entry.doc ?? itemMap.get(id);
          if (!doc) continue;

          results.push({
            slug: doc.id,
            title: doc.title,
            description: doc.description,
            category: doc.category,
            excerpt: buildExcerpt(doc.content, q),
            score: 1,
            url: doc.url,
          });
        }
      }

      return results.slice(0, limit);
    };

    cachedClient = { search };
    return cachedClient;
  })();

  return loadPromise;
}

/** 重置缓存（仅测试用） */
export function resetSearchClient(): void {
  cachedClient = null;
  loadPromise = null;
}
