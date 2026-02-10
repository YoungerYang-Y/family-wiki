import type { MetadataRoute } from 'next';
import { allWikis } from 'contentlayer/generated';
import { siteConfig } from '@/config/site';

const baseUrl = siteConfig.url.replace(/\/$/, '');

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = allWikis.filter((doc) => !doc.draft);
  const categories = Array.from(new Set(posts.map((p) => p.category)));
  const tags = Array.from(new Set(posts.flatMap((p) => p.tags ?? [])));

  const entries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/tags`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  for (const category of categories) {
    entries.push({
      url: `${baseUrl}/${category}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }

  for (const tag of tags) {
    entries.push({
      url: `${baseUrl}/tags/${encodeURIComponent(tag)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    });
  }

  for (const doc of posts) {
    entries.push({
      url: `${baseUrl}${doc.url}`,
      lastModified: doc.lastModified ? new Date(doc.lastModified) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  }

  return entries;
}
