import { describe, it, expect } from 'vitest';
import {
  stripMarkdownToPlainText,
  highlightQuery,
  buildExcerpt,
} from '@/lib/search';

describe('stripMarkdownToPlainText', () => {
  it('removes heading markers', () => {
    expect(stripMarkdownToPlainText('# Title\n## Sub')).toBe('Title Sub');
  });

  it('removes fenced code blocks', () => {
    const md = 'before\n```js\nconst x = 1;\n```\nafter';
    expect(stripMarkdownToPlainText(md)).toBe('before after');
  });

  it('removes inline code but keeps text', () => {
    expect(stripMarkdownToPlainText('use `npm install`')).toBe('use npm install');
  });

  it('removes image syntax but keeps alt text', () => {
    expect(stripMarkdownToPlainText('![diagram](/img/d.png)')).toBe('diagram');
  });

  it('removes link syntax but keeps text', () => {
    expect(stripMarkdownToPlainText('[docs](https://example.com)')).toBe('docs');
  });

  it('removes bold/italic markers', () => {
    expect(stripMarkdownToPlainText('**bold** and *italic*')).toBe('bold and italic');
    expect(stripMarkdownToPlainText('__bold__ and _italic_')).toBe('bold and italic');
  });

  it('removes list markers', () => {
    expect(stripMarkdownToPlainText('- item1\n- item2')).toBe('item1 item2');
    expect(stripMarkdownToPlainText('1. first\n2. second')).toBe('first second');
  });

  it('removes blockquote markers', () => {
    expect(stripMarkdownToPlainText('> quoted text')).toBe('quoted text');
  });

  it('removes table pipes', () => {
    expect(stripMarkdownToPlainText('| A | B |')).toBe('A B');
  });

  it('returns empty string for falsy input', () => {
    expect(stripMarkdownToPlainText('')).toBe('');
    expect(stripMarkdownToPlainText(null as unknown as string)).toBe('');
    expect(stripMarkdownToPlainText(undefined as unknown as string)).toBe('');
  });

  it('handles Chinese content', () => {
    const md = '# 烹饪指南\n\n**红烧肉**是经典家常菜。';
    expect(stripMarkdownToPlainText(md)).toBe('烹饪指南 红烧肉是经典家常菜。');
  });
});

describe('highlightQuery', () => {
  it('wraps matching text in <mark> tags', () => {
    expect(highlightQuery('Hello World', 'world')).toBe('Hello <mark>World</mark>');
  });

  it('is case insensitive', () => {
    expect(highlightQuery('Next.js Framework', 'next')).toBe('<mark>Next</mark>.js Framework');
  });

  it('highlights multiple occurrences', () => {
    expect(highlightQuery('test a test', 'test')).toBe('<mark>test</mark> a <mark>test</mark>');
  });

  it('returns original text if query is empty', () => {
    expect(highlightQuery('Hello', '')).toBe('Hello');
    expect(highlightQuery('Hello', '  ')).toBe('Hello');
  });

  it('escapes regex special characters in query', () => {
    expect(highlightQuery('C++ code (test)', 'C++')).toBe('<mark>C++</mark> code (test)');
  });

  it('highlights Chinese keywords', () => {
    expect(highlightQuery('红烧肉的做法', '红烧肉')).toBe('<mark>红烧肉</mark>的做法');
  });
});

describe('buildExcerpt', () => {
  it('returns start of content when query is empty', () => {
    const content = 'A '.repeat(100);
    const excerpt = buildExcerpt(content, '');
    expect(excerpt.length).toBeLessThanOrEqual(124); // 120 + "..."
    expect(excerpt.endsWith('...')).toBe(true);
  });

  it('returns full text when shorter than maxLength', () => {
    const content = 'Short text';
    expect(buildExcerpt(content, '')).toBe('Short text');
  });

  it('centers excerpt around keyword', () => {
    const content = 'A'.repeat(80) + ' target ' + 'B'.repeat(80);
    const excerpt = buildExcerpt(content, 'target');
    expect(excerpt).toContain('target');
    expect(excerpt.startsWith('...')).toBe(true);
  });

  it('returns start of text when keyword not found', () => {
    const content = 'Hello World from the wiki';
    const excerpt = buildExcerpt(content, 'nonexistent');
    expect(excerpt).toContain('Hello');
  });

  it('strips markdown before building excerpt', () => {
    const content = '## 标题\n\n**粗体**内容';
    const excerpt = buildExcerpt(content, '粗体');
    expect(excerpt).toContain('粗体');
    expect(excerpt).not.toContain('**');
    expect(excerpt).not.toContain('##');
  });
});
