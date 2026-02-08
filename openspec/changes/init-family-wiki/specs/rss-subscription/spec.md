# Spec: rss-subscription

RSS/Atom 订阅能力 —— 自动生成 feed，支持分类级订阅。

关联能力: [content-management](../content-management/spec.md)

## ADDED Requirements

### Requirement: RSS 2.0 Feed 生成

系统 MUST 在 `/feed.xml` 提供标准的 RSS 2.0 格式订阅源。

#### Scenario: 全站 RSS Feed

- **Given**: 站点有多篇已发布文章
- **When**: 访问 `/feed.xml`
- **Then**: 返回有效的 RSS 2.0 XML
- **And**: 包含最近 50 篇文章的标题、描述、链接、发布日期
- **And**: Content-Type 为 `application/xml`

#### Scenario: RSS Feed 缓存

- **Given**: `/feed.xml` 已生成
- **When**: 短时间内多次请求
- **Then**: 响应头包含 `Cache-Control: s-maxage=3600, stale-while-revalidate=600`

### Requirement: Atom 1.0 Feed 生成

系统 MUST 在 `/feed.atom` 提供标准的 Atom 1.0 格式订阅源。

#### Scenario: 全站 Atom Feed

- **Given**: 站点有多篇已发布文章
- **When**: 访问 `/feed.atom`
- **Then**: 返回有效的 Atom 1.0 XML
- **And**: Content-Type 为 `application/atom+xml`

### Requirement: 分类级 Feed

系统 SHALL 支持按分类提供独立的 RSS feed。

#### Scenario: 分类 RSS Feed

- **Given**: `cooking` 分类下有 5 篇文章
- **When**: 访问 `/cooking/feed.xml`
- **Then**: 返回仅包含 `cooking` 分类文章的 RSS feed

### Requirement: Feed 自动发现

页面 `<head>` 中 MUST 包含 feed 自动发现标签。

#### Scenario: 浏览器发现 Feed

- **Given**: 用户使用支持 RSS 的浏览器访问站点
- **When**: 页面加载完成
- **Then**: HTML `<head>` 包含 `<link rel="alternate" type="application/rss+xml" href="/feed.xml">`
- **And**: 包含 `<link rel="alternate" type="application/atom+xml" href="/feed.atom">`
