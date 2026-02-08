# Spec: ai-friendly

AI 友好能力 —— JSON-LD 结构化数据 + llms.txt + 语义化 HTML + Open Graph。

## ADDED Requirements

### Requirement: JSON-LD 结构化数据

每个页面 MUST 注入 Schema.org JSON-LD 结构化数据，便于搜索引擎和 AI 理解内容。

#### Scenario: 文章页 JSON-LD

- **Given**: 访问一篇 Wiki 文章页面
- **When**: 查看页面源码
- **Then**: 包含 `<script type="application/ld+json">`
- **And**: JSON-LD 类型为 `Article`，包含 headline、description、datePublished、dateModified、author、keywords

#### Scenario: 首页 JSON-LD

- **Given**: 访问首页
- **When**: 查看页面源码
- **Then**: 包含 `WebSite` 类型的 JSON-LD

#### Scenario: 面包屑 JSON-LD

- **Given**: 访问 `/cooking/rice`
- **When**: 查看页面源码
- **Then**: 包含 `BreadcrumbList` 类型的 JSON-LD，路径为 首页 → 烹饪 → 米饭的做法

### Requirement: Open Graph / Twitter Card

每个页面 MUST 生成完整的 Open Graph 和 Twitter Card meta 标签。

#### Scenario: OG Meta 标签

- **Given**: 一篇文章的 frontmatter 包含 title 和 description
- **When**: 查看页面 `<head>`
- **Then**: 包含 `og:title`、`og:description`、`og:url`、`og:type`、`og:site_name`

### Requirement: llms.txt 生成

系统 MUST 按照 llms.txt 规范在 `/llms.txt` 提供站点结构摘要，便于大模型理解站点内容。

#### Scenario: llms.txt 可访问

- **Given**: 站点已部署
- **When**: 访问 `/llms.txt`
- **Then**: 返回纯文本内容，Content-Type 为 `text/plain`
- **And**: 包含站点名称、描述、内容分类列表、文章标题索引

### Requirement: 语义化 HTML

页面 MUST 使用语义化 HTML 标签，提升可访问性和 AI 可理解性。

#### Scenario: 文章页语义标签

- **Given**: 访问一篇文章
- **When**: 查看 HTML 结构
- **Then**: 文章正文包裹在 `<article>` 中
- **And**: 导航使用 `<nav>`，侧边栏使用 `<aside>`
- **And**: 日期使用 `<time datetime="...">`
