# Tasks: init-family-wiki

## Tasks

### Milestone 1: 项目初始化与基础架构

- [x] Task 1.1: 初始化 Next.js 14 项目（App Router），配置 TypeScript、ESLint、Prettier
- [x] Task 1.2: 集成 Tailwind CSS，配置主题色、排版（typography plugin）、暗色模式
- [x] Task 1.3: 集成 shadcn/ui，安装基础组件（Button、Input、Dialog、Sheet、Toast 等）
- [x] Task 1.4: 定义目录结构规范（`content/`、`app/`、`components/`、`lib/`、`types/`）
- [x] Task 1.5: 定义 Markdown 内容的 frontmatter schema（title、description、tags、category、created、updated、decision-status 等）
- [x] Task 1.6: 配置 Contentlayer，定义 Document Type，映射 `content/` 目录下的 `.md`/`.mdx` 文件
- [x] Task 1.7: 配置环境变量结构（`GITHUB_TOKEN`、`GITHUB_REPO`、`GITHUB_OWNER`、`EDIT_PASSWORD` 等），创建 `.env.example`
- [x] Task 1.8: 编写 Dockerfile 和 docker-compose.yml，支持本地开发和生产构建
- [x] Task 1.9: 配置 GitHub Actions CI（lint → test → build → Docker image build）
- [x] Task 1.10: 添加示例内容文件（`content/guide/example.mdx`），验证 Contentlayer 管线正常工作

**依赖关系**：Task 1.1 → 1.2 → 1.3（顺序）；Task 1.4 与 1.5 可并行；Task 1.6 依赖 1.4 + 1.5；Task 1.7 独立；Task 1.8 依赖 1.1；Task 1.9 依赖 1.8；Task 1.10 依赖 1.6

### Milestone 2: 内容渲染与页面布局

- [x] Task 2.1: 配置 MDX 处理管线（remark-gfm、rehype-slug、rehype-autolink-headings、rehype-pretty-code）
- [x] Task 2.2: 实现 MDX 自定义组件映射（Heading、Code Block、Table、Blockquote、Image、Link 等）
- [x] Task 2.3: 实现全局 Layout 组件（Header 导航栏、Sidebar 分类树、Footer、面包屑导航）
- [x] Task 2.4: 实现 Wiki 首页（`/`）——分类卡片展示、最近更新列表
- [x] Task 2.5: 实现 Wiki 文章页（`/[category]/[slug]`）——SSR 渲染、frontmatter 元信息展示、TOC 侧栏目录
- [x] Task 2.6: 实现分类列表页（`/[category]`）——按分类筛选文章
- [x] Task 2.7: 实现标签列表页（`/tags`）和标签筛选页（`/tags/[tag]`）
- [x] Task 2.8: 实现响应式设计——移动端侧边栏抽屉、文章页 TOC 折叠
- [x] Task 2.9: 编写页面级单元测试（Breadcrumb、utils；Vitest + Testing Library）

**依赖关系**：Task 2.1 依赖 Milestone 1 完成；Task 2.2 依赖 2.1；Task 2.3 可与 2.1 并行；Task 2.4~2.7 依赖 2.2 + 2.3；Task 2.8 依赖 2.3~2.7；Task 2.9 依赖 2.4~2.7

### Milestone 3: Mermaid 图表支持

- [x] Task 3.1: 集成 Mermaid 构建期渲染——实现 rehype 插件，将 Mermaid 代码块在构建期转换为 SVG
- [x] Task 3.2: 实现 Mermaid SVG 展示组件（支持缩放、全屏查看、暗色模式适配）
- [x] Task 3.3: 处理 Mermaid 渲染降级——构建期渲染失败时，保留代码块 + 客户端懒加载 fallback
- [x] Task 3.4: 编写 Mermaid 渲染测试用例（flowchart、sequence、gantt 等常见图表类型）

**依赖关系**：Task 3.1 依赖 Milestone 2（MDX 管线就绪）；Task 3.2 依赖 3.1；Task 3.3 依赖 3.1；Task 3.4 依赖 3.1~3.3

### Milestone 4: AI 友好的结构化数据

- [x] Task 4.1: 实现 JSON-LD 结构化数据生成——Article、BreadcrumbList、WebSite schema，注入到每个页面 `<head>`
- [x] Task 4.2: 实现 Open Graph / Twitter Card meta 标签生成（基于 frontmatter）
- [x] Task 4.3: 实现 `llms.txt` / `llms-full.txt` 生成——按照 llms.txt 规范，输出站点结构和内容摘要
- [x] Task 4.4: 确保 HTML 语义化——使用 `<article>`、`<nav>`、`<aside>`、`<section>`、`<time>` 等语义标签
- [x] Task 4.5: 编写结构化数据验证测试（JSON-LD 输出校验、meta 标签完整性校验）

**依赖关系**：Task 4.1~4.4 依赖 Milestone 2（页面就绪），可相互并行；Task 4.5 依赖 4.1~4.4

### Milestone 5: 客户端搜索

- [ ] Task 5.1: 集成 FlexSearch，构建期生成搜索索引（标题、正文、标签、分类）
- [ ] Task 5.2: 实现搜索 UI 组件——Command Palette 风格（`Cmd+K` 快捷键唤起）、搜索结果高亮、键盘导航
- [ ] Task 5.3: 实现搜索索引懒加载——首次触发搜索时才加载索引文件，减少首屏体积
- [ ] Task 5.4: 编写搜索功能测试（索引生成、搜索准确性、中文分词）

**依赖关系**：Task 5.1 依赖 Milestone 1（Contentlayer 就绪）；Task 5.2 依赖 5.1 + Milestone 2（UI 就绪）；Task 5.3 依赖 5.1 + 5.2；Task 5.4 依赖 5.1~5.3

### Milestone 6: 在线编辑器与 GitHub API 集成

- [ ] Task 6.1: 实现 GitHub Contents API 封装层——读取文件、创建文件、更新文件、获取文件 SHA（`lib/github.ts`）
- [ ] Task 6.2: 实现编辑鉴权——密码验证 API Route（`/api/auth`），服务端校验密码，返回 JWT token
- [ ] Task 6.3: 实现编辑鉴权中间件——保护 `/api/content/*` 路由，校验 token 有效性
- [ ] Task 6.4: 集成 Milkdown 编辑器组件——Markdown 实时预览、工具栏（标题、粗体、链接、图片、代码块、Mermaid 插入）
- [ ] Task 6.5: 实现文章编辑页面（`/editor/[category]/[slug]`）——加载已有内容、frontmatter 表单编辑、Milkdown 正文编辑
- [ ] Task 6.6: 实现文章新建页面（`/editor`）——选择分类、填写 frontmatter、编写正文
- [ ] Task 6.7: 实现发布 API（`POST /api/content`）——接收 Markdown 内容，通过 GitHub Contents API 提交到仓库
- [ ] Task 6.8: 实现发布流程 UI——密码输入 Dialog → 保存确认 → 提交反馈（成功/失败 Toast）
- [ ] Task 6.9: 实现编辑冲突处理——提交前获取最新 SHA，冲突时提示用户
- [ ] Task 6.10: 编写 GitHub API 集成测试（Mock GitHub API，测试 CRUD 流程）
- [ ] Task 6.11: 编写编辑器 E2E 测试（打开编辑页 → 修改内容 → 密码验证 → 提交成功）

**依赖关系**：Task 6.1 独立；Task 6.2 → 6.3（顺序）；Task 6.4 独立（UI 组件）；Task 6.5 依赖 6.1 + 6.4；Task 6.6 依赖 6.5；Task 6.7 依赖 6.1 + 6.3；Task 6.8 依赖 6.2 + 6.7；Task 6.9 依赖 6.7；Task 6.10 依赖 6.1 + 6.7；Task 6.11 依赖 6.5~6.9

### Milestone 7: RSS / Atom 订阅

- [ ] Task 7.1: 实现 RSS 2.0 feed 生成（`/feed.xml`）——包含最近 50 篇文章，含摘要内容
- [ ] Task 7.2: 实现 Atom feed 生成（`/feed.atom`）——同上，Atom 格式
- [ ] Task 7.3: 实现分类级别 feed（`/[category]/feed.xml`）——按分类订阅
- [ ] Task 7.4: 在页面 `<head>` 中添加 feed 自动发现标签（`<link rel="alternate" type="application/rss+xml">`）
- [ ] Task 7.5: 编写 feed 生成测试（XML 格式校验、内容完整性校验）

**依赖关系**：Task 7.1~7.3 依赖 Milestone 1（Contentlayer 就绪），可并行；Task 7.4 依赖 Milestone 2（Layout 就绪）；Task 7.5 依赖 7.1~7.4

### Milestone 8: 部署与生产就绪

- [ ] Task 8.1: 配置 Vercel 部署——`vercel.json`、环境变量配置、ISR/SSR 策略配置
- [ ] Task 8.2: 配置 Vercel GitHub Integration——Push to main 自动部署、PR Preview 部署
- [ ] Task 8.3: 性能优化——Image 优化（next/image）、字体优化（next/font）、Bundle 分析与优化
- [ ] Task 8.4: SEO 完善——`sitemap.xml` 生成、`robots.txt`、Canonical URL
- [ ] Task 8.5: 错误处理完善——自定义 404 页面、500 页面、全局 Error Boundary
- [ ] Task 8.6: 更新 README.md——项目介绍、本地开发指南、环境变量说明、部署说明、内容编写指南
- [ ] Task 8.7: 端到端冒烟测试——完整流程验证（首页 → 文章 → 搜索 → 编辑 → 发布 → RSS）

**依赖关系**：Task 8.1 依赖 Milestone 1~7 全部完成；Task 8.2 依赖 8.1；Task 8.3~8.5 可与 8.1 并行；Task 8.6 依赖所有 Milestone；Task 8.7 依赖 8.1~8.5

## Done Criteria

### Milestone 1: 项目初始化与基础架构
- `npm run dev` 可启动开发服务器，无报错
- `npm run build` 可成功构建生产版本
- Contentlayer 能正确解析 `content/` 下的 `.mdx` 文件并生成类型安全的数据对象
- frontmatter schema 有 TypeScript 类型定义，字段缺失时构建报错
- `.env.example` 包含所有必需的环境变量及说明
- `docker build` 可成功构建镜像，`docker-compose up` 可启动服务
- GitHub Actions CI 管线通过（lint → test → build）
- ESLint + Prettier 规则生效，`npm run lint` 零错误

### Milestone 2: 内容渲染与页面布局
- 访问 `/` 展示分类卡片和最近更新列表，SSR 渲染（查看源码可见完整 HTML）
- 访问 `/[category]/[slug]` 可渲染完整 Markdown 文章，包含 GFM 表格、代码高亮、数学公式
- TOC 侧栏目录能正确提取文章标题层级，点击可跳转
- 面包屑导航正确显示当前路径层级
- 分类页和标签页能正确筛选文章
- 移动端（< 768px）布局正常，侧边栏可抽屉展开
- 页面渲染测试全部通过

### Milestone 3: Mermaid 图表支持
- 包含 Mermaid 代码块的文章，构建后输出内联 SVG（非运行时渲染）
- SVG 图表在暗色/亮色模式下均可正常显示
- Mermaid 渲染失败时不阻断构建，降级为代码块展示
- 支持 flowchart、sequence diagram、gantt chart 至少三种图表类型
- 构建产物中不包含 Mermaid JS runtime（构建期已处理）

### Milestone 4: AI 友好的结构化数据
- 每个文章页包含有效的 JSON-LD（通过 Schema.org Validator 校验）
- 每个页面包含完整的 Open Graph 和 Twitter Card meta 标签
- `/llms.txt` 可访问，内容包含站点结构和文章摘要索引
- HTML 语义标签正确使用
- 结构化数据测试全部通过

### Milestone 5: 客户端搜索
- `Cmd+K`（Mac）/ `Ctrl+K`（Windows）可唤起搜索面板
- 输入关键词后 200ms 内返回搜索结果
- 搜索结果包含标题、摘要片段，关键词高亮
- 搜索索引文件懒加载，不影响首屏 LCP
- 中文内容可搜索（至少支持按词搜索）

### Milestone 6: 在线编辑器与 GitHub API 集成
- 未输入正确密码时，编辑/发布功能不可用
- 输入正确密码后，可进入编辑模式
- Milkdown 编辑器支持实时 Markdown 预览
- 编辑已有文章：加载原文 → 修改 → 发布 → GitHub 仓库中对应文件已更新
- 新建文章：选分类 → 写内容 → 发布 → GitHub 仓库中新增对应文件
- 发布成功/失败有明确的 Toast 提示
- 编辑冲突时有用户友好的提示
- GitHub API 集成测试（Mock）全部通过

### Milestone 7: RSS / Atom 订阅
- `/feed.xml` 返回有效的 RSS 2.0 XML
- `/feed.atom` 返回有效的 Atom XML
- 分类级 feed 可按分类过滤文章
- 浏览器可通过 `<link>` 标签自动发现 feed
- feed 包含文章摘要内容、发布日期、作者信息

### Milestone 8: 部署与生产就绪
- Vercel 部署成功，可正常访问
- Push to main 触发自动部署
- Lighthouse Performance 得分 ≥ 90（桌面端）
- `sitemap.xml` 和 `robots.txt` 可正确访问
- 404 和 500 页面有自定义 UI
- README.md 包含完整的项目文档

### 整体项目
- `npm run build` 零错误、零警告
- `npm run test` 全部通过，核心业务逻辑测试覆盖率 ≥ 80%
- `npm run lint` 零错误
- Docker 镜像可成功构建并运行
- GitHub Actions CI 全部绿色
- 无敏感信息硬编码
