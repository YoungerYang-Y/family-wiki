# Spec: content-management

内容管理能力 —— Contentlayer 内容管线 + frontmatter schema + 分类结构。

## ADDED Requirements

### Requirement: Contentlayer 内容管线

系统 MUST 使用 Contentlayer 将 `content/` 目录下的 `.mdx` 文件转换为类型安全的 JSON 数据对象，在构建期执行。

#### Scenario: 正常解析 MDX 文件

- **Given**: `content/cooking/rice.mdx` 包含有效的 frontmatter 和正文
- **When**: 执行 `npm run build`
- **Then**: Contentlayer 生成 `.contentlayer/generated/` 下对应的 JSON 和 TypeScript 类型定义
- **And**: 可通过 `allWikiArticles` 获取所有文章数据

#### Scenario: Frontmatter 缺失必填字段

- **Given**: 一篇 `.mdx` 文件缺少 `title` 字段
- **When**: 执行 `npm run build`
- **Then**: 构建报错，提示缺少必填字段 `title`

#### Scenario: 草稿文章过滤

- **Given**: 一篇文章 frontmatter 包含 `draft: true`
- **When**: 生产环境构建并访问文章列表
- **Then**: 该文章不出现在列表中，直接访问 URL 返回 404

### Requirement: Frontmatter Schema 定义

所有文章 MUST 包含结构化的 frontmatter，定义文章元数据，包括 title、description、category 等必填字段。

#### Scenario: 完整的 frontmatter

- **Given**: 一篇文章的 frontmatter 包含 title、description、category、tags、date
- **When**: Contentlayer 解析该文件
- **Then**: 生成的数据对象包含所有字段，类型正确
- **And**: 自动计算 slug、readingTime、wordCount、headings

### Requirement: 分类结构管理

系统 MUST 通过目录结构和 `_meta.json` 管理文章分类，目录自动映射为分类。

#### Scenario: 目录自动映射为分类

- **Given**: `content/cooking/` 目录下有多篇文章
- **When**: 构建并访问 `/cooking`
- **Then**: 展示该分类下所有非草稿文章列表

#### Scenario: _meta.json 配置分类元数据

- **Given**: `content/_meta.json` 定义了分类的 label、icon、weight
- **When**: 访问首页
- **Then**: 分类按 weight 排序展示，显示配置的 label 和 icon
