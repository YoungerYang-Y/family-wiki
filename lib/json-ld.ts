import type { SiteConfig } from '@/config/site';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface ArticleDoc {
  title: string;
  description: string;
  slug: string;
  url: string;
  date?: string;
  lastModified?: string;
  author?: string;
  tags?: string[];
}

/**
 * 生成 Schema.org WebSite JSON-LD
 */
export function buildWebSiteJsonLd(config: SiteConfig): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: config.title,
    description: config.description,
    url: config.url,
    author: {
      '@type': 'Person',
      name: config.author.name,
      ...(config.author.url && { url: config.author.url }),
    },
  };
}

/**
 * 生成 Schema.org BreadcrumbList JSON-LD
 */
export function buildBreadcrumbListJsonLd(
  items: BreadcrumbItem[],
  baseUrl: string
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href && { item: `${baseUrl}${item.href}` }),
    })),
  };
}

/**
 * 生成 Schema.org Article JSON-LD
 */
export function buildArticleJsonLd(
  doc: ArticleDoc,
  baseUrl: string
): object {
  const url = doc.url.startsWith('http') ? doc.url : `${baseUrl}${doc.url}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: doc.title,
    description: doc.description,
    url,
    ...(doc.date && { datePublished: doc.date }),
    ...(doc.lastModified && { dateModified: doc.lastModified }),
    ...(doc.author && {
      author: {
        '@type': 'Person',
        name: doc.author,
      },
    }),
    ...(doc.tags && doc.tags.length > 0 && { keywords: doc.tags.join(', ') }),
  };
}
