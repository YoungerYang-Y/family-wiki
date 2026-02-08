import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { SearchIndexItem } from '@/lib/search';

/**
 * FlexSearch 集成测试：
 * - 索引构建
 * - 搜索准确性（标题、描述、正文）
 * - 中文内容搜索
 * - 结果去重
 * - limit / category 过滤
 * - 懒加载缓存
 */

const mockIndex: SearchIndexItem[] = [
  {
    id: 'guide/example',
    title: '示例文章',
    description: '用于验证 Contentlayer 管线的示例 Wiki 文章',
    category: 'guide',
    tags: ['示例'],
    content: '这是 Family Wiki 的示例内容，用于验证 Contentlayer 能正确解析 MDX 并生成类型安全的数据。',
    url: '/guide/example',
  },
  {
    id: 'cooking/hongshaorou',
    title: '红烧肉的做法',
    description: '经典家常红烧肉的详细步骤',
    category: 'cooking',
    tags: ['烹饪', '肉类'],
    content:
      '红烧肉是一道经典的中式家常菜。准备五花肉500克，酱油适量，冰糖适量。先将五花肉切块焯水，然后炒糖色，加入酱油和水慢炖一小时。',
    url: '/cooking/hongshaorou',
  },
  {
    id: 'health/sleep',
    title: '改善睡眠质量指南',
    description: '科学改善睡眠的方法和建议',
    category: 'health',
    tags: ['健康', '睡眠'],
    content:
      '良好的睡眠对健康至关重要。建议每天保持7-8小时的睡眠，睡前避免使用电子设备，保持卧室安静和凉爽。',
    url: '/health/sleep',
  },
  {
    id: 'cooking/mifan',
    title: '米饭的做法',
    description: '电饭煲蒸米饭技巧',
    category: 'cooking',
    tags: ['烹饪', '主食'],
    content: '蒸米饭是最基本的烹饪技能。取适量大米洗净，加入合适比例的水，放入电饭煲中蒸煮即可。',
    url: '/cooking/mifan',
  },
];

// Mock fetch 以返回 mock 索引数据
function mockFetch() {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => mockIndex,
  });
}

function mockFetchFailure() {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status: 404,
  });
}

describe('search-client (FlexSearch integration)', () => {
  beforeEach(async () => {
    // 每个测试前重置缓存和 fetch mock
    const { resetSearchClient } = await import('@/lib/search-client');
    resetSearchClient();
    vi.restoreAllMocks();
  });

  it('loads search index and returns search results', async () => {
    mockFetch();
    const { loadSearchClient } = await import('@/lib/search-client');
    const client = await loadSearchClient();
    const results = client.search('示例');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title).toBe('示例文章');
    expect(results[0].url).toBe('/guide/example');
    expect(results[0].slug).toBe('guide/example');
  });

  it('returns empty array for empty query', async () => {
    mockFetch();
    const { loadSearchClient } = await import('@/lib/search-client');
    const client = await loadSearchClient();
    expect(client.search('')).toEqual([]);
    expect(client.search('   ')).toEqual([]);
  });

  it('searches across title, description, and content', async () => {
    mockFetch();
    const { loadSearchClient } = await import('@/lib/search-client');
    const client = await loadSearchClient();

    // 按标题搜索
    const byTitle = client.search('红烧肉');
    expect(byTitle.some((r) => r.slug === 'cooking/hongshaorou')).toBe(true);

    // 按描述搜索
    const byDesc = client.search('科学改善');
    expect(byDesc.some((r) => r.slug === 'health/sleep')).toBe(true);

    // 按正文搜索
    const byContent = client.search('电饭煲');
    expect(byContent.some((r) => r.slug === 'cooking/mifan')).toBe(true);
  });

  it('deduplicates results across multiple field matches', async () => {
    mockFetch();
    const { loadSearchClient } = await import('@/lib/search-client');
    const client = await loadSearchClient();
    // "红烧肉" 在标题、描述和正文中都出现，但结果应该只有一条
    const results = client.search('红烧肉');
    const ids = results.map((r) => r.slug);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it('respects limit option', async () => {
    mockFetch();
    const { loadSearchClient } = await import('@/lib/search-client');
    const client = await loadSearchClient();
    // 搜索一个通用词，应该匹配到多个结果
    const results = client.search('的', { limit: 1 });
    expect(results.length).toBeLessThanOrEqual(1);
  });

  it('supports Chinese text search (word-level)', async () => {
    mockFetch();
    const { loadSearchClient } = await import('@/lib/search-client');
    const client = await loadSearchClient();

    const results = client.search('睡眠');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.slug === 'health/sleep')).toBe(true);
  });

  it('returns results with correct structure', async () => {
    mockFetch();
    const { loadSearchClient } = await import('@/lib/search-client');
    const client = await loadSearchClient();
    const results = client.search('示例');
    for (const r of results) {
      expect(r).toHaveProperty('slug');
      expect(r).toHaveProperty('title');
      expect(r).toHaveProperty('description');
      expect(r).toHaveProperty('category');
      expect(r).toHaveProperty('excerpt');
      expect(r).toHaveProperty('score');
      expect(r).toHaveProperty('url');
      expect(typeof r.slug).toBe('string');
      expect(typeof r.url).toBe('string');
    }
  });

  it('caches client across calls', async () => {
    mockFetch();
    const { loadSearchClient } = await import('@/lib/search-client');
    const client1 = await loadSearchClient();
    const client2 = await loadSearchClient();
    expect(client1).toBe(client2);
    // fetch 只应被调用一次
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('throws error when fetch fails', async () => {
    mockFetchFailure();
    const { loadSearchClient, resetSearchClient } = await import('@/lib/search-client');
    resetSearchClient();
    await expect(loadSearchClient()).rejects.toThrow('Failed to load search index');
  });

  it('includes excerpt containing the query keyword', async () => {
    mockFetch();
    const { loadSearchClient } = await import('@/lib/search-client');
    const client = await loadSearchClient();
    const results = client.search('五花肉');
    const match = results.find((r) => r.slug === 'cooking/hongshaorou');
    if (match) {
      expect(match.excerpt).toContain('五花肉');
    }
  });
});
