// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { verifyPassword, signToken, verifyToken } from '@/lib/auth';

describe('auth', () => {
  beforeEach(() => {
    vi.stubEnv('JWT_SECRET', 'test-secret-at-least-32-chars-long');
    vi.stubEnv('AUTH_PASSWORD', 'test-password');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  // -------------------------------------------------------------------------
  // verifyPassword
  // -------------------------------------------------------------------------
  describe('verifyPassword', () => {
    it('returns true for correct password', () => {
      expect(verifyPassword('test-password')).toBe(true);
    });

    it('returns false for incorrect password', () => {
      expect(verifyPassword('wrong-password')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(verifyPassword('')).toBe(false);
    });

    it('throws when AUTH_PASSWORD env is not set', () => {
      vi.stubEnv('AUTH_PASSWORD', '');
      // Empty string is falsy, should throw
      expect(() => verifyPassword('any')).toThrow('AUTH_PASSWORD 环境变量未设置');
    });

    it('throws when AUTH_PASSWORD env is undefined', () => {
      delete process.env.AUTH_PASSWORD;
      expect(() => verifyPassword('any')).toThrow('AUTH_PASSWORD 环境变量未设置');
    });
  });

  // -------------------------------------------------------------------------
  // signToken
  // -------------------------------------------------------------------------
  describe('signToken', () => {
    it('returns an object with token and expiresAt', async () => {
      const result = await signToken();

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('expiresAt');
      expect(typeof result.token).toBe('string');
      expect(result.token.length).toBeGreaterThan(0);
    });

    it('expiresAt is a valid ISO date string approximately 24h from now', async () => {
      const before = Date.now();
      const result = await signToken();
      const after = Date.now();

      const expiresAtMs = new Date(result.expiresAt).getTime();
      const twentyFourHours = 24 * 60 * 60 * 1000;

      // expiresAt should be roughly 24h from now (within 5s tolerance)
      expect(expiresAtMs).toBeGreaterThanOrEqual(before + twentyFourHours - 5000);
      expect(expiresAtMs).toBeLessThanOrEqual(after + twentyFourHours + 5000);
    });

    it('generated token can be verified by verifyToken', async () => {
      const { token } = await signToken();
      const payload = await verifyToken(token);

      expect(payload.sub).toBe('editor');
      expect(typeof payload.exp).toBe('number');
    });

    it('throws when JWT_SECRET env is not set', async () => {
      delete process.env.JWT_SECRET;
      await expect(signToken()).rejects.toThrow('JWT_SECRET 环境变量未设置');
    });
  });

  // -------------------------------------------------------------------------
  // verifyToken
  // -------------------------------------------------------------------------
  describe('verifyToken', () => {
    it('returns payload with sub and exp for a valid token', async () => {
      const { token } = await signToken();
      const payload = await verifyToken(token);

      expect(payload).toHaveProperty('sub', 'editor');
      expect(payload).toHaveProperty('exp');
      expect(typeof payload.exp).toBe('number');
    });

    it('throws for an invalid token string', async () => {
      await expect(verifyToken('invalid.token.string')).rejects.toThrow();
    });

    it('throws for an empty token', async () => {
      await expect(verifyToken('')).rejects.toThrow();
    });

    it('throws for a token signed with a different secret', async () => {
      // Sign with current secret
      const { token } = await signToken();

      // Change secret
      vi.stubEnv('JWT_SECRET', 'a-completely-different-secret-key!!');

      // Verify should fail because secrets don't match
      await expect(verifyToken(token)).rejects.toThrow();
    });

    it('throws when JWT_SECRET env is not set', async () => {
      const { token } = await signToken();
      delete process.env.JWT_SECRET;

      await expect(verifyToken(token)).rejects.toThrow(
        'JWT_SECRET 环境变量未设置',
      );
    });
  });
});
