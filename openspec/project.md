# Family Wiki

## 概述

Family Wiki 是一个「个人决策型知识库（Decision-oriented Wiki）」，基于 Git 驱动的个人生活知识系统 + Web 编辑器。

## 目标

- 提供静态站点展示生活知识 Wiki
- 支持 SSR，便于 RSS/Atom 订阅
- 支持 Markdown + Mermaid 渲染
- 大模型友好，结构化内容便于 AI 理解
- 支持 Web 编辑器，通过 GitHub API 提交内容

## 技术栈

- 框架：Next.js 14（App Router）
- UI：Tailwind CSS + shadcn/ui
- 内容源：GitHub + Markdown
- 内容处理：Contentlayer
- 渲染：MDX + remark / rehype
- 图表：Mermaid（构建期 SVG）
- 编辑器：Milkdown（或 Monaco）
- 提交方式：GitHub Contents API
- 搜索：FlexSearch
- 订阅：RSS / Atom
- 部署：Vercel
