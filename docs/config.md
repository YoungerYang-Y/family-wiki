# 配置说明

本文档描述 Family Wiki 的环境变量与部署相关配置。配置变更时请同步更新此处与 `.env.example`。

## 环境变量

复制 `.env.example` 为 `.env.local`（本地）或按部署平台配置环境变量。**勿将 `.env`、`.env.local` 等包含真实密钥的文件提交到仓库。**

| 变量 | 说明 | 必填 |
|------|------|------|
| `GITHUB_TOKEN` | GitHub Personal Access Token（需 repo 权限），用于在线编辑/发布时读写仓库 | 编辑/发布时 |
| `GITHUB_OWNER` | 仓库 Owner（组织或用户名） | 是 |
| `GITHUB_REPO` | 仓库名 | 是 |
| `GITHUB_BRANCH` | 内容分支，未设置时默认为 `main` | 否 |
| `AUTH_PASSWORD` | 编辑密码，用于在线编辑时的密码鉴权 | 编辑时 |
| `JWT_SECRET` | JWT 签名密钥，至少 32 字符，用于签发/校验编辑 token | 编辑时 |
| `NEXT_PUBLIC_SITE_URL` | 站点完整 URL（如 `https://wiki.example.com`），用于 sitemap、feed、OG 等 | 生产环境建议设置 |

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

### 故障排除

- **开发时修改 content 后页面未更新**：删除缓存后重启  
  `rm -rf .next .contentlayer && pnpm dev`
- **终端出现 webpack 关于 `generate-dotpkg.js` 的 cache 告警**：来自 contentlayer2 的动态 import，可忽略，不影响使用。
- **Vercel 构建失败**：确认 Node 版本（推荐 20）、`pnpm` 已正确安装（Vercel 会自动检测 `packageManager` 或使用 `vercel.json` 中的 `installCommand`）。
