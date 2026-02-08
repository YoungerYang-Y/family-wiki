import { describe, it, expect } from 'vitest';
import {
  buildWebSiteJsonLd,
  buildBreadcrumbListJsonLd,
  buildArticleJsonLd,
} from '@/lib/json-ld';
import { siteConfig } from '@/config/site';

describe('JSON-LD builders', () => {
  describe('buildWebSiteJsonLd', () => {
    it('outputs valid WebSite schema with required fields', () => {
      const data = buildWebSiteJsonLd(siteConfig);
      expect(data).toMatchObject({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: siteConfig.title,
        description: siteConfig.description,
        url: siteConfig.url,
      });
      expect(typeof (data as { author?: unknown }).author).toBe('object');
    });
  });

  describe('buildBreadcrumbListJsonLd', () => {
    it('outputs valid BreadcrumbList with positions and items', () => {
      const items = [
        { label: '首页', href: '/' },
        { label: '烹饪', href: '/cooking' },
        { label: '米饭的做法' },
      ];
      const data = buildBreadcrumbListJsonLd(items, 'https://example.com');
      expect(data).toMatchObject({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
      });
      const list = (data as { itemListElement: unknown[] }).itemListElement;
      expect(list).toHaveLength(3);
      expect(list[0]).toMatchObject({ '@type': 'ListItem', position: 1, name: '首页' });
      expect(list[0]).toHaveProperty('item', 'https://example.com/');
      expect(list[2]).toMatchObject({ position: 3, name: '米饭的做法' });
      expect(list[2]).not.toHaveProperty('item');
    });
  });

  describe('buildArticleJsonLd', () => {
    it('outputs valid Article schema with headline and description', () => {
      const doc = {
        title: '测试文章',
        description: '摘要',
        slug: 'guide/test',
        url: '/guide/test',
        date: '2026-02-08',
        author: 'Author',
        tags: ['a', 'b'],
      };
      const data = buildArticleJsonLd(doc, 'https://example.com');
      expect(data).toMatchObject({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: '测试文章',
        description: '摘要',
        url: 'https://example.com/guide/test',
        datePublished: '2026-02-08',
        author: { '@type': 'Person', name: 'Author' },
        keywords: 'a, b',
      });
    });

    it('omits optional fields when not provided', () => {
      const doc = {
        title: 'Minimal',
        description: 'Desc',
        slug: 's',
        url: '/s',
      };
      const data = buildArticleJsonLd(doc, 'https://example.com');
      expect(data).not.toHaveProperty('datePublished');
      expect(data).not.toHaveProperty('author');
      expect(data).not.toHaveProperty('keywords');
    });
  });
});
