# API 契约

本文档描述 Family Wiki 服务端 API 的请求/响应格式与错误码，接口变更时须同步更新。

通用响应结构：

- 成功：`{ code: number, message: string, data?: T }`
- 错误：`{ code: number, message: string, error: string }`（`error` 为错误码字符串）

HTTP 状态码与 `code` 一致（如 200/201/400/401/404/409/500）。

---

## POST /api/auth

编辑认证，校验密码并返回 JWT。

### 请求

- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Body**:
  - `password` (string, 必填)：编辑密码

### 响应

| HTTP | code | 说明 |
|------|------|------|
| 200 | 200 | 认证成功 |
| 400 | 400 | 请求体非 JSON 或缺少 `password` |
| 401 | 401 | 密码错误 |
| 500 | 500 | 服务器内部错误（如 JWT_SECRET 未配置） |

**200 响应 body 示例**:

```json
{
  "code": 200,
  "message": "认证成功",
  "data": {
    "token": "eyJ...",
    "expiresAt": "2025-02-11T12:00:00.000Z"
  }
}
```

**错误响应 body 示例**:

```json
{
  "code": 401,
  "message": "密码错误",
  "error": "UNAUTHORIZED"
}
```

---

## POST /api/content

创建或更新文档内容（需认证）。通过 GitHub Contents API 写入仓库。

### 请求

- **Method**: `POST`
- **Headers**: `Content-Type: application/json`, `Authorization: Bearer <token>`
- **Body**:
  - `slug` (string, 必填)：文章 slug，如 `guide/example`
  - `content` (string, 必填)：Markdown 内容
  - `message` (string, 必填)：Git commit message
  - `sha` (string, 可选)：当前文件 SHA，更新时传入

### 响应

| HTTP | code | 说明 |
|------|------|------|
| 201 | 201 | 创建/更新成功 |
| 400 | 400 | 请求体非法或缺少必要字段（slug/content/message） |
| 401 | 401 | 未认证或 token 无效 |
| 409 | 409 | 冲突（文件已被修改，需刷新后重试） |
| 500 | 500 | 服务器内部错误（如 GitHub API 失败） |

**201 响应 body 示例**:

```json
{
  "code": 201,
  "message": "内容已保存",
  "data": {
    "slug": "guide/example",
    "sha": "abc123...",
    "commitUrl": "https://github.com/owner/repo/commit/..."
  }
}
```

**错误码 `error`**：`BAD_REQUEST` | `UNAUTHORIZED` | `CONFLICT` | `INTERNAL_ERROR`

---

## GET /api/content/[...slug]

按 slug 获取文档内容。支持公开（解析后数据）与需认证（原始 Markdown + SHA）。

### 请求

- **Method**: `GET`
- **URL**: `/api/content/{category}/{article}`，例如 `/api/content/guide/example`
- **Query**:
  - `raw` (optional)：`true` 时返回原始 Markdown、SHA、lastModified，且需认证；缺省或非 `true` 为公开，返回解析后的 frontmatter + 正文
- **Headers**（当 `raw=true`）：`Authorization: Bearer <token>`

### 响应

| HTTP | code | 说明 |
|------|------|------|
| 200 | 200 | 成功 |
| 401 | 401 | `raw=true` 时未认证或 token 无效 |
| 404 | 404 | 文档不存在 |
| 500 | 500 | 服务器内部错误 |

**200 响应 body（raw=false）示例**:

```json
{
  "code": 200,
  "message": "ok",
  "data": {
    "slug": "guide/example",
    "title": "示例",
    "description": "简短描述",
    "category": "guide",
    "tags": ["入门"],
    "content": "正文 Markdown...",
    "lastModified": "2025-02-10T00:00:00.000Z"
  }
}
```

**200 响应 body（raw=true）示例**:

```json
{
  "code": 200,
  "message": "ok",
  "data": {
    "slug": "guide/example",
    "raw": "---\ntitle: 示例\n...\n---\n正文",
    "sha": "abc123...",
    "lastModified": "2025-02-10T00:00:00.000Z"
  }
}
```

**错误码 `error`**：`UNAUTHORIZED` | `NOT_FOUND` | `INTERNAL_ERROR`
