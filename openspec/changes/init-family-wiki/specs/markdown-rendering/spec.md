# Spec: markdown-rendering

Markdown 渲染能力 —— MDX + remark/rehype 管道 + 自定义组件 + 代码高亮。

## ADDED Requirements

### Requirement: MDX 渲染管道

系统 MUST 使用 remark/rehype 插件链处理 MDX 内容，SHALL 支持 GFM、数学公式、代码高亮。

#### Scenario: GFM 表格渲染

- **Given**: 文章正文包含 GFM 格式的表格
- **When**: 访问该文章页面
- **Then**: 表格以样式化的 HTML `<table>` 渲染，支持响应式滚动

#### Scenario: 代码块语法高亮

- **Given**: 文章正文包含带语言标注的代码块（如 ```typescript）
- **When**: 访问该文章页面
- **Then**: 代码块使用 Shiki 语法高亮渲染，支持行号和复制按钮

#### Scenario: 数学公式渲染

- **Given**: 文章正文包含 LaTeX 数学公式（`$...$` 行内、`$$...$$` 块级）
- **When**: 访问该文章页面
- **Then**: 数学公式正确渲染为可读格式

### Requirement: 自定义 MDX 组件

系统 MUST 提供一组自定义 MDX 组件映射，集中管理在 `mdx-components.tsx` 中。

#### Scenario: Callout 提示框

- **Given**: 文章使用 `> [!NOTE]` 或 `> [!WARNING]` 语法
- **When**: 访问该文章页面
- **Then**: 渲染为带图标和颜色区分的提示框组件

#### Scenario: 标题锚点链接

- **Given**: 文章包含多级标题（h2~h4）
- **When**: 访问该文章页面
- **Then**: 每个标题自动生成锚点 ID，悬停显示链接图标

### Requirement: 文章页面 SSR 渲染

文章页面 MUST 使用 SSR/ISR 渲染，确保完整 HTML 可被搜索引擎和 RSS 阅读器获取。

#### Scenario: SSR 返回完整 HTML

- **Given**: 一篇已发布的文章
- **When**: 使用 curl 或 fetch 请求文章 URL
- **Then**: 响应 HTML 包含完整的文章正文内容（非客户端渲染占位符）

#### Scenario: TOC 目录生成

- **Given**: 一篇包含多级标题的文章
- **When**: 访问该文章页面
- **Then**: 侧栏显示 Table of Contents，正确反映标题层级
- **And**: 点击 TOC 条目跳转到对应标题位置
