import { Feed } from 'feed';
import { siteConfig } from '@/config/site';

const CACHE_CONTROL = 'public, s-maxage=3600, stale-while-revalidate=600';
const MAX_ITEMS = 50;

export interface FeedDoc {
  title: string;
  description: string;
  url: string;
  date: Date;
  lastModified?: Date;
  author?: string;
  /** 可选正文摘要（纯文本），用于 RSS description/content */
  content?: string;
}

/**
 * 从文档列表生成 Feed 实例（RSS 2.0 / Atom 1.0 通用）
 * @param docs 已按时间倒序排列的文档，取前 MAX_ITEMS 篇
 * @param options 可选：自定义 feed 标题、描述、链接（用于分类 feed）
 */
export function createFeed(
  docs: FeedDoc[],
  options?: {
    title?: string;
    description?: string;
    link?: string;
    id?: string;
  }
): Feed {
  const baseUrl = siteConfig.url.replace(/\/$/, '');
  const title = options?.title ?? siteConfig.title;
  const description = options?.description ?? siteConfig.description;
  const link = options?.link ?? baseUrl;
  const id = options?.id ?? link;

  const feed = new Feed({
    title,
    description,
    id,
    link,
    language: 'zh-CN',
    copyright: siteConfig.footer.copyright,
    author: {
      name: siteConfig.author.name,
      email: siteConfig.author.email,
      link: siteConfig.author.url,
    },
  });

  const items = docs.slice(0, MAX_ITEMS);

  for (const doc of items) {
    const itemLink = doc.url.startsWith('http') ? doc.url : `${baseUrl}${doc.url}`;
    feed.addItem({
      title: doc.title,
      id: itemLink,
      link: itemLink,
      description: doc.description,
      content: doc.content ?? doc.description,
      date: doc.lastModified ?? doc.date,
      author: doc.author ? [{ name: doc.author }] : undefined,
    });
  }

  return feed;
}

/**
 * 供 Route Handler 使用的公共响应头
 */
export const feedHeaders = {
  'Cache-Control': CACHE_CONTROL,
} as const;
