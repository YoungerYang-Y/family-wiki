// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { createFeed, feedHeaders, type FeedDoc } from '@/lib/feed';

describe('feed', () => {
  const baseDocs: FeedDoc[] = [
    {
      title: '测试文章一',
      description: '摘要一',
      url: '/guide/test-one',
      date: new Date('2025-01-15'),
      lastModified: new Date('2025-01-16'),
      author: 'Author',
    },
    {
      title: '测试文章二',
      description: '摘要二',
      url: '/cooking/rice',
      date: new Date('2025-01-10'),
    },
  ];

  describe('createFeed', () => {
    it('returns a Feed instance', () => {
      const feed = createFeed(baseDocs);
      expect(feed).toBeDefined();
      expect(typeof feed.rss2).toBe('function');
      expect(typeof feed.atom1).toBe('function');
    });

    it('limits items to 50', () => {
      const manyDocs: FeedDoc[] = Array.from({ length: 60 }, (_, i) => ({
        title: `Title ${i}`,
        description: `Desc ${i}`,
        url: `/cat/doc-${i}`,
        date: new Date(2025, 0, 1 + i),
      }));
      const feed = createFeed(manyDocs);
      const rss = feed.rss2();
      const itemCount = (rss.match(/<item>/g) ?? []).length;
      expect(itemCount).toBe(50);
    });

    it('accepts options for title and link', () => {
      const feed = createFeed(baseDocs, {
        title: '分类 Feed',
        description: '分类描述',
        link: 'https://wiki.example.com/cooking',
        id: 'https://wiki.example.com/cooking',
      });
      const rss = feed.rss2();
      expect(rss).toContain('<title>分类 Feed</title>');
      expect(rss).toContain('/cooking');
    });
  });

  describe('RSS 2.0 output', () => {
    it('produces valid RSS 2.0 structure with channel and items', () => {
      const feed = createFeed(baseDocs);
      const xml = feed.rss2();

      expect(xml).toContain('<?xml');
      expect(xml).toContain('<rss');
      expect(xml).toContain('version="2.0"');
      expect(xml).toContain('<channel>');
      expect(xml).toContain('</channel>');
      expect(xml).toContain('<item>');
      expect(xml).toContain('</item>');
    });

    it('includes item title, link, description and pubDate', () => {
      const feed = createFeed(baseDocs);
      const xml = feed.rss2();

      expect(xml).toContain('测试文章一');
      expect(xml).toContain('测试文章二');
      expect(xml).toContain('/guide/test-one');
      expect(xml).toContain('/cooking/rice');
      expect(xml).toContain('摘要一');
      expect(xml).toContain('摘要二');
      expect(xml).toContain('<pubDate>');
    });
  });

  describe('Atom 1.0 output', () => {
    it('produces valid Atom structure with feed and entries', () => {
      const feed = createFeed(baseDocs);
      const xml = feed.atom1();

      expect(xml).toContain('<?xml');
      expect(xml).toContain('<feed');
      expect(xml).toContain('xmlns="http://www.w3.org/2005/Atom"');
      expect(xml).toContain('<entry>');
      expect(xml).toContain('</entry>');
    });

    it('includes entry title, link, summary and updated', () => {
      const feed = createFeed(baseDocs);
      const xml = feed.atom1();

      expect(xml).toContain('测试文章一');
      expect(xml).toContain('测试文章二');
      expect(xml).toContain('/guide/test-one');
      expect(xml).toContain('/cooking/rice');
      expect(xml).toContain('摘要一');
      expect(xml).toContain('<updated>');
    });
  });

  describe('feedHeaders', () => {
    it('includes Cache-Control for ISR', () => {
      expect(feedHeaders['Cache-Control']).toBe(
        'public, s-maxage=3600, stale-while-revalidate=600'
      );
    });
  });
});
