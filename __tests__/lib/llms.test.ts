import { describe, it, expect } from 'vitest';
import { generateLlmsTxt } from '@/lib/llms';

describe('generateLlmsTxt', () => {
  it('includes site title as H1 and description as blockquote', () => {
    const docs = [
      { slug: 'guide/a', title: 'A', description: 'D', category: 'guide', url: '/guide/a' },
    ];
    const text = generateLlmsTxt(docs);
    expect(text).toContain('# Family Wiki');
    expect(text).toMatch(/> .*个人决策型知识库/);
  });

  it('includes categories section and article index', () => {
    const docs = [
      { slug: 'guide/a', title: '文章A', description: '摘要A', category: 'guide', url: '/guide/a' },
      { slug: 'guide/b', title: '文章B', description: undefined, category: 'guide', url: '/guide/b' },
    ];
    const text = generateLlmsTxt(docs);
    expect(text).toContain('## 分类');
    expect(text).toContain('## 文章索引');
    expect(text).toContain('[文章A]');
    expect(text).toContain('[文章B]');
    expect(text).toContain('/guide/a');
    expect(text).toContain('/guide/b');
  });

  it('returns plain text with newlines', () => {
    const text = generateLlmsTxt([]);
    expect(text).toContain('\n');
    expect(typeof text).toBe('string');
  });
});
