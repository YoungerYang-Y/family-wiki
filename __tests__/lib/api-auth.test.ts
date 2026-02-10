// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authenticateRequest } from '@/lib/api-auth';
import { signToken } from '@/lib/auth';

describe('authenticateRequest', () => {
  beforeEach(() => {
    vi.stubEnv('JWT_SECRET', 'test-secret-at-least-32-chars-long');
    vi.stubEnv('AUTH_PASSWORD', 'test-password');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns null when no Authorization header is present', async () => {
    const request = new Request('http://localhost/api/test');

    const result = await authenticateRequest(request);

    expect(result).toBeNull();
  });

  it('returns null for non-Bearer authorization scheme (Basic)', async () => {
    const request = new Request('http://localhost/api/test', {
      headers: { Authorization: 'Basic dXNlcjpwYXNz' },
    });

    const result = await authenticateRequest(request);

    expect(result).toBeNull();
  });

  it('returns null for malformed Bearer header (no token)', async () => {
    const request = new Request('http://localhost/api/test', {
      headers: { Authorization: 'Bearer ' },
    });

    const result = await authenticateRequest(request);

    expect(result).toBeNull();
  });

  it('returns null for empty Authorization header', async () => {
    const request = new Request('http://localhost/api/test', {
      headers: { Authorization: '' },
    });

    const result = await authenticateRequest(request);

    expect(result).toBeNull();
  });

  it('returns payload for a valid Bearer token', async () => {
    const { token } = await signToken();
    const request = new Request('http://localhost/api/test', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const result = await authenticateRequest(request);

    expect(result).not.toBeNull();
    expect(result!.sub).toBe('editor');
    expect(typeof result!.exp).toBe('number');
  });

  it('returns null for an invalid Bearer token', async () => {
    const request = new Request('http://localhost/api/test', {
      headers: { Authorization: 'Bearer invalid.token.value' },
    });

    const result = await authenticateRequest(request);

    expect(result).toBeNull();
  });

  it('returns null for an expired or tampered token', async () => {
    // Generate a token with one secret, then change the secret
    const { token } = await signToken();
    vi.stubEnv('JWT_SECRET', 'a-completely-different-secret-key!!');

    const request = new Request('http://localhost/api/test', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const result = await authenticateRequest(request);

    expect(result).toBeNull();
  });

  it('returns null when Authorization header has extra spaces', async () => {
    const request = new Request('http://localhost/api/test', {
      headers: { Authorization: 'Bearer  token  extra' },
    });

    const result = await authenticateRequest(request);

    expect(result).toBeNull();
  });
});
