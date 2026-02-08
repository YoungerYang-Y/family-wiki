# Design: init-family-wiki

## 模块边界

### 1. Content Layer（内容层）

- **职责**: Markdown 文件的读取、解析、校验；通过 Contentlayer 将 `content/` 目录中的 `.mdx` 文件转换为类型安全的 JSON 数据；构建期生成搜索索引和 sitemap 数据
- **输入**: `content/` 目录下的 `.mdx` 文件（含 frontmatter）
- **输出**: 类型化的 `Wiki` 文档对象、搜索索引 JSON、分类树结构
- **依赖**: `contentlayer2`、`remark-frontmatter`、`gray-matter`
- **边界约束**:
  - 只负责"源文件 → 结构化数据"的转换，不涉及渲染
  - Frontmatter schema 在此层定义和校验
  - 构建期执行，不在运行时读取文件系统

### 2. Rendering Layer（渲染层）

- **职责**: 将 Contentlayer 输出的 MDX body 渲染为 React 组件；Mermaid 图表在构建期转换为 SVG 内联；代码块语法高亮；自定义组件映射
- **输入**: Contentlayer 产出的 `body.code`（MDX 编译结果）
- **输出**: React Server Component 可渲染的 JSX
- **依赖**: Contentlayer 内置 `useMDXComponent`、`rehype-pretty-code`（Shiki）、`rehype-mermaid`
- **边界约束**:
  - Mermaid 必须在构建期（Node 环境）转 SVG，禁止客户端运行时渲染
  - 自定义 MDX 组件映射集中管理在 `mdx-components.tsx`
  - 不涉及数据获取，只负责"数据 → 视图"

### 3. Editor Layer（编辑层）

- **职责**: 提供 Web 端 Markdown 编辑器；实时预览；提交变更到 GitHub
- **输入**: 用户的编辑内容、当前文档的原始 Markdown
- **输出**: 编辑后的 Markdown 文本 → 调用 API 层提交
- **依赖**: `@milkdown/core`、`@milkdown/preset-commonmark`、API Layer
- **边界约束**:
  - 纯客户端组件（`"use client"`），不参与 SSR
  - 编辑器不直接调用 GitHub API，必须通过 API 层中转（保护 Token）
  - 需要认证后才能进入编辑模式

### 4. API Layer（API 层）

- **职责**: 封装 GitHub Contents API 的 CRUD 操作；认证与授权（简单密码验证 + JWT session）；Revalidation 触发
- **输入**: HTTP 请求（来自编辑器或外部客户端）
- **输出**: JSON 响应（标准格式）
- **依赖**: `@octokit/rest`、`jose`（JWT）、Next.js Route Handlers
- **边界约束**:
  - 所有 GitHub Token 只在服务端使用，禁止暴露到客户端
  - 统一错误响应格式
  - API 路由全部位于 `app/api/` 下
  - 内容变更后触发 ISR revalidation

### 5. UI Layer（UI 层）

- **职责**: 页面布局（Header、Sidebar、Footer）；导航与面包屑；主题切换；响应式设计；TOC
- **输入**: Contentlayer 产出的文档数据、路由参数
- **输出**: 完整的页面 UI
- **依赖**: `tailwindcss`、`shadcn/ui`、`next-themes`、`lucide-react`
- **边界约束**:
  - 优先使用 Server Component，仅交互部分使用 Client Component
  - 布局组件在 `app/layout.tsx` 中定义，采用嵌套 layout
  - shadcn/ui 组件安装到 `components/ui/`，业务组件在 `components/` 根层

### 6. Subscription Layer（订阅层）

- **职责**: 生成 RSS 2.0 和 Atom 1.0 feed
- **输入**: Contentlayer 产出的全部文档数据（按更新时间排序）
- **输出**: XML 格式的 RSS / Atom feed
- **依赖**: `feed`（npm 包）、Contentlayer 数据
- **边界约束**:
  - 使用 Next.js Route Handler 动态生成（支持 ISR 缓存）
  - Feed 条目数限制（最近 50 篇）

### 7. AI Friendliness Layer（AI 友好层）

- **职责**: 生成 JSON-LD 结构化数据（Schema.org）；生成 `/llms.txt`；语义化 HTML
- **输入**: 文档元数据（frontmatter）、站点配置
- **输出**: `<script type="application/ld+json">`、`llms.txt` 文件
- **依赖**: Contentlayer 数据、站点配置
- **边界约束**:
  - JSON-LD 在每个页面的 Server Component 中注入
  - `llms.txt` 在构建期生成为静态文件

## 技术选型

| 需求 | 方案 | 理由 |
|------|------|------|
| SSR 框架 | Next.js 14 (App Router) | 原生 RSC 支持、ISR/SSR 灵活切换、Vercel 一键部署 |
| 内容处理 | Contentlayer2 | 类型安全 Markdown→JSON 管道，构建期处理零运行时开销 |
| MDX 渲染 | Contentlayer `useMDXComponent` | 直接消费编译产物，无需额外配置 |
| 代码高亮 | rehype-pretty-code (Shiki) | 构建期高亮、行高亮/行号、VSCode 兼容语法 |
| Mermaid | rehype-mermaid (strategy: img-svg) | 构建期 SVG，零 JS 运行时 |
| CSS | Tailwind CSS v3 | 原子化 CSS、JIT 编译、shadcn/ui 配套 |
| 组件库 | shadcn/ui | 非黑盒可定制、基于 Radix UI |
| 编辑器 | Milkdown | ProseMirror 架构、插件化、WYSIWYG |
| GitHub 集成 | @octokit/rest | 官方 SDK，类型安全 |
| 认证 | 简单密码 + JWT (jose) | 个人项目无需 OAuth，jose 轻量 Edge 兼容 |
| 搜索 | FlexSearch | 纯客户端全文搜索，零服务端依赖 |
| RSS/Atom | feed (npm) | 同时支持 RSS 2.0 / Atom 1.0 / JSON Feed |
| 主题切换 | next-themes | 与 App Router + Tailwind dark: 完美配合 |
| 部署 | Vercel | Next.js 原生支持、自动 ISR |

## 接口契约

### 统一响应格式

```typescript
// 成功响应
interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

// 错误响应
interface ApiError {
  code: number;
  error: string;
  message: string;
  details?: unknown;
}
```

### POST /api/auth — 密码验证

- **Method**: POST
- **Path**: `/api/auth`
- **描述**: 验证编辑密码，返回 JWT Token
- **Request**: `{ "password": "string" }`
- **Response (200)**: `{ "code": 200, "data": { "token": "eyJ...", "expiresAt": "ISO8601" }, "message": "认证成功" }`
- **Error Codes**:
  - 400: `BAD_REQUEST` — 缺少 password 字段
  - 401: `UNAUTHORIZED` — 密码错误
  - 429: `RATE_LIMITED` — 请求过于频繁

### GET /api/content/[...slug] — 获取内容

- **Method**: GET
- **Path**: `/api/content/[...slug]`
- **描述**: 获取指定路径的原始 Markdown 内容（编辑器加载用）
- **Headers**: `Authorization: Bearer <token>`（编辑模式需要）
- **Query**: `raw=true` 返回原始 Markdown，默认返回解析后数据
- **Response (200, raw=false)**: `{ "code": 200, "data": { "slug", "title", "description", "category", "tags", "content"(HTML), "lastModified", "readingTime" }, "message": "ok" }`
- **Response (200, raw=true)**: `{ "code": 200, "data": { "slug", "raw"(Markdown), "sha", "lastModified" }, "message": "ok" }`
- **Error Codes**:
  - 401: `UNAUTHORIZED` — raw=true 时需要认证
  - 404: `NOT_FOUND` — 文档不存在

### POST /api/content — 创建/更新内容

- **Method**: POST
- **Path**: `/api/content`
- **描述**: 通过 GitHub Contents API 创建或更新 Markdown 文件
- **Headers**: `Authorization: Bearer <token>`（必须）
- **Request**: `{ "slug": "string", "content": "Markdown string", "message": "commit message", "sha"?: "string (更新时必须)" }`
- **Response (200/201)**: `{ "code": 201, "data": { "slug", "sha", "commitUrl" }, "message": "内容已保存" }`
- **Error Codes**:
  - 400: `BAD_REQUEST` — 缺少必要字段
  - 401: `UNAUTHORIZED` — 未认证
  - 409: `CONFLICT` — sha 不匹配，文件已被修改
  - 422: `VALIDATION_ERROR` — Frontmatter 校验失败

### GET /api/search — 搜索

- **Method**: GET
- **Path**: `/api/search`
- **描述**: 全文搜索（FlexSearch 的服务端降级方案）
- **Query**: `q` (required), `limit` (optional, default=20), `category` (optional)
- **Response (200)**: `{ "code": 200, "data": { "query", "total", "items": [{ "slug", "title", "description", "category", "excerpt", "score" }] }, "message": "ok" }`
- **Error Codes**:
  - 400: `BAD_REQUEST` — 搜索关键词为空

### GET /feed.xml — RSS Feed

- **Method**: GET
- **Path**: `/feed.xml`
- **Response**: RSS 2.0 XML, `Content-Type: application/xml`
- **缓存**: `Cache-Control: s-maxage=3600, stale-while-revalidate=600`

### GET /feed.atom — Atom Feed

- **Method**: GET
- **Path**: `/feed.atom`
- **Response**: Atom 1.0 XML, `Content-Type: application/atom+xml`
- **缓存**: 同 RSS

### GET /llms.txt — AI 摘要

- **Method**: GET
- **Path**: `/llms.txt`
- **Response**: 纯文本, `Content-Type: text/plain`

## 数据模型

### WikiArticle（Frontmatter Schema）

```typescript
interface WikiArticle {
  // 必填
  title: string;
  description: string;
  category: string;

  // 可选
  tags?: string[];
  date?: string;              // ISO 8601
  lastModified?: string;      // ISO 8601，Git 自动获取
  draft?: boolean;            // 默认 false
  weight?: number;            // 排序权重，越小越靠前
  icon?: string;              // emoji 或 lucide icon name
  decisionStatus?: 'active' | 'deprecated' | 'reviewing';
  relatedSlugs?: string[];
  author?: string;

  // 计算字段（Contentlayer 生成）
  slug: string;
  readingTime: number;
  headings: Heading[];
  wordCount: number;
  url: string;
}

interface Heading {
  depth: number;  // 1-6
  text: string;
  slug: string;   // 锚点 ID
}
```

### Category（分类结构）

```typescript
interface Category {
  name: string;          // 目录名
  label: string;         // 显示名称
  description?: string;
  icon?: string;
  weight?: number;
  children?: Category[];
}
```

分类通过 `content/_meta.json` 配置。

### SearchIndexItem（搜索索引）

```typescript
interface SearchIndexItem {
  id: string;           // slug
  title: string;
  description: string;
  category: string;
  tags: string[];
  content: string;      // 纯文本（去除 Markdown 标记）
  url: string;
}
```

构建期输出: `public/search-index.json`

### SiteConfig（站点配置）

```typescript
interface SiteConfig {
  title: string;
  description: string;
  url: string;
  author: { name: string; email?: string; url?: string };
  github: { owner: string; repo: string; branch: string; contentPath: string };
  nav: NavItem[];
  footer: { links: NavItem[]; copyright: string };
}
```

## 目录结构

```
family-wiki/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # 根布局
│   ├── page.tsx                      # 首页
│   ├── not-found.tsx                 # 404
│   ├── globals.css                   # Tailwind 入口
│   ├── [category]/
│   │   ├── page.tsx                  # 分类文章列表
│   │   └── [slug]/
│   │       └── page.tsx              # 文章详情（SSR/ISR）
│   ├── editor/
│   │   ├── page.tsx                  # 新建文章
│   │   └── [category]/[slug]/
│   │       └── page.tsx              # 编辑已有文章
│   ├── api/
│   │   ├── auth/route.ts            # POST /api/auth
│   │   ├── content/
│   │   │   ├── route.ts             # POST /api/content
│   │   │   └── [...slug]/route.ts   # GET /api/content/[...slug]
│   │   └── search/route.ts          # GET /api/search
│   ├── feed.xml/route.ts            # RSS
│   ├── feed.atom/route.ts           # Atom
│   ├── llms.txt/route.ts            # llms.txt
│   ├── sitemap.ts
│   └── robots.ts
├── components/
│   ├── ui/                           # shadcn/ui
│   ├── layout/                       # 布局（header, sidebar, footer, breadcrumb, toc）
│   ├── mdx/                          # MDX 组件（callout, mermaid, code-block）
│   ├── editor/                       # 编辑器（milkdown-editor, toolbar, preview）
│   ├── search/                       # 搜索（search-dialog, search-results）
│   └── shared/                       # 通用（article-card, tag-badge, json-ld, theme-toggle）
├── lib/
│   ├── github.ts                    # GitHub API 封装
│   ├── auth.ts                      # JWT 签发/验证
│   ├── feed.ts                      # RSS/Atom 生成
│   ├── search.ts                    # FlexSearch 索引
│   ├── llms.ts                      # llms.txt 生成
│   ├── utils.ts                     # 工具函数
│   └── constants.ts                 # 常量
├── config/
│   └── site.ts                      # 站点配置
├── content/                          # Wiki 内容
│   ├── _meta.json                   # 分类元数据
│   ├── cooking/
│   ├── health/
│   └── finance/
├── public/
│   ├── images/
│   ├── search-index.json            # 构建期生成
│   └── favicon.ico
├── contentlayer.config.ts
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── .env.example
├── Dockerfile
├── docker-compose.yml
├── components.json                   # shadcn/ui 配置
└── README.md
```

## 数据流

### 构建期

```
content/*.mdx → Contentlayer → .contentlayer/generated/ → Next.js Build → SSR HTML + ISR 缓存 + feed.xml + llms.txt + search-index.json
```

### 读取流（用户浏览）

```
浏览器 → GET /{category}/{slug} → Next.js Server (ISR) → 读取 Contentlayer 缓存 → 渲染 MDX → 返回 SSR HTML → 客户端水合 → 懒加载 search-index.json
```

### 写入流（编辑发布）

```
浏览器(编辑器) → POST /api/auth → 验证密码 → JWT
              → GET /api/content/slug?raw=true → GitHub Contents API → 原始 Markdown + sha
              → 编辑内容
              → POST /api/content → GitHub Contents API (PUT) → 新 sha + commitUrl
              → revalidatePath → ISR 重新生成
```

## 环境变量

```bash
# GitHub（服务端）
GITHUB_TOKEN=ghp_xxx          # Personal Access Token
GITHUB_OWNER=YoungerYang      # 仓库 Owner
GITHUB_REPO=family-wiki       # 仓库名
GITHUB_BRANCH=main            # 内容分支

# 认证
AUTH_PASSWORD=xxx              # 编辑密码
JWT_SECRET=xxx                 # JWT 密钥（>=32 字符）

# 站点
NEXT_PUBLIC_SITE_URL=https://wiki.example.com
```
