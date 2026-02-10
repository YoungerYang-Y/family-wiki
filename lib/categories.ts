import path from 'path';
import fs from 'fs';

export interface CategoryMeta {
  label: string;
  icon?: string;
  weight?: number;
  description?: string;
}

let cachedMeta: Record<string, CategoryMeta> | null = null;

export function getCategoriesMeta(): Record<string, CategoryMeta> {
  if (cachedMeta) return cachedMeta;
  try {
    const filePath = path.join(process.cwd(), 'content', '_meta.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    cachedMeta = JSON.parse(raw) as Record<string, CategoryMeta>;
    return cachedMeta ?? {};
  } catch {
    return {};
  }
}

export function getCategoryMeta(category: string): CategoryMeta | undefined {
  return getCategoriesMeta()[category];
}

export function getSidebarCategories(allWikis: { category: string }[]): { name: string; label: string; icon?: string; count: number }[] {
  const meta = getCategoriesMeta();
  const countByCategory: Record<string, number> = {};
  for (const doc of allWikis) {
    countByCategory[doc.category] = (countByCategory[doc.category] ?? 0) + 1;
  }
  const categoryNames =
    Object.keys(meta).length > 0 ? Object.keys(meta) : Array.from(new Set(allWikis.map((d) => d.category))).filter(Boolean).sort();
  return categoryNames.map((name) => ({
    name,
    label: meta[name]?.label ?? name,
    icon: meta[name]?.icon,
    count: countByCategory[name] ?? 0,
  }));
}
