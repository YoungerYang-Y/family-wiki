import { Octokit } from '@octokit/rest';

// ---------------------------------------------------------------------------
// Error types
// ---------------------------------------------------------------------------

/**
 * SHA 冲突错误 —— 当 GitHub Contents API 返回 409 时抛出
 */
export class ConflictError extends Error {
  constructor(message = '文件已被修改，请刷新后重试') {
    super(message);
    this.name = 'ConflictError';
  }
}

// ---------------------------------------------------------------------------
// Return types
// ---------------------------------------------------------------------------

export interface GitHubFileResult {
  /** 解码后的文件内容（UTF-8 字符串） */
  content: string;
  /** 文件 Blob SHA，用于后续更新 */
  sha: string;
  /** 最后修改时间（ISO 8601），来自最近一次 commit */
  lastModified?: string;
}

export interface GitHubCommitResult {
  /** 新文件的 Blob SHA */
  sha: string;
  /** 对应的 commit URL */
  commitUrl: string;
}

// ---------------------------------------------------------------------------
// Config helpers (server-side only)
// ---------------------------------------------------------------------------

function getEnvOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`环境变量 ${key} 未配置`);
  }
  return value;
}

function getConfig() {
  return {
    token: getEnvOrThrow('GITHUB_TOKEN'),
    owner: getEnvOrThrow('GITHUB_OWNER'),
    repo: getEnvOrThrow('GITHUB_REPO'),
    branch: getEnvOrThrow('GITHUB_BRANCH'),
  } as const;
}

/** 延迟初始化，每次调用时读取环境变量 */
function createOctokit(): Octokit {
  const { token } = getConfig();
  return new Octokit({ auth: token });
}

// ---------------------------------------------------------------------------
// Path helpers
// ---------------------------------------------------------------------------

/**
 * slug → GitHub 仓库内的文件路径
 * slug 格式: "category/article-name"
 * 文件路径: "content/category/article-name.mdx"
 */
export function slugToPath(slug: string): string {
  return `content/${slug}.mdx`;
}

// ---------------------------------------------------------------------------
// Core API functions
// ---------------------------------------------------------------------------

/**
 * 读取文件内容（含 SHA）
 *
 * @param slug - 文章 slug，格式 "category/article-name"
 * @returns 文件内容、SHA 和最后修改时间；文件不存在时返回 null
 */
export async function getFile(
  slug: string,
): Promise<GitHubFileResult | null> {
  const octokit = createOctokit();
  const { owner, repo, branch } = getConfig();
  const path = slugToPath(slug);

  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    });

    // getContent 可能返回数组（目录）或单个文件对象
    if (Array.isArray(data) || data.type !== 'file') {
      return null;
    }

    // GitHub 返回 Base64 编码的内容
    const content = Buffer.from(data.content, 'base64').toString('utf-8');

    // 尝试获取最后修改时间（通过最近一次 commit）
    let lastModified: string | undefined;
    try {
      const { data: commits } = await octokit.repos.listCommits({
        owner,
        repo,
        path,
        sha: branch,
        per_page: 1,
      });
      if (commits.length > 0 && commits[0].commit.committer?.date) {
        lastModified = commits[0].commit.committer.date;
      }
    } catch {
      // 获取 commit 历史失败不影响主流程
    }

    return { content, sha: data.sha, lastModified };
  } catch (error: unknown) {
    if (isOctokitError(error) && error.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * 获取文件的 SHA（用于检查文件是否存在及后续更新）
 *
 * @param slug - 文章 slug，格式 "category/article-name"
 * @returns 文件 SHA；文件不存在时返回 null
 */
export async function getFileSha(slug: string): Promise<string | null> {
  const octokit = createOctokit();
  const { owner, repo, branch } = getConfig();
  const path = slugToPath(slug);

  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    });

    if (Array.isArray(data) || data.type !== 'file') {
      return null;
    }

    return data.sha;
  } catch (error: unknown) {
    if (isOctokitError(error) && error.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * 创建或更新文件
 *
 * - 不传 sha → 创建新文件
 * - 传 sha → 更新已有文件（SHA 不匹配时抛出 ConflictError）
 *
 * @param slug    - 文章 slug，格式 "category/article-name"
 * @param content - 文件内容（UTF-8 字符串，将自动 Base64 编码）
 * @param message - Git commit message
 * @param sha     - 当前文件 SHA（更新时必须传入）
 * @returns 新的 SHA 和 commit URL
 */
export async function createOrUpdateFile(
  slug: string,
  content: string,
  message: string,
  sha?: string,
): Promise<GitHubCommitResult> {
  const octokit = createOctokit();
  const { owner, repo, branch } = getConfig();
  const path = slugToPath(slug);

  // 将内容编码为 Base64
  const encodedContent = Buffer.from(content, 'utf-8').toString('base64');

  try {
    const { data } = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: encodedContent,
      branch,
      ...(sha ? { sha } : {}),
    });

    return {
      sha: data.content?.sha ?? '',
      commitUrl: data.commit.html_url ?? '',
    };
  } catch (error: unknown) {
    if (isOctokitError(error) && error.status === 409) {
      throw new ConflictError();
    }
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

interface OctokitError {
  status: number;
  message: string;
}

function isOctokitError(error: unknown): error is OctokitError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as OctokitError).status === 'number'
  );
}
