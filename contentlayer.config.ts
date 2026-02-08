import { defineDocumentType, makeSource } from 'contentlayer2/source-files';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';

export const Wiki = defineDocumentType(() => ({
  name: 'Wiki',
  filePathPattern: '**/*.mdx',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    description: { type: 'string', required: true },
    category: { type: 'string', required: true },
    tags: { type: 'list', of: { type: 'string' } },
    date: { type: 'date' },
    lastModified: { type: 'date' },
    draft: { type: 'boolean', default: false },
    weight: { type: 'number' },
    icon: { type: 'string' },
    decisionStatus: {
      type: 'enum',
      options: ['active', 'deprecated', 'reviewing'],
    },
    relatedSlugs: { type: 'list', of: { type: 'string' } },
    author: { type: 'string' },
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: (doc) => doc._raw.flattenedPath,
    },
    url: {
      type: 'string',
      resolve: (doc) => `/${doc._raw.flattenedPath}`,
    },
    readingTime: {
      type: 'number',
      resolve: (doc) => {
        const text = doc.body.raw;
        const words = text.trim().split(/\s+/).filter(Boolean).length;
        return Math.max(1, Math.ceil(words / 200));
      },
    },
    wordCount: {
      type: 'number',
      resolve: (doc) =>
        doc.body.raw
          .trim()
          .split(/\s+/)
          .filter(Boolean).length,
    },
  },
}));

export default makeSource({
  contentDirPath: 'content',
  documentTypes: [Wiki],
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: 'wrap', properties: { className: ['anchor'] } }],
      [rehypePrettyCode, { theme: 'github-dark' }],
    ],
  },
});
