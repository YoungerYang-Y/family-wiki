# Spec: deployment

部署能力 —— Vercel 部署 + Docker + CI/CD + SEO。

## ADDED Requirements

### Requirement: Vercel 部署

应用 MUST 支持部署到 Vercel，SHALL 支持 ISR 增量静态再生和自动部署。

#### Scenario: 自动部署

- **Given**: 代码推送到 main 分支
- **When**: GitHub 触发 Vercel Webhook
- **Then**: Vercel 自动构建并部署
- **And**: PR 生成 Preview URL

#### Scenario: ISR 增量再生

- **Given**: 文章通过编辑器更新后触发 revalidation
- **When**: 用户访问该文章
- **Then**: 获取到最新内容（ISR revalidate 后）

### Requirement: Docker 支持

项目 MUST 提供 Dockerfile 和 docker-compose.yml，支持本地开发和自托管部署。

#### Scenario: Docker 构建

- **Given**: 项目根目录存在 Dockerfile
- **When**: 执行 `docker build -t family-wiki .`
- **Then**: 镜像构建成功，大小合理（< 500MB）

#### Scenario: Docker Compose 启动

- **Given**: docker-compose.yml 配置完整
- **When**: 执行 `docker-compose up`
- **Then**: 服务启动成功，可通过 `http://localhost:3000` 访问

### Requirement: CI/CD 管道

项目 MUST 配置 GitHub Actions 自动化 CI/CD 管道，包含 lint、test、build 步骤。

#### Scenario: PR 检查

- **Given**: 开发者提交 Pull Request
- **When**: GitHub Actions 触发
- **Then**: 依次执行 lint、test、build
- **And**: 任何步骤失败则整个 check 失败

### Requirement: SEO 基础设施

系统 MUST 自动生成 sitemap.xml 和 robots.txt，确保搜索引擎可正确抓取。

#### Scenario: Sitemap 生成

- **Given**: 站点有多篇文章
- **When**: 访问 `/sitemap.xml`
- **Then**: 返回有效的 Sitemap XML，包含所有已发布文章的 URL 和 lastmod

#### Scenario: Robots.txt

- **Given**: 站点已部署
- **When**: 访问 `/robots.txt`
- **Then**: 返回允许搜索引擎抓取的 robots.txt
- **And**: 包含 `Sitemap: {siteUrl}/sitemap.xml`

### Requirement: 错误页面

系统 MUST 提供自定义 404 和 500 错误页面，风格 SHALL 与站点一致。

#### Scenario: 404 页面

- **Given**: 用户访问不存在的路径
- **When**: 服务器返回 404
- **Then**: 展示自定义 404 页面，包含返回首页链接
- **And**: 页面风格与站点一致
