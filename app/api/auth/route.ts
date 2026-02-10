import { NextResponse } from 'next/server';
import { verifyPassword, signToken } from '@/lib/auth';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { code: 400, message: '请求体必须是有效的 JSON', error: 'BAD_REQUEST' },
      { status: 400 }
    );
  }

  const { password } = body as { password?: string };

  if (!password || typeof password !== 'string') {
    return NextResponse.json(
      { code: 400, message: '缺少 password 字段', error: 'BAD_REQUEST' },
      { status: 400 }
    );
  }

  try {
    if (!verifyPassword(password)) {
      console.error('[API] POST /api/auth code=401 message=密码错误');
      return NextResponse.json(
        { code: 401, message: '密码错误', error: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { token, expiresAt } = await signToken();

    return NextResponse.json(
      {
        code: 200,
        data: { token, expiresAt },
        message: '认证成功',
      },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : '服务器内部错误';
    console.error('[API] POST /api/auth code=500 message=', message);
    return NextResponse.json(
      { code: 500, message, error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
