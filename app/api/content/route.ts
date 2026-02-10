import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { authenticateRequest } from '@/lib/api-auth';
import { createOrUpdateFile, ConflictError } from '@/lib/github';

interface CreateContentBody {
  slug?: string;
  content?: string;
  message?: string;
  sha?: string;
}

/**
 * POST /api/content
 *
 * 创建或更新文档内容（需要认证）
 *
 * Request body:
 *   - slug:    文章 slug（必须）
 *   - content: Markdown 内容（必须）
 *   - message: Git commit message（必须）
 *   - sha:     当前文件 SHA（可选，更新时传入）
 */
export async function POST(request: Request) {
  // 1. 鉴权
  const payload = await authenticateRequest(request);
  if (!payload) {
    return NextResponse.json(
      { code: 401, message: '未认证或 token 无效', error: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  // 2. 解析 body
  let body: CreateContentBody;
  try {
    body = (await request.json()) as CreateContentBody;
  } catch {
    return NextResponse.json(
      { code: 400, message: '请求体必须是有效的 JSON', error: 'BAD_REQUEST' },
      { status: 400 }
    );
  }

  const { slug, content, message, sha } = body;

  // 3. 校验必要字段
  if (!slug || typeof slug !== 'string') {
    return NextResponse.json(
      { code: 400, message: '缺少必要字段: slug', error: 'BAD_REQUEST' },
      { status: 400 }
    );
  }
  if (!content || typeof content !== 'string') {
    return NextResponse.json(
      { code: 400, message: '缺少必要字段: content', error: 'BAD_REQUEST' },
      { status: 400 }
    );
  }
  if (!message || typeof message !== 'string') {
    return NextResponse.json(
      { code: 400, message: '缺少必要字段: message', error: 'BAD_REQUEST' },
      { status: 400 }
    );
  }

  // 4. 调用 GitHub API 创建/更新文件
  try {
    const result = await createOrUpdateFile(slug, content, message, sha);

    // 触发 ISR：使该文章及列表页重新验证
    revalidatePath('/');
    revalidatePath(`/${slug.split('/')[0]}`);
    revalidatePath(`/${slug}`);

    return NextResponse.json(
      {
        code: 201,
        data: {
          slug,
          sha: result.sha,
          commitUrl: result.commitUrl,
        },
        message: '内容已保存',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ConflictError) {
      return NextResponse.json(
        { code: 409, message: error.message, error: 'CONFLICT' },
        { status: 409 }
      );
    }

    const message =
      error instanceof Error ? error.message : '服务器内部错误';
    return NextResponse.json(
      { code: 500, message, error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
