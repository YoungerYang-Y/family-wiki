import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Octokit before importing the module under test
const mockGetContent = vi.fn();
const mockListCommits = vi.fn();
const mockCreateOrUpdateFileContents = vi.fn();

vi.mock('@octokit/rest', () => ({
  Octokit: vi.fn().mockImplementation(() => ({
    repos: {
      getContent: mockGetContent,
      listCommits: mockListCommits,
      createOrUpdateFileContents: mockCreateOrUpdateFileContents,
    },
  })),
}));

import {
  slugToPath,
  getFile,
  getFileSha,
  createOrUpdateFile,
  ConflictError,
} from '@/lib/github';

describe('github', () => {
  beforeEach(() => {
    vi.stubEnv('GITHUB_TOKEN', 'test-token');
    vi.stubEnv('GITHUB_OWNER', 'test-owner');
    vi.stubEnv('GITHUB_REPO', 'test-repo');
    vi.stubEnv('GITHUB_BRANCH', 'main');

    mockGetContent.mockReset();
    mockListCommits.mockReset();
    mockCreateOrUpdateFileContents.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  // -------------------------------------------------------------------------
  // slugToPath
  // -------------------------------------------------------------------------
  describe('slugToPath', () => {
    it('converts slug to content path with .mdx extension', () => {
      expect(slugToPath('health/diet')).toBe('content/health/diet.mdx');
    });

    it('handles single-level slug', () => {
      expect(slugToPath('about')).toBe('content/about.mdx');
    });

    it('handles deeply nested slug', () => {
      expect(slugToPath('a/b/c/d')).toBe('content/a/b/c/d.mdx');
    });
  });

  // -------------------------------------------------------------------------
  // getFile
  // -------------------------------------------------------------------------
  describe('getFile', () => {
    it('returns decoded content, sha, and lastModified for an existing file', async () => {
      const fileContent = '# Hello World\n\nThis is test content.';
      const base64Content = Buffer.from(fileContent, 'utf-8').toString('base64');

      mockGetContent.mockResolvedValue({
        data: {
          type: 'file',
          content: base64Content,
          sha: 'abc123sha',
        },
      });

      mockListCommits.mockResolvedValue({
        data: [
          {
            commit: {
              committer: {
                date: '2025-12-01T10:00:00Z',
              },
            },
          },
        ],
      });

      const result = await getFile('health/diet');

      expect(result).not.toBeNull();
      expect(result!.content).toBe(fileContent);
      expect(result!.sha).toBe('abc123sha');
      expect(result!.lastModified).toBe('2025-12-01T10:00:00Z');

      expect(mockGetContent).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo',
        path: 'content/health/diet.mdx',
        ref: 'main',
      });
    });

    it('returns null when file is not found (404)', async () => {
      mockGetContent.mockRejectedValue({ status: 404, message: 'Not Found' });

      const result = await getFile('nonexistent/page');

      expect(result).toBeNull();
    });

    it('returns null when getContent returns a directory (array)', async () => {
      mockGetContent.mockResolvedValue({
        data: [{ type: 'file', name: 'a.mdx' }],
      });

      const result = await getFile('some/dir');

      expect(result).toBeNull();
    });

    it('returns result without lastModified when listCommits fails', async () => {
      const fileContent = 'test content';
      const base64Content = Buffer.from(fileContent, 'utf-8').toString('base64');

      mockGetContent.mockResolvedValue({
        data: {
          type: 'file',
          content: base64Content,
          sha: 'sha456',
        },
      });

      mockListCommits.mockRejectedValue(new Error('API rate limit'));

      const result = await getFile('health/diet');

      expect(result).not.toBeNull();
      expect(result!.content).toBe(fileContent);
      expect(result!.sha).toBe('sha456');
      expect(result!.lastModified).toBeUndefined();
    });

    it('rethrows non-404 errors', async () => {
      mockGetContent.mockRejectedValue({ status: 500, message: 'Server Error' });

      await expect(getFile('health/diet')).rejects.toEqual({
        status: 500,
        message: 'Server Error',
      });
    });
  });

  // -------------------------------------------------------------------------
  // getFileSha
  // -------------------------------------------------------------------------
  describe('getFileSha', () => {
    it('returns sha for an existing file', async () => {
      mockGetContent.mockResolvedValue({
        data: {
          type: 'file',
          sha: 'file-sha-789',
        },
      });

      const result = await getFileSha('health/diet');

      expect(result).toBe('file-sha-789');
    });

    it('returns null when file is not found (404)', async () => {
      mockGetContent.mockRejectedValue({ status: 404, message: 'Not Found' });

      const result = await getFileSha('nonexistent/page');

      expect(result).toBeNull();
    });

    it('returns null when getContent returns a directory (array)', async () => {
      mockGetContent.mockResolvedValue({
        data: [{ type: 'file', name: 'a.mdx' }],
      });

      const result = await getFileSha('some/dir');

      expect(result).toBeNull();
    });

    it('rethrows non-404 errors', async () => {
      mockGetContent.mockRejectedValue({ status: 403, message: 'Forbidden' });

      await expect(getFileSha('health/diet')).rejects.toEqual({
        status: 403,
        message: 'Forbidden',
      });
    });
  });

  // -------------------------------------------------------------------------
  // createOrUpdateFile
  // -------------------------------------------------------------------------
  describe('createOrUpdateFile', () => {
    it('creates a new file and returns sha and commitUrl', async () => {
      mockCreateOrUpdateFileContents.mockResolvedValue({
        data: {
          content: { sha: 'new-sha-001' },
          commit: { html_url: 'https://github.com/test/commit/abc' },
        },
      });

      const result = await createOrUpdateFile(
        'health/diet',
        '# New Content',
        'feat: add diet page',
      );

      expect(result.sha).toBe('new-sha-001');
      expect(result.commitUrl).toBe('https://github.com/test/commit/abc');

      expect(mockCreateOrUpdateFileContents).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo',
        path: 'content/health/diet.mdx',
        message: 'feat: add diet page',
        content: Buffer.from('# New Content', 'utf-8').toString('base64'),
        branch: 'main',
      });
    });

    it('updates an existing file with sha parameter', async () => {
      mockCreateOrUpdateFileContents.mockResolvedValue({
        data: {
          content: { sha: 'updated-sha-002' },
          commit: { html_url: 'https://github.com/test/commit/def' },
        },
      });

      const result = await createOrUpdateFile(
        'health/diet',
        '# Updated Content',
        'fix: update diet page',
        'old-sha-001',
      );

      expect(result.sha).toBe('updated-sha-002');
      expect(result.commitUrl).toBe('https://github.com/test/commit/def');

      expect(mockCreateOrUpdateFileContents).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo',
        path: 'content/health/diet.mdx',
        message: 'fix: update diet page',
        content: Buffer.from('# Updated Content', 'utf-8').toString('base64'),
        branch: 'main',
        sha: 'old-sha-001',
      });
    });

    it('throws ConflictError when GitHub returns 409', async () => {
      mockCreateOrUpdateFileContents.mockRejectedValue({
        status: 409,
        message: 'Conflict',
      });

      await expect(
        createOrUpdateFile(
          'health/diet',
          '# Content',
          'update',
          'stale-sha',
        ),
      ).rejects.toThrow(ConflictError);
    });

    it('thrown ConflictError has correct name and message', async () => {
      mockCreateOrUpdateFileContents.mockRejectedValue({
        status: 409,
        message: 'Conflict',
      });

      try {
        await createOrUpdateFile('health/diet', '# Content', 'update', 'stale-sha');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictError);
        expect((error as ConflictError).name).toBe('ConflictError');
        expect((error as ConflictError).message).toBe('文件已被修改，请刷新后重试');
      }
    });

    it('rethrows non-409 errors', async () => {
      mockCreateOrUpdateFileContents.mockRejectedValue({
        status: 500,
        message: 'Internal Server Error',
      });

      await expect(
        createOrUpdateFile('health/diet', '# Content', 'update'),
      ).rejects.toEqual({
        status: 500,
        message: 'Internal Server Error',
      });
    });
  });

  // -------------------------------------------------------------------------
  // ConflictError
  // -------------------------------------------------------------------------
  describe('ConflictError', () => {
    it('has correct name and default message', () => {
      const error = new ConflictError();
      expect(error.name).toBe('ConflictError');
      expect(error.message).toBe('文件已被修改，请刷新后重试');
      expect(error).toBeInstanceOf(Error);
    });

    it('accepts a custom message', () => {
      const error = new ConflictError('custom conflict message');
      expect(error.message).toBe('custom conflict message');
    });
  });
});
