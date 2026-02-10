import { verifyToken } from '@/lib/auth';

/**
 * 从 Request 的 Authorization header 提取 Bearer token 并验证
 *
 * @param request - HTTP 请求对象
 * @returns 验证通过返回 JWT payload，失败返回 null
 */
export async function authenticateRequest(
  request: Request
): Promise<{ sub: string; exp: number } | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return null;
  }

  // 仅支持 Bearer 方案
  const match = authHeader.match(/^Bearer\s+(\S+)$/);
  if (!match) {
    return null;
  }

  const token = match[1];

  try {
    return await verifyToken(token);
  } catch {
    // token 无效或过期
    return null;
  }
}
