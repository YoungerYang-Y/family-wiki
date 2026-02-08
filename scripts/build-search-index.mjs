/**
 * 构建期脚本：从 content/ 读取 .mdx，生成 public/search-index.json
 * 运行：node scripts/build-search-index.mjs（在 next build 前执行）
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, '..', 'content');
const outPath = path.join(__dirname, '..', 'public', 'search-index.json');

/** 简单 frontmatter 解析：---\\n...\\n---\\n 与 key: value */
function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };
  const [, fm, content] = match;
  const data = {};
  let currentKey = null;
  for (const line of fm.split(/\r?\n/)) {
    const listItem = line.match(/^\s*-\s+(.+)$/);
    if (listItem && currentKey && Array.isArray(data[currentKey])) {
      data[currentKey].push(listItem[1].trim());
      continue;
    }
    currentKey = null;
    const colon = line.indexOf(':');
    if (colon <= 0) continue;
    const key = line.slice(0, colon).trim();
    let value = line.slice(colon + 1).trim();
    if (value === '' && (key === 'tags' || key === 'relatedSlugs')) {
      data[key] = [];
      currentKey = key;
    } else if (value.startsWith('[')) {
      try {
        value = JSON.parse(value.replace(/'/g, '"'));
      } catch {
        value = [];
      }
      data[key] = value;
    } else if (value === 'true') value = true;
    else if (value === 'false') value = false;
    else data[key] = value;
  }
  return { data, content };
}

function stripMarkdownToPlainText(md) {
  if (!md || typeof md !== 'string') return '';
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]+`/g, (m) => m.slice(1, -1))
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, ' ')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, ' ')
    .replace(/^\s*\d+\.\s+/gm, ' ')
    .replace(/^\s*>\s+/gm, ' ')
    .replace(/\|/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function walkMdx(dir, base = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const rel = path.join(base, e.name);
    if (e.isDirectory()) {
      if (e.name === '_meta.json' || e.name.startsWith('.')) continue;
      files.push(...walkMdx(path.join(dir, e.name), rel));
    } else if (e.name.endsWith('.mdx') || e.name.endsWith('.md')) {
      files.push(path.join(dir, e.name));
    }
  }
  return files;
}

function slugFromPath(filePath) {
  const rel = path.relative(contentDir, filePath);
  return rel.replace(/\.(mdx?|md)$/i, '').replace(/\\/g, '/');
}

function main() {
  const files = walkMdx(contentDir);
  const items = [];

  for (const filePath of files) {
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const { data, content } = parseFrontmatter(raw);
      if (data.draft === true) continue;

      const slug = slugFromPath(filePath);
      const title = typeof data.title === 'string' ? data.title : slug;
      const description = typeof data.description === 'string' ? data.description : '';
      const category = typeof data.category === 'string' ? data.category : '';
      const tags = Array.isArray(data.tags) ? data.tags.filter((t) => typeof t === 'string') : [];
      const plainContent = stripMarkdownToPlainText(content);

      items.push({
        id: slug,
        title,
        description,
        category,
        tags,
        content: plainContent,
        url: `/${slug}`,
      });
    } catch (err) {
      console.error(`[build-search-index] skip ${filePath}:`, err.message);
    }
  }

  const outDir = path.dirname(outPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(items), 'utf-8');
  console.log(`[build-search-index] wrote ${items.length} items to ${outPath}`);
}

main();
