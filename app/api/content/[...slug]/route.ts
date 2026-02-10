import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api-auth';
import { getFile } from '@/lib/github';

interface RouteParams {
  params: Promise<{ slug: string[] }>;
}

/**
 * GET /api/content/[...slug]
 *
 * - raw=true  → 需要认证，返回原始 Markdown、SHA 和 lastModified
 * - raw=false → 公开访问，返回解析后的文档数据（简化实现：同样从 GitHub 获取）
 */
export async function GET(request: Request, { params }: RouteParams) {
  const { slug: slugParts } = await params;
  const slug = slugParts.join('/');
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get('raw') === 'true';

  try {
    // raw=true 时需要认证
    if (raw) {
      const payload = await authenticateRequest(request);
      if (!payload) {
        return NextResponse.json(
          { code: 401, message: '未认证或 token 无效', error: 'UNAUTHORIZED' },
          { status: 401 }
        );
      }
    }

    const file = await getFile(slug);
    if (!file) {
      return NextResponse.json(
        { code: 404, message: '文档不存在', error: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    if (raw) {
      return NextResponse.json(
        {
          code: 200,
          data: {
            slug,
            raw: file.content,
            sha: file.sha,
            lastModified: file.lastModified ?? null,
          },
          message: 'ok',
        },
        { status: 200 }
      );
    }

    // raw=false：解析 frontmatter，返回结构化数据
    const { title, description, category, tags, body } =
      parseFrontmatter(file.content);

    return NextResponse.json(
      {
        code: 200,
        data: {
          slug,
          title,
          description,
          category,
          tags,
          content: body,
          lastModified: file.lastModified ?? null,
        },
        message: 'ok',
      },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : '服务器内部错误';
    return NextResponse.json(
      { code: 500, message, error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface Frontmatter {
  title: string;
  description: string;
  category: string;
  tags: string[];
  body: string;
}

/**
 * 简易 frontmatter 解析器
 * 从 MDX 内容中提取 YAML frontmatter 字段和正文
 */
function parseFrontmatter(content: string): Frontmatter {
  const result: Frontmatter = {
    title: '',
    description: '',
    category: '',
    tags: [],
    body: content,
  };

  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) {
    return result;
  }

  const fmBlock = fmMatch[1];
  result.body = content.slice(fmMatch[0].length).trimStart();

  for (const line of fmBlock.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();

    switch (key) {
      case 'title':
        result.title = stripQuotes(value);
        break;
      case 'description':
        result.description = stripQuotes(value);
        break;
      case 'category':
        result.category = stripQuotes(value);
        break;
      case 'tags':
        result.tags = parseYamlArray(value);
        break;
    }
  }

  return result;
}

/** 移除首尾引号 */
function stripQuotes(s: string): string {
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    return s.slice(1, -1);
  }
  return s;
}

/** 解析 YAML 行内数组，如 [a, b, c] */
function parseYamlArray(value: string): string[] {
  const inner = value.replace(/^\[/, '').replace(/\]$/, '');
  if (!inner.trim()) return [];
  return inner.split(',').map((s) => stripQuotes(s.trim()));
}
