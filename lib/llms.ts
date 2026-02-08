import { siteConfig } from '@/config/site';
import { getSidebarCategories } from '@/lib/categories';

export interface LlmsDoc {
  slug: string;
  title: string;
  description?: string;
  category: string;
  url: string;
}

/**
 * 按照 llms.txt 规范生成站点结构摘要（Markdown 格式）
 * 供大模型理解站点内容与导航
 */
export function generateLlmsTxt(docs: LlmsDoc[]): string {
  const baseUrl = siteConfig.url.replace(/\/$/, '');
  const categories = getSidebarCategories(docs);
  const lines: string[] = [];

  lines.push(`# ${siteConfig.title}`);
  lines.push('');
  lines.push(`> ${siteConfig.description}`);
  lines.push('');
  lines.push('本站点为个人决策型知识库，内容按分类组织。');
  lines.push('');
  lines.push('## 分类');
  lines.push('');
  for (const cat of categories) {
    lines.push(`- [${cat.label}](${baseUrl}/${cat.name})：${cat.count} 篇文章`);
  }
  lines.push('');
  lines.push('## 文章索引');
  lines.push('');
  const sorted = [...docs].sort((a, b) => {
    const aDate = a.slug;
    const bDate = b.slug;
    return aDate.localeCompare(bDate);
  });
  for (const doc of sorted) {
    const desc = doc.description ? `：${doc.description}` : '';
    lines.push(`- [${doc.title}](${baseUrl}${doc.url})${desc}`);
  }
  lines.push('');
  return lines.join('\n');
}
