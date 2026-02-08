/**
 * Wiki 文章 Frontmatter 与计算字段类型（与 Contentlayer 生成的 Wiki 类型一致）
 * 用于应用层类型引用；构建后会从 .contentlayer/generated 生成完整类型
 */
export interface WikiHeading {
  depth: number;
  text: string;
  slug: string;
}

export interface WikiArticleFrontmatter {
  title: string;
  description: string;
  category: string;
  tags?: string[];
  date?: string;
  lastModified?: string;
  draft?: boolean;
  weight?: number;
  icon?: string;
  decisionStatus?: 'active' | 'deprecated' | 'reviewing';
  relatedSlugs?: string[];
  author?: string;
}
