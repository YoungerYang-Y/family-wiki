/**
 * FlexSearch mock for vitest/jsdom environment
 * FlexSearch 0.7.x 的 ESM 构建在 jsdom 中存在兼容性问题，
 * 因此提供一个轻量 mock 实现，支持基本的 Document 搜索 API。
 */

interface DocumentOptions {
  document: {
    id: string;
    store?: boolean;
    index: Array<{ field: string; tokenize?: string }>;
    tag?: string | Array<{ field: string }>;
  };
}

interface SearchOptions {
  query: string;
  limit?: number;
  enrich?: boolean;
  tag?: string | string[];
}

class MockDocument {
  private docs: Map<string, Record<string, unknown>> = new Map();
  private fields: string[];
  private idField: string;
  private tagFields: string[];

  constructor(options: DocumentOptions) {
    this.idField = options.document.id;
    this.fields = options.document.index.map((f) => f.field);
    const tag = options.document.tag;
    this.tagFields = typeof tag === 'string'
      ? [tag]
      : Array.isArray(tag)
        ? tag.map((t) => t.field)
        : [];
  }

  add(doc: Record<string, unknown>): void {
    const id = String(doc[this.idField]);
    this.docs.set(id, { ...doc });
  }

  search(options: SearchOptions): Array<{ field: string; result: Array<{ id: string; doc: Record<string, unknown> }> }> {
    const query = (options.query ?? '').trim().toLowerCase();
    const limit = options.limit ?? 100;
    if (!query) return [];

    // 按 tag 过滤（FlexSearch 中 tag 为 string | string[]，对应 tag 字段的值）
    let candidates = Array.from(this.docs.entries());
    if (options.tag !== undefined && this.tagFields.length > 0) {
      const tagValues = Array.isArray(options.tag) ? options.tag : [options.tag];
      const tagField = this.tagFields[0];
      candidates = candidates.filter(([, doc]) => tagValues.includes(String(doc[tagField] ?? '')));
    }

    // 按 field 分组搜索
    const results: Array<{ field: string; result: Array<{ id: string; doc: Record<string, unknown> }> }> = [];

    for (const field of this.fields) {
      const matched: Array<{ id: string; doc: Record<string, unknown> }> = [];
      for (const [id, doc] of candidates) {
        const value = String(doc[field] ?? '').toLowerCase();
        if (value.includes(query)) {
          if (options.enrich) {
            matched.push({ id, doc });
          } else {
            matched.push({ id, doc });
          }
        }
      }
      if (matched.length > 0) {
        results.push({ field, result: matched.slice(0, limit) });
      }
    }

    return results;
  }
}

class MockIndex {
  private items: Map<string | number, string> = new Map();

  add(id: string | number, content: string): void {
    this.items.set(id, content);
  }

  search(query: string, limit?: number): Array<string | number> {
    const q = (query ?? '').trim().toLowerCase();
    if (!q) return [];
    const results: Array<string | number> = [];
    for (const [id, content] of this.items.entries()) {
      if (content.toLowerCase().includes(q)) {
        results.push(id);
      }
    }
    return results.slice(0, limit ?? 100);
  }
}

const FlexSearch = {
  Document: MockDocument,
  Index: MockIndex,
};

export default FlexSearch;
export { MockDocument as Document, MockIndex as Index };
