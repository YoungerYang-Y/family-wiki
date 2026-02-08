# Spec: search

搜索能力 —— FlexSearch 客户端全文搜索 + Command Palette UI。

## ADDED Requirements

### Requirement: 构建期搜索索引生成

系统 MUST 在构建期从 Contentlayer 数据生成 FlexSearch 搜索索引，输出为 `public/search-index.json`。

#### Scenario: 索引内容完整

- **Given**: `content/` 下有 10 篇非草稿文章
- **When**: 执行 `npm run build`
- **Then**: `public/search-index.json` 包含 10 条索引项
- **And**: 每条包含 id、title、description、category、tags、content（纯文本）、url

#### Scenario: 草稿文章不纳入索引

- **Given**: 一篇文章 `draft: true`
- **When**: 构建搜索索引
- **Then**: 该文章不出现在 `search-index.json` 中

### Requirement: 客户端搜索 UI

系统 MUST 提供 Command Palette 风格的搜索面板，SHALL 支持快捷键唤起和键盘导航。

#### Scenario: 快捷键唤起搜索

- **Given**: 用户在任意页面
- **When**: 按下 `Cmd+K`（Mac）或 `Ctrl+K`（Windows）
- **Then**: 搜索面板弹出，输入框自动聚焦

#### Scenario: 搜索结果展示

- **Given**: 搜索面板已打开
- **When**: 输入关键词 "米饭"
- **Then**: 200ms 内展示匹配结果
- **And**: 结果包含标题、摘要片段、关键词高亮

#### Scenario: 键盘导航

- **Given**: 搜索结果已展示
- **When**: 使用上下箭头键选择、Enter 确认
- **Then**: 跳转到选中的文章页面

### Requirement: 搜索索引懒加载

搜索索引 MUST 仅在首次触发搜索时加载，SHALL NOT 影响首屏加载性能。

#### Scenario: 首屏不加载索引

- **Given**: 用户访问首页
- **When**: 页面加载完成
- **Then**: 网络请求中不包含 `search-index.json`

#### Scenario: 首次搜索加载索引

- **Given**: 用户首次按下 `Cmd+K`
- **When**: 搜索面板打开
- **Then**: 异步加载 `search-index.json` 并构建 FlexSearch 索引
- **And**: 后续搜索直接使用内存中的索引
