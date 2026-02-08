# family-wiki

家庭生活指南 · 个人决策型知识库（Decision-oriented Wiki）

## 开发

本项目使用 **pnpm** 作为包管理工具。

```bash
# 安装依赖
pnpm install

# 开发
pnpm dev

# 构建
pnpm build

# 生产运行
pnpm start
```

## 环境变量

复制 `.env.example` 为 `.env.local` 并填写实际值。详见 `.env.example` 内注释。

## 故障排除

- **开发时修改 content 后页面未更新**：删除缓存后重启  
  `rm -rf .next .contentlayer && pnpm dev`
- **终端出现 webpack 关于 `generate-dotpkg.js` 的 cache 告警**：来自 contentlayer2 的动态 import，可忽略；不影响正常使用。
