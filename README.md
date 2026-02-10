# Family Wiki

家庭生活指南 · 个人决策型知识库（Decision-oriented Wiki）

基于 Git 驱动、AI 友好、可订阅的 Markdown/MDX 知识库，内容存储在 GitHub 仓库，支持在线编辑与 RSS/Atom 订阅。

## 功能概览

- **内容管理**：Contentlayer 类型安全 Markdown/MDX 管线，frontmatter 校验
- **渲染**：MDX + GFM、代码高亮、数学公式、Mermaid 图表（构建期转 SVG）
- **全文搜索**：FlexSearch 客户端搜索，`Cmd+K` / `Ctrl+K` 唤起
- **在线编辑**：Milkdown 编辑器，密码认证后通过 GitHub Contents API 发布
- **订阅**：RSS 2.0（`/feed.xml`）、Atom（`/feed.atom`），支持分类级 feed
- **AI 友好**：JSON-LD、llms.txt、语义化 HTML
- **SEO**：sitemap.xml、robots.txt、Canonical URL

## 本地开发

### 环境要求

- Node.js >= 18.12.0
- pnpm（推荐）

### 安装与运行

```bash
# 安装依赖
pnpm install

# 开发（默认 http://localhost:3000）
pnpm dev

# 生产构建
pnpm build

# 生产运行
pnpm start
```

### 脚本说明

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 构建生产版本（含搜索索引） |
| `pnpm build:analyze` | 构建并生成 Bundle 分析报告（需 `ANALYZE=true`） |
| `pnpm start` | 以生产模式启动 |
| `pnpm lint` | ESLint 检查 |
| `pnpm test` | 运行单元测试 |
| `pnpm test:e2e` | 运行 Playwright E2E 测试 |
| `pnpm format` | Prettier 格式化 |

## 环境变量

复制 `.env.example` 为 `.env.local`（本地）或按部署平台配置环境变量。

| 变量 | 说明 | 必填 |
|------|------|------|
| `GITHUB_TOKEN` | GitHub Personal Access Token（repo 权限） | 编辑/发布时 |
| `GITHUB_OWNER` | 仓库 Owner | 是 |
| `GITHUB_REPO` | 仓库名 | 是 |
| `GITHUB_BRANCH` | 内容分支，默认 `main` | 否 |
| `AUTH_PASSWORD` | 编辑密码，用于在线编辑鉴权 | 编辑时 |
| `JWT_SECRET` | JWT 签名密钥（≥32 字符） | 编辑时 |
| `NEXT_PUBLIC_SITE_URL` | 站点完整 URL（用于 sitemap、feed、OG） | 生产环境建议设置 |

详见 `.env.example` 内注释。

## 部署

### Vercel（推荐）

1. 将仓库推送到 GitHub。
2. 在 [Vercel](https://vercel.com) 中 **Import** 该仓库，框架选 Next.js（自动识别）。
3. 在项目 **Settings → Environment Variables** 中配置上述环境变量（Production / Preview 按需）。
4. 部署后：
   - **Push to main** 会触发生产部署。
   - **Pull Request** 会生成 Preview 部署（预览 URL 在 PR 中可见）。
5. 可选：在 **Settings → Git** 中确认 Connected Git Repository 与分支无误。

项目已包含 `vercel.json`（`framework: nextjs`、`buildCommand`、`installCommand`），无需额外配置即可使用 ISR/SSR。

### Docker

```bash
# 构建镜像
docker build -t family-wiki .

# 运行（需挂载或传入环境变量）
docker run -p 3000:3000 \
  -e GITHUB_TOKEN=xxx \
  -e GITHUB_OWNER=your-org \
  -e GITHUB_REPO=your-repo \
  -e AUTH_PASSWORD=xxx \
  -e JWT_SECRET=xxx \
  -e NEXT_PUBLIC_SITE_URL=https://wiki.example.com \
  family-wiki
```

或使用 docker-compose（需在 `docker-compose.yml` 或 `.env` 中配置环境变量）：

```bash
docker-compose up
```

## 内容编写指南

- 内容存放在 `content/` 目录下，按分类建子目录（如 `content/guide/`、`content/cooking/`）。
- 使用 **MDX**（`.mdx`）格式，支持 JSX 与自定义组件。
- 每篇文章需包含 frontmatter：
  - 必填：`title`、`description`、`category`
  - 可选：`tags`、`date`、`draft`、`weight`、`author`、`decisionStatus` 等。
- 分类元数据在 `content/_meta.json` 中配置（名称、图标、排序等）。
- 在线编辑：访问 `/editor` 新建、`/editor/[category]/[slug]` 编辑已有文章，首次需输入配置的编辑密码。

示例 frontmatter：

```yaml
---
title: 文章标题
description: 简短描述
category: guide
tags: [入门, 示例]
date: 2024-01-01
draft: false
---
```

## 故障排除

- **开发时修改 content 后页面未更新**：删除缓存后重启  
  `rm -rf .next .contentlayer && pnpm dev`
- **终端出现 webpack 关于 `generate-dotpkg.js` 的 cache 告警**：来自 contentlayer2 的动态 import，可忽略，不影响使用。
- **Vercel 构建失败**：确认 Node 版本（推荐 20）、`pnpm` 已正确安装（Vercel 会自动检测 `packageManager` 或使用 `vercel.json` 中的 `installCommand`）。

## 许可证

Private / 按仓库约定。
