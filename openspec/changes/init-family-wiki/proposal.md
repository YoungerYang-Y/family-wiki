# Proposal: init-family-wiki

## Status

Draft

## Why

个人和家庭在日常生活中积累了大量决策性知识（烹饪、健康、理财等），这些知识散落在备忘录、聊天记录、浏览器收藏夹中，难以结构化管理和快速检索。现有的 Wiki 工具（如 Notion、语雀）存在数据锁定、无法自托管、AI 不友好等问题。

需要一个 **Git 驱动、AI 友好、可订阅** 的个人知识库系统，将生活决策知识结构化存储在 GitHub 仓库中，通过静态站点展示，并提供 Web 编辑器实现在线编辑和发布。

## What

构建 Family Wiki —— 一个「个人决策型知识库（Decision-oriented Wiki）」，具备以下核心能力：

1. **内容管理**：基于 Contentlayer 的 Markdown/MDX 内容管线，类型安全的 frontmatter schema
2. **Markdown 渲染**：MDX + remark/rehype 管道，支持 GFM、代码高亮、数学公式
3. **Mermaid 图表**：构建期将 Mermaid 代码块转换为 SVG，零客户端 JS 运行时
4. **在线编辑器**：Milkdown 所见即所得编辑器，密码认证后通过 GitHub Contents API 提交
5. **全文搜索**：FlexSearch 客户端搜索，构建期生成索引，Cmd+K 快捷键唤起
6. **RSS/Atom 订阅**：自动生成 RSS 2.0 和 Atom 1.0 feed，支持分类级订阅
7. **AI 友好**：JSON-LD 结构化数据、llms.txt、语义化 HTML
8. **部署**：Vercel 部署，ISR 增量静态再生，自动 CI/CD

### 技术栈

- 框架：Next.js 14（App Router）
- UI：Tailwind CSS + shadcn/ui
- 内容处理：Contentlayer2
- 渲染：MDX + rehype-pretty-code + rehype-mermaid
- 编辑器：Milkdown
- GitHub 集成：@octokit/rest
- 认证：简单密码 + JWT (jose)
- 搜索：FlexSearch
- 订阅：feed (npm)
- 部署：Vercel

## Impact

### 新增能力

- `content-management`: Contentlayer 内容管线 + frontmatter schema
- `markdown-rendering`: MDX 渲染 + 代码高亮 + 自定义组件
- `mermaid-charts`: 构建期 Mermaid SVG 渲染
- `online-editor`: Milkdown 编辑器 + GitHub API 集成
- `search`: FlexSearch 客户端全文搜索
- `rss-subscription`: RSS 2.0 / Atom 1.0 feed 生成
- `ai-friendly`: JSON-LD + llms.txt + 语义化 HTML
- `deployment`: Vercel 部署 + Docker + CI/CD

### 破坏性变更

无（全新项目）

### 风险

- Contentlayer 已停止维护，使用社区 fork `contentlayer2`，后续可能需要迁移
- Mermaid 构建期渲染依赖 Puppeteer/Playwright，可能增加构建时间和 CI 内存需求
- GitHub Contents API 单文件大小限制 100MB，大文件需要使用 Git Blob API
