/**
 * 搜索索引类型与客户端搜索逻辑
 * 构建期输出 public/search-index.json，客户端懒加载后使用 FlexSearch 检索
 */

export interface SearchIndexItem {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  content: string;
  url: string;
}

export interface SearchResultItem {
  slug: string;
  title: string;
  description: string;
  category: string;
  excerpt: string;
  score: number;
  url: string;
}

/** 从原始 Markdown 中剥离语法，得到纯文本（用于索引与摘要） */
export function stripMarkdownToPlainText(md: string): string {
  if (!md || typeof md !== 'string') return '';
  let text = md
    .replace(/```[\s\S]*?```/g, ' ') // 代码块
    .replace(/`[^`]+`/g, (m) => m.slice(1, -1)) // 行内代码
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // 图片 alt
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 链接文本
    .replace(/^#{1,6}\s+/gm, ' ') // 标题
    .replace(/\*\*([^*]+)\*\*/g, '$1') // 粗体
    .replace(/\*([^*]+)\*/g, '$1') // 斜体
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, ' ') // 列表
    .replace(/^\s*\d+\.\s+/gm, ' ')
    .replace(/^\s*>\s+/gm, ' ') // 引用
    .replace(/\|/g, ' ') // 表格
    .replace(/\s+/g, ' ')
    .trim();
  return text;
}

/** 高亮关键词：在文本中包裹匹配的 query 为 <mark> */
export function highlightQuery(text: string, query: string): string {
  if (typeof text !== 'string') return '';
  if (!query.trim()) return text;
  const q = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(${q})`, 'gi');
  return text.replace(re, '<mark>$1</mark>');
}

/** 从正文中截取包含关键词的摘要，约 120 字 */
export function buildExcerpt(content: string, query: string, maxLength = 120): string {
  const plain = stripMarkdownToPlainText(content);
  if (!query.trim()) return plain.slice(0, maxLength) + (plain.length > maxLength ? '...' : '');
  const q = query.trim().toLowerCase();
  const idx = plain.toLowerCase().indexOf(q);
  if (idx < 0) return plain.slice(0, maxLength) + (plain.length > maxLength ? '...' : '');
  const start = Math.max(0, idx - 40);
  const end = Math.min(plain.length, idx + q.length + 80);
  let excerpt = plain.slice(start, end).trim();
  if (start > 0) excerpt = '...' + excerpt;
  if (end < plain.length) excerpt = excerpt + '...';
  return excerpt;
}
