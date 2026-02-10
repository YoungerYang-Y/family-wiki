import { SignJWT, jwtVerify } from 'jose';

/**
 * 获取 HS256 签名密钥（从环境变量 JWT_SECRET）
 */
function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET 环境变量未设置');
  }
  return new TextEncoder().encode(secret);
}

/**
 * 校验密码是否匹配 AUTH_PASSWORD 环境变量
 */
export function verifyPassword(password: string): boolean {
  const authPassword = process.env.AUTH_PASSWORD;
  if (!authPassword) {
    throw new Error('AUTH_PASSWORD 环境变量未设置');
  }
  return password === authPassword;
}

/**
 * 签发 JWT，有效期 24h
 * payload: { sub: 'editor', iat, exp }
 */
export async function signToken(): Promise<{
  token: string;
  expiresAt: string;
}> {
  const secret = getSecret();
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 24 * 60 * 60; // 24h

  const token = await new SignJWT({ sub: 'editor' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(exp)
    .sign(secret);

  return {
    token,
    expiresAt: new Date(exp * 1000).toISOString(),
  };
}

/**
 * 验证 JWT，返回 payload
 * 无效时抛出 Error
 */
export async function verifyToken(
  token: string
): Promise<{ sub: string; exp: number }> {
  const secret = getSecret();

  const { payload } = await jwtVerify(token, secret, {
    algorithms: ['HS256'],
  });

  if (!payload.sub || !payload.exp) {
    throw new Error('Token payload 缺少必要字段');
  }

  return {
    sub: payload.sub,
    exp: payload.exp,
  };
}
